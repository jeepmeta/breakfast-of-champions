import { Text, StyleSheet, type TextStyle, type StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type Props = {
  size?: number;
  color?: string;
  /** Prefer Bold for primary lockup; SemiBold for smaller UI chrome */
  weight?: 'bold' | 'semibold';
  style?: StyleProp<TextStyle>;
};

/**
 * Product wordmark — Fredoka Bold (branding kit live text).
 */
export function WafflrWordmark({
  size = 40,
  color = colors.brand.amber[500],
  weight = 'bold',
  style,
}: Props) {
  const fontFamily =
    weight === 'semibold' ? fonts.fredoka.semibold : fonts.fredoka.bold;

  return (
    <Text
      style={[
        styles.wordmark,
        {
          fontFamily,
          fontSize: size,
          color,
          letterSpacing: size > 32 ? 0.5 : 0.25,
        },
        style,
      ]}
    >
      Wafflr
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    // weight comes from the loaded Fredoka face, not system fontWeight
  },
});
