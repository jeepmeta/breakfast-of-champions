import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
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
import { PlayChrome } from '../../src/components/play/PlayChrome';
import { AdBanner } from '../../src/components/ads/AdBanner';
import { getCatalogItems, type CatalogId, type CatalogItem } from '../../src/data/catalogs';
import { type PlayableMode, modesForPlayerCount } from '../../src/constants/game-modes';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing } from '../../src/theme/tokens';
import { roomStyles as styles } from '../../src/screens/roomStyles';

export default function RoomScreen() {
  const { code: routeCode } = useLocalSearchParams<{ code: string }>();

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
    if (item) return { id, name: item.title, emoji: item.emoji };
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
      if (modeId === 'swipe_match') await startGame(items);
      else if (modeId === 'wheel') await startGroupWheel(items);
    } finally {
      setStarting(false);
    }
  };

  const onWheelSpinEnd = async () => {
    if (!isHost || completingRef.current) return;
    completingRef.current = true;
    try {
      await completeWheelSpin();
    } finally {
      completingRef.current = false;
    }
  };

  const readyCount = room?.participants.filter((p) => p.is_ready).length ?? 0;
  const total = room?.participants.length ?? 0;

  const renderParticipant = ({ item }: { item: Participant }) => {
    const isSelfRow = item.id === selfId;
    const wins = wheelState?.tallies[item.id];
    return (
      <View style={styles.participantRow}>
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
            <Text style={styles.name}>
              {item.display_name}
              {isSelfRow ? ' (you)' : ''}
            </Text>
            <Text style={styles.meta}>
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
            item.is_ready ? styles.readyPillOn : styles.readyPillOff,
          ]}
        >
          <Text
            style={[
              styles.readyPillText,
              item.is_ready ? styles.readyPillTextOn : styles.readyPillTextOff,
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
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.body}>
          <ActivityIndicator color={colors.brand.amber[500]} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PlayChrome title="Room" subtitle="Not found" />
        <View style={styles.body}>
          <Text style={styles.title}>Room not found</Text>
          <Text style={styles.hint}>
            This code is not active. Ask the host for a fresh code, or create your
            own room.
          </Text>
          <Pressable onPress={() => router.replace('/')} style={styles.back}>
            <Text style={{ color: colors.brand.amber[600], fontSize: 16, fontWeight: '800' }}>
              ← Home
            </Text>
          </Pressable>
        </View>
        <AdBanner />
      </SafeAreaView>
    );
  }

  if (room.mode === 'group_wheel' && wheelState) {
    const celebrating =
      wheelState.phase === 'celebration' || room.status === 'revealing';

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PlayChrome title="Group Wheel" subtitle={code} />
        <ConfettiBurst active={celebrating && !!winnerDisplay} />

        {celebrating && winnerDisplay ? (
          <View style={styles.winnerOverlay} pointerEvents="box-none">
            <View style={styles.winnerCard}>
              <Text style={styles.winnerCardEmoji}>{winnerDisplay.emoji}</Text>
              <Text style={styles.winnerCardName}>{winnerDisplay.name}</Text>
              <Text style={styles.winnerCardSub}>wins this round</Text>
              {isHost ? (
                <Pressable
                  onPress={() => void nextWheelSpin()}
                  style={({ pressed }) => [
                    styles.winnerCardBtn,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={styles.winnerCardBtnText}>Spin again</Text>
                </Pressable>
              ) : (
                <Text style={[styles.startHint, { marginTop: spacing[3] }]}>
                  Waiting for host…
                </Text>
              )}
            </View>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.wheelScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.hint, { marginBottom: spacing[3] }]}>
            Spin the catalog · host spins
          </Text>

          <View style={styles.stage}>
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
          </View>

          <View style={styles.wheelControls}>
            {isHost && wheelState.phase === 'ready' ? (
              <Pressable
                onPress={() => void hostSpinWheel()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { opacity: pressed ? 0.9 : 1, width: '100%' },
                ]}
              >
                <Text style={styles.primaryBtnText}>Spin the wheel</Text>
              </Pressable>
            ) : null}

            {wheelState.phase === 'spinning' ? (
              <Text style={styles.startHint}>Spinning…</Text>
            ) : null}

            {!isHost && wheelState.phase === 'ready' ? (
              <Text style={styles.startHint}>Waiting for host to spin…</Text>
            ) : null}
          </View>

          <View style={styles.tallyBox}>
            <Text style={styles.tallySectionLabel}>Scoreboard</Text>
            <View style={styles.tallyChips}>
              {tallyList.map((row) => (
                <View key={row.id} style={styles.tallyChip}>
                  <Text style={styles.tallyChipName} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={styles.tallyChipWins}>{row.wins}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable onPress={onLeave} style={[styles.back, { marginTop: spacing[4] }]}>
            <Text style={{ color: neu.muted, fontSize: 15, fontWeight: '700' }}>
              Leave room
            </Text>
          </Pressable>
        </ScrollView>
        <AdBanner />
      </SafeAreaView>
    );
  }

  if (
    swipeState &&
    (swipeState.phase === 'celebration' || room.status === 'revealing') &&
    matchedItem
  ) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PlayChrome title="Match!" subtitle={code} />
        <View style={styles.celebrate}>
          <Text style={styles.celebrateEmoji}>{matchedItem.emoji}</Text>
          <Text style={styles.celebrateTitle}>It is a match!</Text>
          <Text style={styles.celebrateItem}>{matchedItem.title}</Text>
          <Text style={styles.hint}>
            Everyone agreed. Decision locked in under 60 seconds.
          </Text>
          <Pressable
            onPress={dismissMatch}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.primaryBtnText}>Keep swiping</Text>
          </Pressable>
          <Pressable onPress={onLeave} style={styles.back}>
            <Text style={{ color: neu.muted, fontSize: 16, fontWeight: '700' }}>
              Done · Leave room
            </Text>
          </Pressable>
        </View>
        <AdBanner />
      </SafeAreaView>
    );
  }

  if (room.status === 'active' && swipeState && swipeState.phase === 'swiping') {
    if (!nextItem) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <PlayChrome title="Swipe Match" subtitle={code} />
          <View style={styles.body}>
            <Text style={styles.title}>Waiting on others…</Text>
            <Text style={styles.hint}>
              You finished the deck. Hang tight for a match.
            </Text>
            <Pressable onPress={onLeave} style={styles.back}>
              <Text style={{ color: neu.muted, fontSize: 16, fontWeight: '700' }}>
                Leave room
              </Text>
            </Pressable>
          </View>
          <AdBanner />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PlayChrome title="Swipe Match" subtitle={code} />
        <View style={styles.swipeHeader}>
          <Text style={styles.swipeTitle}>What are we getting?</Text>
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
        <AdBanner />
      </SafeAreaView>
    );
  }

  if (room.status === 'completed' || swipeState?.phase === 'finished') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <PlayChrome title="Room" subtitle={code} />
        <View style={styles.body}>
          <Text style={styles.title}>Session complete</Text>
          <Text style={styles.hint}>
            {swipeState?.matches.length
              ? `Matches: ${swipeState.matches.length}`
              : 'No mutual matches this round.'}
          </Text>
          <Pressable onPress={onLeave} style={styles.back}>
            <Text style={{ color: colors.brand.amber[600], fontSize: 16, fontWeight: '800' }}>
              ← Home
            </Text>
          </Pressable>
        </View>
        <AdBanner />
      </SafeAreaView>
    );
  }

  // Lobby
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PlayChrome title="Room" subtitle={code} />
      <View style={styles.header}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.readySummary}>
          {readyCount}/{total} ready
        </Text>
        <Text style={styles.live}>Live</Text>
      </View>

      <FlatList
        data={room.participants}
        keyExtractor={(p) => p.id}
        renderItem={renderParticipant}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>Players</Text>
        }
      />

      <View style={styles.footer}>
        <Pressable
          onPress={() => void onToggleReady()}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: self?.is_ready
                ? colors.brand.emerald[400]
                : colors.brand.amber[400],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.primaryBtnText}>
            {self?.is_ready ? 'Ready ✓' : 'I’m ready'}
          </Text>
        </Pressable>

        {isHost ? (
          <Pressable
            onPress={() => void onAddGuest()}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.secondaryBtnText}>Add guest seat</Text>
          </Pressable>
        ) : null}

        {isHost ? (
          <View style={styles.lobbyWrap}>
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
          </View>
        ) : (
          <Text style={[styles.startHint, { textAlign: 'center' }]}>
            Waiting for host to pick a game…
          </Text>
        )}

        <Pressable onPress={onLeave} style={styles.back}>
          <Text style={{ color: neu.muted, fontSize: 16, fontWeight: '700' }}>
            Leave room
          </Text>
        </Pressable>
      </View>
      <AdBanner />
    </SafeAreaView>
  );
}
