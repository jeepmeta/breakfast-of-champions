import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  WafflrWheel,
  type WheelSegment,
} from '../../src/components/wheel/WafflrWheel';
import {
  CATALOGS,
  getCatalogItems,
  type CatalogId,
} from '../../src/data/catalogs';
import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

type InstantMode = Extract<CatalogId, 'dinner' | 'movies' | 'activities'>;

const MODE_COPY: Record<
  InstantMode,
  { title: string; question: string }
> = {
  dinner: { title: 'Eat', question: 'What should we eat?' },
  movies: { title: 'Watch', question: 'What should we watch?' },
  activities: { title: 'Do', question: 'What should we do?' },
};

/**
 * Solo wheel hub — three instant catalogs + open room for invites / location modes.
 */
export default function PlayWheelScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.elevated.dark : colors.elevated.light;

  const [mode, setMode] = useState<InstantMode>('dinner');
  const [lastWinner, setLastWinner] = useState<WheelSegment | null>(null);
  const [busy, setBusy] = useState(false);

  const { create, isLoading } = useRoom();
  const { upsertRoom } = useSessionLists();

  const segments: WheelSegment[] = useMemo(() => {
    return getCatalogItems(mode).map((item) => ({
      id: item.id,
      label: item.title,
      emoji: item.emoji,
      weight: 1,
    }));
  }, [mode]);

  const onSpinEnd = useCallback((segment: WheelSegment) => {
    setLastWinner(segment);
  }, []);

  const selectMode = async (next: InstantMode) => {
    if (next === mode) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // ignore
    }
    setLastWinner(null);
    setMode(next);
  };

  const openWheelRoom = async () => {
    if (busy || isLoading) return;
    setBusy(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      const { code } = await create({ displayName: 'You' });
      upsertRoom({ code, title: `Wheel ${code}`, role: 'host' });
      router.replace(`/room/${code}`);
    } catch {
      // stay
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: muted, fontWeight: '700' }}>← Back</Text>
        </Pressable>

        <Text style={[styles.title, { color: text }]}>Wheel</Text>
        <Text style={[styles.sub, { color: muted }]}>
          Instant spins for eat / watch / do. Open a room for invites, custom lists,
          and nearby places from your location.
        </Text>

        <View style={styles.modeRow}>
          {CATALOGS.map((c) => {
            const active = mode === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => selectMode(c.id as InstantMode)}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: active
                      ? colors.brand.amber[500]
                      : cardBg,
                    borderColor: active
                      ? colors.brand.amber[500]
                      : isDark
                        ? colors.border.dark
                        : colors.border.light,
                  },
                ]}
              >
                <Text style={styles.modeEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.modeLabel,
                    {
                      color: active
                        ? colors.brand.slate[900]
                        : text,
                    },
                  ]}
                >
                  {MODE_COPY[c.id as InstantMode]?.title ?? c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.question, { color: muted }]}>
          {MODE_COPY[mode].question}
        </Text>

        <View style={styles.wheelWrap}>
          <WafflrWheel
            key={mode}
            segments={segments}
            size={280}
            onSpinEnd={onSpinEnd}
          />
        </View>

        {lastWinner ? (
          <Text style={[styles.decided, { color: colors.brand.emerald[500] }]}>
            Decided: {lastWinner.emoji} {lastWinner.label}
          </Text>
        ) : null}

        <Pressable
          onPress={openWheelRoom}
          disabled={busy}
          style={({ pressed }) => [
            styles.roomBtn,
            { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
          ) : (
            <Text style={styles.roomBtnText}>
              Open wheel room · invites & nearby
            </Text>
          )}
        </Pressable>

        <Text style={[styles.footnote, { color: muted }]}>
          In-room: custom segments, group spin, and location lists for food, movies,
          or activities near you.
        </Text>
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
    paddingBottom: spacing[12],
    paddingTop: spacing[2],
    gap: spacing[3],
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  modeChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
  },
  modeEmoji: {
    fontSize: 22,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  question: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing[1],
  },
  wheelWrap: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  decided: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  roomBtn: {
    marginTop: spacing[4],
    backgroundColor: colors.brand.amber[500],
    minHeight: 54,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  roomBtnText: {
    color: colors.brand.slate[900],
    fontSize: 16,
    fontWeight: '800',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
