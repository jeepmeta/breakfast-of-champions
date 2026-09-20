import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayChrome } from '../../src/components/play/PlayChrome';
import { AdBanner } from '../../src/components/ads/AdBanner';
import { NoiseOverlay } from '../../src/components/ui/NoiseOverlay';
import {
  WafflrWheel,
  type WheelSegment,
} from '../../src/components/wheel/WafflrWheel';
import { WinnerPopup } from '../../src/components/wheel/WinnerPopup';
import { InstantPressable } from '../../src/navigation/InstantPressable';
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
import { neu, affect, elevationStyle } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';

export default function PlayWheelScreen() {
  const [topicId, setTopicId] = useState<WheelTopicId>('eat');
  const [variationId, setVariationId] = useState<WheelVariationId>('dinner');
  const [winner, setWinner] = useState<WheelSegment | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [spinning, setSpinning] = useState(false);
  /** Bumps to re-spin without remounting the wheel */
  const [spinNonce, setSpinNonce] = useState(0);
  /** Only remount when topic/variation changes */
  const [catalogKey, setCatalogKey] = useState(0);

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

  const selectTopic = (id: WheelTopicId) => {
    if (id === topicId || spinning || popupOpen) return;
    void Haptics.selectionAsync().catch(() => undefined);
    const next = getTopic(id);
    setTopicId(id);
    setVariationId(next.variations[0].id);
    setWinner(null);
    setPopupOpen(false);
    setCatalogKey((k) => k + 1);
    setSpinNonce(0);
  };

  const selectVariation = (id: WheelVariationId) => {
    if (id === variationId || spinning || popupOpen) return;
    void Haptics.selectionAsync().catch(() => undefined);
    setVariationId(id);
    setWinner(null);
    setPopupOpen(false);
    setCatalogKey((k) => k + 1);
    setSpinNonce(0);
  };

  const onSpinEnd = useCallback((segment: WheelSegment) => {
    setSpinning(false);
    setWinner(segment);
    setPopupOpen(true);
  }, []);

  const dismissPopup = useCallback(() => {
    setPopupOpen(false);
  }, []);

  /** Close popup and spin again — keep wheel instance, bump spinNonce */
  const spinAgain = useCallback(() => {
    setPopupOpen(false);
    setWinner(null);
    setSpinning(true);
    // slight delay so modal unmounts before spin starts
    requestAnimationFrame(() => {
      setSpinNonce((n) => n + 1);
    });
  }, []);

  const openWheelRoom = async () => {
    if (busy || isLoading) return;
    setBusy(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
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

  const locked = spinning || popupOpen;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NoiseOverlay opacity={0.04} frequency={0.85} />
      <PlayChrome title="Wafflr Wheel" subtitle={variation.question} />

      <View style={styles.stageWrap}>
        <View style={styles.stage}>
          <View style={styles.topicRow}>
            {WHEEL_TOPICS.map((t) => {
              const active = topicId === t.id;
              return (
                <InstantPressable
                  key={t.id}
                  disabled={locked}
                  onPress={() => selectTopic(t.id)}
                  style={[
                    styles.topicChip,
                    active && styles.topicChipActive,
                    locked && styles.chipLocked,
                  ]}
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
                </InstantPressable>
              );
            })}
          </View>

          <View style={styles.varRow}>
            {topic.variations.map((v) => {
              const active = variationId === v.id;
              return (
                <InstantPressable
                  key={v.id}
                  disabled={locked}
                  onPress={() => selectVariation(v.id)}
                  style={[
                    styles.varPill,
                    active && styles.varPillActive,
                    locked && styles.chipLocked,
                  ]}
                >
                  <Text style={styles.varEmoji}>{v.emoji}</Text>
                  <Text
                    style={[styles.varLabel, active && styles.varLabelActive]}
                  >
                    {v.label}
                  </Text>
                </InstantPressable>
              );
            })}
          </View>

          <View style={styles.wheelWrap}>
            <WafflrWheel
              key={`catalog-${catalogKey}`}
              segments={segments}
              size={268}
              spinNonce={spinNonce}
              onSpinEnd={(seg) => {
                setSpinning(true);
                onSpinEnd(seg);
              }}
              hideResult
              tickHaptics={false}
              spinStartHaptic
              settleHaptic={false}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <InstantPressable
          onPress={openWheelRoom}
          disabled={busy}
          style={[styles.roomBtn, busy && styles.roomBtnBusy]}
        >
          {busy ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
          ) : (
            <Text style={styles.roomBtnText}>Open wheel room</Text>
          )}
        </InstantPressable>
      </View>

      <AdBanner />

      <WinnerPopup
        visible={popupOpen && !!winner}
        emoji={winner?.emoji ?? '✨'}
        label={winner?.label ?? ''}
        subtitle={`${topic.label} · ${variation.label}`}
        onClose={dismissPopup}
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
    borderWidth: 2.5,
    borderColor: neu.borderSoft,
    backgroundColor: neu.card,
    padding: spacing[3],
    gap: spacing[2],
    ...elevationStyle('card'),
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
    backgroundColor: affect.reward.solid,
    borderColor: affect.reward.solidStrong,
  },
  topicEmoji: { fontSize: 20 },
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
    backgroundColor: affect.delight.soft,
    borderColor: affect.delight.solid,
  },
  varEmoji: { fontSize: 15 },
  varLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: neu.text,
  },
  varLabelActive: { color: affect.delight.text },
  chipLocked: { opacity: 0.55 },
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
    backgroundColor: affect.reward.solid,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: affect.reward.solidStrong,
    ...elevationStyle('cta'),
  },
  roomBtnBusy: { opacity: 0.6 },
  roomBtnText: {
    color: colors.brand.slate[900],
    fontSize: 15,
    fontWeight: '800',
  },
});
