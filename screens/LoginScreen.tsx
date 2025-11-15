import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import {
  loadSession,
  isBiometricsEnabled,
  loadUserEmail,
  saveSession,
} from "../lib/sessionStorage";
import { canUseBiometrics, promptBiometrics } from "../auth/useBiometricAuth";
import { BrutalButton, BrutalCard, BrutalHeader } from "../components/brutal";
import {
  colors,
  borderWidth,
  borderRadius,
  typography,
} from "../theme/brutal-theme";

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { signInWithEmail, enableBiometrics, restoreSessionState } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBiometricSignIn, setShowBiometricSignIn] = useState(false);
  const [canOfferBiometrics, setCanOfferBiometrics] = useState(false);
  const [showPasswordOnly, setShowPasswordOnly] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const storedSession = await loadSession();
    const biometricsEnabled = await isBiometricsEnabled();
    const canBiometric = await canUseBiometrics();

    console.log("Biometric availability check:", {
      storedSession: !!storedSession,
      biometricsEnabled,
      canBiometric,
      showBiometricSignIn: biometricsEnabled && canBiometric,
    });

    setShowBiometricSignIn(biometricsEnabled && canBiometric);
    setCanOfferBiometrics(canBiometric && !biometricsEnabled);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);

      if (canOfferBiometrics) {
        Alert.alert(
          "Enable Face ID?",
          "Would you like to use Face ID for faster login next time?",
          [
            { text: "Not now", style: "cancel" },
            {
              text: "Enable",
              onPress: async () => {
                await enableBiometrics();
                Alert.alert(
                  "Face ID Enabled",
                  "You can now sign in with Face ID."
                );
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      console.log("Starting Face ID authentication...");
      const biometricSuccess = await promptBiometrics("Sign in with Face ID");
      console.log("Face ID result:", biometricSuccess);
      if (biometricSuccess) {
        const storedSessionJson = await loadSession();
        if (storedSessionJson) {
          const parsedSession = JSON.parse(storedSessionJson);
          const { data, error } = await supabase.auth.setSession(parsedSession);
          if (!error && data.session && data.user) {
            restoreSessionState(data.user, data.session);
            console.log(
              "Session restored successfully after Face ID on LoginScreen"
            );
          } else {
            console.error("Failed to restore session after Face ID:", error);
            const userEmail = await loadUserEmail();
            if (userEmail) {
              setStoredEmail(userEmail);
              setShowPasswordOnly(true);
              setShowBiometricSignIn(false);
            } else {
              setShowBiometricSignIn(false);
            }
          }
        } else {
          console.log(
            "No stored session found, checking for existing Supabase session..."
          );
          const {
            data: { session: existingSession },
            error: sessionError,
          } = await supabase.auth.getSession();
          if (!sessionError && existingSession) {
            const {
              data: { user: existingUser },
            } = await supabase.auth.getUser();
            if (existingUser) {
              await saveSession(
                JSON.stringify({
                  access_token: existingSession.access_token,
                  refresh_token: existingSession.refresh_token,
                })
              );
              restoreSessionState(existingUser, existingSession);
              console.log("Existing Supabase session restored after Face ID");
            } else {
              const userEmail = await loadUserEmail();
              if (userEmail) {
                setStoredEmail(userEmail);
                setShowPasswordOnly(true);
                setShowBiometricSignIn(false);
              } else {
                setShowBiometricSignIn(false);
              }
            }
          } else {
            const userEmail = await loadUserEmail();
            if (userEmail) {
              setStoredEmail(userEmail);
              setShowPasswordOnly(true);
              setShowBiometricSignIn(false);
            } else {
              setShowBiometricSignIn(false);
            }
          }
        }
      } else {
        Alert.alert(
          "Face ID Required",
          "Face ID authentication failed. Device passcode is not allowed for security. Please sign in with email and password instead."
        );
        setShowBiometricSignIn(false);
      }
    } catch (error: any) {
      console.error("Biometric login error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
      setShowBiometricSignIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordOnlyLogin = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(storedEmail, password);
      setShowPasswordOnly(false);
    } catch (error: any) {
      console.error("Password-only login error:", error);
      Alert.alert("Login Failed", error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 20,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <BrutalHeader
              title="TimeKeep"
              subtitle="Care Home Timekeeping"
              style={{ marginBottom: 40, backgroundColor: "#FFD700" }}
            />

            <BrutalCard style={{ marginBottom: 20 }}>
              {showPasswordOnly ? (
                <>
                  <Text
                    style={{
                      ...typography.h2,
                      marginBottom: 20,
                    }}
                  >
                    ✅ FACE ID VERIFIED
                  </Text>
                  <Text
                    style={{
                      ...typography.body,
                      marginBottom: 20,
                    }}
                  >
                    Enter your password to complete login
                  </Text>

                  <View style={{ gap: 16 }}>
                    <View
                      style={{
                        backgroundColor: colors.white,
                        padding: 16,
                        borderRadius: borderRadius.medium,
                        borderWidth: borderWidth,
                        borderColor: colors.black,
                      }}
                    >
                      <Text
                        style={{
                          ...typography.body,
                          fontSize: typography.body.fontSize - 2,
                          color: colors.black,
                          marginBottom: 4,
                        }}
                      >
                        EMAIL
                      </Text>
                      <Text
                        style={{
                          ...typography.body,
                          color: colors.black,
                        }}
                      >
                        {storedEmail}
                      </Text>
                    </View>

                    <TextInput
                      key="password-only-input"
                      style={{
                        backgroundColor: colors.white,
                        borderWidth: borderWidth,
                        borderColor: colors.black,
                        borderRadius: borderRadius.medium,
                        padding: 16,
                        ...typography.body,
                        color: colors.black,
                      }}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.black}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    <BrutalButton
                      title={loading ? "AUTHENTICATING..." : "COMPLETE LOGIN"}
                      variant="success"
                      size="lg"
                      onPress={handlePasswordOnlyLogin}
                      disabled={loading}
                      loading={loading}
                    />

                    <BrutalButton
                      title="BACK TO FACE ID"
                      variant="outline"
                      size="md"
                      onPress={() => {
                        setShowPasswordOnly(false);
                        setShowBiometricSignIn(true);
                      }}
                      disabled={loading}
                    />
                  </View>
                </>
              ) : showBiometricSignIn ? (
                <View
                  style={{
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: borderRadius.medium,
                      backgroundColor: colors.white,
                      borderWidth: borderWidth,
                      borderColor: colors.black,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 40,
                        color: colors.black,
                      }}
                    >
                      👤
                    </Text>
                  </View>

                  <Text
                    style={{
                      ...typography.h2,
                      textAlign: "center",
                    }}
                  >
                    FACE ID REQUIRED
                  </Text>

                  <Text
                    style={{
                      ...typography.body,
                      textAlign: "center",
                      lineHeight: 24,
                    }}
                  >
                    Use Face ID to securely authenticate and access your account
                  </Text>

                  <BrutalButton
                    title={
                      loading
                        ? "AUTHENTICATING..."
                        : "AUTHENTICATE WITH FACE ID"
                    }
                    variant="primary"
                    size="xl"
                    onPress={handleBiometricLogin}
                    disabled={loading}
                    loading={loading}
                  />
                </View>
              ) : (
                <View style={{ gap: 20 }}>
                  <Text
                    style={{
                      ...typography.h2,
                      textAlign: "center",
                      marginBottom: 16,
                    }}
                  >
                    WELCOME BACK
                  </Text>

                  <View style={{ gap: 16 }}>
                    <TextInput
                      key="email-input"
                      style={{
                        backgroundColor: colors.white,
                        borderWidth: borderWidth,
                        borderColor: colors.black,
                        borderRadius: borderRadius.medium,
                        padding: 16,
                        ...typography.body,
                        color: colors.black,
                      }}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.black}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    <TextInput
                      key="password-input"
                      style={{
                        backgroundColor: colors.white,
                        borderWidth: borderWidth,
                        borderColor: colors.black,
                        borderRadius: borderRadius.medium,
                        padding: 16,
                        ...typography.body,
                        color: colors.black,
                      }}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.black}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    <BrutalButton
                      title={loading ? "SIGNING IN..." : "SIGN IN"}
                      variant="primary"
                      size="lg"
                      onPress={handleEmailLogin}
                      disabled={loading}
                      loading={loading}
                    />
                  </View>
                </View>
              )}
            </BrutalCard>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
