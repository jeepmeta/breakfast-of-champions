import { useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
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
  /** Resets table / dismisses */
  onDismiss: () => void;
};

const { width: SCREEN_W } = Dimensions.get('window');

/** Staggered total card — single cycling cheer CTA resets the table. */
export function DiceResultPopup({ visible, total, details, onDismiss }: Props) {
  const cheer = useMemo(
    () => CHEERS[Math.floor(Math.random() * CHEERS.length)],
    // re-roll word each time the popup opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible, total],
  );

  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.7);
  const badgeY = useSharedValue(12);
  const badgeOp = useSharedValue(0);
  const totalScale = useSharedValue(0.5);
  const totalOp = useSharedValue(0);
  const detailOp = useSharedValue(0);
  const btnY = useSharedValue(20);
  const btnOp = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 140 });
      cardScale.value = withSpring(1, SPRINGS.bouncy);

      badgeOp.value = withDelay(80, withTiming(1, { duration: 160 }));
      badgeY.value = withDelay(80, withSpring(0, SPRINGS.snappy));

      totalOp.value = withDelay(160, withTiming(1, { duration: 120 }));
      totalScale.value = withDelay(
        160,
        withSequence(
          withSpring(1.14, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );

      detailOp.value = withDelay(280, withTiming(1, { duration: 180 }));

      btnOp.value = withDelay(360, withTiming(1, { duration: 160 }));
      btnY.value = withDelay(360, withSpring(0, SPRINGS.bouncy));

      shine.value = withDelay(
        200,
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      cardOpacity.value = 0;
      cardScale.value = 0.7;
      badgeY.value = 12;
      badgeOp.value = 0;
      totalScale.value = 0.5;
      totalOp.value = 0;
      detailOp.value = 0;
      btnY.value = 20;
      btnOp.value = 0;
      shine.value = 0;
    }
  }, [
    visible,
    badgeOp,
    badgeY,
    btnOp,
    btnY,
    cardOpacity,
    cardScale,
    detailOp,
    shine,
    totalOp,
    totalScale,
  ]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value * 0.48,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOp.value,
    transform: [{ translateY: badgeY.value }],
  }));

  const totalStyle = useAnimatedStyle(() => ({
    opacity: totalOp.value,
    transform: [{ scale: totalScale.value }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    opacity: detailOp.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOp.value,
    transform: [{ translateY: btnY.value }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shine.value,
          [0, 1],
          [-SCREEN_W * 0.4, SCREEN_W * 0.5],
        ),
      },
      { rotate: '18deg' },
    ],
    opacity: interpolate(shine.value, [0, 0.4, 1], [0, 0.5, 0]),
  }));

  const subtitle =
    details.length > 1
      ? details.join(' + ')
      : details.length === 1
        ? `Rolled a ${details[0]}`
        : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Animated.View
                style={[styles.shine, shineStyle]}
                pointerEvents="none"
              >
                <View style={styles.shineBand} />
              </Animated.View>

              <Animated.Text style={[styles.badge, badgeStyle]}>
                TOTAL
              </Animated.Text>
              <Animated.Text style={[styles.total, totalStyle]}>
                {total}
              </Animated.Text>
              {subtitle ? (
                <Animated.Text style={[styles.sub, detailStyle]}>
                  {subtitle}
                </Animated.Text>
              ) : null}

              <Animated.View style={[styles.actions, btnStyle]}>
                <Pressable
                  onPress={onDismiss}
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>{cheer}</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.brand.slate[900],
  },
  cardWrap: {
    width: '100%',
    maxWidth: 320,
    zIndex: 2,
  },
  card: {
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: colors.brand.pink[400],
    backgroundColor: '#FFF5F8',
    shadowColor: colors.brand.pink[700],
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cardInner: {
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: '#FFFFFF',
  },
  shine: {
    position: 'absolute',
    top: -50,
    bottom: -50,
    width: 64,
    zIndex: 3,
  },
  shineBand: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: colors.brand.pink[600],
  },
  total: {
    fontSize: 76,
    fontWeight: '900',
    color: colors.brand.pink[600],
    lineHeight: 84,
  },
  sub: {
    fontSize: 15,
    fontWeight: '700',
    color: neu.muted,
    textAlign: 'center',
    marginTop: spacing[1],
  },
  actions: {
    marginTop: spacing[5],
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: colors.brand.pink[500],
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontWeight: '900',
    fontSize: 18,
    color: colors.brand.white,
  },
});
