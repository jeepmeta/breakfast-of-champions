import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoom } from '../../src/room/RoomContext';
import type { Participant } from '../../src/types/room';
import { isSwipeMatchState } from '../../src/types/swipe';
import { isGroupWheelState } from '../../src/types/group-wheel';
import { SwipeDeck } from '../../src/components/swipe/SwipeDeck';
import {
  WafflrWheel,
  type WheelSegment,
} from '../../src/components/wheel/WafflrWheel';
import { ConfettiBurst } from '../../src/components/celebration/ConfettiBurst';
import { LobbyPicker } from '../../src/components/lobby/LobbyPicker';
import { getCatalogItems, type CatalogId, type CatalogItem } from '../../src/data/catalogs';
import { type PlayableMode, modesForPlayerCount } from '../../src/constants/game-modes';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

export default function RoomScreen() {
  const { code: routeCode } = useLocalSearchParams<{ code: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.brand.slate[800] : colors.brand.slate[100];

  const {
    room,
    selfId,
    refresh,
    setReady,
    addGuest,
    leave,
    startGame,
    startGroupWheel,
    hostSpinWheel,
    completeWheelSpin,
    nextWheelSpin,
    castVote,
    castVeto,
    dismissMatch,
    isHost,
    everyoneReady,
    isLoading,
  } = useRoom();

  const completingRef = useRef(false);
  const [catalogId, setCatalogId] = useState<CatalogId>('dinner');
  const [modeId, setModeId] = useState<PlayableMode>('wheel');
  const [starting, setStarting] = useState(false);

  const playerCount = room?.participants.length ?? 1;
  useEffect(() => {
    const available = modesForPlayerCount(playerCount);
    if (!available.some((m) => m.id === modeId)) {
      setModeId(available[0]?.id ?? 'wheel');
    }
  }, [playerCount, modeId]);

  useEffect(() => {
    if (routeCode) void refresh(String(routeCode));
  }, [routeCode, refresh]);

  const self = room?.participants.find((p) => p.id === selfId);
  const code = room?.code ?? String(routeCode ?? '').toUpperCase();
  const swipeState = room && isSwipeMatchState(room.state) ? room.state : null;
  const wheelState = room && isGroupWheelState(room.state) ? room.state : null;

  const votedIds = useMemo(() => {
    if (!swipeState || !selfId) return new Set<string>();
    const ids = new Set<string>();
    for (const [itemId, votes] of Object.entries(swipeState.votes)) {
      if (votes.some((v) => v.participant_id === selfId)) ids.add(itemId);
    }
    return ids;
  }, [swipeState, selfId]);

  const nextItem = useMemo(() => {
    if (!swipeState) return null;
    const vetoed = new Set(swipeState.vetoed_item_ids);
    return (
      swipeState.items.find(
        (it) => !votedIds.has(it.id) && !vetoed.has(it.id),
      ) ?? null
    );
  }, [swipeState, votedIds]);

  const remaining = swipeState
    ? swipeState.items.filter((it) => {
        const vetoed = new Set(swipeState.vetoed_item_ids);
        return !votedIds.has(it.id) && !vetoed.has(it.id);
      }).length
    : 0;

  const latestMatch = swipeState?.matches.length
    ? swipeState.matches[swipeState.matches.length - 1]
    : null;

  const matchedItem = latestMatch
    ? (swipeState?.items.find((i) => i.id === latestMatch.item_id)?.payload as
        | CatalogItem
        | undefined)
    : undefined;

  const wheelSegments: WheelSegment[] = useMemo(() => {
    if (!room) return [];
    const items = room.item_payload as CatalogItem[] | undefined;
    if (items && items.length > 0) {
      return items.map((it) => ({
        id: it.id,
        label: it.title,
        emoji: it.emoji,
        weight: 1,
      }));
    }
    return room.participants.map((p) => ({
      id: p.id,
      label: p.display_name,
      emoji: p.display_name.slice(0, 1).toUpperCase(),
      weight: 1,
    }));
  }, [room]);

  const externalSpin = useMemo(() => {
    if (!wheelState?.spin || wheelState.phase !== 'spinning') return null;
    return {
      nonce: wheelState.spin.nonce,
      velocity: wheelState.spin.velocity,
      startRotation: wheelState.spin.start_rotation,
    };
  }, [wheelState]);

  const winnerDisplay = useMemo(() => {
    if (!wheelState?.current_winner_id || !room) return null;
    const id = wheelState.current_winner_id;
    const items = room.item_payload as CatalogItem[] | undefined;
    const item = items?.find((i) => i.id === id);
    if (item) {
      return { id, name: item.title, emoji: item.emoji };
    }
    const p = room.participants.find((x) => x.id === id);
    if (p) {
      return {
        id,
        name: p.display_name,
        emoji: p.display_name.slice(0, 1).toUpperCase(),
      };
    }
    return { id, name: 'Unknown', emoji: '✨' };
  }, [wheelState, room]);

  const tallyList = useMemo(() => {
    if (!wheelState || !room) return [];
    const items = room.item_payload as CatalogItem[] | undefined;
    if (items && items.length > 0) {
      return items
        .map((it) => ({
          id: it.id,
          name: it.title,
          wins: wheelState.tallies[it.id] ?? 0,
        }))
        .sort((a, b) => b.wins - a.wins);
    }
    return room.participants
      .map((p) => ({
        id: p.id,
        name: p.display_name,
        wins: wheelState.tallies[p.id] ?? 0,
      }))
      .sort((a, b) => b.wins - a.wins);
  }, [wheelState, room]);

  const onToggleReady = async () => {
    if (!self) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    await setReady(!self.is_ready);
  };

  const onLeave = async () => {
    await leave();
    router.replace('/');
  };

  const onAddGuest = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    await addGuest();
  };

  const onLobbyStart = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    const items = getCatalogItems(catalogId);
    try {
      if (modeId === 'swipe_match') {
        await startGame(items);
      } else if (modeId === 'wheel') {
        await startGroupWheel(items);
      }
    } finally {
      setStarting(false);
    }
  };

  const onWheelSpinEnd = async () => {
    if (!isHost) return;
    if (completingRef.current) return;
    completingRef.current = true;
    try {
      await completeWheelSpin();
    } finally {
      completingRef.current = false;
    }
  };

  const readyCount =
    room?.participants.filter((p) => p.is_ready).length ?? 0;
  const total = room?.participants.length ?? 0;

  const renderParticipant = ({ item }: { item: Participant }) => {
    const isSelfRow = item.id === selfId;
    const wins = wheelState?.tallies[item.id];
    return (
      <View style={[styles.participantRow, { backgroundColor: cardBg }]}>
        <View style={styles.participantLeft}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: item.is_host
                  ? colors.brand.amber[500]
                  : colors.brand.emerald[500],
              },
            ]}
          >
            <Text style={styles.avatarText}>
              {item.display_name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[styles.name, { color: text }]}>
              {item.display_name}
              {isSelfRow ? ' (you)' : ''}
            </Text>
            <Text style={[styles.meta, { color: muted }]}>
              {item.is_host ? 'Host' : 'Guest'}
              {typeof wins === 'number'
                ? ` · ${wins} win${wins === 1 ? '' : 's'}`
                : ''}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.readyPill,
            {
              backgroundColor: item.is_ready
                ? colors.brand.emerald[500]
                : isDark
                  ? colors.brand.slate[700]
                  : colors.brand.slate[200],
            },
          ]}
        >
          <Text
            style={[
              styles.readyPillText,
              { color: item.is_ready ? '#fff' : muted },
            ]}
          >
            {item.is_ready ? 'Ready' : 'Waiting'}
          </Text>
        </View>
      </View>
    );
  };

  if (!room && isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.body}>
          <ActivityIndicator color={colors.brand.amber[500]} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: text }]}>Room not found</Text>
          <Text style={[styles.hint, { color: muted }]}>
            This code is not active. Ask the host for a fresh code, or create
            your own room.
          </Text>
          <Pressable onPress={() => router.replace('/')} style={styles.back}>
            <Text style={{ color: colors.brand.amber[500], fontSize: 16 }}>
              ← Home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (room.mode === 'group_wheel' && wheelState) {
    const celebrating =
      wheelState.phase === 'celebration' || room.status === 'revealing';

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <ConfettiBurst active={celebrating && !!winnerDisplay} />
        <ScrollView
          contentContainerStyle={styles.wheelScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.label, { color: muted }]}>{code}</Text>
          <Text style={[styles.swipeTitle, { color: text }]}>Group Wheel</Text>
          <Text
            style={[styles.hint, { color: muted, marginBottom: spacing[4] }]}
          >
            Spin the catalog · host spins
          </Text>

          <WafflrWheel
            segments={wheelSegments}
            size={280}
            hideSpinButton
            hideResult
            externalSpin={externalSpin}
            onSpinEnd={() => {
              void onWheelSpinEnd();
            }}
          />

          {celebrating && winnerDisplay ? (
            <View style={styles.wheelWinBox}>
              <Text style={styles.celebrateEmoji}>{winnerDisplay.emoji}</Text>
              <Text
                style={[
                  styles.celebrateTitle,
                  { color: colors.brand.emerald[500] },
                ]}
              >
                {winnerDisplay.name}
              </Text>
              <Text style={[styles.hint, { color: muted }]}>
                wins this round!
              </Text>
            </View>
          ) : null}

          {wheelState.phase === 'spinning' ? (
            <Text style={[styles.startHint, { color: muted }]}>Spinning…</Text>
          ) : null}

          <View style={styles.tallyBox}>
            <Text style={[styles.sectionLabel, { color: muted }]}>
              Scoreboard
            </Text>
            {tallyList.map((row) => (
              <View key={row.id} style={styles.tallyRow}>
                <Text style={[styles.tallyName, { color: text }]}>
                  {row.name}
                </Text>
                <Text
                  style={[
                    styles.tallyWins,
                    { color: colors.brand.amber[500] },
                  ]}
                >
                  {row.wins}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            {isHost && wheelState.phase === 'ready' ? (
              <Pressable
                onPress={() => void hostSpinWheel()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.brand.amber[500],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: colors.brand.slate[900] },
                  ]}
                >
                  Spin the wheel
                </Text>
              </Pressable>
            ) : null}

            {isHost && celebrating ? (
              <Pressable
                onPress={() => void nextWheelSpin()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.brand.emerald[500],
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={[styles.primaryBtnText, { color: '#fff' }]}>
                  Spin again
                </Text>
              </Pressable>
            ) : null}

            {!isHost && wheelState.phase === 'ready' ? (
              <Text style={[styles.startHint, { color: muted }]}>
                Waiting for host to spin…
              </Text>
            ) : null}

            <Pressable onPress={onLeave} style={styles.back}>
              <Text style={{ color: muted, fontSize: 16 }}>Leave room</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (
    swipeState &&
    (swipeState.phase === 'celebration' || room.status === 'revealing') &&
    matchedItem
  ) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.celebrate}>
          <Text style={styles.celebrateEmoji}>{matchedItem.emoji}</Text>
          <Text
            style={[
              styles.celebrateTitle,
              { color: colors.brand.emerald[500] },
            ]}
          >
            It is a match!
          </Text>
          <Text style={[styles.celebrateItem, { color: text }]}>
            {matchedItem.title}
          </Text>
          <Text style={[styles.hint, { color: muted }]}>
            Everyone agreed. Decision locked in under 60 seconds.
          </Text>
          <Pressable
            onPress={dismissMatch}
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.brand.amber[500] },
            ]}
          >
            <Text
              style={[
                styles.primaryBtnText,
                { color: colors.brand.slate[900] },
              ]}
            >
              Keep swiping
            </Text>
          </Pressable>
          <Pressable onPress={onLeave} style={styles.back}>
            <Text style={{ color: muted, fontSize: 16 }}>Done · Leave room</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (
    room.status === 'active' &&
    swipeState &&
    swipeState.phase === 'swiping'
  ) {
    if (!nextItem) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
          <View style={styles.body}>
            <Text style={[styles.title, { color: text }]}>
              Waiting on others…
            </Text>
            <Text style={[styles.hint, { color: muted }]}>
              You finished the deck. Hang tight for a match.
            </Text>
            <Pressable onPress={onLeave} style={styles.back}>
              <Text style={{ color: muted, fontSize: 16 }}>Leave room</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.swipeHeader}>
          <Text style={[styles.label, { color: muted }]}>{code}</Text>
          <Text style={[styles.swipeTitle, { color: text }]}>
            What are we getting?
          </Text>
        </View>
        <SwipeDeck
          key={nextItem.id}
          item={nextItem.payload as CatalogItem}
          remaining={remaining}
          vetoEnabled={room.settings.veto_enabled}
          vetoesRemaining={self?.vetoes_remaining ?? 0}
          onSwipe={(dir) => {
            void castVote(nextItem.id, dir);
          }}
          onVeto={() => {
            void castVeto(nextItem.id);
          }}
        />
      </SafeAreaView>
    );
  }

  if (room.status === 'completed' || swipeState?.phase === 'finished') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: text }]}>Session complete</Text>
          <Text style={[styles.hint, { color: muted }]}>
            {swipeState?.matches.length
              ? `Matches: ${swipeState.matches.length}`
              : 'No mutual matches this round.'}
          </Text>
          <Pressable onPress={onLeave} style={styles.back}>
            <Text style={{ color: colors.brand.amber[500], fontSize: 16 }}>
              ← Home
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: muted }]}>Room code</Text>
        <Text style={[styles.code, { color: colors.brand.amber[500] }]}>
          {code}
        </Text>
        <Text style={[styles.readySummary, { color: muted }]}>
          {readyCount}/{total} ready
          {everyoneReady ? ' · Everyone is ready' : ''}
        </Text>
        <Text style={[styles.live, { color: colors.brand.emerald[500] }]}>
          ● Live
        </Text>
      </View>

      <FlatList
        data={room.participants}
        keyExtractor={(p) => p.id}
        renderItem={renderParticipant}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: muted }]}>Players</Text>
        }
      />

      <View style={styles.footer}>
        {isHost ? (
          <Pressable
            onPress={onAddGuest}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: isDark ? colors.border.dark : colors.border.light,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: text }]}>
              + Add demo guest
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onToggleReady}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: self?.is_ready
                ? colors.brand.slate[600]
                : colors.brand.amber[500],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.primaryBtnText,
              {
                color: self?.is_ready ? '#fff' : colors.brand.slate[900],
              },
            ]}
          >
            {self?.is_ready ? 'Not ready' : "I'm ready"}
          </Text>
        </Pressable>

        {isHost ? (
          <LobbyPicker
            playerCount={room.participants.length}
            catalogId={catalogId}
            modeId={modeId}
            onCatalogChange={setCatalogId}
            onModeChange={setModeId}
            onStart={() => void onLobbyStart()}
            canStart={everyoneReady || room.participants.length === 1}
            starting={starting}
          />
        ) : (
          <Text style={[styles.startHint, { color: muted, textAlign: 'center' }]}>
            Waiting for host to pick a game…
          </Text>
        )}

        <Pressable onPress={onLeave} style={styles.back}>
          <Text style={{ color: muted, fontSize: 16 }}>Leave room</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
    gap: spacing[3],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    alignItems: 'center',
    gap: spacing[1],
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  code: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
  },
  readySummary: {
    fontSize: 14,
    marginTop: spacing[1],
  },
  live: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing[1],
  },
  list: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
    marginTop: spacing[2],
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[3],
    borderRadius: radius.lg,
    marginBottom: spacing[2],
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  readyPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  readyPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: spacing[6],
    gap: spacing[3],
  },
  primaryBtn: {
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    paddingVertical: spacing[3],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  back: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
  },
  swipeHeader: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  swipeTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  celebrate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[3],
  },
  celebrateEmoji: {
    fontSize: 64,
  },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  celebrateItem: {
    fontSize: 22,
    fontWeight: '700',
  },
  wheelScroll: {
    padding: spacing[6],
    alignItems: 'center',
    paddingBottom: spacing[12],
  },
  wheelWinBox: {
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[1],
  },
  startHint: {
    marginTop: spacing[3],
    fontSize: 14,
  },
  tallyBox: {
    width: '100%',
    marginTop: spacing[6],
    gap: spacing[2],
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  tallyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tallyWins: {
    fontSize: 18,
    fontWeight: '800',
  },
});
