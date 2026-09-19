import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

import { DieFace } from './DieFace';

type Props = {
  size: number;
  value: number;
  /** Increment to trigger a roll toward `value`. */
  rollNonce: number;
  /** Stagger index so multi-dice don't sync perfectly. */
  index?: number;
  onSettled?: () => void;
};

/**
 * Single die with 3D-style tumble (perspective + rotateX/Y + bounce).
 * Face values flash during spin, then settle on `value`.
 * No haptics here — parent fires once on ROLL.
 */
export function DiceCube({
  size,
  value,
  rollNonce,
  index = 0,
  onSettled,
}: Props) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const faceFlash = useSharedValue(0);
  const displayValue = useSharedValue(value);

  // JS state mirror for DieFace (can't read shared value in React tree easily)
  // We drive face via interval coordinated with animation duration.

  useEffect(() => {
    if (rollNonce === 0) return;

    const delay = index * 90;
    const spinMs = 1400 + index * 120; // slower, natural
    const settleMs = 320;

    // Random tumble magnitudes (multiple full turns)
    const turnsX = 3 + Math.floor(Math.random() * 3); // 3–5
    const turnsY = 4 + Math.floor(Math.random() * 3); // 4–6
    const endX = turnsX * 360 + (Math.random() > 0.5 ? 12 : -8);
    const endY = turnsY * 360 + (Math.random() > 0.5 ? -10 : 15);

    rotateX.value = 0;
    rotateY.value = 0;
    bounceY.value = 0;

    rotateX.value = withDelay(
      delay,
      withTiming(endX, {
        duration: spinMs,
        easing: Easing.out(Easing.cubic),
      }),
    );
    rotateY.value = withDelay(
      delay,
      withTiming(endY, {
        duration: spinMs,
        easing: Easing.out(Easing.cubic),
      }),
    );

    // Table bounce near the end
    bounceY.value = withDelay(
      delay + spinMs * 0.55,
      withSequence(
        withTiming(-18, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: settleMs, easing: Easing.bounce }),
      ),
    );

    faceFlash.value = withDelay(
      delay,
      withTiming(1, { duration: spinMs }, (finished) => {
        if (finished && onSettled) runOnJS(onSettled)();
      }),
    );
  }, [rollNonce, index, onSettled, bounceY, faceFlash, rotateX, rotateY]);

  const style = useAnimatedStyle(() => {
    // Subtle scale pulse as it “lands”
    const land = interpolate(bounceY.value, [-18, 0], [0.94, 1]);
    return {
      transform: [
        { perspective: 700 },
        { translateY: bounceY.value },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: land },
      ],
    };
  });

  return (
    <View style={[styles.shadowWrap, { width: size, height: size }]}>
      <Animated.View style={[styles.cube, { width: size, height: size }, style]}>
        <DieFace value={value} size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cube: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
