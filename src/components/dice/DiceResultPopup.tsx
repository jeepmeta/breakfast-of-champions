import { useEffect } from 'react';
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
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';
import { SPRINGS } from '../../constants/springs';

type Props = {
  visible: boolean;
  total: number;
  details: number[];
  onClose: () => void;
  onRollAgain?: () => void;
};

const { width: SCREEN_W } = Dimensions.get('window');

/** Instant-win pop-up for dice totals. */
export function DiceResultPopup({
  visible,
  total,
  details,
  onClose,
  onRollAgain,
}: Props) {
  const scale = useSharedValue(0.65);
  const opacity = useSharedValue(0);
  const shine = useSharedValue(0);
  const bob = useSharedValue(0);
  const numberPop = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 160 });
      scale.value = withSpring(1, SPRINGS.bouncy);
      numberPop.value = withSequence(
        withSpring(1.12, SPRINGS.bouncy),
        withSpring(1, SPRINGS.snappy),
      );
      bob.value = withRepeat(
        withSequence(
          withSpring(1, SPRINGS.gentle),
          withSpring(0, SPRINGS.gentle),
        ),
        -1,
        false,
      );
      shine.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      opacity.value = 0;
      scale.value = 0.65;
      numberPop.value = 0;
    }
  }, [visible, bob, numberPop, opacity, scale, shine]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.5,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: interpolate(bob.value, [0, 1], [0, -5]) },
    ],
  }));

  const totalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberPop.value || 1 }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shine.value,
          [0, 1],
          [-SCREEN_W * 0.35, SCREEN_W * 0.45],
        ),
      },
      { rotate: '18deg' },
    ],
    opacity: 0.45,
  }));

  const subtitle =
    details.length > 1
      ? details.join(' + ')
      : details.length === 1
        ? `Single die · ${details[0]}`
        : undefined;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <View style={styles.card}>
            <View style={styles.cardInner}>
              <Animated.View style={[styles.shine, shineStyle]} pointerEvents="none">
                <View style={styles.shineBand} />
              </Animated.View>

              <Text style={styles.badge}>TOTAL</Text>
              <Text style={styles.emoji}>🎲</Text>
              <Animated.Text style={[styles.total, totalStyle]}>{total}</Animated.Text>
              {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}

              <View style={styles.actions}>
                {onRollAgain ? (
                  <Pressable
                    onPress={onRollAgain}
                    style={({ pressed }) => [
                      styles.btnPrimary,
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <Text style={styles.btnPrimaryText}>Roll again</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.btnGhost,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.btnGhostText}>Nice</Text>
                </Pressable>
              </View>
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
    maxWidth: 340,
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
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: colors.brand.pink[600],
  },
  emoji: {
    fontSize: 40,
    marginTop: spacing[1],
  },
  total: {
    fontSize: 72,
    fontWeight: '900',
    color: colors.brand.pink[600],
    lineHeight: 80,
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
    gap: spacing[2],
  },
  btnPrimary: {
    backgroundColor: colors.brand.pink[500],
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.brand.white,
  },
  btnGhost: {
    minHeight: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand.pink[200],
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  btnGhostText: {
    fontWeight: '700',
    fontSize: 15,
    color: neu.muted,
  },
});
