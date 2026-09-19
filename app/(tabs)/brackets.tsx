import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useRoom } from '../../src/room/RoomContext';
import {
  useSessionLists,
  type SessionEntry,
} from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { neu } from '../../src/theme/neumorph';
import { spacing, radius } from '../../src/theme/tokens';
import { normalizeRoomCode } from '../../src/utils/room-code';
import { SPRINGS } from '../../src/constants/springs';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function BracketRow({
  item,
  onOpen,
  onLeave,
}: {
  item: SessionEntry;
  onOpen: () => void;
  onLeave: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.97, SPRINGS.stiff);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRINGS.snappy);
      }}
      onPress={onOpen}
      style={[styles.row, style]}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.rowCode}>{item.code}</Text>
        <Text style={styles.rowMeta}>
          {item.role === 'host' ? 'Host' : 'Guest'} · open until host closes
        </Text>
      </View>
      <Pressable onPress={onLeave} hitSlop={12} style={styles.leaveBtn}>
        <Text style={styles.leaveText}>Leave</Text>
      </Pressable>
    </AnimatedPressable>
  );
}

export default function BracketsScreen() {
  const { create, join, isLoading } = useRoom();
  const { brackets, upsertBracket, removeBracket } = useSessionLists();

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onCreate = async () => {
    if (busy || isLoading) return;
    setBusy(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    try {
      const { code } = await create({ displayName: 'You' });
      upsertBracket({ code, title: `Bracket ${code}`, role: 'host' });
      router.push(`/room/${code}`);
    } catch {
      setJoinError('Could not create bracket.');
    } finally {
      setBusy(false);
    }
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
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    upsertBracket({
      code: result.code,
      title: `Bracket ${result.code}`,
      role: 'guest',
    });
    setJoinOpen(false);
    router.push(`/room/${result.code}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Brackets</Text>
        <Text style={styles.subtitle}>
          Elimination brackets you host or joined. Host closes to end.
        </Text>
      </View>

      <View style={styles.toolbar}>
        <Pressable
          onPress={onCreate}
          disabled={busy}
          style={({ pressed }) => [
            styles.toolBtnPrimary,
            { opacity: pressed || busy ? 0.88 : 1 },
          ]}
        >
          {busy && !joinOpen ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.toolBtnPrimaryText}>Create</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => {
            setJoinCode('');
            setJoinError(null);
            setJoinOpen(true);
          }}
          style={({ pressed }) => [
            styles.toolBtnOutline,
            { opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.toolBtnOutlineText}>Join code</Text>
        </Pressable>
      </View>

      <FlatList
        data={brackets}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <BracketRow
            item={item}
            onOpen={() => router.push(`/room/${item.code}`)}
            onLeave={() => removeBracket(item.code)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No brackets yet. Create one or join with a code.
          </Text>
        }
      />

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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join bracket</Text>
            <Text style={styles.modalHint}>
              Enter the 6-character code from your host
            </Text>
            <TextInput
              value={joinCode}
              onChangeText={(t) => setJoinCode(normalizeRoomCode(t))}
              placeholder="WAFFLR"
              placeholderTextColor={neu.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              style={styles.codeInput}
              onSubmitEditing={onSubmitJoin}
              returnKeyType="go"
            />
            {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}
            <Pressable
              onPress={onSubmitJoin}
              disabled={busy || joinCode.length < 6}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  opacity: busy || joinCode.length < 6 ? 0.5 : pressed ? 0.9 : 1,
                },
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Join</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setJoinOpen(false)} style={styles.cancel}>
              <Text style={{ color: neu.muted, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: neu.canvas },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  title: { fontSize: 28, fontWeight: '800', color: neu.text },
  subtitle: { fontSize: 14, lineHeight: 20, color: neu.muted },
  toolbar: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    marginBottom: spacing[3],
  },
  toolBtnPrimary: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand.emerald[500],
    shadowColor: colors.brand.emerald[800],
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  toolBtnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  toolBtnOutline: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: neu.borderSoft,
    shadowColor: neu.shadowSoft.color,
    shadowOpacity: neu.shadowSoft.opacity,
    shadowRadius: neu.shadowSoft.radius,
    shadowOffset: neu.shadowSoft.offset,
    elevation: neu.shadowSoft.elevation,
  },
  toolBtnOutlineText: {
    fontWeight: '700',
    fontSize: 16,
    color: neu.text,
  },
  list: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderRadius: radius.xl,
    marginBottom: spacing[3],
    backgroundColor: neu.card,
    borderWidth: 1.5,
    borderColor: colors.brand.emerald[100],
    shadowColor: neu.shadow.color,
    shadowOpacity: neu.shadow.opacity,
    shadowRadius: neu.shadow.radius,
    shadowOffset: neu.shadow.offset,
    elevation: neu.shadow.elevation,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowCode: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.brand.emerald[600],
  },
  rowMeta: { fontSize: 12, color: neu.muted },
  leaveBtn: { paddingLeft: spacing[3] },
  leaveText: {
    color: colors.brand.red[500],
    fontWeight: '700',
    fontSize: 13,
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing[10],
    fontSize: 15,
    color: neu.muted,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(6, 78, 59, 0.2)',
  },
  modalCard: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
    backgroundColor: neu.canvasAlt,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: neu.text },
  modalHint: { marginTop: spacing[1], fontSize: 15, color: neu.muted },
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
    color: neu.text,
    backgroundColor: neu.card,
    borderColor: colors.brand.emerald[100],
  },
  errorText: {
    marginTop: spacing[2],
    color: colors.brand.red[500],
    fontSize: 14,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: spacing[4],
    backgroundColor: colors.brand.emerald[500],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  cancel: { alignItems: 'center', paddingVertical: spacing[3] },
});
