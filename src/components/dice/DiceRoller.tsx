import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { DiceCube } from './DiceCube';
import { DieFace } from './DieFace';
import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';
import { SPRINGS } from '../../constants/springs';

type DiceCount = 1 | 2 | 3;

function randomFace() {
  return 1 + Math.floor(Math.random() * 6);
}

type Props = {
  /** Base size for a single die */
  dieSize?: number;
};

/**
 * Solo dice table: 1–3 dice, ROLL button, slow 3D tumble.
 * One haptic on ROLL press only.
 */
export function DiceRoller({ dieSize = 112 }: Props) {
  const [count, setCount] = useState<DiceCount>(1);
  const [values, setValues] = useState<number[]>([1]);
  const [rolling, setRolling] = useState(false);
  const [rollNonce, setRollNonce] = useState(0);
  const [displayValues, setDisplayValues] = useState<number[]>([1]);
  const settledCount = useRef(0);
  const flashTimers = useRef<ReturnType<typeof setInterval>[]>([]);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // Keep arrays sized to count when not mid-roll
  useEffect(() => {
    if (rolling) return;
    setValues((prev) => {
      const next = Array.from({ length: count }, (_, i) => prev[i] ?? 1);
      return next;
    });
    setDisplayValues((prev) => {
      const next = Array.from({ length: count }, (_, i) => prev[i] ?? 1);
      return next;
    });
  }, [count, rolling]);

  const clearFlash = () => {
    flashTimers.current.forEach(clearInterval);
    flashTimers.current = [];
  };

  const onDieSettled = useCallback(() => {
    settledCount.current += 1;
    if (settledCount.current >= count) {
      clearFlash();
      setDisplayValues((v) => [...v]); // final already set at roll start path
      setRolling(false);
    }
  }, [count]);

  const roll = async () => {
    if (rolling) return;

    // Single haptic on tap — no continuous ticks during roll
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }

    btnScale.value = withSpring(0.94, SPRINGS.stiff, () => {
      btnScale.value = withSpring(1, SPRINGS.bouncy);
    });

    const finals = Array.from({ length: count }, () => randomFace());
    setValues(finals);
    settledCount.current = 0;
    setRolling(true);
    setRollNonce((n) => n + 1);

    clearFlash();
    // Flash random faces during tumble (slow: ~90ms), then lock finals
    const duration = 1400 + (count - 1) * 120;
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed >= duration) {
        clearInterval(id);
        setDisplayValues(finals);
        return;
      }
      // Slow down face changes as time progresses (natural)
      const t = elapsed / duration;
      if (Math.random() > t * 0.55) {
        setDisplayValues(Array.from({ length: count }, () => randomFace()));
      }
    }, 90);
    flashTimers.current.push(id);
  };

  const total = displayValues.reduce((a, b) => a + b, 0);
  const size =
    count === 1 ? dieSize + 16 : count === 2 ? dieSize : dieSize - 8;

  return (
    <View style={styles.root}>
      <View style={styles.table}>
        <View style={styles.diceRow}>
          {displayValues.map((v, i) => (
            <DiceCube
              key={`${rollNonce}-${i}`}
              size={size}
              value={rolling ? v : values[i] ?? v}
              rollNonce={rollNonce}
              index={i}
              onSettled={i === 0 ? onDieSettled : undefined}
            />
          ))}
        </View>

        {!rolling && rollNonce > 0 ? (
          <Text style={styles.total}>
            {count > 1 ? `Total ${total}` : `Rolled ${values[0]}`}
          </Text>
        ) : (
          <Text style={styles.totalPlaceholder}>
            {rolling ? 'Rolling…' : 'Ready'}
          </Text>
        )}
      </View>

      <Animated.View style={btnStyle}>
        <Pressable
          onPress={roll}
          disabled={rolling}
          accessibilityRole="button"
          accessibilityLabel="Roll dice"
          style={({ pressed }) => [
            styles.rollBtn,
            { opacity: rolling ? 0.55 : pressed ? 0.92 : 1 },
          ]}
        >
          <Text style={styles.rollBtnText}>{rolling ? '…' : 'ROLL'}</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.pills}>
        {([1, 2, 3] as DiceCount[]).map((n) => {
          const active = count === n;
          return (
            <Pressable
              key={n}
              disabled={rolling}
              onPress={() => setCount(n)}
              style={[
                styles.pill,
                active && styles.pillActive,
                rolling && styles.pillDisabled,
              ]}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {n} {n === 1 ? 'die' : 'dice'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  table: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  diceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    minHeight: 140,
  },
  total: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand.pink[600],
  },
  totalPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: neu.muted,
  },
  rollBtn: {
    backgroundColor: colors.brand.pink[500],
    paddingHorizontal: spacing[12],
    minHeight: 58,
    minWidth: 180,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.pink[800],
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  rollBtnText: {
    color: colors.brand.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  pill: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.full,
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
    shadowColor: neu.shadowSoft.color,
    shadowOpacity: neu.shadowSoft.opacity,
    shadowRadius: neu.shadowSoft.radius,
    shadowOffset: neu.shadowSoft.offset,
    elevation: neu.shadowSoft.elevation,
  },
  pillActive: {
    backgroundColor: colors.brand.pink[100],
    borderColor: colors.brand.pink[500],
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    color: neu.text,
  },
  pillTextActive: {
    color: colors.brand.pink[700],
  },
});
