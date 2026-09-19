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

import { InstantDice } from '../../src/components/dice/InstantDice';
import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

/**
 * Solo dice hub — instant roll now; open a dice room for multiplayer / variants.
 */
export default function PlayDiceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const { create, isLoading } = useRoom();
  const { upsertRoom } = useSessionLists();
  const [busy, setBusy] = useState(false);

  const openDiceRoom = async () => {
    if (busy || isLoading) return;
    setBusy(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      const { code } = await create({ displayName: 'You' });
      upsertRoom({ code, title: `Dice ${code}`, role: 'host' });
      // Room lobby will host dice mode selection next.
      router.replace(`/room/${code}`);
    } catch {
      // stay
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: muted, fontWeight: '700' }}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: text }]}>Dice</Text>
        <Text style={[styles.sub, { color: muted }]}>
          Instant roll for quick ties. Open a room to invite friends and unlock more
          variations.
        </Text>
      </View>

      <View style={styles.center}>
        <InstantDice size={160} />
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={openDiceRoom}
          disabled={busy}
          style={({ pressed }) => [
            styles.roomBtn,
            { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
          ) : (
            <Text style={styles.roomBtnText}>Open dice room · invite friends</Text>
          )}
        </Pressable>
        <Text style={[styles.footnote, { color: muted }]}>
          Coming in-room: multi-die, high/low, roll-offs, and custom sides.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingBottom: spacing[6],
  },
  top: {
    paddingTop: spacing[2],
    gap: spacing[2],
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    gap: spacing[3],
  },
  roomBtn: {
    backgroundColor: colors.brand.pink[500],
    minHeight: 54,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  roomBtnText: {
    color: colors.brand.white,
    fontSize: 16,
    fontWeight: '800',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
