import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { WafflrLockup } from '../../src/components/brand';
import { InstantDice } from '../../src/components/dice/InstantDice';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const { create, isLoading } = useRoom();
  const { upsertRoom, upsertBracket } = useSessionLists();
  const [busy, setBusy] = useState<'room' | 'bracket' | null>(null);

  const onCreateRoom = async () => {
    if (busy || isLoading) return;
    setBusy('room');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      const { code } = await create({ displayName: 'You' });
      upsertRoom({ code, title: `Room ${code}`, role: 'host' });
      router.push(`/room/${code}`);
    } catch {
      // stay on home; Rooms tab can surface join errors
    } finally {
      setBusy(null);
    }
  };

  const onCreateBracket = async () => {
    if (busy || isLoading) return;
    setBusy('bracket');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      // Brackets reuse room infrastructure for now; mode selected in-session.
      const { code } = await create({ displayName: 'You' });
      upsertBracket({ code, title: `Bracket ${code}`, role: 'host' });
      router.push(`/room/${code}`);
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <WafflrLockup
          markSize={72}
          wordmarkSize={34}
          showTagline
          tagline="Spin. Swipe. Decide."
          mutedColor={muted}
        />
      </View>

      <View style={styles.diceBlock}>
        <InstantDice size={132} />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onCreateRoom}
          disabled={!!busy}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            { opacity: busy ? 0.65 : pressed ? 0.9 : 1 },
          ]}
        >
          {busy === 'room' ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
          ) : (
            <Text style={styles.btnPrimaryText}>Create room</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onCreateBracket}
          disabled={!!busy}
          style={({ pressed }) => [
            styles.btn,
            styles.btnSecondary,
            {
              borderColor: isDark ? colors.border.dark : colors.border.light,
              opacity: busy ? 0.65 : pressed ? 0.9 : 1,
            },
          ]}
        >
          {busy === 'bracket' ? (
            <ActivityIndicator color={colors.brand.amber[500]} />
          ) : (
            <Text
              style={[
                styles.btnSecondaryText,
                { color: isDark ? colors.text.primary.dark : colors.text.primary.light },
              ]}
            >
              Create bracket
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingBottom: spacing[4],
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing[4],
  },
  diceBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingBottom: spacing[2],
  },
  btn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  btnPrimary: {
    backgroundColor: colors.brand.amber[500],
  },
  btnPrimaryText: {
    color: colors.brand.slate[900],
    fontSize: 16,
    fontWeight: '800',
  },
  btnSecondary: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
