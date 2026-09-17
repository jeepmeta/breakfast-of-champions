import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Pressable,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import type { CatalogItem } from '../../data/sample-items';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_W * 0.28;

type Props = {
  item: CatalogItem;
  onSwipe: (direction: 'left' | 'right') => void;
  /** Secret veto — only shown when user still has vetoes. */
  onVeto?: () => void;
  remaining: number;
  vetoesRemaining?: number;
  vetoEnabled?: boolean;
};

export function SwipeDeck({
  item,
  onSwipe,
  onVeto,
  remaining,
  vetoesRemaining = 0,
  vetoEnabled = false,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.brand.slate[800] : '#fff';

  const canVeto = vetoEnabled && vetoesRemaining > 0 && !!onVeto;

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const finish = useCallback(
    (dir: 'left' | 'right') => {
      try {
        void Haptics.impactAsync(
          dir === 'right'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light,
        );
      } catch {
        // ignore
      }
      onSwipe(dir);
      tx.value = 0;
      ty.value = 0;
    },
    [onSwipe, tx, ty],
  );

  const fireVeto = useCallback(() => {
    if (!canVeto) return;
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // ignore
    }
    onVeto?.();
  }, [canVeto, onVeto]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY * 0.2;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        tx.value = withSpring(SCREEN_W * 1.2, { stiffness: 400, damping: 30 });
        runOnJS(finish)('right');
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        tx.value = withSpring(-SCREEN_W * 1.2, { stiffness: 400, damping: 30 });
        runOnJS(finish)('left');
      } else {
        tx.value = withSpring(0, { stiffness: 400, damping: 30 });
        ty.value = withSpring(0, { stiffness: 400, damping: 30 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      tx.value,
      [-SCREEN_W / 2, 0, SCREEN_W / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.metaRow}>
        <Text style={[styles.remaining, { color: muted }]}>
          {remaining} left
        </Text>
        {vetoEnabled ? (
          <Text style={[styles.vetoHint, { color: muted }]}>
            {vetoesRemaining > 0
              ? `${vetoesRemaining} secret veto${vetoesRemaining === 1 ? '' : 's'}`
              : 'No vetoes left'}
          </Text>
        ) : null}
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: isDark ? colors.border.dark : colors.border.light,
            },
            cardStyle,
          ]}
        >
          <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
            <Text style={styles.stampTextLike}>YES</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
            <Text style={styles.stampTextNope}>NOPE</Text>
          </Animated.View>

          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={[styles.title, { color: text }]}>{item.title}</Text>
          {item.subtitle ? (
            <Text style={[styles.subtitle, { color: muted }]}>{item.subtitle}</Text>
          ) : null}
          {item.tags?.length ? (
            <View style={styles.tags}>
              {item.tags.map((t) => (
                <View
                  key={t}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isDark
                        ? colors.brand.slate[700]
                        : colors.brand.slate[100],
                    },
                  ]}
                >
                  <Text style={{ color: muted, fontSize: 12, fontWeight: '600' }}>
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>

      <View style={styles.actions}>
        <Pressable
          onPress={() => finish('left')}
          style={[styles.circleBtn, { borderColor: colors.brand.pink[500] }]}
        >
          <Text style={{ fontSize: 22 }}>✕</Text>
        </Pressable>

        {canVeto ? (
          <Pressable
            onPress={fireVeto}
            style={[styles.vetoBtn, { borderColor: colors.brand.amber[500] }]}
          >
            <Text style={styles.vetoBtnLabel}>VETO</Text>
            <Text style={[styles.vetoBtnSub, { color: muted }]}>secret</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => finish('right')}
          style={[styles.circleBtn, { borderColor: colors.brand.emerald[500] }]}
        >
          <Text style={{ fontSize: 22 }}>♥</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  remaining: {
    fontSize: 13,
    fontWeight: '600',
  },
  vetoHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    width: Math.min(SCREEN_W - 48, 340),
    minHeight: 380,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing[2],
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  tag: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  stamp: {
    position: 'absolute',
    top: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 8,
  },
  likeStamp: {
    left: 20,
    borderColor: colors.brand.emerald[500],
    transform: [{ rotate: '-12deg' }],
  },
  nopeStamp: {
    right: 20,
    borderColor: colors.brand.pink[500],
    transform: [{ rotate: '12deg' }],
  },
  stampTextLike: {
    color: colors.brand.emerald[500],
    fontWeight: '900',
    fontSize: 22,
  },
  stampTextNope: {
    color: colors.brand.pink[500],
    fontWeight: '900',
    fontSize: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    marginTop: spacing[6],
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vetoBtn: {
    minWidth: 72,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
  },
  vetoBtnLabel: {
    color: colors.brand.amber[500],
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  vetoBtnSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
