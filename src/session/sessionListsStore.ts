import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionEntry = {
  code: string;
  title: string;
  role: 'host' | 'guest';
  joinedAt: number;
};

type InputEntry = Omit<SessionEntry, 'joinedAt'> & { joinedAt?: number };

function upsertList(list: SessionEntry[], entry: InputEntry): SessionEntry[] {
  const next: SessionEntry = {
    ...entry,
    joinedAt: entry.joinedAt ?? Date.now(),
  };
  const without = list.filter(
    (r) => r.code.toUpperCase() !== next.code.toUpperCase(),
  );
  return [next, ...without].slice(0, 40);
}

type SessionListsState = {
  rooms: SessionEntry[];
  brackets: SessionEntry[];
  upsertRoom: (entry: InputEntry) => void;
  upsertBracket: (entry: InputEntry) => void;
  removeRoom: (code: string) => void;
  removeBracket: (code: string) => void;
};

export const useSessionListsStore = create<SessionListsState>()(
  persist(
    (set) => ({
      rooms: [],
      brackets: [],
      upsertRoom: (entry) =>
        set((s) => ({ rooms: upsertList(s.rooms, entry) })),
      upsertBracket: (entry) =>
        set((s) => ({ brackets: upsertList(s.brackets, entry) })),
      removeRoom: (code) =>
        set((s) => ({
          rooms: s.rooms.filter(
            (r) => r.code.toUpperCase() !== code.toUpperCase(),
          ),
        })),
      removeBracket: (code) =>
        set((s) => ({
          brackets: s.brackets.filter(
            (r) => r.code.toUpperCase() !== code.toUpperCase(),
          ),
        })),
    }),
    {
      name: 'wafflr-session-lists',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ rooms: s.rooms, brackets: s.brackets }),
    },
  ),
);

/** Hook-shaped API matching the old Context consumer. */
export function useSessionLists() {
  const rooms = useSessionListsStore((s) => s.rooms);
  const brackets = useSessionListsStore((s) => s.brackets);
  const upsertRoom = useSessionListsStore((s) => s.upsertRoom);
  const upsertBracket = useSessionListsStore((s) => s.upsertBracket);
  const removeRoom = useSessionListsStore((s) => s.removeRoom);
  const removeBracket = useSessionListsStore((s) => s.removeBracket);
  return {
    rooms,
    brackets,
    upsertRoom,
    upsertBracket,
    removeRoom,
    removeBracket,
  };
}
