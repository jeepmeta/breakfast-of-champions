import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { WafflrMark } from '../../src/components/brand';
import { WafflrWordmark } from '../../src/components/brand';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';
import { SPRINGS } from '../../src/constants/springs';

const SCREEN_W = Dimensions.get('window').width;

type CardId = 'dice' | 'wheel' | 'room' | 'bracket';

type CardConfig = {
  id: CardId;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  accentSoft: string;
};

const CARDS: CardConfig[] = [
  {
    id: 'dice',
    title: 'Dice',
    subtitle: 'Tap to roll',
    emoji: '🎲',
    accent: colors.brand.pink[500],
    accentSoft: colors.brand.pink[100],
  },
  {
    id: 'wheel',
    title: 'Wheel',
    subtitle: 'Tap to spin',
    emoji: '🎡',
    accent: colors.brand.amber[500],
    accentSoft: colors.brand.amber[100],
  },
  {
    id: 'room',
    title: 'Room',
    subtitle: 'Play together',
    emoji: '🏠',
    accent: colors.brand.emerald[500],
    accentSoft: colors.brand.emerald[100],
  },
  {
    id: 'bracket',
    title: 'Bracket',
    subtitle: 'Elimination',
    emoji: '🏆',
    accent: colors.brand.amber[600],
    accentSoft: '#FEF3C7',
  },
];

function TapGameCard({
  config,
  disabled,
  onPress,
}: {
  config: CardConfig;
  disabled: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, SPRINGS.stiff);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRINGS.snappy);
  };

  return (
    <Animated.View style={[styles.cardSlot, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.gameCard,
          {
            borderColor: config.accent,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <View
          style={[styles.cardGlow, { backgroundColor: config.accentSoft }]}
        />
        <Text style={styles.gameEmoji}>{config.emoji}</Text>
        <Text style={styles.gameTitle}>{config.title}</Text>
        <Text style={[styles.gameSub, { color: config.accent }]}>
          {config.subtitle}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedHero() {
  const bounce = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withSpring(1, SPRINGS.bouncy),
        withSpring(0, SPRINGS.gentle),
      ),
      -1,
      false,
    );
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bounce, sparkle]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(bounce.value, [0, 1], [0, -10]) },
      { scale: interpolate(bounce.value, [0, 1], [1, 1.06]) },
    ],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkle.value, [0, 1], [0.75, 1]),
    transform: [{ scale: interpolate(sparkle.value, [0, 1], [0.98, 1.03]) }],
  }));

  return (
    <View style={styles.hero}>
      <Animated.View style={markStyle}>
        <WafflrMark size={108} />
      </Animated.View>
      <WafflrWordmark size={40} color={colors.brand.slate[900]} />
      <Animated.View style={[styles.tagPill, tagStyle]}>
        <Text style={styles.tagPillText}>
          <Text style={{ color: colors.brand.amber[600] }}>Spin. </Text>
          <Text style={{ color: colors.brand.pink[500] }}>Swipe. </Text>
          <Text style={{ color: colors.brand.emerald[600] }}>Decide.</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

/** Fire haptic without awaiting — never block navigation. */
function bump() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
    () => undefined,
  );
}

export default function HomeScreen() {
  const { create, isLoading } = useRoom();
  const { upsertRoom, upsertBracket } = useSessionLists();
  const [busy, setBusy] = useState<CardId | null>(null);

  const openDice = () => {
    if (busy) return;
    bump();
    router.push('/play/dice');
  };

  const openWheel = () => {
    if (busy) return;
    bump();
    router.push('/play/wheel');
  };

  const createRoom = () => {
    if (busy || isLoading) return;
    bump();
    setBusy('room');
    void (async () => {
      try {
        const { code } = await create({ displayName: 'You' });
        upsertRoom({ code, title: `Room ${code}`, role: 'host' });
        router.push(`/room/${code}`);
      } catch {
        // stay
      } finally {
        setBusy(null);
      }
    })();
  };

  const createBracket = () => {
    if (busy || isLoading) return;
    bump();
    setBusy('bracket');
    void (async () => {
      try {
        const { code } = await create({ displayName: 'You' });
        upsertBracket({ code, title: `Bracket ${code}`, role: 'host' });
        router.push(`/room/${code}`);
      } catch {
        // stay
      } finally {
        setBusy(null);
      }
    })();
  };

  const handlers: Record<CardId, () => void> = {
    dice: openDice,
    wheel: openWheel,
    room: createRoom,
    bracket: createBracket,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHero />

      <View style={styles.gridBlock}>
        <Text style={styles.hint}>Tap a card · go</Text>

        <View style={styles.grid}>
          {CARDS.map((c) => (
            <TapGameCard
              key={c.id}
              config={c}
              disabled={!!busy}
              onPress={handlers[c.id]}
            />
          ))}
        </View>

        {(busy === 'room' || busy === 'bracket') && (
          <View style={styles.busyRow}>
            <ActivityIndicator color={colors.brand.amber[600]} />
            <Text style={styles.busyText}>
              {busy === 'room' ? 'Opening room…' : 'Opening bracket…'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
    paddingHorizontal: spacing[4],
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    gap: spacing[1],
  },
  tagPill: {
    marginTop: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: neu.card,
    shadowColor: neu.shadow.color,
    shadowOpacity: neu.shadow.opacity,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tagPillText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gridBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: neu.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    justifyContent: 'center',
  },
  cardSlot: {
    width: (SCREEN_W - spacing[4] * 2 - spacing[3]) / 2,
  },
  gameCard: {
    minHeight: 148,
    borderRadius: radius['2xl'],
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    gap: 2,
    overflow: 'hidden',
    backgroundColor: neu.card,
    shadowColor: neu.shadow.color,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 6 },
    elevation: 5,
  },
  cardGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.85,
  },
  gameEmoji: {
    fontSize: 36,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: neu.text,
  },
  gameSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  busyText: {
    fontWeight: '700',
    color: colors.brand.slate[600],
    fontSize: 13,
  },
});
