import { type ComponentProps, type ReactNode } from 'react';
import { Pressable as GHPressable } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPRINGS } from '../constants/springs';

const AnimatedGHPressable = Animated.createAnimatedComponent(GHPressable);

type Props = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Fire light haptic on press (default true). */
  haptic?: boolean;
  style?: ComponentProps<typeof GHPressable>['style'];
  accessibilityLabel?: string;
  accessibilityRole?: ComponentProps<typeof GHPressable>['accessibilityRole'];
};

/**
 * Gesture-handler Pressable + micro scale + optional haptic.
 * Prefer this over RN Pressable for lower touch latency under concurrent gestures.
 */
export function InstantPressable({
  children,
  onPress,
  disabled,
  haptic = true,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
}: Props) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedGHPressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, SPRINGS.stiff);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRINGS.snappy);
      }}
      onPress={() => {
        if (haptic) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => undefined,
          );
        }
        onPress?.();
      }}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedGHPressable>
  );
}
