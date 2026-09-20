import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { CATALOGS, type CatalogId } from '../../data/catalogs';
import {
  modesForPlayerCount,
  tierLabel,
  type PlayableMode,
  type ModeDef,
} from '../../constants/game-modes';
import {
  neu,
  neuCard,
  neuPill,
  neuPrimaryBtn,
  neuPrimaryBtnText,
  neuSection,
  affect,
  elevationStyle,
} from '../../theme/neumorph';
import { spacing } from '../../theme/tokens';

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
  const modes = modesForPlayerCount(playerCount);
  const selectedMode = modes.find((m) => m.id === modeId) ?? modes[0];

  const tap = (fn: () => void) => {
    void Haptics.selectionAsync().catch(() => undefined);
    fn();
  };

  return (
    <View style={styles.root}>
      <View style={styles.tierPill}>
        <Text style={styles.tierText}>
          {tierLabel(playerCount)} · {playerCount} player
          {playerCount === 1 ? '' : 's'}
        </Text>
      </View>

      <Text style={styles.section}>What are we deciding?</Text>
      <View style={styles.row}>
        {CATALOGS.map((c) => {
          const active = c.id === catalogId;
          return (
            <Pressable
              key={c.id}
              onPress={() => tap(() => onCatalogChange(c.id))}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                { opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Text style={styles.chipEmoji}>{c.emoji}</Text>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { marginTop: spacing[4] }]}>
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
              style={({ pressed }) => [
                styles.modeCard,
                active && styles.modeCardActive,
                locked && styles.modeLocked,
                { opacity: pressed && !locked ? 0.92 : 1 },
              ]}
            >
              <Text style={styles.modeEmoji}>{m.emoji}</Text>
              <Text style={styles.modeLabel}>{m.label}</Text>
              <Text style={styles.modeBlurb}>{locked ? 'Soon' : m.blurb}</Text>
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
            opacity:
              !canStart || starting || !selectedMode?.ready
                ? 0.5
                : pressed
                  ? 0.9
                  : 1,
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
  tierPill: {
    ...neuPill,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    marginBottom: spacing[1],
    backgroundColor: affect.reward.soft,
    borderColor: affect.reward.softBorder,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '800',
    color: affect.reward.text,
    letterSpacing: 0.3,
  },
  section: {
    ...neuSection,
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    ...neuPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  chipActive: {
    backgroundColor: affect.reward.solid,
    borderColor: affect.reward.solidStrong,
    ...elevationStyle('cta'),
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: neu.text,
  },
  chipLabelActive: {
    color: affect.type.primary,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  modeCard: {
    ...neuCard,
    width: '47%',
    minWidth: 140,
    flexGrow: 1,
    padding: spacing[3],
    gap: 4,
  },
  modeCardActive: {
    backgroundColor: affect.success.soft,
    borderColor: affect.success.softBorder,
    ...elevationStyle('card'),
  },
  modeLocked: {
    opacity: 0.45,
  },
  modeEmoji: {
    fontSize: 24,
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: neu.text,
  },
  modeBlurb: {
    fontSize: 12,
    fontWeight: '600',
    color: neu.muted,
    lineHeight: 16,
  },
  startBtn: {
    ...neuPrimaryBtn,
    marginTop: spacing[3],
  },
  startBtnText: {
    ...neuPrimaryBtnText,
    fontSize: 17,
  },
});
