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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { WafflrMark } from '../../src/components/brand';
import { WafflrWordmark } from '../../src/components/brand';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

const SWIPE_THRESHOLD = 56;
const SCREEN_W = Dimensions.get('window').width;
/** Match native stack transition (~system push duration) */
const EXIT_MS = 320;

type CardId = 'dice' | 'wheel' | 'room' | 'bracket';
type Dir = 'left' | 'right';

type CardConfig = {
  id: CardId;
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  accentSoft: string;
  dir: Dir;
};

const CARDS: CardConfig[] = [
  {
    id: 'dice',
    title: 'Dice',
    subtitle: 'Swipe left',
    emoji: '🎲',
    accent: colors.brand.pink[500],
    accentSoft: colors.brand.pink[100],
    dir: 'left',
  },
  {
    id: 'wheel',
    title: 'Wheel',
    subtitle: 'Swipe right',
    emoji: '🎡',
    accent: colors.brand.amber[500],
    accentSoft: colors.brand.amber[100],
    dir: 'right',
  },
  {
    id: 'room',
    title: 'Room',
    subtitle: 'Swipe left',
    emoji: '🏠',
    accent: colors.brand.emerald[500],
    accentSoft: colors.brand.emerald[100],
    dir: 'left',
  },
  {
    id: 'bracket',
    title: 'Bracket',
    subtitle: 'Swipe right',
    emoji: '🏆',
    accent: colors.brand.amber[600],
    accentSoft: '#FEF3C7',
    dir: 'right',
  },
];

function BounceArrow({
  direction,
  color,
}: {
  direction: Dir;
  color: string;
}) {
  const bob = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 550, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [bob]);

  const style = useAnimatedStyle(() => {
    const shift = interpolate(bob.value, [0, 1], [0, direction === 'left' ? -6 : 6]);
    return {
      transform: [{ translateX: shift }],
      opacity: interpolate(bob.value, [0, 1], [0.75, 1]),
    };
  });

  return (
    <Animated.View style={[styles.arrowChip, { borderColor: color }, style]}>
      <Ionicons
        name={direction === 'left' ? 'chevron-back' : 'chevron-forward'}
        size={16}
        color={color}
      />
    </Animated.View>
  );
}

function SwipeGameCard({
  config,
  disabled,
  onActivate,
}: {
  config: CardConfig;
  disabled: boolean;
  onActivate: () => void;
}) {
  const x = useSharedValue(0);
  const opacity = useSharedValue(1);

  const exit = () => {
    const target = config.dir === 'left' ? -SCREEN_W : SCREEN_W;
    x.value = withTiming(
      target,
      { duration: EXIT_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onActivate)();
      },
    );
    opacity.value = withTiming(0.25, { duration: EXIT_MS });
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-10, 10])
    .failOffsetY([-28, 28])
    .onUpdate((e) => {
      if (config.dir === 'left') {
        x.value = Math.min(0, Math.max(-SCREEN_W * 0.5, e.translationX));
      } else {
        x.value = Math.max(0, Math.min(SCREEN_W * 0.5, e.translationX));
      }
    })
    .onEnd((e) => {
      const crossed =
        config.dir === 'left'
          ? e.translationX <= -SWIPE_THRESHOLD || e.velocityX < -550
          : e.translationX >= SWIPE_THRESHOLD || e.velocityX > 550;
      if (crossed) {
        runOnJS(exit)();
      } else {
        x.value = withSpring(0, { damping: 16, stiffness: 240 });
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    opacity: opacity.value,
  }));

  // Reset when returning to home
  useEffect(() => {
    if (!disabled) {
      x.value = 0;
      opacity.value = 1;
    }
  }, [disabled, opacity, x]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.cardSlot, animStyle]}>
        <Pressable
          onPress={exit}
          disabled={disabled}
          style={({ pressed }) => [
            styles.gameCard,
            {
              backgroundColor: colors.brand.white,
              borderColor: config.accent,
              opacity: pressed ? 0.94 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.cardGlow,
              { backgroundColor: config.accentSoft },
            ]}
          />
          <Text style={styles.gameEmoji}>{config.emoji}</Text>
          <Text style={styles.gameTitle}>{config.title}</Text>
          <Text style={[styles.gameSub, { color: config.accent }]}>
            {config.subtitle}
          </Text>

          <View
            style={[
              styles.cardArrow,
              config.dir === 'left' ? styles.cardArrowLeft : styles.cardArrowRight,
            ]}
            pointerEvents="none"
          >
            <BounceArrow direction={config.dir} color={config.accent} />
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

function AnimatedHero() {
  const bounce = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withSpring(1, { damping: 6, stiffness: 120 }),
        withSpring(0, { damping: 8, stiffness: 100 }),
      ),
      -1,
      false,
    );
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0, { duration: 900 }),
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
    opacity: interpolate(sparkle.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(sparkle.value, [0, 1], [0.98, 1.02]) }],
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

export default function HomeScreen() {
  const { create, isLoading } = useRoom();
  const { upsertRoom, upsertBracket } = useSessionLists();
  const [busy, setBusy] = useState<CardId | null>(null);
  const [navigating, setNavigating] = useState(false);

  const afterNav = () => {
    setTimeout(() => {
      setNavigating(false);
      setBusy(null);
    }, 450);
  };

  const openDice = () => {
    if (navigating) return;
    setNavigating(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    router.push('/play/dice');
    afterNav();
  };

  const openWheel = () => {
    if (navigating) return;
    setNavigating(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    router.push('/play/wheel');
    afterNav();
  };

  const createRoom = async () => {
    if (navigating || busy || isLoading) return;
    setBusy('room');
    setNavigating(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      const { code } = await create({ displayName: 'You' });
      upsertRoom({ code, title: `Room ${code}`, role: 'host' });
      router.push(`/room/${code}`);
    } catch {
      setNavigating(false);
      setBusy(null);
      return;
    }
    afterNav();
  };

  const createBracket = async () => {
    if (navigating || busy || isLoading) return;
    setBusy('bracket');
    setNavigating(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      const { code } = await create({ displayName: 'You' });
      upsertBracket({ code, title: `Bracket ${code}`, role: 'host' });
      router.push(`/room/${code}`);
    } catch {
      setNavigating(false);
      setBusy(null);
      return;
    }
    afterNav();
  };

  const handlers: Record<CardId, () => void> = {
    dice: openDice,
    wheel: openWheel,
    room: () => {
      void createRoom();
    },
    bracket: () => {
      void createBracket();
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AnimatedHero />

      <View style={styles.gridBlock}>
        <Text style={styles.hint}>Swipe a card · instant dopamine</Text>

        <View style={styles.grid}>
          {CARDS.map((c) => (
            <SwipeGameCard
              key={c.id}
              config={c}
              disabled={navigating || !!busy}
              onActivate={handlers[c.id]}
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
    backgroundColor: '#FFF8EB', // warm candy cream
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
    backgroundColor: colors.brand.white,
    // neumorphic soft raise
    shadowColor: colors.brand.amber[700],
    shadowOpacity: 0.12,
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
    color: colors.brand.slate[500],
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
    // shiny neumorph
    shadowColor: '#78350F',
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
    color: colors.brand.slate[900],
  },
  gameSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -14,
  },
  cardArrowLeft: {
    left: 6,
  },
  cardArrowRight: {
    right: 6,
  },
  arrowChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
