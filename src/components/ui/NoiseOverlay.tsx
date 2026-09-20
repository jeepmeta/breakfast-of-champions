import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  /** 0–1 visual strength */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  /** unused — kept for call-site compat */
  frequency?: number;
};

/** Deterministic pseudo-random 0–1 from integer seed */
function hash01(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Subtle film-grain without SVG filter primitives.
 * FeTurbulence / FeColorMatrix are not implemented on native RN SVG
 * and were spamming console + can break sibling layout.
 */
export function NoiseOverlay({ opacity = 0.05, style }: Props) {
  // Fixed logical tile — Svg scales to fill
  const W = 120;
  const H = 200;
  const DOTS = 280;

  const dots = useMemo(() => {
    const list: { cx: number; cy: number; r: number; o: number }[] = [];
    for (let i = 0; i < DOTS; i++) {
      list.push({
        cx: hash01(i * 3 + 1) * W,
        cy: hash01(i * 5 + 2) * H,
        r: 0.35 + hash01(i * 7 + 3) * 0.55,
        o: 0.25 + hash01(i * 11 + 4) * 0.55,
      });
    }
    return list;
  }, []);

  return (
    <View pointerEvents="none" style={[styles.fill, style, { opacity }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        {dots.map((d, i) => (
          <Circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={`rgba(120, 53, 15, ${d.o})`}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
});
