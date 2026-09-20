import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayChrome } from '../../src/components/play/PlayChrome';
import { AdBanner } from '../../src/components/ads/AdBanner';
import {
  DiceRoller,
  DiceCountPills,
  type DiceCount,
} from '../../src/components/dice/DiceRoller';
import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';

export default function PlayDiceScreen() {
  const { create, isLoading } = useRoom();
  const { upsertRoom } = useSessionLists();
  const [count, setCount] = useState<DiceCount>(2);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <PlayChrome title="Dice Roller" subtitle="Swipe the table to cast" />

      <View style={styles.stageWrap}>
        <DiceRoller count={count} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.pillLabel}>Dice</Text>
        <DiceCountPills count={count} onChange={setCount} />

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
            <Text style={styles.roomBtnText}>Open dice room</Text>
          )}
        </Pressable>
      </View>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
  },
  stageWrap: {
    flex: 1,
    marginHorizontal: spacing[4],
    minHeight: 260,
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    gap: spacing[2],
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: neu.muted,
    textAlign: 'center',
  },
  roomBtn: {
    marginTop: spacing[1],
    backgroundColor: colors.brand.amber[400],
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand.amber[500],
  },
  roomBtnText: {
    color: colors.brand.slate[900],
    fontSize: 15,
    fontWeight: '800',
  },
});
