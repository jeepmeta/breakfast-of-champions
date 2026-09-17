import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  WafflrWheel,
  type WheelSegment,
} from '../../src/components/wheel/WafflrWheel';
import { DINNER_ITEMS } from '../../src/data/sample-items';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/tokens';

export default function SoloWheelScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const [lastWinner, setLastWinner] = useState<WheelSegment | null>(null);

  const segments: WheelSegment[] = useMemo(
    () =>
      DINNER_ITEMS.map((item) => ({
        id: item.id,
        label: item.title,
        emoji: item.emoji,
        weight: 1,
      })),
    [],
  );

  const onSpinEnd = useCallback((segment: WheelSegment) => {
    setLastWinner(segment);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.brand.amber[500] }]}>
          Wafflr Wheel
        </Text>
        <Text style={[styles.subtitle, { color: muted }]}>
          Physics spin · fair by chance
        </Text>

        <View style={styles.wheelWrap}>
          <WafflrWheel segments={segments} size={300} onSpinEnd={onSpinEnd} />
        </View>

        {lastWinner ? (
          <Text style={[styles.footerNote, { color: muted }]}>
            Decided: {lastWinner.emoji} {lastWinner.label}
          </Text>
        ) : null}

        <Pressable onPress={() => router.back()} style={styles.close}>
          <Text style={{ color: muted, fontSize: 16 }}>Close</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    paddingBottom: spacing[10],
  },
  title: {
    marginTop: spacing[6],
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: spacing[1],
    fontSize: 14,
    fontWeight: '500',
  },
  wheelWrap: {
    marginTop: spacing[8],
  },
  footerNote: {
    marginTop: spacing[4],
    fontSize: 14,
  },
  close: {
    marginTop: spacing[8],
    padding: spacing[3],
  },
});
