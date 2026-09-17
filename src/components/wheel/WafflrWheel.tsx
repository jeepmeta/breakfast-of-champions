import { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { G, Path, Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useFrameCallback,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { WHEEL_PHYSICS, WHEEL_SEGMENT_COLORS } from '../../constants/wheel-physics';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/tokens';

export type WheelSegment = {
  id: string;
  label: string;
  emoji?: string;
  /** Relative weight (default 1). Higher = larger slice. */
  weight?: number;
  color?: string;
};

type Props = {
  segments: WheelSegment[];
  size?: number;
  onSpinEnd?: (segment: WheelSegment, index: number) => void;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function WafflrWheel({ segments, size = 300, onSpinEnd }: Props) {
  const rotation = useSharedValue(0);
  const velocity = useSharedValue(0);
  const spinning = useSharedValue(false);
  const lastTickAngle = useSharedValue(0);
  const didFinish = useSharedValue(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  const totalWeight = useMemo(
    () => segments.reduce((sum, s) => sum + (s.weight ?? 1), 0),
    [segments],
  );

  const sliceMeta = useMemo(() => {
    let cursor = 0;
    return segments.map((seg, i) => {
      const w = seg.weight ?? 1;
      const sweep = (w / totalWeight) * 360;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      const mid = start + sweep / 2;
      return {
        ...seg,
        index: i,
        start,
        end,
        sweep,
        mid,
        color: seg.color ?? WHEEL_SEGMENT_COLORS[i % WHEEL_SEGMENT_COLORS.length],
      };
    });
  }, [segments, totalWeight]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  const resolveWinner = useCallback((rotDeg: number) => {
    const normalized = ((-rotDeg % 360) + 360) % 360;
    const meta = segmentsRef.current;
    const tw = meta.reduce((s, x) => s + (x.weight ?? 1), 0);
    let cursor = 0;
    for (let i = 0; i < meta.length; i++) {
      const sweep = ((meta[i].weight ?? 1) / tw) * 360;
      if (normalized >= cursor && normalized < cursor + sweep) {
        return i;
      }
      cursor += sweep;
    }
    return meta.length - 1;
  }, []);

  const finishSpin = useCallback(
    (finalRot: number) => {
      const idx = resolveWinner(finalRot);
      setWinnerIndex(idx);
      setIsSpinning(false);
      try {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // ignore
      }
      onSpinEnd?.(segmentsRef.current[idx], idx);
    },
    [onSpinEnd, resolveWinner],
  );

  const tickHaptic = useCallback(() => {
    try {
      void Haptics.selectionAsync();
    } catch {
      // ignore
    }
  }, []);

  useFrameCallback(() => {
    'worklet';
    if (!spinning.value) return;

    velocity.value *= WHEEL_PHYSICS.friction;
    rotation.value += velocity.value;

    const interval = WHEEL_PHYSICS.haptic_tick_interval_deg;
    if (Math.abs(rotation.value - lastTickAngle.value) >= interval) {
      lastTickAngle.value = rotation.value;
      runOnJS(tickHaptic)();
    }

    if (
      Math.abs(velocity.value) < WHEEL_PHYSICS.min_velocity_to_stop &&
      !didFinish.value
    ) {
      didFinish.value = true;
      spinning.value = false;
      velocity.value = 0;
      runOnJS(finishSpin)(rotation.value);
    }
  });

  const spin = useCallback(() => {
    if (spinning.value || isSpinning) return;
    setWinnerIndex(null);
    setIsSpinning(true);

    const { initial_velocity_range, full_rotations_before_decel } = WHEEL_PHYSICS;

    const v =
      initial_velocity_range.min +
      Math.random() *
        (initial_velocity_range.max - initial_velocity_range.min);

    const extraTurns =
      full_rotations_before_decel.min +
      Math.random() *
        (full_rotations_before_decel.max - full_rotations_before_decel.min);

    rotation.value = rotation.value + extraTurns * 360 * 0.02;
    velocity.value = v;
    lastTickAngle.value = rotation.value;
    didFinish.value = false;
    spinning.value = true;

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // ignore
    }
  }, [isSpinning, lastTickAngle, rotation, spinning, velocity, didFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const winner = winnerIndex != null ? segments[winnerIndex] : null;

  return (
    <View style={styles.root}>
      <View style={styles.pointerWrap}>
        <View style={styles.pointer} />
      </View>

      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg width={size} height={size}>
          <G>
            {sliceMeta.map((slice) => {
              const labelPos = polarToCartesian(cx, cy, r * 0.62, slice.mid);
              return (
                <G key={slice.id}>
                  <Path
                    d={describeArc(cx, cy, r, slice.start, slice.end)}
                    fill={slice.color}
                    stroke={colors.brand.slate[900]}
                    strokeWidth={2}
                  />
                  <SvgText
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={colors.brand.slate[900]}
                    fontSize={slice.sweep < 40 ? 11 : 13}
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {slice.emoji ? `${slice.emoji}` : slice.label.slice(0, 8)}
                  </SvgText>
                </G>
              );
            })}
            <Circle
              cx={cx}
              cy={cy}
              r={28}
              fill={colors.brand.slate[900]}
              stroke={colors.brand.amber[500]}
              strokeWidth={3}
            />
            <SvgText
              x={cx}
              y={cy + 1}
              fill={colors.brand.amber[500]}
              fontSize={11}
              fontWeight="800"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              SPIN
            </SvgText>
          </G>
        </Svg>
      </Animated.View>

      <Pressable
        onPress={spin}
        disabled={isSpinning}
        style={({ pressed }) => [
          styles.spinBtn,
          {
            opacity: isSpinning ? 0.5 : pressed ? 0.9 : 1,
            transform: [{ scale: pressed && !isSpinning ? 0.97 : 1 }],
          },
        ]}
      >
        <Text style={styles.spinBtnText}>
          {isSpinning ? 'Spinning…' : 'Spin'}
        </Text>
      </Pressable>

      {winner ? (
        <View style={styles.result}>
          <Text style={styles.resultEmoji}>{winner.emoji ?? '✨'}</Text>
          <Text style={styles.resultLabel}>{winner.label}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Tap Spin — physics decides</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  pointerWrap: {
    zIndex: 2,
    marginBottom: -12,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.brand.amber[500],
  },
  spinBtn: {
    marginTop: spacing[8],
    backgroundColor: colors.brand.amber[500],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[12],
    borderRadius: radius.full,
  },
  spinBtnText: {
    color: colors.brand.slate[900],
    fontSize: 18,
    fontWeight: '800',
  },
  result: {
    marginTop: spacing[6],
    alignItems: 'center',
    gap: spacing[1],
  },
  resultEmoji: {
    fontSize: 40,
  },
  resultLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brand.emerald[500],
  },
  hint: {
    marginTop: spacing[6],
    fontSize: 14,
    color: colors.brand.slate[400],
  },
});
