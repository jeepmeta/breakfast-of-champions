import { View, Text, Pressable, ScrollView } from 'react-native';

import { PlayChrome } from '../../components/play/PlayChrome';
import {
  WafflrWheel,
  type WheelSegment,
  type ExternalSpin,
} from '../../components/wheel/WafflrWheel';
import { ConfettiBurst } from '../../components/celebration/ConfettiBurst';
import { spacing } from '../../theme/tokens';
import { neu } from '../../theme/neumorph';
import { roomStyles as styles } from '../roomStyles';
import { haptic } from '../../lib/haptics';

type TallyRow = { id: string; name: string; wins: number };

type Props = {
  code: string;
  isHost: boolean;
  phase: string;
  celebrating: boolean;
  winner: { id: string; name: string; emoji: string } | null;
  segments: WheelSegment[];
  externalSpin: ExternalSpin | null;
  tallyList: TallyRow[];
  onSpinEnd: () => void;
  onHostSpin: () => void;
  onSpinAgain: () => void;
  onLeave: () => void;
};

export function RoomGroupWheel({
  code,
  isHost,
  phase,
  celebrating,
  winner,
  segments,
  externalSpin,
  tallyList,
  onSpinEnd,
  onHostSpin,
  onSpinAgain,
  onLeave,
}: Props) {
  return (
    <>
      <PlayChrome title="Group Wheel" subtitle={code} />
      <ConfettiBurst active={celebrating && !!winner} />

      {celebrating && winner ? (
        <View style={styles.winnerOverlay} pointerEvents="box-none">
          <View style={styles.winnerCard}>
            <Text style={styles.winnerCardEmoji}>{winner.emoji}</Text>
            <Text style={styles.winnerCardName}>{winner.name}</Text>
            <Text style={styles.winnerCardSub}>wins this round</Text>
            {isHost ? (
              <Pressable
                onPress={() => {
                  haptic.medium();
                  onSpinAgain();
                }}
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
            segments={segments}
            size={280}
            hideSpinButton
            hideResult
            externalSpin={externalSpin}
            onSpinEnd={onSpinEnd}
          />
        </View>

        <View style={styles.wheelControls}>
          {isHost && phase === 'ready' ? (
            <Pressable
              onPress={() => {
                haptic.medium();
                onHostSpin();
              }}
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed ? 0.9 : 1, width: '100%' },
              ]}
            >
              <Text style={styles.primaryBtnText}>Spin the wheel</Text>
            </Pressable>
          ) : null}

          {phase === 'spinning' ? (
            <Text style={styles.startHint}>Spinning…</Text>
          ) : null}

          {!isHost && phase === 'ready' ? (
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

        <Pressable
          onPress={onLeave}
          style={[styles.back, { marginTop: spacing[4] }]}
        >
          <Text style={{ color: neu.muted, fontSize: 15, fontWeight: '700' }}>
            Leave room
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
