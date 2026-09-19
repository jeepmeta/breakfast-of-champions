import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
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

import { useRoom } from '../../src/room/RoomContext';
import {
  useSessionLists,
  type SessionEntry,
} from '../../src/session/SessionListsContext';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/tokens';
import { normalizeRoomCode } from '../../src/utils/room-code';

export default function RoomsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg = isDark ? colors.canvas.dark : colors.canvas.light;
  const text = isDark ? colors.text.primary.dark : colors.text.primary.light;
  const muted = isDark ? colors.text.muted.dark : colors.text.muted.light;
  const cardBg = isDark ? colors.elevated.dark : colors.elevated.light;

  const { create, join, isLoading } = useRoom();
  const { rooms, upsertRoom, removeRoom } = useSessionLists();

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
      upsertRoom({ code, title: `Room ${code}`, role: 'host' });
      router.push(`/room/${code}`);
    } catch {
      setJoinError('Could not create room.');
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
    upsertRoom({ code: result.code, title: `Room ${result.code}`, role: 'guest' });
    setJoinOpen(false);
    router.push(`/room/${result.code}`);
  };

  const renderItem = ({ item }: { item: SessionEntry }) => (
    <Pressable
      onPress={() => router.push(`/room/${item.code}`)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: cardBg, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.rowLeft}>
        <Text style={[styles.rowCode, { color: colors.brand.amber[500] }]}>
          {item.code}
        </Text>
        <Text style={[styles.rowMeta, { color: muted }]}>
          {item.role === 'host' ? 'Host' : 'Guest'} · open until host closes
        </Text>
      </View>
      <Pressable
        onPress={() => removeRoom(item.code)}
        hitSlop={12}
        style={styles.leaveBtn}
      >
        <Text style={{ color: colors.brand.red[500], fontWeight: '700', fontSize: 13 }}>
          Leave
        </Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>Rooms</Text>
        <Text style={[styles.subtitle, { color: muted }]}>
          Rooms you host or joined. They stay open until the host closes them.
        </Text>
      </View>

      <View style={styles.toolbar}>
        <Pressable
          onPress={onCreate}
          disabled={busy}
          style={({ pressed }) => [
            styles.toolBtn,
            { backgroundColor: colors.brand.amber[500], opacity: pressed || busy ? 0.85 : 1 },
          ]}
        >
          {busy && !joinOpen ? (
            <ActivityIndicator color={colors.brand.slate[900]} />
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
            styles.toolBtn,
            styles.toolBtnOutline,
            {
              borderColor: isDark ? colors.border.dark : colors.border.light,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.toolBtnOutlineText, { color: text }]}>Join code</Text>
        </Pressable>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: muted }]}>
            No rooms yet. Create one or join with a code.
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
            {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}
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
            <Pressable onPress={() => setJoinOpen(false)} style={styles.cancel}>
              <Text style={{ color: muted }}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, lineHeight: 20 },
  toolbar: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    marginBottom: spacing[3],
  },
  toolBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnPrimaryText: {
    color: colors.brand.slate[900],
    fontWeight: '800',
    fontSize: 16,
  },
  toolBtnOutline: { borderWidth: 1.5 },
  toolBtnOutlineText: { fontWeight: '700', fontSize: 16 },
  list: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[2],
  },
  rowLeft: { flex: 1, gap: 2 },
  rowCode: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  rowMeta: { fontSize: 12 },
  leaveBtn: { paddingLeft: spacing[3] },
  empty: { textAlign: 'center', marginTop: spacing[10], fontSize: 15 },
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
  modalTitle: { fontSize: 22, fontWeight: '700' },
  modalHint: { marginTop: spacing[1], fontSize: 15 },
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
    color: colors.brand.red[500],
    fontSize: 14,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.brand.amber[500],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.brand.slate[900],
    fontSize: 17,
    fontWeight: '700',
  },
  cancel: { alignItems: 'center', paddingVertical: spacing[3] },
});
