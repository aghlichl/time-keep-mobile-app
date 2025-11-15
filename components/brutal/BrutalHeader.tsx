import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, borderWidth, borderRadius, typography } from '../../theme/brutal-theme';

interface BrutalHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

export function BrutalHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  style,
  titleStyle,
  subtitleStyle,
}: BrutalHeaderProps) {
  const defaultHeaderStyles: ViewStyle = {
    backgroundColor: colors.surface, // Default background
    borderColor: colors.text, // Use semantic text color
    borderWidth: borderWidth,
    borderRadius: borderRadius.medium, // Using medium for headers for a chunky feel
    padding: 20, // Generous spacing
    marginBottom: 20, // Generous spacing
    overflow: 'hidden',
  };

  const titleTextStyles: TextStyle = {
    ...typography.h1,
    textAlign: 'center',
  };

  const subtitleTextStyles: TextStyle = {
    ...typography.body,
    marginTop: 8,
    textAlign: 'center',
  };

  return (
    <View style={[defaultHeaderStyles, style]}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: subtitle ? 16 : 0, // Adjusted spacing
      }}>
        {leftAction && (
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            {leftAction}
          </View>
        )}

        <View style={{ flex: leftAction || rightAction ? 2 : 1, alignItems: 'center' }}>
          <Text style={[titleTextStyles, titleStyle]}>
            {title}
          </Text>
        </View>

        {rightAction && (
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {rightAction}
          </View>
        )}
      </View>

      {subtitle && (
        <Text style={[subtitleTextStyles, subtitleStyle]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
