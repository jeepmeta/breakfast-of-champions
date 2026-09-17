import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Pressable,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoom } from '../../src/room/RoomContext';
import type { Participant } from '../../src/types/room';
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
    isHost,
    everyoneReady,
  } = useRoom();

  useEffect(() => {
    if (routeCode) refresh(String(routeCode));
  }, [routeCode, refresh]);

  const self = room?.participants.find((p) => p.id === selfId);
  const code = room?.code ?? String(routeCode ?? '').toUpperCase();

  const onToggleReady = async () => {
    if (!self) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    setReady(!self.is_ready);
  };

  const onLeave = async () => {
    leave();
    router.replace('/');
  };

  const onAddGuest = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    addGuest();
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
              {item.connection_status !== 'connected'
                ? ` · ${item.connection_status}`
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
              {
                color: item.is_ready ? '#fff' : muted,
              },
            ]}
          >
            {item.is_ready ? 'Ready' : 'Waiting'}
          </Text>
        </View>
      </View>
    );
  };

  if (!room) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: text }]}>Room not found</Text>
          <Text style={[styles.hint, { color: muted }]}>
            This code is not active in this session. Create a room or join one
            that was created on this device (local-first foundation).
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
      </View>

      <FlatList
        data={room.participants}
        keyExtractor={(p) => p.id}
        renderItem={renderParticipant}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.sectionLabel, { color: muted }]}>
            Players
          </Text>
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

        {everyoneReady ? (
          <Text style={[styles.startHint, { color: colors.brand.emerald[500] }]}>
            All ready — game start comes next
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
