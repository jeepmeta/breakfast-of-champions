import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRoom } from '../src/room/RoomContext';
import { colors } from '../src/theme/colors';
import { spacing, radius } from '../src/theme/tokens';
import { normalizeRoomCode } from '../src/utils/room-code';
import { WafflrLockup } from '../src/components/brand';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;

  const { create, join, isLoading } = useRoom();
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const haptic = async (style: Haptics.ImpactFeedbackStyle) => {
    try {
      await Haptics.impactAsync(style);
    } catch {
      // ignore
    }
  };

  const onCreateRoom = async () => {
    if (busy || isLoading) return;
    setBusy(true);
    await haptic(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { code } = await create({ displayName: 'You' });
      router.push(`/room/${code}`);
    } catch {
      setJoinError('Could not create room. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  const onOpenJoin = async () => {
    await haptic(Haptics.ImpactFeedbackStyle.Light);
    setJoinCode('');
    setJoinError(null);
    setJoinOpen(true);
  };

  const onSubmitJoin = async () => {
    if (busy || joinCode.length < 6) return;
    setBusy(true);
    setJoinError(null);
    const result = await join(joinCode, 'You');
    setBusy(false);
    if (!result.ok) {
      setJoinError(result.error);
      return;
    }
    await haptic(Haptics.ImpactFeedbackStyle.Medium);
    setJoinOpen(false);
    router.push(`/room/${result.code}`);
  };

  const onSoloWheel = async () => {
    await haptic(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/solo/wheel');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.hero}>
        <WafflrLockup
          markSize={96}
          wordmarkSize={42}
          showTagline
          tagline="Decide in under 60 seconds"
          mutedColor={muted}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onCreateRoom}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            { opacity: busy ? 0.6 : pressed ? 0.9 : 1 },
          ]}
        >
          {busy && !joinOpen ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
          ) : (
            <Text style={styles.primaryBtnText}>Create Room</Text>
          )}
        </Pressable>

        <Pressable
          onPress={onOpenJoin}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: isDark ? colors.border.dark : colors.border.light,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: text }]}>Join with Code</Text>
        </Pressable>

        <Pressable onPress={onSoloWheel} style={styles.ghostBtn}>
          <Text style={[styles.ghostBtnText, { color: colors.brand.amber[500] }]}>
            Solo · Wafflr Wheel
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: muted }]}>
        Fairness through randomness + consensus
      </Text>

      <Modal
        visible={joinOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setJoinOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? colors.brand.slate[800] : colors.brand.slate[50] },
            ]}
          >
            <Text style={[styles.modalTitle, { color: text }]}>Join room</Text>
            <Text style={[styles.modalHint, { color: muted }]}>
              Enter the 6-character code from your host
            </Text>
            <TextInput
              value={joinCode}
              onChangeText={(t) => setJoinCode(normalizeRoomCode(t))}
              placeholder="WAFFLR"
              placeholderTextColor={muted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={[
                styles.codeInput,
                {
                  color: text,
                  borderColor: isDark ? colors.border.dark : colors.border.light,
                  backgroundColor: isDark ? colors.brand.slate[900] : '#fff',
                },
              ]}
              onSubmitEditing={onSubmitJoin}
              returnKeyType="go"
            />
            {joinError ? (
              <Text style={styles.errorText}>{joinError}</Text>
            ) : null}
            <Pressable
              onPress={onSubmitJoin}
              disabled={busy || joinCode.length < 6}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  opacity: busy || joinCode.length < 6 ? 0.5 : pressed ? 0.9 : 1,
                  marginTop: spacing[4],
                },
              ]}
            >
              {busy ? (
                <ActivityIndicator color={colors.brand.slate[900]} />
              ) : (
                <Text style={styles.primaryBtnText}>Join</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setJoinOpen(false)} style={styles.ghostBtn}>
              <Text style={{ color: muted }}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: 'space-between',
    paddingBottom: spacing[8],
  },
  hero: {
    marginTop: spacing[16],
    alignItems: 'center',
    gap: spacing[2],
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    fontWeight: '500',
  },
  actions: {
    gap: spacing[3],
  },
  primaryBtn: {
    backgroundColor: colors.brand.amber[500],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: colors.brand.slate[900],
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
  },
  ghostBtn: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalHint: {
    marginTop: spacing[1],
    fontSize: 15,
  },
  codeInput: {
    marginTop: spacing[4],
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
  },
  errorText: {
    marginTop: spacing[2],
    color: colors.brand.pink[500],
    fontSize: 14,
    textAlign: 'center',
  },
});
