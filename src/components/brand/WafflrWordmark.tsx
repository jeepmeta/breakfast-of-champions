import { Text, StyleSheet, type TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type Props = {
  size?: number;
  color?: string;
  style?: TextStyle;
};

/**
 * Fredoka Bold bubble wordmark — branding kit display type.
 */
export function WafflrWordmark({
  size = 36,
  color = colors.brand.amber[500],
  style,
}: Props) {
  return (
    <Text
      style={[
        styles.word,
        {
          fontSize: size,
          color,
          fontFamily: fonts.display,
        },
        style,
      ]}
    >
      Wafflr
    </Text>
  );
}

const styles = StyleSheet.create({
  word: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
