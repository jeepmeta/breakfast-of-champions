import { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';

const { width: W, height: H } = Dimensions.get('window');

const PALETTE = [
  colors.brand.amber[500],
  colors.brand.emerald[500],
  colors.brand.pink[500],
  colors.brand.amber[300],
  colors.brand.emerald[600],
  colors.brand.pink[600],
];

type Particle = {
  id: number;
  x: number;
  color: string;
  delay: number;
  drift: number;
  size: number;
  rotate: number;
};

function ParticleView({ p }: { p: Particle }) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rot = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      p.delay,
      withTiming(H * 0.7 + Math.random() * 80, {
        duration: 1800 + Math.random() * 600,
        easing: Easing.out(Easing.quad),
      }),
    );
    opacity.value = withDelay(
      p.delay + 1200,
      withTiming(0, { duration: 700 }),
    );
    rot.value = withDelay(
      p.delay,
      withTiming(p.rotate, { duration: 2000 }),
    );
  }, [opacity, p.delay, p.rotate, rot, y]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: p.x + (y.value / H) * p.drift,
    top: y.value,
    width: p.size,
    height: p.size * 0.4,
    borderRadius: 2,
    backgroundColor: p.color,
    opacity: opacity.value,
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return <Animated.View style={style} />;
}

type Props = {
  active: boolean;
  count?: number;
};

export function ConfettiBurst({ active, count = 42 }: Props) {
  const particles = useMemo<Particle[]>(() => {
    if (!active) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * W,
      color: PALETTE[i % PALETTE.length],
      delay: Math.floor(Math.random() * 200),
      drift: (Math.random() - 0.5) * 120,
      size: 6 + Math.random() * 8,
      rotate: (Math.random() - 0.5) * 720,
    }));
  }, [active, count]);

  if (!active || particles.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => (
        <ParticleView key={p.id} p={p} />
      ))}
    </View>
  );
}
