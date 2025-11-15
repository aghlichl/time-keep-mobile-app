// Design System Colors following 60-30-10 rule and semantic naming
export const colors = {
  // Primary (10% usage - CTAs, key highlights)
  primary: {
    500: '#3B82F6',  // Main primary blue
    600: '#2563EB',  // Darker primary for hover/press states
    50: '#EFF6FF',   // Subtle primary-tinted backgrounds
  },

  // Secondary / Accent (up to 30% usage - charts, tags, secondary buttons)
  accent: {
    500: '#F97316',  // Main accent orange
    50: '#FFF7ED',   // Subtle accent-tinted backgrounds
  },

  // Semantic colors for status indicators
  success: {
    500: '#22C55E',  // Muted green for success states
  },
  error: {
    500: '#EF4444',  // Muted red for error states
  },

  // Neutral / Surfaces (60% usage - backgrounds, cards, borders)
  // Light mode variants
  light: {
    bgRoot: '#F5F5F7',
    bgSurface1: '#FFFFFF',
    bgSurface2: '#F3F4F6',
    borderSubtle: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
  },

  // Dark mode variants
  dark: {
    bgRoot: '#0B0B10',
    bgSurface1: '#111827',
    bgSurface2: '#1F2933',
    borderSubtle: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
  },

  // Semantic aliases for easier usage
  background: '#F5F5F7',        // Default to light mode bg-root
  surface: '#FFFFFF',           // Default to light mode surface-1
  surfaceSecondary: '#F3F4F6',  // Default to light mode surface-2
  border: '#E5E7EB',           // Default to light mode border-subtle
  text: '#111827',             // Default to light mode text-primary
  textSecondary: '#4B5563',    // Default to light mode text-secondary
  textMuted: '#6B7280',        // Default to light mode text-muted

  // Legacy support - these will be deprecated
  white: '#FFFFFF',
  black: '#000000',
};

export const borderWidth = 4;
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
};

export const typography = {
  fontFamily: 'Inter Black', // Assuming Inter Black is available, otherwise a similar heavy bold font
  // Or 'Helvetica Heavy'
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  h1: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text, // Use semantic text color instead of hard-coded black
  },
  h2: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text, // Use semantic text color instead of hard-coded black
  },
  body: {
    fontSize: 16,
    fontWeight: "normal",
    color: colors.text, // Use semantic text color instead of hard-coded black
  },
  button: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text, // Use semantic text color instead of hard-coded black
    textAlign: "center",
  },
};
