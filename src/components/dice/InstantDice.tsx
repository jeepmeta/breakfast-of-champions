import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Rect, Circle } from 'react-native-svg';

import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.28, 0.28],
    [0.5, 0.5],
    [0.72, 0.72],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.5, 0.5],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  6: [
    [0.28, 0.25],
    [0.72, 0.25],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.75],
    [0.72, 0.75],
  ],
};

function DieFace({ value, size }: { value: number; size: number }) {
  const pips = PIP_LAYOUTS[value] ?? PIP_LAYOUTS[1];
  const r = size * 0.08;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect
        x={size * 0.04}
        y={size * 0.04}
        width={size * 0.92}
        height={size * 0.92}
        rx={size * 0.18}
        fill={colors.brand.slate[50]}
        stroke={colors.brand.slate[900]}
        strokeWidth={size * 0.04}
      />
      {pips.map(([nx, ny], i) => (
        <Circle
          key={i}
          cx={size * nx}
          cy={size * ny}
          r={r}
          fill={colors.brand.slate[900]}
        />
      ))}
    </Svg>
  );
}

type Props = {
  size?: number;
};

/**
 * Always-on home dice — tap for a fair 1–6 roll. No screen change.
 */
export function InstantDice({ size = 120 }: Props) {
  const [value, setValue] = useState(1);
  const [rolling, setRolling] = useState(false);

  const roll = async () => {
    if (rolling) return;
    setRolling(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }

    // Quick visual shuffle
    let ticks = 0;
    const id = setInterval(() => {
      setValue(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= 8) {
        clearInterval(id);
        const final = 1 + Math.floor(Math.random() * 6);
        setValue(final);
        setRolling(false);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
      }
    }, 40);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={roll}
        accessibilityRole="button"
        accessibilityLabel="Roll dice"
        style={({ pressed }) => [
          styles.hit,
          { opacity: pressed || rolling ? 0.85 : 1 },
        ]}
      >
        <DieFace value={value} size={size} />
      </Pressable>
      <Text style={styles.hint}>Tap to roll</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing[2],
  },
  hit: {
    borderRadius: radius['2xl'],
  },
  hint: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brand.slate[400],
  },
});
