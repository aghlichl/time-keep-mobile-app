import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrutalButton, BrutalCard, BrutalHeader, BrutalTabBar, StatusPill } from '../components/brutal';
import { theme } from '../theme';
import { useAuth } from '../auth/AuthContext';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState('stats');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Card animations
  const cardAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

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

    // Stagger card animations
    cardAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: index * 150,
        ...theme.animations.spring,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim, slideAnim, cardAnims]);

  const tabItems = [
    { key: 'stats', label: 'Stats' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'settings', label: 'Settings' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  const renderStatsTab = () => (
    <View style={{ gap: theme.spacing.lg }}>
      <Animated.View style={{
        transform: [{
          translateY: cardAnims[0].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })
        }],
        opacity: cardAnims[0],
      }}>
        <BrutalCard
          variant="elevated"
          style={{
            backgroundColor: "#FFE600",
            borderColor: "#000",
            borderWidth: 4,
          }}
        >
          <View style={{ alignItems: 'center', gap: theme.spacing.md }}>
            <Text style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.black,
              color: "#000",
            }}>
              This Week
            </Text>
            <View style={{
              flexDirection: 'row',
              gap: theme.spacing.lg,
              alignItems: 'center',
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: theme.typography.fontSize['4xl'],
                  fontWeight: theme.typography.fontWeight.black,
                  color: theme.colors.success[500],
                }}>
                  32.5
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  fontWeight: theme.typography.fontWeight.medium,
                }}>
                  HOURS
                </Text>
              </View>
              <View style={{
                width: 2,
                height: 60,
                backgroundColor: theme.colors.gray[300],
                borderRadius: 1,
              }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: theme.typography.fontSize['4xl'],
                  fontWeight: theme.typography.fontWeight.black,
                  color: theme.colors.primary[500],
                }}>
                  5
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary,
                  fontWeight: theme.typography.fontWeight.medium,
                }}>
                  DAYS
                </Text>
              </View>
            </View>
          </View>
        </BrutalCard>
      </Animated.View>

      <Animated.View style={{
        transform: [{
          translateY: cardAnims[1].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })
        }],
        opacity: cardAnims[1],
      }}>
        <BrutalCard
          variant="default"
          style={{
            backgroundColor: "#4ECDC4",
            borderColor: "#000",
            borderWidth: 4,
          }}
        >
          <View style={{ gap: theme.spacing.md }}>
            <Text style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: "#000",
            }}>
              Recent Activity
            </Text>
            <View style={{ gap: theme.spacing.sm }}>
              {[
                { time: '9:15 AM', action: 'Clocked In', site: 'Main Office' },
                { time: '5:30 PM', action: 'Clocked Out', site: 'Main Office' },
                { time: '9:00 AM', action: 'Clocked In', site: 'Branch A' },
              ].map((activity, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  backgroundColor: theme.colors.gray[50],
                  borderRadius: theme.borderRadius.md,
                  borderWidth: theme.borderWidth.thin,
                  borderColor: theme.colors.gray[200],
                }}>
                  <View>
                    <Text style={{
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: "#000",
                    }}>
                      {activity.action}
                    </Text>
                    <Text style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: "#333",
                    }}>
                      {activity.site}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: "#333",
                    fontWeight: theme.typography.fontWeight.medium,
                  }}>
                    {activity.time}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </BrutalCard>
      </Animated.View>
    </View>
  );

  const renderScheduleTab = () => (
    <Animated.View style={{
      transform: [{
        translateY: cardAnims[0].interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        })
      }],
      opacity: cardAnims[0],
    }}>
      <BrutalCard
        variant="brutal"
        style={{
          backgroundColor: "#A855F7",
          borderColor: "#000",
          borderWidth: 4,
        }}
      >
        <View style={{ alignItems: 'center', gap: theme.spacing.lg }}>
          <Text style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.black,
            color: "#FFF",
            textAlign: 'center',
          }}>
            Work Schedule
          </Text>
          <View style={{ gap: theme.spacing.md, width: '100%' }}>
            {[
              { day: 'Monday', hours: '9:00 AM - 5:00 PM' },
              { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },
              { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },
              { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },
              { day: 'Friday', hours: '9:00 AM - 5:00 PM' },
            ].map((schedule, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.md,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: theme.borderRadius.lg,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
                <Text style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: "#FFF",
                }}>
                  {schedule.day}
                </Text>
                <Text style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: "#E0E0E0",
                  fontWeight: theme.typography.fontWeight.medium,
                }}>
                  {schedule.hours}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </BrutalCard>
    </Animated.View>
  );

  const renderSettingsTab = () => (
    <View style={{ gap: theme.spacing.lg }}>
      <Animated.View style={{
        transform: [{
          translateY: cardAnims[0].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          })
        }],
        opacity: cardAnims[0],
      }}>
        <BrutalCard
          variant="default"
          style={{
            backgroundColor: "#9B59B6",
            borderColor: "#000",
            borderWidth: 4,
          }}
        >
          <View style={{ gap: theme.spacing.md }}>
            <Text style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: "#FFF",
            }}>
              Account Settings
            </Text>
            <View style={{ gap: theme.spacing.sm }}>
              <BrutalButton
                title="Change Password"
                variant="primary"
                size="md"
                onPress={() => {}}
                style={{
                  backgroundColor: "#FF9EC4",
                  borderColor: "#000",
                  borderWidth: 4,
                }}
              />
              <BrutalButton
                title="Notification Settings"
                variant="primary"
                size="md"
                onPress={() => {}}
                style={{
                  backgroundColor: "#00FF88",
                  borderColor: "#000",
                  borderWidth: 4,
                }}
              />
              <BrutalButton
                title="Location Settings"
                variant="primary"
                size="md"
                onPress={() => {}}
                style={{
                  backgroundColor: "#FFD700",
                  borderColor: "#000",
                  borderWidth: 4,
                }}
              />
            </View>
          </View>
        </BrutalCard>
      </Animated.View>

      <View style={{ alignItems: 'center', paddingTop: theme.spacing.lg }}>
        <BrutalButton
          title="Logout"
          variant="danger"
          size="lg"
          onPress={handleLogout}
        />
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return renderStatsTab();
      case 'schedule':
        return renderScheduleTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderStatsTab();
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.colors.background.root,
    }}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header with parallax effect */}
        <Animated.View
          style={{
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 200],
                outputRange: [0, -50],
                extrapolate: 'clamp',
              }),
            }],
          }}
        >
          <BrutalHeader
            title="Profile"
            subtitle="Manage your account"
            style={{ backgroundColor: "#00D4FF" }}
            leftAction={
              <BrutalButton
                title="Back"
                variant="outline"
                size="sm"
                onPress={() => navigation.goBack()}
                style={{
                  backgroundColor: "#FF6B9D",
                  borderColor: "#000",
                  borderWidth: 4,
                }}
              />
            }
          />
        </Animated.View>

        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing['3xl'],
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          {/* Tab Bar */}
          <BrutalTabBar
            tabs={tabItems}
            activeTab={activeTab}
            onTabPress={setActiveTab}
            style={{ marginBottom: theme.spacing.xl }}
          />

          {/* Tab Content */}
          {renderTabContent()}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
