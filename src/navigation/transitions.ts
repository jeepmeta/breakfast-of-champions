import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

/** Target duration for push/pop (ms). Keep ≤200 for instant feel. */
export const TRANSITION_MS = 180;

/**
 * Shared native-stack defaults — lean on react-native-screens for 60fps
 * transitions and full-screen back gestures (iOS).
 */
export const stackScreenDefaults: NativeStackNavigationOptions = {
  headerShown: false,
  animation: Platform.select({
    ios: 'default',
    android: 'fade_from_bottom',
    default: 'fade',
  }),
  animationDuration: TRANSITION_MS,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  // Detach inactive screens from the view hierarchy (memory + jank)
  freezeOnBlur: true,
  contentStyle: {
    backgroundColor: '#FFF8EB',
  },
};

export const playDiceOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  animation: 'slide_from_left',
  animationDuration: TRANSITION_MS,
};

export const playWheelOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  animation: 'slide_from_right',
  animationDuration: TRANSITION_MS,
};

export const roomOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  animation: 'slide_from_right',
  animationDuration: TRANSITION_MS,
};

export const modalOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: TRANSITION_MS,
};
