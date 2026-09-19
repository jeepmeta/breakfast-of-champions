import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
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
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { WafflrLockup } from '../../src/components/brand';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

const SWIPE_THRESHOLD = 64;
const SCREEN_W = Dimensions.get('window').width;
const EXIT_MS = 220;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.elevated.dark : colors.elevated.light;

  const { create, isLoading } = useRoom();
  const { upsertRoom, upsertBracket } = useSessionLists();
  const [busy, setBusy] = useState<'room' | 'bracket' | null>(null);
  const [navigating, setNavigating] = useState(false);

  // Only the active card translates; the other stays put.
  const diceX = useSharedValue(0);
  const wheelX = useSharedValue(0);
  const diceOpacity = useSharedValue(1);
  const wheelOpacity = useSharedValue(1);

  const goDice = () => {
    if (navigating) return;
    setNavigating(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    router.push('/play/dice');
    // Reset after transition so back feels clean
    setTimeout(() => {
      diceX.value = 0;
      diceOpacity.value = 1;
      setNavigating(false);
    }, 400);
  };

  const goWheel = () => {
    if (navigating) return;
    setNavigating(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
      () => undefined,
    );
    router.push('/play/wheel');
    setTimeout(() => {
      wheelX.value = 0;
      wheelOpacity.value = 1;
      setNavigating(false);
    }, 400);
  };

  const exitDiceLeft = () => {
    diceX.value = withTiming(
      -SCREEN_W,
      { duration: EXIT_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(goDice)();
      },
    );
    diceOpacity.value = withTiming(0.35, { duration: EXIT_MS });
  };

  const exitWheelRight = () => {
    wheelX.value = withTiming(
      SCREEN_W,
      { duration: EXIT_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(goWheel)();
      },
    );
    wheelOpacity.value = withTiming(0.35, { duration: EXIT_MS });
  };

  const dicePan = Gesture.Pan()
    .enabled(!navigating)
    .activeOffsetX([-10, 10])
    .failOffsetY([-24, 24])
    .onUpdate((e) => {
      // Dice only moves left
      diceX.value = Math.min(0, Math.max(-SCREEN_W * 0.55, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX <= -SWIPE_THRESHOLD || e.velocityX < -600) {
        runOnJS(exitDiceLeft)();
      } else {
        diceX.value = withSpring(0, { damping: 18, stiffness: 240 });
      }
    });

  const wheelPan = Gesture.Pan()
    .enabled(!navigating)
    .activeOffsetX([-10, 10])
    .failOffsetY([-24, 24])
    .onUpdate((e) => {
      // Wheel only moves right
      wheelX.value = Math.max(0, Math.min(SCREEN_W * 0.55, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX >= SWIPE_THRESHOLD || e.velocityX > 600) {
        runOnJS(exitWheelRight)();
      } else {
        wheelX.value = withSpring(0, { damping: 18, stiffness: 240 });
      }
    });

  const diceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: diceX.value }],
    opacity: diceOpacity.value,
  }));

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wheelX.value }],
    opacity: wheelOpacity.value,
  }));

  const onCreateRoom = async () => {
    if (busy || isLoading || navigating) return;
    setBusy('room');
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
      // stay on home
    } finally {
      setBusy(null);
    }
  };

  const onCreateBracket = async () => {
    if (busy || isLoading || navigating) return;
    setBusy('bracket');
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
      // ignore
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Floating side arrows — fixed, do not move with cards */}
      <Pressable
        onPress={exitDiceLeft}
        disabled={navigating}
        style={[styles.edgeArrow, styles.edgeLeft]}
        hitSlop={12}
        accessibilityLabel="Open dice"
      >
        <View
          style={[
            styles.arrowBubble,
            {
              backgroundColor: isDark
                ? colors.brand.slate[800]
                : colors.brand.slate[100],
              borderColor: colors.brand.pink[500],
            },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.brand.pink[500]} />
        </View>
      </Pressable>

      <Pressable
        onPress={exitWheelRight}
        disabled={navigating}
        style={[styles.edgeArrow, styles.edgeRight]}
        hitSlop={12}
        accessibilityLabel="Open wheel"
      >
        <View
          style={[
            styles.arrowBubble,
            {
              backgroundColor: isDark
                ? colors.brand.slate[800]
                : colors.brand.slate[100],
              borderColor: colors.brand.amber[500],
            },
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.brand.amber[500]}
          />
        </View>
      </Pressable>

      <View style={styles.header}>
        <WafflrLockup
          markSize={64}
          wordmarkSize={32}
          showTagline
          tagline="Spin. Swipe. Decide."
          mutedColor={muted}
        />
      </View>

      <View style={styles.chooser}>
        <Text style={[styles.chooserHint, { color: muted }]}>
          Swipe a card off-screen · or tap an arrow
        </Text>

        <View style={styles.cardRow}>
          <GestureDetector gesture={dicePan}>
            <Animated.View style={[styles.cardSlot, diceStyle]}>
              <Pressable
                onPress={exitDiceLeft}
                disabled={navigating}
                style={({ pressed }) => [
                  styles.gameCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: colors.brand.pink[500],
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={styles.gameEmoji}>🎲</Text>
                <Text style={[styles.gameTitle, { color: text }]}>Dice</Text>
                <Text style={[styles.gameSub, { color: muted }]}>Swipe left</Text>
              </Pressable>
            </Animated.View>
          </GestureDetector>

          <GestureDetector gesture={wheelPan}>
            <Animated.View style={[styles.cardSlot, wheelStyle]}>
              <Pressable
                onPress={exitWheelRight}
                disabled={navigating}
                style={({ pressed }) => [
                  styles.gameCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: colors.brand.amber[500],
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={styles.gameEmoji}>🎡</Text>
                <Text style={[styles.gameTitle, { color: text }]}>Wheel</Text>
                <Text style={[styles.gameSub, { color: muted }]}>Swipe right</Text>
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onCreateRoom}
          disabled={!!busy || navigating}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            { opacity: busy || navigating ? 0.65 : pressed ? 0.9 : 1 },
          ]}
        >
          {busy === 'room' ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
          ) : (
            <Text style={styles.btnPrimaryText}>Create room</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onCreateBracket}
          disabled={!!busy || navigating}
          style={({ pressed }) => [
            styles.btn,
            styles.btnSecondary,
            {
              borderColor: isDark ? colors.border.dark : colors.border.light,
              opacity: busy || navigating ? 0.65 : pressed ? 0.9 : 1,
            },
          ]}
        >
          {busy === 'bracket' ? (
            <ActivityIndicator color={colors.brand.amber[500]} />
          ) : (
            <Text style={[styles.btnSecondaryText, { color: text }]}>
              Create bracket
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingBottom: spacing[4],
  },
  edgeArrow: {
    position: 'absolute',
    top: '48%',
    zIndex: 20,
  },
  edgeLeft: {
    left: spacing[2],
  },
  edgeRight: {
    right: spacing[2],
  },
  arrowBubble: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing[3],
  },
  chooser: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[3],
  },
  chooserHint: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  cardSlot: {
    flex: 1,
  },
  gameCard: {
    minHeight: 168,
    borderRadius: radius['2xl'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
    gap: spacing[1],
  },
  gameEmoji: {
    fontSize: 40,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  gameSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingBottom: spacing[2],
  },
  btn: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  btnPrimary: {
    backgroundColor: colors.brand.amber[500],
  },
  btnPrimaryText: {
    color: colors.brand.slate[900],
    fontSize: 16,
    fontWeight: '800',
  },
  btnSecondary: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
