import React from 'react';
import { Animated, Easing } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { theme } from '../theme';

// Custom transition configuration using React Native Animated
export const brutalTransitionSpec = {
  animation: 'timing',
  config: {
    duration: theme.animations.timing.duration,
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Custom easing curve
    useNativeDriver: true,
  },
};

export const brutalCardStyleInterpolator = ({ current, next, layouts }: any) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
    extrapolate: 'clamp',
  });

  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
    extrapolate: 'clamp',
  });

  const opacity = current.progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  const overlayOpacity = next
    ? next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.3],
        extrapolate: 'clamp',
      })
    : 0;

  return {
    cardStyle: {
      transform: [{ translateX }, { scale }],
      opacity,
    },
    overlayStyle: {
      opacity: overlayOpacity,
    },
  };
};

export const brutalSlideFromRight = {
  gestureDirection: 'horizontal' as const,
  transitionSpec: {
    open: brutalTransitionSpec,
    close: brutalTransitionSpec,
  },
  cardStyleInterpolator: brutalCardStyleInterpolator,
};

export const brutalModalPresentation = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 400,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Bounce effect
        useNativeDriver: true,
      },
    },
    close: brutalTransitionSpec,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => {
    const translateY = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.height, 0],
      extrapolate: 'clamp',
    });

    const scale = current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
      extrapolate: 'clamp',
    });

    const borderRadius = current.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [theme.borderRadius.xl, theme.borderRadius.lg, 0],
      extrapolate: 'clamp',
    });

    return {
      cardStyle: {
        transform: [{ translateY }, { scale }],
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
        overflow: 'hidden',
      },
      overlayStyle: {
        backgroundColor: theme.colors.background.overlay,
      },
    };
  },
};

// Create enhanced Stack Navigator with brutal animations
export const createBrutalStackNavigator = () => {
  const Stack = createStackNavigator();

  const BrutalStackNavigator = ({ children, ...props }: any) => (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...brutalSlideFromRight,
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
      {...props}
    >
      {children}
    </Stack.Navigator>
  );

  return { Stack, BrutalStackNavigator };
};

// Screen wrapper for consistent animations
export const withBrutalAnimation = (Component: React.ComponentType<any>) => {
  return React.forwardRef((props: any, ref: any) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          ...theme.animations.spring,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim]);

    return (
      <Animated.View
        ref={ref}
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Component {...props} />
      </Animated.View>
    );
  });
};
