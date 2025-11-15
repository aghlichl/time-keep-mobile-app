# Neo-Brutalist UI Components

A premium neo-brutalist design system for React Native + Expo using only React Native Animated (no Reanimated).

## Components

### BrutalButton
Animated button with press effects and multiple variants.

```tsx
import { BrutalButton } from './components/brutal';

<BrutalButton
  title="Click Me"
  variant="primary" // 'primary' | 'secondary' | 'success' | 'danger' | 'outline'
  size="md" // 'sm' | 'md' | 'lg' | 'xl'
  onPress={() => console.log('Pressed')}
  disabled={false}
  loading={false}
  hapticFeedback={true}
/>
```

### BrutalCard
Elevated container with subtle animations.

```tsx
import { BrutalCard } from './components/brutal';

<BrutalCard
  variant="elevated" // 'default' | 'elevated' | 'brutal'
  onPress={() => console.log('Pressed')} // optional
  style={{ margin: 16 }}
>
  <Text>Card content</Text>
</BrutalCard>
```

### StatusPill
Animated status indicator with pulsing effects.

```tsx
import { StatusPill } from './components/brutal';

<StatusPill
  status="clockedIn" // 'clockedIn' | 'clockedOut' | 'pending'
  label="CLOCKED IN"
  size="lg" // 'sm' | 'md' | 'lg'
  animated={true}
/>
```

### BrutalHeader
Bold header with optional actions.

```tsx
import { BrutalHeader } from './components/brutal';

<BrutalHeader
  title="Page Title"
  subtitle="Optional subtitle"
  leftAction={<BrutalButton title="Back" variant="outline" size="sm" />}
  backgroundColor= '#FFE600' 
  rightAction={<BrutalButton title="Settings" variant="outline" size="sm" />}
  variant="default" // 'default' | 'gradient' | 'brutal'
/>
```

### BrutalTabBar
Animated tab navigation with smooth transitions.

```tsx
import { BrutalTabBar } from './components/brutal';

const tabs = [
  { key: 'stats', label: 'Stats' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'settings', label: 'Settings' },
];

<BrutalTabBar
  tabs={tabs}
  activeTab="stats"
  onTabPress={(tabKey) => setActiveTab(tabKey)}
/>
```

## Theme System

The design system uses a comprehensive theme defined in `theme.ts` with:

- **Colors**: Neo-brutalist color palette with primary, secondary, accent, success, error, and warning colors
- **Spacing**: Generous spacing scale from 4px to 128px
- **Border Radius**: Playful rounded corners from 8px to 48px
- **Shadows**: Dramatic shadow presets including the signature "brutal" shadow
- **Typography**: Bold typography with proper line heights and letter spacing
- **Animations**: Spring and timing configurations for smooth interactions

## Animation Features

- **Screen Transitions**: Smooth slide animations between screens
- **Press Effects**: Scale and opacity animations on button presses
- **Entrance Animations**: Staggered card animations on screen load
- **Status Animations**: Pulsing effects for status indicators
- **Scroll Effects**: Parallax effects on scrollable content

## Usage in Expo Go

All components work in Expo Go with the managed workflow - no custom native modules required. Uses only:

- React Native core (Animated, Easing, LayoutAnimation, etc.)
- Expo libraries (expo-haptics, expo-blur, expo-linear-gradient)
- NativeWind for styling

## File Structure

```
components/brutal/
├── BrutalButton.tsx
├── BrutalCard.tsx
├── StatusPill.tsx
├── BrutalHeader.tsx
├── BrutalTabBar.tsx
├── index.ts
└── README.md

theme.ts
navigation/
├── RootNavigator.tsx
└── AnimatedNavigator.tsx

screens/
├── ClockScreen.tsx
├── ProfileScreen.tsx
└── LoginScreen.tsx
```
