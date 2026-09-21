import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { PlayChrome } from '../src/components/play/PlayChrome';
import { AdBanner } from '../src/components/ads/AdBanner';
import { NoiseOverlay } from '../src/components/ui/NoiseOverlay';
import { useSubscriptionStore } from '../src/subscription/subscriptionStore';
import { colors } from '../src/theme/colors';
import { neu, affect, elevationStyle } from '../src/theme/neumorph';
import { spacing, radius } from '../src/theme/tokens';
import { haptic } from '../src/lib/haptics';

export default function SettingsScreen() {
  const isSubscribed = useSubscriptionStore((s) => s.isSubscribed);
  const setSubscribed = useSubscriptionStore((s) => s.setSubscribed);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NoiseOverlay opacity={0.04} />
      <PlayChrome title="Settings" subtitle="Prefs & account" />

      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Subscription</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>
              {isSubscribed ? 'Pro · ads hidden' : 'Free · ads shown'}
            </Text>
            <Switch
              value={isSubscribed}
              onValueChange={(v) => {
                haptic.selection();
                setSubscribed(v);
              }}
              trackColor={{
                false: colors.brand.slate[300],
                true: affect.success.solid,
              }}
              thumbColor={colors.brand.white}
            />
          </View>
          <Text style={styles.hint}>
            Subscription toggle is local for now — wire StoreKit / Play Billing
            later.
          </Text>
        </View>

        <Pressable
          onPress={() => {
            haptic.light();
            router.back();
          }}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.backBtnText}>Done</Text>
        </Pressable>
      </View>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neu.canvas,
  },
  body: {
    flex: 1,
    padding: spacing[4],
    gap: spacing[4],
  },
  card: {
    backgroundColor: neu.card,
    borderRadius: radius['2xl'],
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
    padding: spacing[4],
    gap: spacing[3],
    ...elevationStyle('card'),
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: neu.muted,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: neu.text,
  },
  hint: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: neu.muted,
  },
  backBtn: {
    backgroundColor: affect.reward.solid,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: affect.reward.solidStrong,
    ...elevationStyle('cta'),
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.brand.slate[900],
  },
});
