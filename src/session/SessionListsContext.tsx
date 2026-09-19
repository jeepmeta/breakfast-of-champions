import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SessionEntry = {
  code: string;
  title: string;
  role: 'host' | 'guest';
  joinedAt: number;
};

type SessionListsContextValue = {
  rooms: SessionEntry[];
  brackets: SessionEntry[];
  upsertRoom: (entry: Omit<SessionEntry, 'joinedAt'> & { joinedAt?: number }) => void;
  upsertBracket: (
    entry: Omit<SessionEntry, 'joinedAt'> & { joinedAt?: number },
  ) => void;
  removeRoom: (code: string) => void;
  removeBracket: (code: string) => void;
};

const SessionListsContext = createContext<SessionListsContextValue | null>(
  null,
);

function upsert(
  list: SessionEntry[],
  entry: Omit<SessionEntry, 'joinedAt'> & { joinedAt?: number },
): SessionEntry[] {
  const next: SessionEntry = {
    ...entry,
    joinedAt: entry.joinedAt ?? Date.now(),
  };
  const without = list.filter(
    (r) => r.code.toUpperCase() !== next.code.toUpperCase(),
  );
  return [next, ...without].slice(0, 40);
}

export function SessionListsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<SessionEntry[]>([]);
  const [brackets, setBrackets] = useState<SessionEntry[]>([]);

  const upsertRoom = useCallback(
    (entry: Omit<SessionEntry, 'joinedAt'> & { joinedAt?: number }) => {
      setRooms((prev) => upsert(prev, entry));
    },
    [],
  );

  const upsertBracket = useCallback(
    (entry: Omit<SessionEntry, 'joinedAt'> & { joinedAt?: number }) => {
      setBrackets((prev) => upsert(prev, entry));
    },
    [],
  );

  const removeRoom = useCallback((code: string) => {
    setRooms((prev) =>
      prev.filter((r) => r.code.toUpperCase() !== code.toUpperCase()),
    );
  }, []);

  const removeBracket = useCallback((code: string) => {
    setBrackets((prev) =>
      prev.filter((r) => r.code.toUpperCase() !== code.toUpperCase()),
    );
  }, []);

  const value = useMemo(
    () => ({
      rooms,
      brackets,
      upsertRoom,
      upsertBracket,
      removeRoom,
      removeBracket,
    }),
    [rooms, brackets, upsertRoom, upsertBracket, removeRoom, removeBracket],
  );

  return (
    <SessionListsContext.Provider value={value}>
      {children}
    </SessionListsContext.Provider>
  );
}

export function useSessionLists() {
  const ctx = useContext(SessionListsContext);
  if (!ctx) {
    throw new Error('useSessionLists must be used within SessionListsProvider');
  }
  return ctx;
}
