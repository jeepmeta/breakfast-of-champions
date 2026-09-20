import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlayChrome } from '../src/components/play/PlayChrome';
import { AdBanner } from '../src/components/ads/AdBanner';
import { useSubscription } from '../src/subscription/SubscriptionContext';
import { colors } from '../src/theme/colors';
import { neu } from '../src/theme/neumorph';
import { spacing, radius } from '../src/theme/tokens';

export default function SettingsScreen() {
  const { isSubscribed, setSubscribed } = useSubscription();
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const toggleSub = (v: boolean) => {
    void Haptics.selectionAsync().catch(() => undefined);
    setSubscribed(v);
    setSavedHint(v ? 'Pro unlocked · ads hidden' : 'Free plan · ads shown');
    setTimeout(() => setSavedHint(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PlayChrome title="Settings" subtitle="App preferences" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.label}>Subscription</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Wafflr Pro</Text>
              <Text style={styles.rowSub}>Hide ads across the app</Text>
            </View>
            <Switch
              value={isSubscribed}
              onValueChange={toggleSub}
              trackColor={{
                false: colors.brand.slate[200],
                true: colors.brand.amber[300],
              }}
              thumbColor={
                isSubscribed ? colors.brand.amber[500] : colors.brand.slate[100]
              }
            />
          </View>
          {savedHint ? <Text style={styles.hint}>{savedHint}</Text> : null}
        </View>

        <Text style={styles.footnote}>
          Subscription toggle is local for now — wire StoreKit / Play Billing later.
        </Text>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neu.canvas },
  scroll: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
    gap: spacing[3],
  },
  card: {
    borderRadius: radius['2xl'],
    padding: spacing[5],
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[3],
    color: neu.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  rowTitle: { fontSize: 16, fontWeight: '800', color: neu.text },
  rowSub: { fontSize: 13, fontWeight: '600', color: neu.muted, marginTop: 2 },
  hint: {
    marginTop: spacing[3],
    fontWeight: '700',
    fontSize: 13,
    color: colors.brand.emerald[600],
  },
  footnote: {
    fontSize: 12,
    lineHeight: 18,
    color: neu.muted,
    textAlign: 'center',
  },
});
