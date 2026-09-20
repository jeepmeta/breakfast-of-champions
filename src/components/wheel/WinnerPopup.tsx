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
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { neu, affect, elevationStyle } from '../../theme/neumorph';
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

const CARD_W = 240;
const CARD_H = 360;
const { height: SCREEN_H } = Dimensions.get('window');

/** Playing-card result — RN Pressable inside Modal (GH is unreliable here). */
export function WinnerPopup({
  visible,
  emoji,
  label,
  subtitle,
  onClose,
  onSpinAgain,
}: Props) {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.86);
  const centerOp = useSharedValue(0);
  const centerScale = useSharedValue(0.55);
  const btnOp = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 120 });
      cardScale.value = withSpring(1, SPRINGS.bouncy);
      centerOp.value = withDelay(100, withTiming(1, { duration: 100 }));
      centerScale.value = withDelay(
        100,
        withSequence(
          withSpring(1.08, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
      btnOp.value = withDelay(220, withTiming(1, { duration: 140 }));
      shine.value = withDelay(
        120,
        withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      cardOpacity.value = 0;
      cardScale.value = 0.86;
      centerOp.value = 0;
      centerScale.value = 0.55;
      btnOp.value = 0;
      shine.value = 0;
    }
  }, [visible, btnOp, cardOpacity, cardScale, centerOp, centerScale, shine]);

  const close = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
    onClose();
  }, [onClose]);

  const spinAgain = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    onSpinAgain?.();
  }, [onSpinAgain]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value * 0.52,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const centerStyle = useAnimatedStyle(() => ({
    opacity: centerOp.value,
    transform: [{ scale: centerScale.value }],
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

  const pip = useMemo(() => emoji.slice(0, 2), [emoji]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <View style={styles.root}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityLabel="Dismiss result"
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.backdrop, backdropStyle]}
            />
          </Pressable>

          <Animated.View
            style={[styles.cardWrap, cardStyle]}
            pointerEvents="box-none"
          >
            <Pressable onPress={(e) => e?.stopPropagation?.()}>
              <View style={styles.card}>
                <View style={styles.cornerTL} pointerEvents="none">
                  <Text style={styles.pipEmoji}>{pip}</Text>
                </View>
                <View style={styles.cornerBR} pointerEvents="none">
                  <Text style={[styles.pipEmoji, styles.pipFlip]}>{pip}</Text>
                </View>

                <Animated.View
                  style={[styles.shine, shineStyle]}
                  pointerEvents="none"
                >
                  <View style={styles.shineBand} />
                </Animated.View>

                <Animated.View
                  style={[styles.center, centerStyle]}
                  pointerEvents="none"
                >
                  <Text style={styles.badge}>YOU GOT</Text>
                  <Text style={styles.emoji}>{emoji}</Text>
                  <Text style={styles.label}>{label}</Text>
                  {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
                </Animated.View>

                <Animated.View style={[styles.actions, btnStyle]}>
                  {onSpinAgain ? (
                    <Pressable
                      onPress={spinAgain}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.btnPrimary,
                        pressed && styles.btnPressed,
                      ]}
                    >
                      <Text style={styles.btnPrimaryText}>Spin again</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    onPress={close}
                    hitSlop={10}
                    style={({ pressed }) => [
                      styles.btnGhost,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text style={styles.btnGhostText}>Nice</Text>
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
  modalRoot: { flex: 1 },
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
    borderColor: affect.reward.solidStrong,
    backgroundColor: neu.card,
    overflow: 'hidden',
    ...elevationStyle('float'),
    paddingTop: spacing[4],
    paddingHorizontal: spacing[3],
    paddingBottom: 12,
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    zIndex: 1,
  },
  pipEmoji: { fontSize: 22 },
  pipFlip: { transform: [{ rotate: '180deg' }] },
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
    zIndex: 20,
    paddingHorizontal: spacing[2],
    marginBottom: 36,
    gap: spacing[2],
  },
  btnPrimary: {
    backgroundColor: affect.reward.solid,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    minHeight: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: affect.reward.softBorder,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  btnPrimaryText: {
    fontWeight: '900',
    fontSize: 16,
    color: colors.brand.slate[900],
  },
  btnGhostText: {
    fontWeight: '700',
    fontSize: 15,
    color: neu.muted,
  },
});
