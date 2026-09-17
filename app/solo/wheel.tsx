import { View, Text, StyleSheet, useColorScheme, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/tokens';

/**
 * Solo Wafflr Wheel placeholder.
 * Physics-based deceleration + haptics will be implemented with Reanimated
 * (see animation-haptic-constants.md).
 */
export default function SoloWheelScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const onSpin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: trigger wheel physics
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen
        options={{
          title: 'Wafflr Wheel',
          headerShown: true,
          headerStyle: { backgroundColor: bg },
          headerTintColor: text,
          presentation: 'modal',
        }}
      />

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
        <Text style={{ color: muted }}>Close</Text>
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
