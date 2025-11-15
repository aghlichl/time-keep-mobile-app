/**
 * AuthContext: Face ID-Gated Authentication Flow
 * 
 * This provider manages the app's authentication state with Face ID protection.
 * 
 * Flow:
 * 1. On app launch (initializeAuth):
 *    - If biometrics enabled + Face ID succeeds → restore stored session → show Home
 *    - If biometrics enabled + Face ID fails/canceled → clear session + disable biometrics → show Login
 *    - If biometrics disabled → check for valid session → show Home or Login
 * 
 * 2. On email/password login (signInWithEmail):
 *    - Save session to SecureStore
 *    - Save user email for biometric login fallback
 *    - Optionally enable biometrics for next app launch
 * 
 * 3. On sign out (signOut):
 *    - Clear Supabase session
 *    - Clear stored session and user email
 *    - Keep biometrics enabled (Face ID required for next login)
 * 
 * Security: No passwords stored, only Supabase access + refresh tokens in SecureStore.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { saveSession, loadSession, clearSession, setBiometricsEnabled, isBiometricsEnabled, saveUserEmail, clearUserEmail } from '../lib/sessionStorage';
import { canUseBiometrics, promptBiometrics } from './useBiometricAuth';

type AuthState = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableBiometrics: () => Promise<void>;
  restoreSessionState: (user: User, session: Session) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const biometricsEnabled = await isBiometricsEnabled();

      if (biometricsEnabled) {
        console.log('Biometrics enabled - prompting for Face ID on app launch');
        // Face ID is REQUIRED - always prompt when enabled
        const canBiometric = await canUseBiometrics();
        console.log('Can use biometrics:', canBiometric);
        if (canBiometric) {
          const biometricSuccess = await promptBiometrics('Unlock Care Home Timekeeping');
          console.log('App launch Face ID result:', biometricSuccess);
          if (biometricSuccess) {
            // Face ID succeeded - try to restore session if it exists
            const storedSessionJson = await loadSession();
            console.log('Stored session exists:', !!storedSessionJson);
            if (storedSessionJson) {
              const parsedSession = JSON.parse(storedSessionJson);
              const { data, error } = await supabase.auth.setSession(parsedSession);
              if (!error && data.session) {
                // Successfully restored session - update context state
                setUser(data.user);
                setSession(data.session);
                console.log('Session restored successfully after Face ID');
              } else {
                console.log('Failed to restore session:', error);
                // Session restore failed - clear everything
                await clearSession();
                await setBiometricsEnabled(false);
                await clearUserEmail();
              }
            } else {
              // No stored session, but Face ID succeeded - check for existing Supabase session
              console.log('No stored session found, checking for existing Supabase session...');
              const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
              if (!sessionError && existingSession) {
                // Found a valid Supabase session - restore it
                const { data: { user: existingUser } } = await supabase.auth.getUser();
                if (existingUser) {
                  // Save the session to SecureStore for future use
                  await saveSession(JSON.stringify({
                    access_token: existingSession.access_token,
                    refresh_token: existingSession.refresh_token,
                  }));
                  // Update context state
                  setUser(existingUser);
                  setSession(existingSession);
                  console.log('Existing Supabase session restored after Face ID on app launch');
                }
              }
              // If no existing session either, we'll show Face ID login screen
            }
          } else {
            console.log('Face ID failed on app launch - clearing session and disabling biometrics');
            // Face ID failed - clear stored session, disable biometrics, and show regular login
            await clearSession();
            await setBiometricsEnabled(false);
            await clearUserEmail();
          }
        } else {
          console.log('Face ID not available - clearing session and disabling biometrics');
          // Face ID not available - clear everything and disable biometrics
          await clearSession();
          await setBiometricsEnabled(false);
          await clearUserEmail();
        }
      } else {
        console.log('Biometrics not enabled - checking for existing session');
        // Biometrics not enabled - check if there's a valid session
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (!error && currentUser) {
          setUser(currentUser);
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setInitializing(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      // Save session
      await saveSession(JSON.stringify({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      }));

      // Save user email for biometric login fallback
      await saveUserEmail(email);

      setUser(data.user);
      setSession(data.session);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await clearSession();
    await clearUserEmail();
    // Keep biometrics enabled so Face ID remains required for login
    setUser(null);
    setSession(null);
  };

  const enableBiometrics = async () => {
    await setBiometricsEnabled(true);
  };

  const restoreSessionState = (user: User, session: Session) => {
    setUser(user);
    setSession(session);
    console.log('Session state restored in AuthContext');
  };

  const value: AuthState = {
    user,
    session,
    initializing,
    signInWithEmail,
    signOut,
    enableBiometrics,
    restoreSessionState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
