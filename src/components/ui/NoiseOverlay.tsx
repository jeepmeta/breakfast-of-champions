import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Filter, Rect, FeTurbulence, FeColorMatrix } from 'react-native-svg';

type Props = {
  /** 0–1 visual strength */
  opacity?: number;
  style?: StyleProp<ViewStyle>;
  /** baseFrequency for grain (higher = finer) */
  frequency?: number;
};

/**
 * Subtle film-grain noise over any surface.
 * Pointer-events none — pure visual texture.
 */
export function NoiseOverlay({
  opacity = 0.06,
  style,
  frequency = 0.9,
}: Props) {
  return (
    <View pointerEvents="none" style={[styles.fill, style, { opacity }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Filter id="noise">
          <FeTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={3}
            stitchTiles="stitch"
          />
          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0.2
                    0 0 0 0 0.15
                    0 0 0 0 0.08
                    0 0 0 0.55 0"
          />
        </Filter>
        <Rect width="100%" height="100%" filter="url(#noise)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
