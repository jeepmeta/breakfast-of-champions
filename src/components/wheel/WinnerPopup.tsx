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
import { haptic } from '../../lib/haptics';

type Props = {
  visible: boolean;
  emoji: string;
  label: string;
  subtitle?: string;
  onClose: () => void;
  onSpinAgain?: () => void;
};

export function WinnerPopup({
  visible,
  emoji,
  label,
  subtitle,
  onClose,
  onSpinAgain,
}: Props) {
  const centerScale = useSharedValue(0.7);
  const centerOp = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      centerOp.value = withDelay(80, withTiming(1, { duration: 120 }));
      centerScale.value = withDelay(
        80,
        withSequence(
          withSpring(1.06, SPRINGS.bouncy),
          withSpring(1, SPRINGS.snappy),
        ),
      );
    } else {
      centerOp.value = 0;
      centerScale.value = 0.7;
    }
  }, [visible, centerOp, centerScale]);

  const centerStyle = useAnimatedStyle(() => ({
    opacity: centerOp.value,
    transform: [{ scale: centerScale.value }],
  }));

  const pip = useMemo(() => emoji.slice(0, 2), [emoji]);

  return (
    <ResultPopup
      visible={visible}
      onDismiss={onClose}
      width={248}
      height={380}
      borderColor={affect.reward.solidStrong}
    >
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
            onPress={() => {
              haptic.medium();
              onSpinAgain();
            }}
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
          onPress={onClose}
          hitSlop={10}
          style={({ pressed }) => [
            styles.btnGhost,
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnGhostText}>Nice</Text>
        </Pressable>
      </View>
    </ResultPopup>
  );
}

const styles = StyleSheet.create({
  cornerTL: { position: 'absolute', top: 14, left: 14 },
  cornerBR: { position: 'absolute', bottom: 14, right: 14 },
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
  emoji: { fontSize: 56, marginVertical: spacing[1] },
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
