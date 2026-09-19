import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { DieFace } from './DieFace';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

type Props = {
  size?: number;
};

/**
 * Compact single-die control (legacy / embed).
 * Prefer DiceRoller on the play/dice screen.
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

    let ticks = 0;
    const id = setInterval(() => {
      setValue(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= 14) {
        clearInterval(id);
        setValue(1 + Math.floor(Math.random() * 6));
        setRolling(false);
      }
    }, 70);
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
