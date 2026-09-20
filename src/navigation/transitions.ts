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
  freezeOnBlur: true,
  contentStyle: {
    backgroundColor: '#FFF8EB',
  },
};

/**
 * Home grid columns (2-col):
 *  Dice | Wheel
 *  Room | Bracket
 *  Profile | Settings
 * Left column → slide_from_left; right → slide_from_right.
 */
export const fromLeftOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  animation: 'slide_from_left',
  animationDuration: TRANSITION_MS,
};

export const fromRightOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  animation: 'slide_from_right',
  animationDuration: TRANSITION_MS,
};

/** Left column: Dice, Room, Profile */
export const playDiceOptions = fromLeftOptions;
export const roomFromLeftOptions = fromLeftOptions;
export const profileOptions = fromLeftOptions;

/** Right column: Wheel, Bracket, Settings */
export const playWheelOptions = fromRightOptions;
export const roomFromRightOptions = fromRightOptions;
export const settingsOptions = fromRightOptions;

/** @deprecated use roomFromLeftOptions / roomFromRightOptions */
export const roomOptions = fromRightOptions;

export const modalOptions: NativeStackNavigationOptions = {
  ...stackScreenDefaults,
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: TRANSITION_MS,
};
