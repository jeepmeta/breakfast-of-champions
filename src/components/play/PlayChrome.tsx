import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { WafflrMark } from '../brand';
import { colors } from '../../theme/colors';
import { neu } from '../../theme/neumorph';
import { spacing, radius } from '../../theme/tokens';

type Props = {
  title: string;
  /** Optional accent under the title */
  subtitle?: string;
};

/**
 * Shared top bar for Dice / Wheel — mark + game name + back pill.
 */
export function PlayChrome({ title, subtitle }: Props) {
  const goBack = () => {
    void Haptics.selectionAsync().catch(() => undefined);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <WafflrMark size={40} />
        <View style={styles.titles}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.sub} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={goBack}
        hitSlop={10}
        style={({ pressed }) => [styles.backPill, { opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[1],
    paddingBottom: spacing[2],
    gap: spacing[3],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
    minWidth: 0,
  },
  titles: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: neu.text,
  },
  sub: {
    fontSize: 12,
    fontWeight: '600',
    color: neu.muted,
  },
  backPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
    shadowColor: neu.shadowSoft.color,
    shadowOpacity: neu.shadowSoft.opacity,
    shadowRadius: neu.shadowSoft.radius,
    shadowOffset: neu.shadowSoft.offset,
    elevation: 2,
  },
  backText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.brand.slate[700],
  },
});
