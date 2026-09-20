import { useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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

const CARD_W = 248;
const CARD_H = 380;

/** Playing-card result — fixed shell, reliable RN Pressable CTAs. */
export function WinnerPopup({
  visible,
  emoji,
  label,
  subtitle,
  onClose,
  onSpinAgain,
}: Props) {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const centerScale = useSharedValue(0.7);
  const centerOp = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 140 });
      cardScale.value = withSpring(1, SPRINGS.bouncy);
      centerOp.value = withDelay(80, withTiming(1, { duration: 120 }));
      centerScale.value = withDelay(
        80,
        withSequence(
          withSpring(1.06, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
    } else {
      cardOpacity.value = 0;
      cardScale.value = 0.9;
      centerOp.value = 0;
      centerScale.value = 0.7;
    }
  }, [visible, cardOpacity, cardScale, centerOp, centerScale]);

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
    opacity: cardOpacity.value * 0.55,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const centerStyle = useAnimatedStyle(() => ({
    opacity: centerOp.value,
    transform: [{ scale: centerScale.value }],
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
      <GestureHandlerRootView style={styles.flex}>
        <View style={styles.root}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, backdropStyle]}
          />

          <Pressable
            style={styles.dismissHit}
            onPress={close}
            accessibilityLabel="Dismiss result"
          />

          <Animated.View style={[styles.cardShell, cardStyle]}>
            <View style={styles.card}>
              <View style={styles.cornerTL} pointerEvents="none">
                <Text style={styles.pipEmoji}>{pip}</Text>
              </View>
              <View style={styles.cornerBR} pointerEvents="none">
                <Text style={[styles.pipEmoji, styles.pipFlip]}>{pip}</Text>
              </View>

              <Animated.View style={[styles.center, centerStyle]} pointerEvents="none">
                <Text style={styles.badge}>YOU GOT</Text>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.label}>{label}</Text>
                {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
              </Animated.View>

              <View style={styles.actions}>
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
              </View>
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.brand.slate[900],
  },
  dismissHit: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  cardShell: {
    width: CARD_W,
    height: CARD_H,
    zIndex: 2,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: affect.reward.solidStrong,
    backgroundColor: '#FFFFFF',
    paddingTop: spacing[5],
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[4],
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 16,
  },
  cornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  pipEmoji: { fontSize: 22 },
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
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  btnPrimary: {
    backgroundColor: affect.reward.solid,
    minHeight: 50,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    minHeight: 46,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: affect.reward.softBorder,
    backgroundColor: '#FFF8EB',
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
