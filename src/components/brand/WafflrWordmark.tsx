import { Text, StyleSheet, type TextStyle, type StyleProp } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Product wordmark — Fredoka/bubble energy approximated with heavy system weight.
 * Branding kit: live text in product; outlined paths only for partners.
 */
export function WafflrWordmark({
  size = 40,
  color = colors.brand.amber[500],
  style,
}: Props) {
  return (
    <Text
      style={[
        styles.wordmark,
        { fontSize: size, color, letterSpacing: size > 32 ? -0.5 : 0 },
        style,
      ]}
    >
      Wafflr
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontWeight: '800',
  },
});
