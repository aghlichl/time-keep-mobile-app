import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/database';
import { useAuth } from '../auth/AuthContext';
import { promptBiometrics } from '../auth/useBiometricAuth';
import { BrutalButton, BrutalCard, BrutalHeader, StatusPill } from '../components/brutal';
import { theme } from '../theme';

type ClockEvent = Database['public']['Tables']['clock_events']['Row'];

type ClockSuccessResponse = {
  success: true;
  eventId: string;
  siteName: string;
  siteId: string;
  timestamp: string;
};

type ClockErrorResponse = {
  success: false;
  errorCode: string;
  message: string;
};

interface ClockScreenProps {
  navigation: any;
}

export default function ClockScreen({ navigation }: ClockScreenProps) {
  const { user, signOut } = useAuth();
  const [employee, setEmployee] = useState<any>(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastClockEvent, setLastClockEvent] = useState<ClockEvent | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user) {
      getEmployeeData();
      checkLastClockStatus();
    }
  }, [user]);

  // Screen entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...theme.animations.spring,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Status change animation
  useEffect(() => {
    if (isClockedIn !== undefined) {
      Animated.sequence([
        Animated.spring(statusPulseAnim, {
          toValue: 1.2,
          ...theme.animations.spring,
          useNativeDriver: true,
        }),
        Animated.spring(statusPulseAnim, {
          toValue: 1,
          ...theme.animations.spring,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isClockedIn, statusPulseAnim]);

  const getEmployeeData = async () => {
    if (!user) return;

    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (employeeError) {
        console.error('Error getting employee data:', employeeError);
        return;
      }

      setEmployee(employeeData);
    } catch (error: any) {
      console.error('Network error in getEmployeeData:', error);
    }
  };

  const checkLastClockStatus = async () => {
    if (!user) return;

    try {

      const { data: events, error: eventsError } = await supabase
        .from('clock_events')
        .select('*')
        .eq('employee_id', user!.id)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (eventsError) {
        console.error('Error getting clock events:', eventsError);
        return;
      }

      if (events && events.length > 0) {
        const lastEvent = events[0];
        setLastClockEvent(lastEvent);
        setIsClockedIn(lastEvent.type === 'IN');
      }
    } catch (error: any) {
      console.error('Network error in checkLastClockStatus:', error);
    }
  };

  /**
   * Clock In/Out Flow:
   * 1. Prompt Face ID (REQUIRED for every clock event - no passcode fallback)
   * 2. Request location permission
   * 3. Get current GPS coordinates
   * 4. Call Supabase Edge Function with lat/lng for geofence check
   * 5. Edge function validates user is within allowed radius of a site
   * 6. If valid, create clock event in DB; otherwise return OUT_OF_RANGE error
   * 
   * Note: Geofence check happens on the backend (Edge Function), not here.
   */
  const handleClock = async (type: 'IN' | 'OUT') => {
    setLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.spring(buttonScaleAnim, {
        toValue: 0.95,
        ...theme.animations.spring,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        ...theme.animations.spring,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Step 1: Biometric authentication (REQUIRED for all clock events)
      console.log(`Prompting biometric auth for clock ${type.toLowerCase()}...`);
      const biometricSuccess = await promptBiometrics(`Authenticate to Clock ${type}`);
      if (!biometricSuccess) {
        Alert.alert(
          'Face ID Required',
          'Face ID authentication is required to clock in or out. Device passcode is not allowed for security. Please try again.'
        );
        return;
      }

      // Step 2: Location permission (geofence check)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for clocking');
        return;
      }

      // Step 3: Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Step 4: Call Supabase Edge Function

      // Get current session so we can pass the JWT explicitly
      const { data: sessionResult, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        Alert.alert('Auth Error', 'Could not get current session.');
        return;
      }

      const accessToken = sessionResult.session?.access_token;

      if (!accessToken) {
        console.error('No access token on session:', sessionResult);
        Alert.alert('Auth Error', 'You must be logged in to clock in/out.');
        return;
      }

      console.log('Clock payload:', {
        type,
        lat: latitude,
        lng: longitude,
        accuracy,
      });

      const { data, error } = await supabase.functions.invoke('norcal-edge', {
        body: {
          type,
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          deviceLabel: `${Platform.OS} ${Platform.Version}`,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log('Edge function raw result:', { data, error });

      const functionPayload = data as
        | ClockSuccessResponse
        | ClockErrorResponse
        | null;

      const hasSuccess = functionPayload?.success === true;

      if (error || !functionPayload || !hasSuccess) {
        const fallbackMessage =
          type === 'IN'
            ? 'You need to be closer to the facility to Clock In.'
            : 'You need to be closer to the facility to Clock Out.';

        const outOfRangeMessage =
          type === 'IN'
            ? 'Please move closer to the facility to Clock In.'
            : 'Please move closer to the facility to Clock Out.';

        let message =
          functionPayload && !functionPayload.success
            ? functionPayload.message
            : error?.message;

        if ((functionPayload as ClockErrorResponse)?.errorCode === 'OUT_OF_RANGE') {
          message = outOfRangeMessage;
        }

        Alert.alert('Clock Failed', message ?? fallbackMessage);
        return;
      }

      const successData = functionPayload as ClockSuccessResponse;
      setIsClockedIn(type === 'IN');
      setLastClockEvent({
        ...successData,
        employee_id: user!.id,
        site_id: successData.siteId,
        type,
        timestamp: successData.timestamp,
        lat: latitude,
        lng: longitude,
        accuracy_meters: accuracy,
        device_label: `${Platform.OS} ${Platform.Version}`,
        status: 'OK',
        created_at: successData.timestamp,
        id: successData.eventId,
      });

      Alert.alert('Success', `Clocked ${type.toLowerCase()} at ${successData.siteName}`, [
        { text: 'OK' },
      ]);

    } catch (error: any) {
      console.error('Clock error:', error);

      // Provide more specific error messages
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Logging out and clearing session...');
    await signOut();
    console.log('Logout complete');
  };

  if (!user || !employee) {
    return (
      <SafeAreaView style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    }}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing['3xl'],
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <BrutalHeader
            title={`Hi, ${employee.full_name.split(' ')[0]}!`}
            subtitle="Ready to clock in?"
            style={{ backgroundColor: '#FFE600' }}
            rightAction={
              <BrutalButton
                title="Settings"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('TestBiometric')}
              />
            }
          />

          {/* Status Card */}
          <BrutalCard variant="elevated" style={{ marginBottom: theme.spacing.xl }}>
            <View style={{
              alignItems: 'center',
              gap: theme.spacing.lg,
            }}>
              <Animated.View
                style={{
                  transform: [{ scale: statusPulseAnim }],
                }}
              >
                <StatusPill
                  status={isClockedIn ? 'clockedIn' : 'clockedOut'}
                  label={isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
                  size="lg"
                />
              </Animated.View>

              {lastClockEvent && (
                <View style={{
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                }}>
                  <Text style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}>
                    LAST EVENT
                  </Text>
                  <Text style={{
                    fontSize: theme.typography.fontSize.md,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    textAlign: 'center',
                  }}>
                    {new Date(lastClockEvent.timestamp).toLocaleDateString()}
                  </Text>
                  <Text style={{
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.bold,
                  }}>
                    {new Date(lastClockEvent.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              )}
            </View>
          </BrutalCard>

          {/* Clock Buttons */}
          <View style={{
            gap: theme.spacing.lg,
          }}>
            <Animated.View
              style={{
                transform: [{ scale: buttonScaleAnim }],
              }}
            >
              <BrutalButton
                title={loading ? "Authenticating..." : "Clock In"}
                variant="success"
                size="xl"
                onPress={() => handleClock('IN')}
                disabled={loading || isClockedIn}
                loading={loading}
              />
            </Animated.View>

            <Animated.View
              style={{
                transform: [{ scale: buttonScaleAnim }],
              }}
            >
              <BrutalButton
                title={loading ? "Authenticating..." : "Clock Out"}
                variant="danger"
                size="xl"
                onPress={() => handleClock('OUT')}
                disabled={loading || !isClockedIn}
                loading={loading}
              />
            </Animated.View>
          </View>

          {/* Logout Button */}
          <View style={{
            marginTop: theme.spacing['2xl'],
            alignItems: 'center',
          }}>
            <BrutalButton
              title="Logout"
              variant="outline"
              size="md"
              onPress={handleLogout}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

