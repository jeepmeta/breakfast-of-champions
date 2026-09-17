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
 * Primary Wafflr mark — mark-3x3-butter from branding kit.
 * Glossy 3×3 waffle with butter pats.
 */
export function WafflrMark({ size = 96 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 128 128" fill="none">
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
        <LinearGradient id="wbu" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#FACC15" />
        </LinearGradient>
      </Defs>
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
      <Rect
        x={42}
        y={50}
        width={22}
        height={22}
        rx={6}
        fill="url(#wbu)"
        transform="rotate(-16 53 61)"
      />
      <Rect
        x={44}
        y={52}
        width={18}
        height={8}
        rx={3}
        fill="#FFFFFF"
        opacity={0.5}
        transform="rotate(-16 53 56)"
      />
      <Rect
        x={64}
        y={42}
        width={22}
        height={22}
        rx={6}
        fill="url(#wbu)"
        transform="rotate(14 75 53)"
      />
      <Rect
        x={66}
        y={44}
        width={18}
        height={8}
        rx={3}
        fill="#FFFFFF"
        opacity={0.4}
        transform="rotate(14 75 48)"
      />
      <Circle cx={20} cy={20} r={3} fill="#FFFFFF" opacity={0.7} />
      <Circle cx={28} cy={16} r={1.5} fill="#FFFFFF" opacity={0.7} />
    </Svg>
  );
}
