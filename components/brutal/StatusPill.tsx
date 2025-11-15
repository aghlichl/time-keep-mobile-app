import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, borderWidth, borderRadius, typography } from '../../theme/brutal-theme';

interface StatusPillProps {
  status: 'clockedIn' | 'clockedOut' | 'pending';
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function StatusPill({
  status,
  label,
  size = 'md',
  style,
  textStyle,
}: StatusPillProps) {
  const getBackgroundColor = () => {
    switch (status) {
      case 'clockedIn':
        return colors.success[500]; // Semantic success color
      case 'clockedOut':
        return colors.error[500]; // Semantic error color
      case 'pending':
        return colors.accent[500]; // Use accent for pending states (30% usage)
      default:
        return colors.surface; // Neutral surface background
    }
  };

  const sizeConfig = {
    sm: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: borderRadius.small,
      fontSize: typography.button.fontSize - 4,
    },
    md: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.medium,
      fontSize: typography.button.fontSize - 2,
    },
    lg: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: borderRadius.large,
      fontSize: typography.button.fontSize,
    },
  };

  const config = sizeConfig[size];

  const pillStyles: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: colors.text, // Use semantic text color
    borderWidth: borderWidth,
    borderRadius: config.borderRadius,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingVertical: config.paddingVertical,
    paddingHorizontal: config.paddingHorizontal,
  };

  const textStyles: TextStyle = {
    fontSize: config.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text, // Use semantic text color
    textAlign: 'center',
    letterSpacing: typography.letterSpacing,
  };

  return (
    <View style={[pillStyles, style]}>
      <Text style={[textStyles, textStyle]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
