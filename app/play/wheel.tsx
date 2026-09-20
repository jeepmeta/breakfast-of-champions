import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayChrome } from '../../src/components/play/PlayChrome';
import { AdBanner } from '../../src/components/ads/AdBanner';
import {
  WafflrWheel,
  type WheelSegment,
} from '../../src/components/wheel/WafflrWheel';
import { WinnerPopup } from '../../src/components/wheel/WinnerPopup';
import {
  WHEEL_TOPICS,
  getTopic,
  getVariation,
  type WheelTopicId,
  type WheelVariationId,
} from '../../src/data/wheel-topics';
import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';

export default function PlayWheelScreen() {
  const [topicId, setTopicId] = useState<WheelTopicId>('eat');
  const [variationId, setVariationId] = useState<WheelVariationId>('dinner');
  const [winner, setWinner] = useState<WheelSegment | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wheelKey, setWheelKey] = useState(0);

  const { create, isLoading } = useRoom();
  const { upsertRoom } = useSessionLists();

  const topic = useMemo(() => getTopic(topicId), [topicId]);
  const variation = useMemo(
    () => getVariation(topicId, variationId),
    [topicId, variationId],
  );

  const segments: WheelSegment[] = useMemo(
    () =>
      variation.segments.map((s) => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
        weight: 1,
      })),
    [variation],
  );

  const selectTopic = async (id: WheelTopicId) => {
    if (id === topicId) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // ignore
    }
    const next = getTopic(id);
    setTopicId(id);
    setVariationId(next.variations[0].id);
    setWinner(null);
    setPopupOpen(false);
    setWheelKey((k) => k + 1);
  };

  const selectVariation = async (id: WheelVariationId) => {
    if (id === variationId) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // ignore
    }
    setVariationId(id);
    setWinner(null);
    setPopupOpen(false);
    setWheelKey((k) => k + 1);
  };

  const onSpinEnd = useCallback((segment: WheelSegment) => {
    setWinner(segment);
    setPopupOpen(true);
  }, []);

  const spinAgain = () => {
    setPopupOpen(false);
    setWinner(null);
    setWheelKey((k) => k + 1);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <PlayChrome title="Wafflr Wheel" subtitle={variation.question} />

      <View style={styles.stageWrap}>
        <View style={styles.stage}>
          <View style={styles.topicRow}>
            {WHEEL_TOPICS.map((t) => {
              const active = topicId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => selectTopic(t.id)}
                  style={[styles.topicChip, active && styles.topicChipActive]}
                >
                  <Text style={styles.topicEmoji}>{t.emoji}</Text>
                  <Text
                    style={[
                      styles.topicLabel,
                      active && styles.topicLabelActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.varRow}>
            {topic.variations.map((v) => {
              const active = variationId === v.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => selectVariation(v.id)}
                  style={[styles.varPill, active && styles.varPillActive]}
                >
                  <Text style={styles.varEmoji}>{v.emoji}</Text>
                  <Text
                    style={[styles.varLabel, active && styles.varLabelActive]}
                  >
                    {v.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.wheelWrap}>
            <WafflrWheel
              key={`${topicId}-${variationId}-${wheelKey}`}
              segments={segments}
              size={250}
              onSpinEnd={onSpinEnd}
              hideResult
              tickHaptics={false}
              spinStartHaptic
              settleHaptic={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
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
            <Text style={styles.roomBtnText}>Open wheel room</Text>
          )}
        </Pressable>
      </View>

      <AdBanner />

      <WinnerPopup
        visible={popupOpen && !!winner}
        emoji={winner?.emoji ?? '✨'}
        label={winner?.label ?? ''}
        subtitle={`${topic.label} · ${variation.label}`}
        onClose={() => setPopupOpen(false)}
        onSpinAgain={spinAgain}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
  },
  stageWrap: {
    flex: 1,
    marginHorizontal: spacing[4],
    minHeight: 260,
  },
  stage: {
    flex: 1,
    borderRadius: radius['2xl'],
    borderWidth: 2,
    borderColor: neu.borderSoft,
    backgroundColor: neu.card,
    padding: spacing[3],
    gap: spacing[2],
  },
  topicRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  topicChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing[2],
    alignItems: 'center',
    gap: 2,
    backgroundColor: neu.canvasAlt,
    borderColor: neu.borderSoft,
  },
  topicChipActive: {
    backgroundColor: colors.brand.amber[500],
    borderColor: colors.brand.amber[600],
  },
  topicEmoji: { fontSize: 18 },
  topicLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: neu.text,
  },
  topicLabelActive: { color: colors.brand.slate[900] },
  varRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'center',
  },
  varPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: neu.canvasAlt,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
  },
  varPillActive: {
    backgroundColor: colors.brand.pink[100],
    borderColor: colors.brand.pink[500],
  },
  varEmoji: { fontSize: 13 },
  varLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: neu.text,
  },
  varLabelActive: { color: colors.brand.pink[700] },
  wheelWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  roomBtn: {
    backgroundColor: colors.brand.amber[400],
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.brand.amber[500],
  },
  roomBtnText: {
    color: colors.brand.slate[900],
    fontSize: 15,
    fontWeight: '800',
  },
});
