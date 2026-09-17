import { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoom } from '../../src/room/RoomContext';
import type { Participant } from '../../src/types/room';
import { isSwipeMatchState } from '../../src/types/swipe';
import type { CatalogItem } from '../../src/data/sample-items';
import { SwipeDeck } from '../../src/components/swipe/SwipeDeck';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

export default function RoomLobbyScreen() {
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
    castVote,
    dismissMatch,
    isHost,
    everyoneReady,
    isLoading,
  } = useRoom();

  useEffect(() => {
    if (routeCode) {
      void refresh(String(routeCode));
    }
  }, [routeCode, refresh]);

  const self = room?.participants.find((p) => p.id === selfId);
  const code = room?.code ?? String(routeCode ?? '').toUpperCase();
  const swipeState = room && isSwipeMatchState(room.state) ? room.state : null;

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
    return swipeState.items.find((it) => !votedIds.has(it.id)) ?? null;
  }, [swipeState, votedIds]);

  const remaining = swipeState
    ? swipeState.items.filter((it) => !votedIds.has(it.id)).length
    : 0;

  const latestMatch = swipeState?.matches.length
    ? swipeState.matches[swipeState.matches.length - 1]
    : null;

  const matchedItem = latestMatch
    ? (swipeState?.items.find((i) => i.id === latestMatch.item_id)?.payload as
        | CatalogItem
        | undefined)
    : undefined;

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

  const onStart = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    await startGame();
  };

  const readyCount =
    room?.participants.filter((p) => p.is_ready).length ?? 0;
  const total = room?.participants.length ?? 0;

  const renderParticipant = ({ item }: { item: Participant }) => {
    const isSelf = item.id === selfId;
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
              {isSelf ? ' (you)' : ''}
            </Text>
            <Text style={[styles.meta, { color: muted }]}>
              {item.is_host ? 'Host' : 'Guest'}
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

  if (
    swipeState &&
    (swipeState.phase === 'celebration' || room.status === 'revealing') &&
    matchedItem
  ) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.celebrate}>
          <Text style={styles.celebrateEmoji}>{matchedItem.emoji}</Text>
          <Text style={[styles.celebrateTitle, { color: colors.brand.emerald[500] }]}>
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
            style={[styles.primaryBtn, { backgroundColor: colors.brand.amber[500] }]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.brand.slate[900] }]}>
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
            <Text style={[styles.title, { color: text }]}>Waiting on others…</Text>
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
          <Text style={[styles.swipeTitle, { color: text }]}>What are we getting?</Text>
        </View>
        <SwipeDeck
          key={nextItem.id}
          item={nextItem.payload as CatalogItem}
          remaining={remaining}
          onSwipe={(dir) => {
            void castVote(nextItem.id, dir);
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

        {isHost && everyoneReady ? (
          <Pressable
            onPress={onStart}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.brand.emerald[500],
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: '#fff' }]}>
              Start · Swipe Match
            </Text>
          </Pressable>
        ) : null}

        {!isHost && everyoneReady ? (
          <Text style={[styles.startHint, { color: colors.brand.emerald[500] }]}>
            Waiting for host to start…
          </Text>
        ) : null}

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
    paddingHorizontal: spacing[6],
  },
  header: {
    marginTop: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
  },
  swipeHeader: {
    marginTop: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  swipeTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    marginTop: spacing[1],
    fontSize: 14,
  },
  live: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing[1],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  list: {
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.lg,
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
    color: colors.brand.slate[900],
    fontWeight: '800',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
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
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
  },
  celebrate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
  },
  celebrateEmoji: {
    fontSize: 80,
  },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  celebrateItem: {
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  hint: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  footer: {
    gap: spacing[3],
    paddingBottom: spacing[6],
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
  startHint: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  back: {
    paddingVertical: spacing[2],
    alignItems: 'center',
  },
});
