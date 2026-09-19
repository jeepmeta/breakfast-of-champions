import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';
import { SPRINGS } from '../../src/constants/springs';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SettingsScreen() {
  const [handle, setHandle] = useState('You');
  const [email, setEmail] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧇');
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const saveScale = useSharedValue(1);
  const saveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const onSave = async () => {
    saveScale.value = withSpring(0.96, SPRINGS.stiff, () => {
      saveScale.value = withSpring(1, SPRINGS.bouncy);
    });
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Optional profile. Guests can still play without an account.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Avatar</Text>
          <View style={styles.avatarRow}>
            {['🧇', '🎲', '🎯', '🍿', '🍕', '🎬'].map((e) => (
              <Pressable
                key={e}
                onPress={() => setAvatarEmoji(e)}
                style={[
                  styles.avatarChip,
                  avatarEmoji === e && styles.avatarChipActive,
                ]}
              >
                <Text style={styles.avatarEmoji}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: spacing[4] }]}>Handle</Text>
          <TextInput
            value={handle}
            onChangeText={setHandle}
            placeholder="Display name"
            placeholderTextColor={neu.muted}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: spacing[4] }]}>
            Login email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="optional@email.com"
            placeholderTextColor={neu.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <AnimatedPressable
            onPress={onSave}
            style={[styles.saveBtn, saveStyle]}
          >
            <Text style={styles.saveBtnText}>Save profile</Text>
          </AnimatedPressable>

          {savedHint ? (
            <Text style={styles.hint}>{savedHint}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neu.canvas },
  scroll: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[12],
  },
  title: { fontSize: 28, fontWeight: '800', color: neu.text },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing[1],
    marginBottom: spacing[5],
    color: neu.muted,
  },
  card: {
    borderRadius: radius['2xl'],
    padding: spacing[5],
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
    shadowColor: neu.shadow.color,
    shadowOpacity: neu.shadow.opacity,
    shadowRadius: neu.shadow.radius,
    shadowOffset: neu.shadow.offset,
    elevation: neu.shadow.elevation,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[2],
    color: neu.muted,
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
    borderColor: neu.borderSoft,
    backgroundColor: neu.cardInset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipActive: {
    borderColor: colors.brand.amber[500],
    backgroundColor: colors.brand.amber[100],
  },
  avatarEmoji: { fontSize: 22 },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    fontWeight: '600',
    color: neu.text,
    backgroundColor: neu.cardInset,
    borderColor: neu.borderSoft,
  },
  saveBtn: {
    marginTop: spacing[5],
    backgroundColor: colors.brand.amber[500],
    borderRadius: radius.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.amber[800],
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveBtnText: {
    color: colors.brand.slate[900],
    fontWeight: '800',
    fontSize: 16,
  },
  hint: {
    marginTop: spacing[3],
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    color: colors.brand.emerald[600],
  },
  logoutBtn: {
    marginTop: spacing[6],
    borderWidth: 1.5,
    borderRadius: radius.xl,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: neu.card,
    borderColor: colors.brand.red[500],
  },
  logoutText: {
    color: colors.brand.red[500],
    fontWeight: '800',
    fontSize: 16,
  },
});
