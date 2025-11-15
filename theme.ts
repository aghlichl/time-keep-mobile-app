import { ViewStyle, TextStyle } from 'react-native';

// Design System Color Palette following 60-30-10 rule
export const colors = {
  // Primary (10% usage - CTAs, key highlights) - Blue scale
  primary: {
    50: '#EFF6FF',   // Subtle primary-tinted backgrounds
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main primary blue
    600: '#2563EB',  // Darker primary for hover/press states
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary / Accent (up to 30% usage - charts, tags, secondary buttons) - Orange scale
  accent: {
    50: '#FFF7ED',   // Subtle accent-tinted backgrounds
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',  // Main accent orange
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  // Semantic colors - keeping these for status indicators but toning down saturation
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Muted green for success states
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Muted red for error states
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Amber for warning states (less saturated than pure orange)
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Neutral Colors - Following design system neutrals
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#F3F4F6',  // Matches bg-surface-2 light
    300: '#E5E7EB',  // Matches border-subtle light
    400: '#D1D5DB',
    500: '#6B7280',  // Matches text-muted
    600: '#4B5563',  // Matches text-secondary
    700: '#374151',
    800: '#1F2937',  // Matches border-subtle dark
    900: '#111827',  // Matches bg-surface-1 dark
  },

  // Background colors - Light mode variants (60% usage)
  background: {
    root: '#F5F5F7',      // bg-root light
    surface1: '#FFFFFF',  // bg-surface-1 light
    surface2: '#F3F4F6',  // bg-surface-2 light
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  // Dark mode background colors
  backgroundDark: {
    root: '#0B0B10',      // bg-root dark
    surface1: '#111827',  // bg-surface-1 dark
    surface2: '#1F2933',  // bg-surface-2 dark
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  // Text colors - Following design system
  text: {
    primary: '#111827',     // text-primary light
    secondary: '#4B5563',   // text-secondary light
    muted: '#6B7280',       // text-muted
    inverse: '#F9FAFB',     // text-primary dark
    accent: '#3B82F6',      // Use primary instead of red
  },

  // Dark mode text colors
  textDark: {
    primary: '#F9FAFB',     // text-primary dark
    secondary: '#9CA3AF',   // text-secondary dark
    muted: '#6B7280',       // text-muted (same for both modes)
  },
};

// Spacing Scale - Generous and breathing room
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128,
};

// Border Radius Scale - Playful but structured
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  full: 9999,
};

// Border Width Scale - Thick and bold
export const borderWidth = {
  none: 0,
  thin: 1,
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  '2xl': 12,
};

// Shadow Presets - Dramatic and 3D
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  brutal: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 10,
  },
  inner: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
};

// Typography Scale - Bold and playful
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  fontWeight: {
    thin: '100' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
};

// Animation Configs - Smooth like Apple/Robinhood
export const animations = {
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  timing: {
    duration: 300,
    easing: 'easeInOut' as const,
  },
  bounce: {
    damping: 12,
    stiffness: 400,
    mass: 1,
  },
};

// Component-specific themes - Updated to follow 60-30-10 rule
export const componentThemes = {
  button: {
    variants: {
      primary: {
        backgroundColor: colors.primary[500], // 10% usage - main CTAs
        borderColor: colors.primary[600],
        borderWidth: borderWidth.md,
        shadow: shadows.brutal,
      },
      secondary: {
        backgroundColor: colors.accent[500], // Up to 30% usage - secondary buttons
        borderColor: colors.accent[600],
        borderWidth: borderWidth.md,
        shadow: shadows.brutal,
      },
      success: {
        backgroundColor: colors.success[500], // Semantic color for positive actions
        borderColor: colors.success[600],
        borderWidth: borderWidth.md,
        shadow: shadows.brutal,
      },
      danger: {
        backgroundColor: colors.error[500], // Semantic color for destructive actions
        borderColor: colors.error[600],
        borderWidth: borderWidth.md,
        shadow: shadows.brutal,
      },
      outline: {
        backgroundColor: 'transparent', // Neutral background for subtle actions
        borderColor: colors.primary[500],
        borderWidth: borderWidth.md,
        shadow: shadows.md,
      },
    },
    sizes: {
      sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
      },
      md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
      },
      lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.xl,
      },
      xl: {
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing['2xl'],
        borderRadius: borderRadius['2xl'],
      },
    },
  },

  card: {
    variants: {
      default: {
        backgroundColor: colors.background.surface1, // 60% usage - neutral surface
        borderColor: colors.gray[300],
        borderWidth: borderWidth.sm,
        shadow: shadows.md,
      },
      elevated: {
        backgroundColor: colors.background.surface1, // 60% usage - neutral surface
        borderColor: colors.gray[400],
        borderWidth: borderWidth.md,
        shadow: shadows.lg,
      },
      brutal: {
        backgroundColor: colors.background.surface1, // 60% usage - neutral surface
        borderColor: colors.gray[800],
        borderWidth: borderWidth.lg,
        shadow: shadows.brutal,
      },
    },
    borderRadius: borderRadius.xl,
  },

  status: {
    clockedIn: {
      backgroundColor: colors.success[500], // Semantic success color
      borderColor: colors.success[600],
      textColor: colors.text.inverse,
    },
    clockedOut: {
      backgroundColor: colors.error[500], // Semantic error color
      borderColor: colors.error[600],
      textColor: colors.text.inverse,
    },
    pending: {
      backgroundColor: colors.accent[500], // Use accent for pending states (30% usage)
      borderColor: colors.accent[600],
      textColor: colors.text.primary,
    },
  },
};

// Main theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  typography,
  animations,
  componentThemes,
};

// Type exports for better TypeScript support
export type ColorScheme = typeof colors;
export type SpacingScale = typeof spacing;
export type BorderRadiusScale = typeof borderRadius;
export type ShadowPresets = typeof shadows;
export type TypographyScale = typeof typography;
export type Theme = typeof theme;
