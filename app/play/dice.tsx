import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiceRoller } from '../../src/components/dice/DiceRoller';
import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';

/**
 * Solo dice hub — real 3D physics table (Three + Cannon) + multiplayer room.
 */
export default function PlayDiceScreen() {
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
      router.replace(`/room/${code}`);
    } catch {
      // stay
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Dice</Text>
        <Text style={styles.sub}>
          Real physics tumble — gravity, bounce, and settle. Pick 1–5, then ROLL.
        </Text>
      </View>

      <View style={styles.center}>
        <DiceRoller />
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
        <Text style={styles.footnote}>
          Physics adapted from the Mant0u 3D dice pen — Wafflr brand + ROLL control.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
  },
  top: {
    paddingTop: spacing[2],
    gap: spacing[1],
  },
  back: {
    color: neu.muted,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: neu.text,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: neu.muted,
  },
  center: {
    flex: 1,
    minHeight: 320,
    marginTop: spacing[2],
  },
  footer: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },
  roomBtn: {
    backgroundColor: colors.brand.amber[400],
    minHeight: 50,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.brand.amber[500],
  },
  roomBtnText: {
    color: colors.brand.slate[900],
    fontSize: 15,
    fontWeight: '800',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: neu.muted,
  },
});
