import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

import { ResultPopup } from '../ui/ResultPopup';
import { colors } from '../../theme/colors';
import { neu, affect } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';
import { SPRINGS } from '../../constants/springs';

const CHEERS = [
  'Nice!',
  'Sweet!',
  'Delicious!',
  'Buttery!',
  'Crispy!',
  'Perfect!',
  'Lucky!',
  'Wow!',
  'Boom!',
  'Chef’s kiss!',
  'Stacked!',
  'Golden!',
] as const;

type Props = {
  visible: boolean;
  total: number;
  details: number[];
  onDismiss: () => void;
};

export function DiceResultPopup({
  visible,
  total,
  details,
  onDismiss,
}: Props) {
  const cheer = useMemo(
    () => CHEERS[Math.floor(Math.random() * CHEERS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, total],
  );

  const totalScale = useSharedValue(0.6);
  const totalOp = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      totalOp.value = withDelay(80, withTiming(1, { duration: 120 }));
      totalScale.value = withDelay(
        80,
        withSequence(
          withSpring(1.08, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
    } else {
      totalOp.value = 0;
      totalScale.value = 0.6;
    }
  }, [visible, totalOp, totalScale]);

  const totalStyle = useAnimatedStyle(() => ({
    opacity: totalOp.value,
    transform: [{ scale: totalScale.value }],
  }));

  const subtitle =
    details.length > 1
      ? details.join(' + ')
      : details.length === 1
        ? `Rolled a ${details[0]}`
        : undefined;

  return (
    <ResultPopup
      visible={visible}
      onDismiss={onDismiss}
      width={232}
      height={360}
      borderColor={affect.delight.softBorder}
    >
      <View style={styles.cornerTL} pointerEvents="none">
        <Text style={styles.pipNum}>{total}</Text>
        <Text style={styles.pipSuit}>🎲</Text>
      </View>
      <View style={styles.cornerBR} pointerEvents="none">
        <Text style={[styles.pipNum, styles.pipFlip]}>{total}</Text>
        <Text style={[styles.pipSuit, styles.pipFlip]}>🎲</Text>
      </View>

      <View style={styles.center} pointerEvents="none">
        <Text style={styles.badge}>TOTAL</Text>
        <Animated.Text style={[styles.total, totalStyle]}>{total}</Animated.Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={cheer}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>{cheer}</Text>
        </Pressable>
      </View>
    </ResultPopup>
  );
}

const styles = StyleSheet.create({
  cornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    alignItems: 'center',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    alignItems: 'center',
  },
  pipNum: {
    fontSize: 18,
    fontWeight: '900',
    color: affect.delight.text,
    lineHeight: 20,
  },
  pipSuit: { fontSize: 14, marginTop: -2 },
  pipFlip: { transform: [{ rotate: '180deg' }] },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: affect.delight.solid,
  },
  total: {
    fontSize: 72,
    fontWeight: '900',
    color: affect.delight.text,
    lineHeight: 78,
  },
  sub: {
    fontSize: 13,
    fontWeight: '700',
    color: neu.muted,
    textAlign: 'center',
    paddingHorizontal: spacing[2],
  },
  actions: {
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[2],
  },
  btnPrimary: {
    backgroundColor: affect.delight.solid,
    minHeight: 50,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  btnPrimaryText: {
    fontWeight: '900',
    fontSize: 17,
    color: colors.brand.white,
  },
});
