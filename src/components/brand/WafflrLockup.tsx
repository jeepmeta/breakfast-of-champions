import { View, Text, StyleSheet } from 'react-native';
import { WafflrMark } from './WafflrMark';
import { WafflrWordmark } from './WafflrWordmark';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/tokens';

type Props = {
  markSize?: number;
  wordmarkSize?: number;
  showTagline?: boolean;
  tagline?: string;
  mutedColor?: string;
};

/**
 * Primary logo + wordmark lockup (branding kit hero).
 */
export function WafflrLockup({
  markSize = 88,
  wordmarkSize = 40,
  showTagline = true,
  tagline = 'Spin. Swipe. Decide.',
  mutedColor = colors.brand.slate[400],
}: Props) {
  return (
    <View style={styles.wrap}>
      <WafflrMark size={markSize} />
      <WafflrWordmark size={wordmarkSize} />
      {showTagline ? (
        <Text style={[styles.tagline, { color: mutedColor }]}>{tagline}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing[2],
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing[1],
  },
});
