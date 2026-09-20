import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';

import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { WafflrMark } from '../../src/components/brand';
import { WafflrWordmark } from '../../src/components/brand';
import { InstantPressable } from '../../src/navigation/InstantPressable';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';
import { SPRINGS } from '../../src/constants/springs';

const SCREEN_W = Dimensions.get('window').width;

/** Plays sequential bounce-in only once per JS runtime (cold start). */
let homeEntrancePlayed = false;

type CardId = 'dice' | 'wheel' | 'room' | 'bracket';

type CardConfig = {
  id: CardId;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  accentSoft: string;
  /** Grid side — drives stack slide direction */
  side: 'left' | 'right';
};

const CARDS: CardConfig[] = [
  {
    id: 'dice',
    title: 'Dice',
    subtitle: 'Tap to roll',
    emoji: '🎲',
    accent: colors.brand.pink[500],
    accentSoft: colors.brand.pink[100],
    side: 'left',
  },
  {
    id: 'wheel',
    title: 'Wheel',
    subtitle: 'Tap to spin',
    emoji: '🎡',
    accent: colors.brand.amber[500],
    accentSoft: colors.brand.amber[100],
    side: 'right',
  },
  {
    id: 'room',
    title: 'Room',
    subtitle: 'Play together',
    emoji: '🏠',
    accent: colors.brand.emerald[500],
    accentSoft: colors.brand.emerald[100],
    side: 'left',
  },
  {
    id: 'bracket',
    title: 'Bracket',
    subtitle: 'Elimination',
    emoji: '🏆',
    accent: colors.brand.amber[600],
    accentSoft: '#FEF3C7',
    side: 'right',
  },
];

/** Stagger delays (ms) — hero first, then grid. */
const ENTRANCE = {
  logo: 0,
  wordmark: 90,
  tagline: 170,
  hint: 280,
  cards: [360, 420, 480, 540] as const,
};

function BounceIn({
  progress,
  children,
  style,
}: {
  progress: SharedValue<number>;
  children: React.ReactNode;
  style?: object;
}) {
  const animStyle = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p,
      transform: [
        { translateY: interpolate(p, [0, 1], [28, 0]) },
        { scale: interpolate(p, [0, 1], [0.82, 1]) },
      ],
    };
  });

  return (
    <Animated.View style={[style, animStyle]}>{children}</Animated.View>
  );
}

function useEntranceProgress(delayMs: number) {
  const progress = useSharedValue(homeEntrancePlayed ? 1 : 0);

  useEffect(() => {
    if (homeEntrancePlayed) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(delayMs, withSpring(1, SPRINGS.bouncy));
  }, [delayMs, progress]);

  return progress;
}

function TapGameCard({
  config,
  disabled,
  onPress,
  entranceDelay,
}: {
  config: CardConfig;
  disabled: boolean;
  onPress: () => void;
  entranceDelay: number;
}) {
  const progress = useEntranceProgress(entranceDelay);

  return (
    <BounceIn progress={progress} style={styles.cardSlot}>
      <InstantPressable
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={config.title}
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
      </InstantPressable>
    </BounceIn>
  );
}

function AnimatedHero() {
  const logoProgress = useEntranceProgress(ENTRANCE.logo);
  const wordProgress = useEntranceProgress(ENTRANCE.wordmark);
  const tagProgress = useEntranceProgress(ENTRANCE.tagline);

  const idleBob = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    // Start idle motion after entrance settles
    const t = setTimeout(() => {
      idleBob.value = withRepeat(
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
    }, homeEntrancePlayed ? 0 : 700);
    return () => clearTimeout(t);
  }, [idleBob, sparkle]);

  const logoIdle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(idleBob.value, [0, 1], [0, -8]) },
      { scale: interpolate(idleBob.value, [0, 1], [1, 1.04]) },
    ],
  }));

  const tagIdle = useAnimatedStyle(() => ({
    opacity: interpolate(sparkle.value, [0, 1], [0.8, 1]),
  }));

  return (
    <View style={styles.hero}>
      <BounceIn progress={logoProgress}>
        <Animated.View style={logoIdle}>
          <WafflrMark size={128} />
        </Animated.View>
      </BounceIn>

      <View style={styles.heroCopy}>
        <BounceIn progress={wordProgress}>
          <WafflrWordmark size={46} color={colors.brand.slate[900]} />
        </BounceIn>
        <BounceIn progress={tagProgress}>
          <Animated.View style={[styles.tagPill, tagIdle]}>
            <Text style={styles.tagPillText}>
              <Text style={{ color: colors.brand.amber[600] }}>Spin. </Text>
              <Text style={{ color: colors.brand.pink[500] }}>Swipe. </Text>
              <Text style={{ color: colors.brand.emerald[600] }}>Decide.</Text>
            </Text>
          </Animated.View>
        </BounceIn>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { create, isLoading } = useRoom();
  const { upsertRoom, upsertBracket } = useSessionLists();
  const [busy, setBusy] = useState<CardId | null>(null);
  const hintProgress = useEntranceProgress(ENTRANCE.hint);

  useEffect(() => {
    // Mark entrance as done after the last card delay + spring settle
    if (homeEntrancePlayed) return;
    const t = setTimeout(() => {
      homeEntrancePlayed = true;
    }, ENTRANCE.cards[3] + 500);
    return () => clearTimeout(t);
  }, []);

  const openDice = () => {
    if (busy) return;
    router.push('/play/dice');
  };

  const openWheel = () => {
    if (busy) return;
    router.push('/play/wheel');
  };

  const createRoom = () => {
    if (busy || isLoading) return;
    setBusy('room');
    void (async () => {
      try {
        const { code } = await create({ displayName: 'You' });
        upsertRoom({ code, title: `Room ${code}`, role: 'host' });
        // Left column → slide_from_left
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
    setBusy('bracket');
    void (async () => {
      try {
        const { code } = await create({ displayName: 'You' });
        upsertBracket({ code, title: `Bracket ${code}`, role: 'host' });
        // Right column → slide_from_right via bracket alias route
        router.push(`/bracket/${code}`);
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
        <BounceIn progress={hintProgress}>
          <Text style={styles.hint}>Tap a card · go</Text>
        </BounceIn>

        <View style={styles.grid}>
          {CARDS.map((c, i) => (
            <TapGameCard
              key={c.id}
              config={c}
              disabled={!!busy}
              onPress={handlers[c.id]}
              entranceDelay={ENTRANCE.cards[i] ?? 400}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[1],
    gap: spacing[4],
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[2],
  },
  tagPill: {
    alignSelf: 'flex-start',
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
    fontSize: 16,
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
