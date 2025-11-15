/**
 * Session Storage: Secure persistence for authentication state
 * 
 * Uses expo-secure-store to save sensitive data in iOS Keychain.
 * 
 * Stored items:
 * - supabase_session: Serialized JSON with access_token + refresh_token
 * - biometrics_enabled: Flag ('1' or '0') indicating if Face ID is required on app launch
 * - user_email: User's email for biometric login fallback (pre-fills email field)
 * 
 * Security: All items stored with keychainAccessible: WHEN_UNLOCKED (iOS Keychain).
 */
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'supabase_session';
const BIOMETRICS_KEY = 'biometrics_enabled';
const USER_EMAIL_KEY = 'user_email';

export async function saveSession(sessionJson: string) {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, sessionJson, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  } catch (error) {
    console.error('SecureStore: unable to save session', error);
  }
}

export async function loadSession(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch (error) {
    console.error('SecureStore: unable to load session', error);
    return null;
  }
}

export async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch (error) {
    console.error('SecureStore: unable to clear session', error);
  }
}

export async function setBiometricsEnabled(enabled: boolean) {
  try {
    await SecureStore.setItemAsync(BIOMETRICS_KEY, enabled ? '1' : '0');
  } catch (error) {
    console.error('SecureStore: unable to set biometrics flag', error);
  }
}

export async function isBiometricsEnabled(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(BIOMETRICS_KEY);
    return value === '1';
  } catch (error) {
    console.error('SecureStore: unable to check biometrics flag', error);
    return false;
  }
}

export async function saveUserEmail(email: string) {
  try {
    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
  } catch (error) {
    console.error('SecureStore: unable to save user email', error);
  }
}

export async function loadUserEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_EMAIL_KEY);
  } catch (error) {
    console.error('SecureStore: unable to load user email', error);
    return null;
  }
}

export async function clearUserEmail() {
  try {
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
  } catch (error) {
    console.error('SecureStore: unable to clear user email', error);
  }
}
