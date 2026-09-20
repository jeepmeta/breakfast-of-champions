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

import { NeuSurface } from '../ui/NeuSurface';
import { InstantPressable } from '../../navigation/InstantPressable';
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

const { height: SCREEN_H } = Dimensions.get('window');

/** Portrait playing-card style total reveal. */
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
  const cardScale = useSharedValue(0.82);
  const cornerOp = useSharedValue(0);
  const totalScale = useSharedValue(0.4);
  const totalOp = useSharedValue(0);
  const detailOp = useSharedValue(0);
  const btnY = useSharedValue(24);
  const btnOp = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 140 });
      cardScale.value = withSpring(1, SPRINGS.bouncy);
      cornerOp.value = withDelay(60, withTiming(1, { duration: 180 }));
      totalOp.value = withDelay(140, withTiming(1, { duration: 120 }));
      totalScale.value = withDelay(
        140,
        withSequence(
          withSpring(1.12, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
      detailOp.value = withDelay(260, withTiming(1, { duration: 160 }));
      btnOp.value = withDelay(340, withTiming(1, { duration: 160 }));
      btnY.value = withDelay(340, withSpring(0, SPRINGS.bouncy));
      shine.value = withDelay(
        180,
        withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      cardOpacity.value = 0;
      cardScale.value = 0.82;
      cornerOp.value = 0;
      totalScale.value = 0.4;
      totalOp.value = 0;
      detailOp.value = 0;
      btnY.value = 24;
      btnOp.value = 0;
      shine.value = 0;
    }
  }, [
    visible,
    btnOp,
    btnY,
    cardOpacity,
    cardScale,
    cornerOp,
    detailOp,
    shine,
    totalOp,
    totalScale,
  ]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value * 0.5,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    opacity: cornerOp.value,
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
        translateY: interpolate(shine.value, [0, 1], [-40, SCREEN_H * 0.35]),
      },
      { rotate: '12deg' },
    ],
    opacity: interpolate(shine.value, [0, 0.35, 1], [0, 0.55, 0]),
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
          <NeuSurface
            level="float"
            borderRadius={18}
            borderWidth={3}
            borderColor={affect.delight.softBorder}
            backgroundColor={neu.card}
            style={styles.surface}
            contentStyle={styles.cardFace}
          >
            <Animated.View style={[styles.cornerTL, cornerStyle]}>
              <Text style={styles.pipNum}>{total}</Text>
              <Text style={styles.pipSuit}>🎲</Text>
            </Animated.View>
            <Animated.View style={[styles.cornerBR, cornerStyle]}>
              <Text style={[styles.pipNum, styles.pipFlip]}>{total}</Text>
              <Text style={[styles.pipSuit, styles.pipFlip]}>🎲</Text>
            </Animated.View>

            <Animated.View
              style={[styles.shine, shineStyle]}
              pointerEvents="none"
            >
              <View style={styles.shineBand} />
            </Animated.View>

            <View style={styles.center}>
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

            {/* Button sits above bottom pips */}
            <Animated.View style={[styles.actions, btnStyle]}>
              <InstantPressable onPress={onDismiss} style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>{cheer}</Text>
              </InstantPressable>
            </Animated.View>
          </NeuSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const CARD_W = 220;
const CARD_H = 340;

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
    width: CARD_W,
    height: CARD_H,
    zIndex: 2,
  },
  surface: {
    flex: 1,
  },
  cardFace: {
    flex: 1,
    paddingTop: spacing[4],
    paddingHorizontal: spacing[3],
    // Leave room above bottom pips for the CTA
    paddingBottom: 56,
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
    bottom: 10,
    right: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  pipNum: {
    fontSize: 18,
    fontWeight: '900',
    color: affect.delight.text,
    lineHeight: 20,
  },
  pipSuit: {
    fontSize: 14,
    marginTop: -2,
  },
  pipFlip: {
    transform: [{ rotate: '180deg' }],
  },
  shine: {
    position: 'absolute',
    left: -30,
    width: 70,
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
    paddingBottom: spacing[2],
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
    zIndex: 3,
    paddingHorizontal: spacing[2],
    marginBottom: spacing[1],
  },
  btnPrimary: {
    backgroundColor: affect.delight.solid,
    minHeight: 46,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontWeight: '900',
    fontSize: 17,
    color: colors.brand.white,
  },
});
