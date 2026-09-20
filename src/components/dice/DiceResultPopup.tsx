import { useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { neu, affect, elevationStyle } from '../../theme/neumorph';
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

const CARD_W = 228;
const CARD_H = 348;
const { height: SCREEN_H } = Dimensions.get('window');

/**
 * Portrait result card. Uses RN Pressable (not GH) inside Modal so taps
 * always register — GH Pressable is unreliable under RN Modal.
 */
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

  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.86);
  const totalScale = useSharedValue(0.5);
  const totalOp = useSharedValue(0);
  const detailOp = useSharedValue(0);
  const btnOp = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 120 });
      cardScale.value = withSpring(1, SPRINGS.bouncy);
      totalOp.value = withDelay(100, withTiming(1, { duration: 100 }));
      totalScale.value = withDelay(
        100,
        withSequence(
          withSpring(1.1, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
      detailOp.value = withDelay(200, withTiming(1, { duration: 140 }));
      // Button fully interactive as soon as visible — no opacity gate
      btnOp.value = withDelay(220, withTiming(1, { duration: 140 }));
      shine.value = withDelay(
        120,
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      cardOpacity.value = 0;
      cardScale.value = 0.86;
      totalScale.value = 0.5;
      totalOp.value = 0;
      detailOp.value = 0;
      btnOp.value = 0;
      shine.value = 0;
    }
  }, [
    visible,
    btnOp,
    cardOpacity,
    cardScale,
    detailOp,
    shine,
    totalOp,
    totalScale,
  ]);

  const handleDismiss = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onDismiss();
  }, [onDismiss]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value * 0.52,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const totalStyle = useAnimatedStyle(() => ({
    opacity: totalOp.value,
    transform: [{ scale: totalScale.value }],
  }));

  const detailStyle = useAnimatedStyle(() => ({
    opacity: detailOp.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0.35, btnOp.value),
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(shine.value, [0, 1], [-36, SCREEN_H * 0.32]),
      },
      { rotate: '12deg' },
    ],
    opacity: interpolate(shine.value, [0, 0.35, 1], [0, 0.5, 0]),
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
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* Required so any nested GH views (if added) still work under Modal */}
      <GestureHandlerRootView style={styles.modalRoot}>
        <View style={styles.root}>
          {/* Full-screen dismiss — RN Pressable, always hittable */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleDismiss}
            accessibilityLabel="Dismiss result"
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.backdrop, backdropStyle]}
            />
          </Pressable>

          {/* Card — stop propagation so backdrop doesn't steal CTA taps */}
          <Animated.View
            style={[styles.cardWrap, cardStyle]}
            pointerEvents="box-none"
          >
            <Pressable onPress={(e) => e?.stopPropagation?.()}>
              <View style={styles.card}>
                {/* Corner pips — non-interactive */}
                <View style={styles.cornerTL} pointerEvents="none">
                  <Text style={styles.pipNum}>{total}</Text>
                  <Text style={styles.pipSuit}>🎲</Text>
                </View>
                <View style={styles.cornerBR} pointerEvents="none">
                  <Text style={[styles.pipNum, styles.pipFlip]}>{total}</Text>
                  <Text style={[styles.pipSuit, styles.pipFlip]}>🎲</Text>
                </View>

                <Animated.View
                  style={[styles.shine, shineStyle]}
                  pointerEvents="none"
                >
                  <View style={styles.shineBand} />
                </Animated.View>

                <View style={styles.center} pointerEvents="none">
                  <Text style={styles.badge}>TOTAL</Text>
                  <Animated.Text style={[styles.total, totalStyle]}>
                    {total}
                  </Animated.Text>
                  {subtitle ? (
                    <Animated.Text style={[styles.sub, detailStyle]}>
                      {subtitle}
                    </Animated.Text>
                  ) : null}
                </View>

                {/* CTA — RN Pressable, high zIndex, clear of bottom pips */}
                <Animated.View style={[styles.actions, btnStyle]}>
                  <Pressable
                    onPress={handleDismiss}
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
                </Animated.View>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
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
    width: CARD_W,
    height: CARD_H,
    zIndex: 10,
    elevation: 20,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: affect.delight.softBorder,
    backgroundColor: neu.card,
    overflow: 'hidden',
    ...elevationStyle('float'),
    paddingTop: spacing[4],
    paddingHorizontal: spacing[3],
    // Reserve space so CTA never covers bottom pips
    paddingBottom: 12,
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  pipNum: {
    fontSize: 17,
    fontWeight: '900',
    color: affect.delight.text,
    lineHeight: 19,
  },
  pipSuit: {
    fontSize: 13,
    marginTop: -2,
  },
  pipFlip: {
    transform: [{ rotate: '180deg' }],
  },
  shine: {
    position: 'absolute',
    left: -28,
    width: 64,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  shineBand: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 2,
    paddingBottom: 8,
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
    zIndex: 20,
    paddingHorizontal: spacing[2],
    // Lift CTA above bottom-right pip
    marginBottom: 36,
  },
  btnPrimary: {
    backgroundColor: affect.delight.solid,
    minHeight: 48,
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
