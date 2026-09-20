import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { affect } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';

export type WheelSegment = {
  id: string;
  label: string;
  emoji?: string;
  weight?: number;
  color?: string;
};

export type ExternalSpin = {
  nonce: number;
  velocity: number;
  startRotation: number;
};

type Props = {
  segments: WheelSegment[];
  size?: number;
  onSpinStart?: () => void;
  onSpinEnd?: (segment: WheelSegment, index: number) => void;
  hideSpinButton?: boolean;
  externalSpin?: ExternalSpin | null;
  hideResult?: boolean;
  tickHaptics?: boolean;
  spinStartHaptic?: boolean;
  settleHaptic?: boolean;
  /** Imperative spin trigger — increment to spin again without remount */
  spinNonce?: number;
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

export function WafflrWheel({
  segments,
  size = 300,
  onSpinStart,
  onSpinEnd,
  hideSpinButton = false,
  externalSpin = null,
  hideResult = false,
  tickHaptics = true,
  spinStartHaptic = true,
  settleHaptic = true,
  spinNonce = 0,
}: Props) {
  const rotation = useSharedValue(0);
  const velocity = useSharedValue(0);
  const spinning = useSharedValue(false);
  const lastTickAngle = useSharedValue(0);
  const didFinish = useSharedValue(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;
  const lastNonceRef = useRef<number | null>(null);
  const lastSpinNonceRef = useRef(spinNonce);
  const tickHapticsRef = useRef(tickHaptics);
  tickHapticsRef.current = tickHaptics;
  const settleHapticRef = useRef(settleHaptic);
  settleHapticRef.current = settleHaptic;
  const onSpinStartRef = useRef(onSpinStart);
  onSpinStartRef.current = onSpinStart;

  const totalWeight = useMemo(
    () => segments.reduce((sum, s) => sum + (s.weight ?? 1), 0) || 1,
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
    const tw = meta.reduce((s, x) => s + (x.weight ?? 1), 0) || 1;
    let cursor = 0;
    for (let i = 0; i < meta.length; i++) {
      const sweep = ((meta[i].weight ?? 1) / tw) * 360;
      if (normalized >= cursor && normalized < cursor + sweep) {
        return i;
      }
      cursor += sweep;
    }
    return Math.max(0, meta.length - 1);
  }, []);

  const finishSpin = useCallback(
    (finalRot: number) => {
      const idx = resolveWinner(finalRot);
      setWinnerIndex(idx);
      setIsSpinning(false);
      if (settleHapticRef.current) {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
      }
      onSpinEnd?.(segmentsRef.current[idx], idx);
    },
    [onSpinEnd, resolveWinner],
  );

  const tickHaptic = useCallback(() => {
    if (!tickHapticsRef.current) return;
    void Haptics.selectionAsync().catch(() => undefined);
  }, []);

  const beginSpin = useCallback(
    (vel: number, startRot: number, withStartHaptic: boolean) => {
      setWinnerIndex(null);
      setIsSpinning(true);
      onSpinStartRef.current?.();
      rotation.value = startRot;
      velocity.value = vel;
      lastTickAngle.value = startRot;
      didFinish.value = false;
      spinning.value = true;
      if (withStartHaptic) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => undefined,
        );
      }
    },
    [didFinish, lastTickAngle, rotation, spinning, velocity],
  );

  useEffect(() => {
    if (!externalSpin) return;
    if (lastNonceRef.current === externalSpin.nonce) return;
    lastNonceRef.current = externalSpin.nonce;
    beginSpin(externalSpin.velocity, externalSpin.startRotation, spinStartHaptic);
  }, [externalSpin, beginSpin, spinStartHaptic]);

  useEffect(() => {
    if (spinNonce === lastSpinNonceRef.current) return;
    if (spinNonce === 0) {
      lastSpinNonceRef.current = 0;
      return;
    }
    lastSpinNonceRef.current = spinNonce;
    if (spinning.value || isSpinning) return;
    const { initial_velocity_range } = WHEEL_PHYSICS;
    const v =
      initial_velocity_range.min +
      Math.random() *
        (initial_velocity_range.max - initial_velocity_range.min);
    beginSpin(v, rotation.value, spinStartHaptic);
  }, [spinNonce, beginSpin, isSpinning, rotation, spinning, spinStartHaptic]);

  useFrameCallback(() => {
    'worklet';
    if (!spinning.value) return;

    let nextV = velocity.value * WHEEL_PHYSICS.friction;
    if (Math.abs(nextV) < WHEEL_PHYSICS.sticky_threshold) {
      nextV *= WHEEL_PHYSICS.sticky_friction;
    }
    velocity.value = nextV;
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
    const { initial_velocity_range } = WHEEL_PHYSICS;
    const v =
      initial_velocity_range.min +
      Math.random() *
        (initial_velocity_range.max - initial_velocity_range.min);
    beginSpin(v, rotation.value, spinStartHaptic);
  }, [beginSpin, isSpinning, rotation, spinning, spinStartHaptic]);

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
              const emojiPos = polarToCartesian(cx, cy, r * 0.58, slice.mid);
              const labelPos = polarToCartesian(cx, cy, r * 0.78, slice.mid);
              const emojiSize =
                slice.sweep < 32 ? 18 : slice.sweep < 48 ? 24 : 28;
              const labelSize =
                slice.sweep < 32 ? 9 : slice.sweep < 48 ? 11 : 12;
              const shortLabel =
                slice.label.length > 10
                  ? slice.label.slice(0, 9) + '…'
                  : slice.label;

              return (
                <G key={slice.id}>
                  <Path
                    d={describeArc(cx, cy, r, slice.start, slice.end)}
                    fill={slice.color}
                    stroke={colors.brand.slate[900]}
                    strokeWidth={2.5}
                  />
                  {slice.emoji ? (
                    <SvgText
                      x={emojiPos.x}
                      y={emojiPos.y}
                      fill={colors.brand.slate[900]}
                      fontSize={emojiSize}
                      fontWeight="700"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {slice.emoji}
                    </SvgText>
                  ) : null}
                  {slice.sweep >= 28 ? (
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y}
                      fill={colors.brand.slate[900]}
                      fontSize={labelSize}
                      fontWeight="800"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {shortLabel}
                    </SvgText>
                  ) : null}
                </G>
              );
            })}
            <Circle
              cx={cx}
              cy={cy}
              r={Math.max(30, size * 0.1)}
              fill={colors.brand.slate[900]}
              stroke={affect.reward.solid}
              strokeWidth={3}
            />
            <SvgText
              x={cx}
              y={cy + 1}
              fill={affect.reward.solid}
              fontSize={Math.max(11, size * 0.04)}
              fontWeight="800"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              SPIN
            </SvgText>
          </G>
        </Svg>
      </Animated.View>

      {!hideSpinButton ? (
        <Pressable
          onPress={spin}
          disabled={isSpinning}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isSpinning ? 'Spinning' : 'Spin the wheel'}
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
      ) : null}

      {!hideResult && winner ? (
        <View style={styles.result}>
          <Text style={styles.resultEmoji}>{winner.emoji ?? '✨'}</Text>
          <Text style={styles.resultLabel}>{winner.label}</Text>
        </View>
      ) : null}

      {!hideResult && !winner && !hideSpinButton ? (
        <Text style={styles.hint}>Tap Spin — physics decides</Text>
      ) : null}
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
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: affect.reward.solid,
  },
  spinBtn: {
    marginTop: spacing[6],
    backgroundColor: affect.reward.solid,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[12],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: affect.reward.solidStrong,
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
    color: affect.success.solid,
  },
  hint: {
    marginTop: spacing[6],
    fontSize: 14,
    color: colors.brand.slate[400],
  },
});
