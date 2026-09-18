import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  G,
  Circle,
} from 'react-native-svg';

type Props = {
  size?: number;
};

/**
 * 2×2 micro waffle — branding kit mark-2x2.
 * Use for fun in-app animations, confetti ticks, and dense UI (≤32px).
 * Not for store icons or the primary lockup.
 */
export function WafflrMark2x2({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128" fill="none">
      <Defs>
        <LinearGradient id="m2b" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FCD34D" />
          <Stop offset="40%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#C15B0D" />
        </LinearGradient>
        <LinearGradient id="m2p" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#78350F" stopOpacity={0.8} />
          <Stop offset="100%" stopColor="#92400E" stopOpacity={0.3} />
        </LinearGradient>
        <LinearGradient id="m2s" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
          <Stop offset="30%" stopColor="#FFFFFF" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={8} y={8} width={112} height={112} rx={28} fill="url(#m2b)" />
      <Path
        d="M 12 36 C 12 22.748 22.748 12 36 12 L 92 12 C 105.252 12 116 22.748 116 36 C 116 42 70 65 12 36 Z"
        fill="url(#m2s)"
      />
      <G fill="url(#m2p)">
        <Rect x={22} y={22} width={38} height={38} rx={9} />
        <Rect x={68} y={22} width={38} height={38} rx={9} />
        <Rect x={22} y={68} width={38} height={38} rx={9} />
        <Rect x={68} y={68} width={38} height={38} rx={9} />
      </G>
      <G fill="none" stroke="#FEF3C7" strokeWidth={2} opacity={0.65}>
        <Rect x={22} y={22} width={38} height={38} rx={9} />
        <Rect x={68} y={22} width={38} height={38} rx={9} />
        <Rect x={22} y={68} width={38} height={38} rx={9} />
        <Rect x={68} y={68} width={38} height={38} rx={9} />
      </G>
      <Circle cx={20} cy={20} r={3} fill="#FFFFFF" opacity={0.7} />
      <Circle cx={28} cy={16} r={1.5} fill="#FFFFFF" opacity={0.7} />
    </Svg>
  );
}
