import React from 'react';
import {
  Pressable,
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderWidth, borderRadius, typography } from '../../theme/brutal-theme';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface BrutalTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
}

export function BrutalTabBar({
  tabs,
  activeTab,
  onTabPress,
  style,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
}: BrutalTabBarProps) {
  const handleTabPress = (tabKey: string) => {
    if (tabKey === activeTab) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(tabKey);
  };

  const containerStyles: ViewStyle = {
    flexDirection: 'row',
    backgroundColor: colors.surface, // Neutral surface background (60% usage)
    borderColor: colors.text, // Semantic text color for borders
    borderWidth: borderWidth,
    borderRadius: borderRadius.medium,
    padding: 8, // Generous spacing
    gap: 8,
  };

  const baseTabStyles: ViewStyle = {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth,
    borderColor: 'transparent',
    overflow: 'hidden',
  };

  const activeTabStyles: ViewStyle = {
    backgroundColor: colors.primary[500], // Primary blue for active state (10% usage)
    borderColor: colors.text,
  };

  const inactiveTabStyles: ViewStyle = {
    backgroundColor: colors.surfaceSecondary, // Neutral secondary surface
    borderColor: colors.border, // Semantic border color
  };

  const baseTextStyles: TextStyle = {
    ...typography.button,
    color: colors.text, // Semantic text color
  };

  return (
    <View style={[containerStyles, style]}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={({ pressed }) => [
              baseTabStyles,
              isActive ? activeTabStyles : inactiveTabStyles,
              pressed && {
                transform: [{ translateY: borderWidth }],
              },
              tabStyle,
              isActive && activeTabStyle,
            ]}
          >
            {tab.icon && (
              <View
                style={{
                  backgroundColor: colors.surface, // Neutral surface for icon background
                  borderColor: colors.text, // Semantic text color for borders
                  borderWidth: borderWidth,
                  borderRadius: borderRadius.small,
                  padding: 8, // Oversized icon padding
                  marginBottom: 4,
                }}
              >
                {/*
                  // @ts-ignore */}
                {React.cloneElement(tab.icon as React.ReactElement, {
                  color: colors.text, // Semantic text color for icons
                  size: 24, // Oversized
                })}
              </View>
            )}
            <Text style={[
              baseTextStyles,
              textStyle,
              isActive && activeTextStyle,
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
