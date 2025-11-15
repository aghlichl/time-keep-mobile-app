import React from 'react';
import {
  Pressable,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderWidth, borderRadius } from '../../theme/brutal-theme';

interface BrutalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'brutal';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  hapticFeedback?: boolean;
  animated?: boolean;
}

export function BrutalCard({
  children,
  variant = 'default',
  onPress,
  style,
  contentStyle,
  hapticFeedback = true,
  animated = true,
}: BrutalCardProps) {
  const getBackgroundColor = () => {
    // Use neutral surface for cards (60% usage) following design system
    return colors.surface; // Neutral surface background
  };

  const handlePress = () => {
    if (!onPress) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const cardStyles: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: colors.text, // Use semantic text color instead of hard-coded black
    borderWidth: borderWidth,
    borderRadius: borderRadius.medium, // Using medium for general cards
    overflow: 'hidden',
    padding: 16, // Generous spacing
  };

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          pressed && {
            transform: [{ translateY: borderWidth }], // Simulate push effect
          },
        ]}
      >
        <View style={[cardStyles, style]}>
          <View style={contentStyle}>
            {children}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[cardStyles, style]}>
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
}
