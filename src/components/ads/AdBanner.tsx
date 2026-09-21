import { View, Text, StyleSheet } from 'react-native';

import { useSubscriptionStore } from '../../subscription/subscriptionStore';
import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';

/**
 * Placeholder ad strip — hidden when subscribed.
 * Swap body for a real ad unit when billing ships.
 */
export function AdBanner() {
  const isSubscribed = useSubscriptionStore((s) => s.isSubscribed);
  if (isSubscribed) return null;

  return (
    <View style={styles.wrap} accessibilityRole="text">
      <View style={styles.banner}>
        <Text style={styles.label}>Ad</Text>
        <Text style={styles.copy}>Support Wafflr · go Pro to hide ads</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    paddingTop: spacing[1],
  },
  banner: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: neu.borderSoft,
    backgroundColor: colors.brand.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.brand.slate[500],
    textTransform: 'uppercase',
  },
  copy: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brand.slate[600],
  },
});
