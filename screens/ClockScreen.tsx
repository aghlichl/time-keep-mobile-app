import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { supabase } from "../lib/supabaseClient";
import { Database } from "../types/database";
import { useAuth } from "../auth/AuthContext";
import { promptBiometrics } from "../auth/useBiometricAuth";
import {
  BrutalButton,
  BrutalCard,
  BrutalHeader,
  StatusPill,
} from "../components/brutal";
import { theme } from "../theme";

type ClockEvent = Database["public"]["Tables"]["clock_events"]["Row"];

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
  const [loadingMessage, setLoadingMessage] = useState("");
  const [lastClockEvent, setLastClockEvent] = useState<ClockEvent | null>(null);
  const [todaysTotalHours, setTodaysTotalHours] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentSiteName, setCurrentSiteName] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<string>("00:00:00");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user) {
      getEmployeeData();
      checkLastClockStatus();
      calculateTodaysStats();
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

  // Real-time session duration counter
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (sessionStartTime && isClockedIn) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - sessionStartTime.getTime();

        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setSessionDuration(formatted);
      }, 1000);
    } else {
      setSessionDuration("00:00:00");
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sessionStartTime, isClockedIn]);

  const getEmployeeData = async () => {
    if (!user) return;

    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", user!.id)
        .single();

      if (employeeError) {
        console.error("Error getting employee data:", employeeError);
        return;
      }

      setEmployee(employeeData);
    } catch (error: any) {
      console.error("Network error in getEmployeeData:", error);
    }
  };

  const checkLastClockStatus = async () => {
    if (!user) return;

    try {
      const { data: events, error: eventsError } = await supabase
        .from("clock_events")
        .select("*")
        .eq("employee_id", user!.id)
        .order("timestamp", { ascending: false })
        .limit(1);

      if (eventsError) {
        console.error("Error getting clock events:", eventsError);
        return;
      }

      if (events && events.length > 0) {
        const lastEvent = events[0];
        setLastClockEvent(lastEvent);
        setIsClockedIn(lastEvent.type === "IN");
      }
    } catch (error: any) {
      console.error("Network error in checkLastClockStatus:", error);
    }
  };

  const calculateTodaysStats = async () => {
    if (!user) return;

    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: todaysEvents, error: eventsError } = await supabase
        .from("clock_events")
        .select(`
          *,
          sites!inner(name)
        `)
        .eq("employee_id", user!.id)
        .gte("timestamp", startOfDay.toISOString())
        .lte("timestamp", endOfDay.toISOString())
        .order("timestamp", { ascending: true });

      if (eventsError) {
        console.error("Error getting today's events:", eventsError);
        return;
      }

      if (todaysEvents && todaysEvents.length > 0) {
        // Set current site name from last event
        const lastEvent = todaysEvents[todaysEvents.length - 1];
        setCurrentSiteName((lastEvent as any).sites?.name || "");

        // Calculate total hours worked today
        let totalHours = 0;
        let currentSessionStart: Date | null = null;

        for (let i = 0; i < todaysEvents.length; i++) {
          const event = todaysEvents[i];
          if (event.type === "IN") {
            currentSessionStart = new Date(event.timestamp);
          } else if (event.type === "OUT" && currentSessionStart) {
            const sessionEnd = new Date(event.timestamp);
            const sessionDuration = (sessionEnd.getTime() - currentSessionStart.getTime()) / (1000 * 60 * 60); // hours
            totalHours += sessionDuration;
            currentSessionStart = null;
          }
        }

        setTodaysTotalHours(Math.max(0, totalHours));

        // If currently clocked in, set session start time
        const isCurrentlyClockedIn = todaysEvents[todaysEvents.length - 1].type === "IN";
        if (isCurrentlyClockedIn && currentSessionStart) {
          setSessionStartTime(currentSessionStart);
        } else {
          setSessionStartTime(null);
        }
      } else {
        setTodaysTotalHours(0);
        setCurrentSiteName("");
        setSessionStartTime(null);
      }
    } catch (error: any) {
      console.error("Network error in calculateTodaysStats:", error);
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
  const handleClock = async (type: "IN" | "OUT") => {
    setLoading(true);
    setLoadingMessage("Authenticating...");

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
      console.log(
        `Prompting biometric auth for clock ${type.toLowerCase()}...`
      );
      setLoadingMessage("Authenticating with Face ID...");
      const biometricSuccess = await promptBiometrics(
        `Authenticate to Check ${type}`
      );
      if (!biometricSuccess) {
        Alert.alert(
          "Face ID Required",
          "Face ID authentication is required to check in or out. Device passcode is not allowed for security. Please try again."
        );
        return;
      }

      // Step 2: Location permission (geofence check)
      setLoadingMessage("Checking location permissions...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for clocking"
        );
        return;
      }

      // Step 3: Get current position (optimized for speed)
      setLoadingMessage("Getting your location...");
      console.log("Getting location with balanced accuracy...");
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Faster than High accuracy
      });

      const { latitude, longitude, accuracy } = position.coords;
      console.log("Location acquired:", { latitude, longitude, accuracy });

      // Step 4: Call Supabase Edge Function
      setLoadingMessage("Verifying location...");

      // Get current session so we can pass the JWT explicitly
      const { data: sessionResult, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        Alert.alert("Auth Error", "Could not get current session.");
        return;
      }

      const accessToken = sessionResult.session?.access_token;

      if (!accessToken) {
        console.error("No access token on session:", sessionResult);
        Alert.alert("Auth Error", "You must be logged in to clock in/out.");
        return;
      }

      console.log("Clock payload:", {
        type,
        lat: latitude,
        lng: longitude,
        accuracy,
      });

      const { data, error } = await supabase.functions.invoke("norcal-edge", {
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

      console.log("Edge function raw result:", { data, error });

      const functionPayload = data as
        | ClockSuccessResponse
        | ClockErrorResponse
        | null;

      const hasSuccess = functionPayload?.success === true;

      if (error || !functionPayload || !hasSuccess) {
        const fallbackMessage =
          type === "IN"
            ? "You need to be closer to the facility to Check In."
            : "You need to be closer to the facility to Check Out.";

        const outOfRangeMessage =
          type === "IN"
            ? "Please move closer to the facility to Check In."
            : "Please move closer to the facility to Check Out.";

        let message =
          functionPayload && !functionPayload.success
            ? functionPayload.message
            : error?.message;

        if (
          (functionPayload as ClockErrorResponse)?.errorCode === "OUT_OF_RANGE"
        ) {
          message = outOfRangeMessage;
        }

        Alert.alert("Clock Failed", message ?? fallbackMessage);
        return;
      }

      const successData = functionPayload as ClockSuccessResponse;
      setIsClockedIn(type === "IN");
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
        status: "OK",
        created_at: successData.timestamp,
        id: successData.eventId,
      });

      // Recalculate today's stats after successful clock event
      await calculateTodaysStats();

      Alert.alert(
        "Success",
        `Checked ${type.toLowerCase()} at ${successData.siteName}`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Clock error:", error);

      // Provide more specific error messages
      if (error.message?.includes("Location request timed out")) {
        Alert.alert(
          "Location Timeout",
          "Unable to get your location quickly enough. Please ensure you have a clear view of the sky and try again."
        );
      } else if (
        error.message?.includes("Network request failed") ||
        error.message?.includes("fetch")
      ) {
        Alert.alert(
          "Network Error",
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };


  if (!user || !employee) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.root,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.root,
      }}
    >
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Top Half - Fixed Content */}
        <View style={{ flex: 0.3, padding: theme.spacing.lg }}>
            {/* Header */}
            <BrutalHeader
              title={`Hi, ${employee.full_name.split(" ")[0]}!`}
            subtitle="Ready to check in?"
              style={{ backgroundColor: "#FFE600" }}
              rightAction={
                <BrutalButton
                  title="Profile"
                  size="sm"
                  onPress={() => navigation.navigate("Profile")}
                  variant="outline"
                  style={{
                    backgroundColor: "#FF9EC4", // pink
                    borderColor: "#000",
                    borderWidth: 4,
                  }}
                />
              }
            />

          {/* Status Card */}
          <BrutalCard
            variant="elevated"
            style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm }} // Tighter spacing
          >
              <View
                style={{
                  alignItems: "center",
                  gap: theme.spacing.sm, // Match spacing between profile and status card
                }}
              >
                {/* Status Pill */}
                <Animated.View
                  style={{
                    transform: [{ scale: statusPulseAnim }],
                  }}
                >
                  <StatusPill
                    status={isClockedIn ? "clockedIn" : "clockedOut"}
                    label={isClockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
                    size="md"
                  />
                </Animated.View>

                {/* Stats Grid */}
                <View
                  style={{
                    width: "100%",
                    gap: theme.spacing.sm, // Tighten gap between individual stats
                  }}
                >
                  {/* Current Session Duration (only when clocked in) */}
                  {isClockedIn && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: theme.spacing.md,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                      >
                        CURRENT SESSION
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.xl,
                          color: theme.colors.success[500],
                          fontWeight: theme.typography.fontWeight.bold,
                          fontVariant: ["tabular-nums"],
                        }}
                      >
                        {sessionDuration}
                      </Text>
                    </View>
                  )}

                  {/* Today's Total Hours */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: theme.spacing.md,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      TODAY'S HOURS
                    </Text>
                    <Text
                      style={{
                        fontSize: theme.typography.fontSize.xl,
                        color: theme.colors.primary[500],
                        fontWeight: theme.typography.fontWeight.bold,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {todaysTotalHours.toFixed(1)}h
                    </Text>
                  </View>

                  {/* Current Location */}
                  {currentSiteName && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: theme.spacing.md,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.secondary,
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                      >
                        LOCATION
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.md,
                          color: theme.colors.text.primary,
                          fontWeight: theme.typography.fontWeight.semibold,
                          textAlign: "right",
                          flex: 1,
                          marginLeft: theme.spacing.md,
                        }}
                        numberOfLines={1}
                      >
                        {currentSiteName}
                      </Text>
                    </View>
                  )}

                  {/* Last Event (smaller, at bottom) */}
                  {lastClockEvent && (
                    <View
                      style={{
                        alignItems: "center",
                        gap: theme.spacing.xs,
                        paddingTop: theme.spacing.xs, // Reduce padding above last event
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.gray[300],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.text.secondary,
                          fontWeight: theme.typography.fontWeight.medium,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Last {lastClockEvent.type.toLowerCase()}
                      </Text>
                      <Text
                        style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text.primary,
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                      >
                        {new Date(lastClockEvent.timestamp).toLocaleDateString()} at{" "}
                        {new Date(lastClockEvent.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </BrutalCard>
        </View>

        {/* Bottom Half - Check Button */}
        <View
          style={{
            flex: 1, // Fill remaining space
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.md, // Reduced padding
          }}
        >
          <Animated.View
            style={{
              width: "100%",
              transform: [{ scale: buttonScaleAnim }],
            }}
          >
            <BrutalButton
              title={loading ? loadingMessage : (isClockedIn ? "Check Out" : "Check In")}
              variant={isClockedIn ? "danger" : "success"}
              size="xl"
              onPress={() => handleClock(isClockedIn ? "OUT" : "IN")}
              disabled={loading}
              loading={loading}
              style={{
                width: "100%",
                height: 200, // Even bigger height
                justifyContent: "center",
                alignItems: "center",
              }}
              textStyle={{
                fontSize: 60, // Even bigger font size
                fontWeight: "900",
                letterSpacing: 2,
              }}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
