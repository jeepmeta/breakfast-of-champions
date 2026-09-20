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

import { NeuSurface } from '../ui/NeuSurface';
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

const { width: SCREEN_W } = Dimensions.get('window');

/**
 * Shiny pop-up card for wheel result — spring in + moving highlight band.
 */
export function WinnerPopup({
  visible,
  emoji,
  label,
  subtitle,
  onClose,
  onSpinAgain,
}: Props) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const shine = useSharedValue(0);
  const bob = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withSpring(1, SPRINGS.bouncy);
      bob.value = withRepeat(
        withSequence(
          withSpring(1, SPRINGS.gentle),
          withSpring(0, SPRINGS.gentle),
        ),
        -1,
        false,
      );
      shine.value = withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      opacity.value = 0;
      scale.value = 0.7;
    }
  }, [visible, bob, opacity, scale, shine]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.55,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: interpolate(bob.value, [0, 1], [0, -6]) },
    ],
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
    opacity: 0.4,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <NeuSurface
            level="float"
            borderRadius={radius['2xl']}
            borderWidth={2.5}
            borderColor={affect.reward.solidStrong}
            backgroundColor={neu.card}
            contentStyle={styles.cardFace}
          >
            <Animated.View style={[styles.shine, shineStyle]} pointerEvents="none">
              <View style={styles.shineBand} />
            </Animated.View>

            <Text style={styles.badge}>YOU GOT</Text>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.label}>{label}</Text>
            {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}

            <View style={styles.actions}>
              {onSpinAgain ? (
                <Pressable
                  onPress={onSpinAgain}
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>Spin again</Text>
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
          </NeuSurface>
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
  cardFace: {
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    gap: spacing[2],
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
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  badge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: affect.reward.text,
  },
  emoji: {
    fontSize: 64,
    marginVertical: spacing[2],
  },
  label: {
    fontSize: 28,
    fontWeight: '900',
    color: neu.text,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    fontWeight: '600',
    color: neu.muted,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing[5],
    width: '100%',
    gap: spacing[2],
  },
  btnPrimary: {
    backgroundColor: affect.reward.solid,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.brand.slate[900],
  },
  btnGhost: {
    minHeight: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: affect.reward.softBorder,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  btnGhostText: {
    fontWeight: '700',
    fontSize: 15,
    color: neu.muted,
  },
});
