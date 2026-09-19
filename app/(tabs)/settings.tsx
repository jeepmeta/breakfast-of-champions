import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.elevated.dark : colors.elevated.light;
  const inputBg = isDark ? colors.brand.slate[900] : colors.brand.white;

  const [handle, setHandle] = useState('You');
  const [email, setEmail] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧇');
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const onSave = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
    setSavedHint('Profile saved on this device');
    setTimeout(() => setSavedHint(null), 2000);
  };

  const onLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    setHandle('You');
    setEmail('');
    setAvatarEmoji('🧇');
    setSavedHint('Signed out locally');
    setTimeout(() => setSavedHint(null), 2000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: muted }]}>
          Optional profile. Guests can still play without an account.
        </Text>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.label, { color: muted }]}>Avatar</Text>
          <View style={styles.avatarRow}>
            {['🧇', '🎲', '🎯', '🍿', '🍕', '🎬'].map((e) => (
              <Pressable
                key={e}
                onPress={() => setAvatarEmoji(e)}
                style={[
                  styles.avatarChip,
                  {
                    borderColor:
                      avatarEmoji === e
                        ? colors.brand.amber[500]
                        : isDark
                          ? colors.border.dark
                          : colors.border.light,
                    backgroundColor:
                      avatarEmoji === e
                        ? colors.brand.amber[500] + '22'
                        : 'transparent',
                  },
                ]}
              >
                <Text style={styles.avatarEmoji}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: muted, marginTop: spacing[4] }]}>
            Handle
          </Text>
          <TextInput
            value={handle}
            onChangeText={setHandle}
            placeholder="Display name"
            placeholderTextColor={muted}
            style={[
              styles.input,
              {
                color: text,
                backgroundColor: inputBg,
                borderColor: isDark ? colors.border.dark : colors.border.light,
              },
            ]}
          />

          <Text style={[styles.label, { color: muted, marginTop: spacing[4] }]}>
            Login email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="optional@email.com"
            placeholderTextColor={muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[
              styles.input,
              {
                color: text,
                backgroundColor: inputBg,
                borderColor: isDark ? colors.border.dark : colors.border.light,
              },
            ]}
          />

          <Pressable
            onPress={onSave}
            style={({ pressed }) => [
              styles.saveBtn,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.saveBtnText}>Save profile</Text>
          </Pressable>

          {savedHint ? (
            <Text style={[styles.hint, { color: colors.brand.emerald[500] }]}>
              {savedHint}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              borderColor: colors.brand.red[500],
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[12],
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing[1],
    marginBottom: spacing[5],
  },
  card: {
    borderRadius: radius['2xl'],
    padding: spacing[5],
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[2],
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  avatarChip: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: spacing[5],
    backgroundColor: colors.brand.amber[500],
    borderRadius: radius.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: colors.brand.slate[900],
    fontWeight: '800',
    fontSize: 16,
  },
  hint: {
    marginTop: spacing[3],
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutBtn: {
    marginTop: spacing[6],
    borderWidth: 1.5,
    borderRadius: radius.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.brand.red[500],
    fontWeight: '800',
    fontSize: 16,
  },
});
