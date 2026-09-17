import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

import { CATALOGS, type CatalogId } from '../../data/catalogs';
import {
  modesForPlayerCount,
  tierLabel,
  type PlayableMode,
  type ModeDef,
} from '../../constants/game-modes';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

type Props = {
  playerCount: number;
  catalogId: CatalogId;
  modeId: PlayableMode;
  onCatalogChange: (id: CatalogId) => void;
  onModeChange: (id: PlayableMode) => void;
  onStart: () => void;
  canStart: boolean;
  starting?: boolean;
};

export function LobbyPicker({
  playerCount,
  catalogId,
  modeId,
  onCatalogChange,
  onModeChange,
  onStart,
  canStart,
  starting = false,
}: Props) {
  const isDark = useColorScheme() === 'dark';
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.brand.slate[800] : colors.brand.slate[100];
  const border = isDark ? colors.border.dark : colors.border.light;

  const modes = modesForPlayerCount(playerCount);
  const selectedMode = modes.find((m) => m.id === modeId) ?? modes[0];

  const tap = async (fn: () => void) => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // ignore
    }
    fn();
  };

  return (
    <View style={styles.root}>
      <Text style={[styles.tier, { color: muted }]}>
        {tierLabel(playerCount)} · {playerCount} player{playerCount === 1 ? '' : 's'}
      </Text>

      <Text style={[styles.section, { color: muted }]}>What are we deciding?</Text>
      <View style={styles.row}>
        {CATALOGS.map((c) => {
          const active = c.id === catalogId;
          return (
            <Pressable
              key={c.id}
              onPress={() => tap(() => onCatalogChange(c.id))}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.brand.amber[500] : cardBg,
                  borderColor: active ? colors.brand.amber[500] : border,
                },
              ]}
            >
              <Text style={styles.chipEmoji}>{c.emoji}</Text>
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? colors.brand.slate[900] : text },
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { color: muted, marginTop: spacing[4] }]}>
        How do we decide?
      </Text>
      <View style={styles.modeGrid}>
        {modes.map((m: ModeDef) => {
          const active = m.id === modeId;
          const locked = !m.ready;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                if (locked) return;
                tap(() => onModeChange(m.id));
              }}
              style={[
                styles.modeCard,
                {
                  backgroundColor: active ? colors.brand.emerald[500] + '22' : cardBg,
                  borderColor: active
                    ? colors.brand.emerald[500]
                    : border,
                  opacity: locked ? 0.45 : 1,
                },
              ]}
            >
              <Text style={styles.modeEmoji}>{m.emoji}</Text>
              <Text style={[styles.modeLabel, { color: text }]}>{m.label}</Text>
              <Text style={[styles.modeBlurb, { color: muted }]}>
                {locked ? 'Soon' : m.blurb}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onStart}
        disabled={!canStart || starting || !selectedMode?.ready}
        style={({ pressed }) => [
          styles.startBtn,
          {
            backgroundColor: colors.brand.amber[500],
            opacity: !canStart || starting || !selectedMode?.ready ? 0.5 : pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={styles.startBtnText}>
          {starting
            ? 'Starting…'
            : !selectedMode?.ready
              ? 'Coming soon'
              : `Start · ${selectedMode?.label ?? 'Game'}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[2],
  },
  tier: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[1],
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  modeCard: {
    width: '47%',
    minWidth: 140,
    flexGrow: 1,
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: 2,
  },
  modeEmoji: {
    fontSize: 22,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  modeBlurb: {
    fontSize: 12,
  },
  startBtn: {
    marginTop: spacing[3],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  startBtnText: {
    color: colors.brand.slate[900],
    fontSize: 17,
    fontWeight: '800',
  },
});
