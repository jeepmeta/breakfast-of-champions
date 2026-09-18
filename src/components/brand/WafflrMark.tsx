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
 * Official Wafflr mark — shrug character (assets/wafflr-mark.svg).
 * Cute waffle with arms up, rosy cheeks, indecisive squiggle mouth.
 */
export function WafflrMark({ size = 96 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <Defs>
        <LinearGradient id="wb" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FCD34D" />
          <Stop offset="40%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#C15B0D" />
        </LinearGradient>
        <LinearGradient id="wp" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#78350F" stopOpacity={0.8} />
          <Stop offset="100%" stopColor="#92400E" stopOpacity={0.3} />
        </LinearGradient>
        <LinearGradient id="ws" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
          <Stop offset="30%" stopColor="#FFFFFF" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {/* Limbs — shrug */}
      <G
        stroke="#78350F"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Path d="m38 75-22 5-6-20-4 0" />
        <Path d="m122 75 22 5 6-20 4 0" />
        <Path d="M 60 132 L 60 148 L 48 148" />
        <Path d="M 100 132 L 100 148 L 112 148" />
      </G>

      {/* Waffle body */}
      <G transform="translate(16, 16)">
        <Rect x={8} y={8} width={112} height={112} rx={28} fill="url(#wb)" />
        <Path
          d="M 12 36 C 12 22.748 22.748 12 36 12 L 92 12 C 105.252 12 116 22.748 116 36 C 116 42 70 65 12 36 Z"
          fill="url(#ws)"
        />
        <G fill="url(#wp)">
          <Rect x={22} y={22} width={24} height={24} rx={6} />
          <Rect x={52} y={22} width={24} height={24} rx={6} />
          <Rect x={82} y={22} width={24} height={24} rx={6} />
          <Rect x={22} y={52} width={24} height={24} rx={6} />
          <Rect x={52} y={52} width={24} height={24} rx={6} />
          <Rect x={82} y={52} width={24} height={24} rx={6} />
          <Rect x={22} y={82} width={24} height={24} rx={6} />
          <Rect x={52} y={82} width={24} height={24} rx={6} />
          <Rect x={82} y={82} width={24} height={24} rx={6} />
        </G>
        <G fill="none" stroke="#FEF3C7" strokeWidth={1.75} opacity={0.65}>
          <Rect x={22} y={22} width={24} height={24} rx={6} />
          <Rect x={52} y={22} width={24} height={24} rx={6} />
          <Rect x={82} y={22} width={24} height={24} rx={6} />
          <Rect x={22} y={52} width={24} height={24} rx={6} />
          <Rect x={52} y={52} width={24} height={24} rx={6} />
          <Rect x={82} y={52} width={24} height={24} rx={6} />
          <Rect x={22} y={82} width={24} height={24} rx={6} />
          <Rect x={52} y={82} width={24} height={24} rx={6} />
          <Rect x={82} y={82} width={24} height={24} rx={6} />
        </G>
        <Circle cx={20} cy={20} r={3} fill="#FFFFFF" opacity={0.7} />
        <Circle cx={28} cy={16} r={1.5} fill="#FFFFFF" opacity={0.7} />
      </G>

      {/* Face */}
      <G>
        <Circle cx={53} cy={76} r={7} fill="#F43F5E" opacity={0.6} />
        <Circle cx={107} cy={76} r={7} fill="#F43F5E" opacity={0.6} />
        <Circle cx={65} cy={66} r={7} fill="#451A03" />
        <Circle cx={63} cy={64} r={2.5} fill="#FFFFFF" />
        <Circle cx={95} cy={66} r={7} fill="#451A03" />
        <Circle cx={93} cy={64} r={2.5} fill="#FFFFFF" />
        <Path
          d="m 74 80 q 3 -3 6 0 t 6 0"
          fill="none"
          stroke="#451A03"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
