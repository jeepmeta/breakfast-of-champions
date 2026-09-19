import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

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

/**
 * Basic solo wheel — Eat / Watch / Do with meal, media, and activity variations.
 * Vision: room spin lands on a topic → generate place/title cards → swipe match.
 */
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Wheel</Text>
        <Text style={styles.sub}>
          Pick a subject, spin once, decide. In a room this topic seeds swipe cards
          next.
        </Text>

        {/* Topic: Eat / Watch / Do */}
        <View style={styles.topicRow}>
          {WHEEL_TOPICS.map((t) => {
            const active = topicId === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => selectTopic(t.id)}
                style={[
                  styles.topicChip,
                  active && styles.topicChipActive,
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
              </Pressable>
            );
          })}
        </View>

        {/* Variations */}
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

        <Text style={styles.question}>{variation.question}</Text>

        <View style={styles.wheelWrap}>
          <WafflrWheel
            key={`${topicId}-${variationId}-${wheelKey}`}
            segments={segments}
            size={280}
            onSpinEnd={onSpinEnd}
            hideResult
            tickHaptics={false}
            spinStartHaptic
            settleHaptic={false}
          />
        </View>

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
            <Text style={styles.roomBtnText}>
              Open room · spin then swipe
            </Text>
          )}
        </Pressable>

        <Text style={styles.footnote}>
          Coming: land on Sushi → nearby sushi cards. Land on Sci-Fi → popular
          titles. Everyone swipes; matches rank top to bottom.
        </Text>
      </ScrollView>

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
  scroll: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[12],
    paddingTop: spacing[2],
    gap: spacing[3],
  },
  back: {
    color: neu.muted,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: neu.text,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: neu.muted,
  },
  topicRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  topicChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    alignItems: 'center',
    gap: 2,
    backgroundColor: neu.card,
    borderColor: neu.borderSoft,
    shadowColor: neu.shadowSoft.color,
    shadowOpacity: neu.shadowSoft.opacity,
    shadowRadius: neu.shadowSoft.radius,
    shadowOffset: neu.shadowSoft.offset,
    elevation: neu.shadowSoft.elevation,
  },
  topicChipActive: {
    backgroundColor: colors.brand.amber[500],
    borderColor: colors.brand.amber[600],
  },
  topicEmoji: {
    fontSize: 22,
  },
  topicLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: neu.text,
  },
  topicLabelActive: {
    color: colors.brand.slate[900],
  },
  varRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  varPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
  },
  varPillActive: {
    backgroundColor: colors.brand.pink[100],
    borderColor: colors.brand.pink[500],
  },
  varEmoji: {
    fontSize: 14,
  },
  varLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: neu.text,
  },
  varLabelActive: {
    color: colors.brand.pink[700],
  },
  question: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: neu.muted,
  },
  wheelWrap: {
    alignItems: 'center',
    marginTop: spacing[1],
  },
  roomBtn: {
    marginTop: spacing[4],
    backgroundColor: colors.brand.amber[400],
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.brand.amber[500],
  },
  roomBtnText: {
    color: colors.brand.slate[900],
    fontSize: 15,
    fontWeight: '800',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: neu.muted,
  },
});
