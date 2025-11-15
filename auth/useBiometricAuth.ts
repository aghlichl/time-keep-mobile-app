/**
 * Biometric Authentication Helper
 * 
 * Wraps expo-local-authentication for Face ID / Touch ID prompts.
 * 
 * Security: disableDeviceFallback = true (Face ID only, no device passcode fallback).
 */
import * as LocalAuthentication from 'expo-local-authentication';

export async function canUseBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function promptBiometrics(reason = 'Sign in with Face ID'): Promise<boolean> {
  console.log('Prompting for biometrics with reason:', reason);
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    disableDeviceFallback: true, // Face ID ONLY - no PIN fallback for security
  });
  console.log('Biometric authentication result:', result);

  // Log detailed error information for debugging
  if (!result.success) {
    console.log('Biometric auth failed:', {
      error: result.error,
      warning: result.warning,
    });
  }

  return result.success;
}
