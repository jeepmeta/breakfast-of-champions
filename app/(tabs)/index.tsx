import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { useRoom } from '../../src/room/RoomContext';
import { useSessionLists } from '../../src/session/SessionListsContext';
import { WafflrLockup } from '../../src/components/brand';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

const SWIPE_THRESHOLD = 48;

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

  const translateX = useSharedValue(0);

  const openDice = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    router.push('/play/dice');
  };

  const openWheel = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    router.push('/play/wheel');
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = Math.max(-80, Math.min(80, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX <= -SWIPE_THRESHOLD) {
        runOnJS(openDice)();
      } else if (e.translationX >= SWIPE_THRESHOLD) {
        runOnJS(openWheel)();
      }
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
    });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onCreateRoom = async () => {
    if (busy || isLoading) return;
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
    if (busy || isLoading) return;
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
          Swipe left · Dice · Swipe right · Wheel
        </Text>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.cardRow, swipeStyle]}>
            <Pressable
              onPress={openDice}
              style={({ pressed }) => [
                styles.gameCard,
                {
                  backgroundColor: cardBg,
                  borderColor: colors.brand.pink[500],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.gameEmoji}>🎲</Text>
              <Text style={[styles.gameTitle, { color: text }]}>Dice</Text>
              <Text style={[styles.gameSub, { color: muted }]}>Swipe left</Text>
            </Pressable>

            <Pressable
              onPress={openWheel}
              style={({ pressed }) => [
                styles.gameCard,
                {
                  backgroundColor: cardBg,
                  borderColor: colors.brand.amber[500],
                  opacity: pressed ? 0.9 : 1,
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

      <View style={styles.actions}>
        <Pressable
          onPress={onCreateRoom}
          disabled={!!busy}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            { opacity: busy ? 0.65 : pressed ? 0.9 : 1 },
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
          disabled={!!busy}
          style={({ pressed }) => [
            styles.btn,
            styles.btnSecondary,
            {
              borderColor: isDark ? colors.border.dark : colors.border.light,
              opacity: busy ? 0.65 : pressed ? 0.9 : 1,
            },
          ]}
        >
          {busy === 'bracket' ? (
            <ActivityIndicator color={colors.brand.amber[500]} />
          ) : (
            <Text style={[styles.btnSecondaryText, { color: text }]}>Create bracket</Text>
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
  gameCard: {
    flex: 1,
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
