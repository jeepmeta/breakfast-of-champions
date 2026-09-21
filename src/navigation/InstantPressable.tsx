import { type ComponentProps, type ReactNode } from 'react';
import { Pressable as GHPressable } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { SPRINGS } from '../constants/springs';
import { haptic } from '../lib/haptics';

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

/** Gesture-handler Pressable + bounce scale + optional haptic. */
export function InstantPressable({
  children,
  onPress,
  disabled,
  haptic: doHaptic = true,
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
        scale.value = withSpring(0.94, SPRINGS.stiff);
      }}
      onPressOut={() => {
        scale.value = withSequence(
          withSpring(1.04, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        );
      }}
      onPress={() => {
        if (doHaptic) haptic.light();
        onPress?.();
      }}
      style={[animStyle, style]}
    >
      {children}
    </AnimatedGHPressable>
  );
}
