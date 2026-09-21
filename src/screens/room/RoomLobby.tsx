import { View, Text, Pressable, FlatList } from 'react-native';

import { LobbyPicker } from '../../components/lobby/LobbyPicker';
import type { Participant } from '../../types/room';
import type { CatalogId } from '../../data/catalogs';
import type { PlayableMode } from '../../constants/game-modes';
import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { roomStyles as styles } from '../roomStyles';
import { haptic } from '../../lib/haptics';

type Props = {
  code: string;
  participants: Participant[];
  selfId: string | null;
  self: Participant | undefined;
  isHost: boolean;
  everyoneReady: boolean;
  catalogId: CatalogId;
  modeId: PlayableMode;
  starting: boolean;
  onCatalogChange: (id: CatalogId) => void;
  onModeChange: (id: PlayableMode) => void;
  onToggleReady: () => void;
  onAddGuest: () => void;
  onStart: () => void;
  onLeave: () => void;
};

export function RoomLobby({
  code,
  participants,
  selfId,
  self,
  isHost,
  everyoneReady,
  catalogId,
  modeId,
  starting,
  onCatalogChange,
  onModeChange,
  onToggleReady,
  onAddGuest,
  onStart,
  onLeave,
}: Props) {
  const readyCount = participants.filter((p) => p.is_ready).length;
  const total = participants.length;

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.readySummary}>
          {readyCount}/{total} ready
        </Text>
        <Text style={styles.live}>Live</Text>
      </View>

      <FlatList
        data={participants}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>Players</Text>
        }
        renderItem={({ item }) => {
          const isSelfRow = item.id === selfId;
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
                    item.is_ready
                      ? styles.readyPillTextOn
                      : styles.readyPillTextOff,
                  ]}
                >
                  {item.is_ready ? 'Ready' : 'Waiting'}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            haptic.light();
            onToggleReady();
          }}
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
            onPress={() => {
              haptic.light();
              onAddGuest();
            }}
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
              playerCount={participants.length}
              catalogId={catalogId}
              modeId={modeId}
              onCatalogChange={onCatalogChange}
              onModeChange={onModeChange}
              onStart={onStart}
              canStart={everyoneReady || participants.length === 1}
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
    </>
  );
}
