import { useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
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

type Props = {
  visible: boolean;
  emoji: string;
  label: string;
  subtitle?: string;
  onClose: () => void;
  onSpinAgain?: () => void;
};

const { height: SCREEN_H } = Dimensions.get('window');

/**
 * Playing-card style result — matched to DiceResultPopup.
 */
export function WinnerPopup({
  visible,
  emoji,
  label,
  subtitle,
  onClose,
  onSpinAgain,
}: Props) {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.82);
  const cornerOp = useSharedValue(0);
  const centerOp = useSharedValue(0);
  const centerScale = useSharedValue(0.5);
  const btnY = useSharedValue(24);
  const btnOp = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 140 });
      cardScale.value = withSpring(1, SPRINGS.bouncy);
      cornerOp.value = withDelay(60, withTiming(1, { duration: 180 }));
      centerOp.value = withDelay(140, withTiming(1, { duration: 120 }));
      centerScale.value = withDelay(
        140,
        withSequence(
          withSpring(1.1, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
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
      centerOp.value = 0;
      centerScale.value = 0.5;
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
    centerOp,
    centerScale,
    cornerOp,
    shine,
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

  const centerStyle = useAnimatedStyle(() => ({
    opacity: centerOp.value,
    transform: [{ scale: centerScale.value }],
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

  const pip = useMemo(() => emoji.slice(0, 2), [emoji]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <NeuSurface
            level="float"
            borderRadius={18}
            borderWidth={3}
            borderColor={affect.reward.solidStrong}
            backgroundColor={neu.card}
            style={styles.surface}
            contentStyle={styles.cardFace}
          >
            <Animated.View style={[styles.cornerTL, cornerStyle]}>
              <Text style={styles.pipEmoji}>{pip}</Text>
            </Animated.View>
            <Animated.View style={[styles.cornerBR, cornerStyle]}>
              <Text style={[styles.pipEmoji, styles.pipFlip]}>{pip}</Text>
            </Animated.View>

            <Animated.View
              style={[styles.shine, shineStyle]}
              pointerEvents="none"
            >
              <View style={styles.shineBand} />
            </Animated.View>

            <Animated.View style={[styles.center, centerStyle]}>
              <Text style={styles.badge}>YOU GOT</Text>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.label}>{label}</Text>
              {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
            </Animated.View>

            <Animated.View style={[styles.actions, btnStyle]}>
              {onSpinAgain ? (
                <InstantPressable onPress={onSpinAgain} style={styles.btnPrimary}>
                  <Text style={styles.btnPrimaryText}>Spin again</Text>
                </InstantPressable>
              ) : null}
              <InstantPressable onPress={onClose} style={styles.btnGhost}>
                <Text style={styles.btnGhostText}>Nice</Text>
              </InstantPressable>
            </Animated.View>
          </NeuSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const CARD_W = 240;
const CARD_H = 360;

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
  surface: { flex: 1 },
  cardFace: {
    flex: 1,
    paddingTop: spacing[4],
    paddingHorizontal: spacing[3],
    paddingBottom: 64,
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    zIndex: 2,
  },
  pipEmoji: {
    fontSize: 22,
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
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: affect.reward.text,
  },
  emoji: {
    fontSize: 56,
    marginVertical: spacing[1],
  },
  label: {
    fontSize: 24,
    fontWeight: '900',
    color: neu.text,
    textAlign: 'center',
    paddingHorizontal: spacing[2],
  },
  sub: {
    fontSize: 13,
    fontWeight: '600',
    color: neu.muted,
    textAlign: 'center',
  },
  actions: {
    zIndex: 3,
    paddingHorizontal: spacing[2],
    gap: spacing[2],
  },
  btnPrimary: {
    backgroundColor: affect.reward.solid,
    minHeight: 46,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontWeight: '900',
    fontSize: 16,
    color: colors.brand.slate[900],
  },
  btnGhost: {
    minHeight: 42,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: affect.reward.softBorder,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  btnGhostText: {
    fontWeight: '700',
    fontSize: 15,
    color: neu.muted,
  },
});
