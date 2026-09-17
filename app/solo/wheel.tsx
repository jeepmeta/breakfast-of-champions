import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

/**
 * Solo Wafflr Wheel placeholder.
 * Physics-based deceleration + haptics will be implemented with Reanimated
 * (see animation-haptic-constants.md).
 */
export default function SoloWheelScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const onSpin = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // no-op
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: colors.brand.amber[500] }]}>Wafflr Wheel</Text>

      <View style={styles.wheelPlaceholder}>
        <Text style={[styles.placeholderLabel, { color: muted }]}>
          Physics wheel coming next
        </Text>
      </View>

      <Pressable
        onPress={onSpin}
        style={({ pressed }) => [
          styles.spinBtn,
          { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <Text style={styles.spinBtnText}>Spin</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.close}>
        <Text style={{ color: muted, fontSize: 16 }}>Close</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  title: {
    marginTop: spacing[8],
    fontSize: 24,
    fontWeight: '800',
  },
  wheelPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: colors.brand.amber[500],
    borderStyle: 'dashed',
    marginTop: spacing[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  spinBtn: {
    marginTop: spacing[10],
    backgroundColor: colors.brand.amber[500],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[12],
    borderRadius: radius.full,
  },
  spinBtnText: {
    color: colors.brand.slate[900],
    fontSize: 18,
    fontWeight: '800',
  },
  close: {
    marginTop: spacing[6],
    padding: spacing[3],
  },
});
