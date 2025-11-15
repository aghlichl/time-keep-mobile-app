import React from 'react';
import {
  Pressable,
  Text,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, borderWidth, borderRadius, typography } from '../../theme/brutal-theme';

interface BrutalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  hapticFeedback?: boolean;
}

export function BrutalButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  hapticFeedback = true,
}: BrutalButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary[500]; // Primary blue (10% usage)
      case 'secondary':
        return colors.accent[500]; // Accent orange (30% usage)
      case 'success':
        return colors.success[500]; // Muted green for success
      case 'danger':
        return colors.error[500]; // Muted red for error
      case 'outline':
        return colors.surface; // Neutral surface background
      default:
        return colors.primary[500];
    }
  };

  const getBorderRadius = () => {
    switch (size) {
      case 'sm':
        return borderRadius.small;
      case 'md':
        return borderRadius.medium;
      case 'lg':
      case 'xl':
        return borderRadius.large;
      default:
        return borderRadius.medium;
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress();
  };

  const buttonStyles: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: colors.text, // Use semantic text color instead of hard-coded black
    borderWidth: borderWidth,
    borderRadius: getBorderRadius(),
    paddingVertical: size === 'sm' ? 10 : size === 'lg' || size === 'xl' ? 20 : 15,
    paddingHorizontal: size === 'sm' ? 15 : size === 'lg' || size === 'xl' ? 30 : 20,
    opacity: disabled ? 0.5 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  const textStyles: TextStyle = {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any, // Cast to avoid TypeScript strict checking
    color: colors.text, // Use semantic text color instead of hard-coded black
    textAlign: typography.button.textAlign as any, // Cast to avoid TypeScript strict checking
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyles,
        pressed && !disabled && !loading && {
          transform: [{ translateY: borderWidth }], // Simulate push effect
        },
        style,
      ]}
    >
      {icon && !loading && icon}
      <Text style={[textStyles, textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </Pressable>
  );
}
