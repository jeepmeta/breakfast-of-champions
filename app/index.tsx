import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../src/theme/colors';
import { spacing, radius } from '../src/theme/tokens';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const onCreateRoom = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // haptics unavailable on web / simulator without support
    }
    router.push('/room/WAFFLR');
  };

  const onJoinRoom = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op
    }
    // Placeholder: same demo room for now
    router.push('/room/JOINME');
  };

  const onSoloWheel = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // no-op
    }
    router.push('/solo/wheel');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.hero}>
        <Text style={[styles.logo, { color: colors.brand.amber[500] }]}>Wafflr</Text>
        <Text style={[styles.tagline, { color: muted }]}>
          Decide in under 60 seconds
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onCreateRoom}
          style={({ pressed }) => [
            styles.primaryBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Text style={styles.primaryBtnText}>Create Room</Text>
        </Pressable>

        <Pressable
          onPress={onJoinRoom}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: isDark ? colors.border.dark : colors.border.light,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: text }]}>Join with Code</Text>
        </Pressable>

        <Pressable onPress={onSoloWheel} style={styles.ghostBtn}>
          <Text style={[styles.ghostBtnText, { color: colors.brand.amber[500] }]}>
            Solo · Wafflr Wheel
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: muted }]}>
        Fairness through randomness + consensus
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingBottom: spacing[8],
  },
  hero: {
    marginTop: spacing[16],
    alignItems: 'center',
    gap: spacing[2],
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '500',
  },
  actions: {
    gap: spacing[3],
  },
  primaryBtn: {
    backgroundColor: colors.brand.amber[500],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.brand.slate[900],
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  ghostBtn: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
  },
});
