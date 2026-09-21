import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoom } from '../../src/room/RoomContext';
import { isSwipeMatchState } from '../../src/types/swipe';
import { isGroupWheelState } from '../../src/types/group-wheel';
import { PlayChrome } from '../../src/components/play/PlayChrome';
import { AdBanner } from '../../src/components/ads/AdBanner';
import {
  getCatalogItems,
  type CatalogId,
  type CatalogItem,
} from '../../src/data/catalogs';
import {
  type PlayableMode,
  modesForPlayerCount,
} from '../../src/constants/game-modes';
import type { WheelSegment } from '../../src/components/wheel/WafflrWheel';
import { RoomLobby } from '../../src/screens/room/RoomLobby';
import {
  RoomSwipe,
  RoomSwipeWaiting,
  RoomSwipeCelebrate,
} from '../../src/screens/room/RoomSwipe';
import { RoomGroupWheel } from '../../src/screens/room/RoomGroupWheel';
import { colors } from '../../src/theme/colors';
import { roomStyles as styles } from '../../src/screens/roomStyles';
import { haptic } from '../../src/lib/haptics';

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

  const onLeave = async () => {
    await leave();
    router.replace('/');
  };

  const onLobbyStart = async () => {
    if (starting) return;
    setStarting(true);
    haptic.success();
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
            <Text
              style={{
                color: colors.brand.amber[600],
                fontSize: 16,
                fontWeight: '800',
              }}
            >
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
        <RoomGroupWheel
          code={code}
          isHost={isHost}
          phase={wheelState.phase}
          celebrating={celebrating}
          winner={winnerDisplay}
          segments={wheelSegments}
          externalSpin={externalSpin}
          tallyList={tallyList}
          onSpinEnd={() => {
            void onWheelSpinEnd();
          }}
          onHostSpin={() => {
            void hostSpinWheel();
          }}
          onSpinAgain={() => {
            void nextWheelSpin();
          }}
          onLeave={() => {
            void onLeave();
          }}
        />
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
        <RoomSwipeCelebrate
          code={code}
          item={matchedItem}
          onKeepSwiping={() => {
            void dismissMatch();
          }}
          onLeave={() => {
            void onLeave();
          }}
        />
        <AdBanner />
      </SafeAreaView>
    );
  }

  if (room.status === 'active' && swipeState && swipeState.phase === 'swiping') {
    if (!nextItem) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <RoomSwipeWaiting
            code={code}
            onLeave={() => {
              void onLeave();
            }}
          />
          <AdBanner />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <RoomSwipe
          code={code}
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
          <Pressable onPress={() => void onLeave()} style={styles.back}>
            <Text
              style={{
                color: colors.brand.amber[600],
                fontSize: 16,
                fontWeight: '800',
              }}
            >
              ← Home
            </Text>
          </Pressable>
        </View>
        <AdBanner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PlayChrome title="Room" subtitle={code} />
      <RoomLobby
        code={code}
        participants={room.participants}
        selfId={selfId}
        self={self}
        isHost={isHost}
        everyoneReady={everyoneReady}
        catalogId={catalogId}
        modeId={modeId}
        starting={starting}
        onCatalogChange={setCatalogId}
        onModeChange={setModeId}
        onToggleReady={() => {
          if (!self) return;
          void setReady(!self.is_ready);
        }}
        onAddGuest={() => {
          void addGuest();
        }}
        onStart={() => {
          void onLobbyStart();
        }}
        onLeave={() => {
          void onLeave();
        }}
      />
      <AdBanner />
    </SafeAreaView>
  );
}
