import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
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

import { useRoom } from '../src/room/RoomContext';
import { useSessionListsStore } from '../src/session/sessionListsStore';
import { WafflrMark } from '../src/components/brand';
import { WafflrWordmark } from '../src/components/brand';
import { InstantPressable } from '../src/navigation/InstantPressable';
import { AdBanner } from '../src/components/ads/AdBanner';
import { NeuSurface } from '../src/components/ui/NeuSurface';
import { NoiseOverlay } from '../src/components/ui/NoiseOverlay';
import { colors } from '../src/theme/colors';
import { neu, elevationStyle } from '../src/theme/neumorph';
import { spacing, radius } from '../src/theme/tokens';
import { SPRINGS } from '../src/constants/springs';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = (SCREEN_W - spacing[4] * 2 - spacing[3]) / 2;

let homeEntrancePlayed = false;

type CardId =
  | 'dice'
  | 'wheel'
  | 'room'
  | 'bracket'
  | 'profile'
  | 'settings';

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
    subtitle: 'Swipe to roll',
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
  {
    id: 'profile',
    title: 'Profile',
    subtitle: 'Handle & avatar',
    emoji: '👤',
    accent: colors.brand.slate[600],
    accentSoft: colors.brand.slate[100],
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Prefs & Pro',
    emoji: '⚙️',
    accent: colors.brand.slate[500],
    accentSoft: '#E2E8F0',
  },
];

const ENTRANCE = {
  logo: 0,
  wordmark: 90,
  tagline: 170,
  hint: 260,
  cards: [320, 370, 420, 470, 520, 570] as const,
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
        { translateY: interpolate(p, [0, 1], [22, 0]) },
        { scale: interpolate(p, [0, 1], [0.86, 1]) },
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
      <NeuSurface
        level="float"
        borderRadius={radius['2xl']}
        borderWidth={2.5}
        borderColor={config.accent}
        backgroundColor={neu.card}
        style={{ opacity: disabled ? 0.55 : 1 }}
        contentStyle={styles.gameCardFace}
      >
        <InstantPressable
          onPress={onPress}
          disabled={disabled}
          accessibilityLabel={config.title}
          style={styles.gameCardPress}
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
      </NeuSurface>
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
          <WafflrMark size={112} />
        </Animated.View>
      </BounceIn>
      <View style={styles.heroCopy}>
        <BounceIn progress={wordProgress}>
          <WafflrWordmark size={42} color={colors.brand.slate[900]} />
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
  const upsertRoom = useSessionListsStore((s) => s.upsertRoom);
  const upsertBracket = useSessionListsStore((s) => s.upsertBracket);
  const [busy, setBusy] = useState<CardId | null>(null);
  const hintProgress = useEntranceProgress(ENTRANCE.hint);

  useEffect(() => {
    if (homeEntrancePlayed) return;
    const t = setTimeout(() => {
      homeEntrancePlayed = true;
    }, ENTRANCE.cards[5] + 500);
    return () => clearTimeout(t);
  }, []);

  const createRoom = () => {
    if (busy || isLoading) return;
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
    setBusy('bracket');
    void (async () => {
      try {
        const { code } = await create({ displayName: 'You' });
        upsertBracket({ code, title: `Bracket ${code}`, role: 'host' });
        router.push(`/bracket/${code}`);
      } catch {
        // stay
      } finally {
        setBusy(null);
      }
    })();
  };

  const handlers: Record<CardId, () => void> = {
    dice: () => {
      if (!busy) router.push('/play/dice');
    },
    wheel: () => {
      if (!busy) router.push('/play/wheel');
    },
    room: createRoom,
    bracket: createBracket,
    profile: () => {
      if (!busy) router.push('/profile');
    },
    settings: () => {
      if (!busy) router.push('/settings');
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NoiseOverlay opacity={0.04} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scroll: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    flexGrow: 1,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    gap: spacing[3],
  },
  heroCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[2],
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
    ...elevationStyle('soft'),
  },
  tagPillText: {
    fontSize: 15,
    fontWeight: '800',
  },
  gridBlock: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing[3],
    paddingBottom: spacing[2],
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
    width: CARD_W,
  },
  gameCardFace: {
    minHeight: 118,
    width: '100%',
  },
  gameCardPress: {
    width: '100%',
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[2],
    gap: 1,
  },
  cardGlow: {
    position: 'absolute',
    top: -18,
    right: -18,
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.85,
  },
  gameEmoji: { fontSize: 30 },
  gameTitle: {
    fontSize: 16,
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
