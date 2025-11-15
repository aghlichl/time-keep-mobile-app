import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { canUseBiometrics, promptBiometrics } from '../auth/useBiometricAuth';

interface TestBiometricScreenProps {
  navigation: any;
}

export default function TestBiometricScreen({ navigation }: TestBiometricScreenProps) {
  const [loading, setLoading] = useState(false);
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');

  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  const checkBiometricCapabilities = async () => {
    const hasBiometric = await canUseBiometrics();
    setCanUseBiometric(hasBiometric);

    if (hasBiometric) {
      // For simplicity, we'll just indicate Face ID is available
      // In a real app, you might want to detect specific biometric types
      setBiometricType('Face ID / Biometric');
    }
  };

  const handleTestBiometric = async () => {
    if (!canUseBiometric) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    setLoading(true);
    try {
      const success = await promptBiometrics('Test Face ID Authentication');
      if (success) {
        Alert.alert('Success', 'Biometric authentication successful!');
      } else {
        Alert.alert(
          'Face ID Required',
          'Face ID authentication failed or was cancelled. Device passcode is not allowed for security. Make sure Face ID is properly enrolled on your device.'
        );
      }
    } catch (error: any) {
      console.error('Biometric test error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Face ID Test</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Test Face ID functionality independently of the clocking flow. Only Face ID is accepted - device passcode is disabled for security.
        </Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Biometric Status:</Text>
          <Text style={canUseBiometric ? styles.statusAvailable : styles.statusUnavailable}>
            {canUseBiometric ? `Available (${biometricType})` : 'Not Available'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testButton, (!canUseBiometric || loading) && styles.buttonDisabled]}
          onPress={handleTestBiometric}
          disabled={!canUseBiometric || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.testButtonText}>Test Face ID Only</Text>
          )}
        </TouchableOpacity>

        {!canUseBiometric && (
          <Text style={styles.note}>
            Note: Face ID is only available on physical devices with biometric hardware configured.
            Simulators and emulators do not support biometric authentication.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statusAvailable: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: 'bold',
  },
  statusUnavailable: {
    fontSize: 18,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
