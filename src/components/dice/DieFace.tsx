import Svg, { Rect, Circle } from 'react-native-svg';

import { colors } from '../../theme/colors';

export const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.28, 0.28],
    [0.5, 0.5],
    [0.72, 0.72],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.5, 0.5],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  6: [
    [0.28, 0.25],
    [0.72, 0.25],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.75],
    [0.72, 0.75],
  ],
};

type Props = {
  value: number;
  size: number;
};

/** Classic rounded die face with pips. */
export function DieFace({ value, size }: Props) {
  const pips = PIP_LAYOUTS[value] ?? PIP_LAYOUTS[1];
  const r = size * 0.09;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect
        x={size * 0.03}
        y={size * 0.03}
        width={size * 0.94}
        height={size * 0.94}
        rx={size * 0.18}
        fill="#FFFCFA"
        stroke={colors.brand.slate[800]}
        strokeWidth={size * 0.045}
      />
      {/* Soft top-left shine for 3D bevel feel */}
      <Rect
        x={size * 0.08}
        y={size * 0.08}
        width={size * 0.42}
        height={size * 0.28}
        rx={size * 0.08}
        fill="#FFFFFF"
        opacity={0.55}
      />
      {pips.map(([nx, ny], i) => (
        <Circle
          key={i}
          cx={size * nx}
          cy={size * ny}
          r={r}
          fill={colors.brand.slate[900]}
        />
      ))}
    </Svg>
  );
}
