import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSubscription } from '../../subscription/SubscriptionContext';
import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';

/**
 * Sticky bottom ad slot — hidden when subscribed.
 * Placeholder creative until a real network is wired.
 */
export function AdBanner() {
  const { isSubscribed } = useSubscription();
  const insets = useSafeAreaInsets();

  if (isSubscribed) return null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <Pressable style={styles.banner} accessibilityRole="button">
        <Text style={styles.kicker}>Ad</Text>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            Wafflr Pro — zero ads, extra modes
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            Tap to learn more
          </Text>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Upgrade</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: neu.canvasAlt,
    borderTopWidth: 1,
    borderTopColor: neu.borderSoft,
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
  },
  banner: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: colors.brand.amber[200],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[3],
    gap: spacing[2],
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: neu.muted,
    textTransform: 'uppercase',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: neu.text,
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    color: neu.muted,
    marginTop: 1,
  },
  cta: {
    backgroundColor: colors.brand.amber[400],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.brand.slate[900],
  },
});
