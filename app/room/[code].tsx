import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/tokens';

/**
 * Live room lobby / active session.
 * Real-time state will sync via Supabase Realtime or WebSocket (see room-state-schemas.md).
 */
export default function RoomScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={[styles.label, { color: muted }]}>Room code</Text>
        <Text style={[styles.code, { color: colors.brand.amber[500] }]}>
          {(code ?? '······').toUpperCase()}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: text }]}>Waiting for players…</Text>
        <Text style={[styles.hint, { color: muted }]}>
          Share the code. Sessions complete in ≤60 seconds once everyone is ready.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  header: {
    marginTop: spacing[8],
    alignItems: 'center',
    gap: spacing[1],
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  code: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  hint: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
