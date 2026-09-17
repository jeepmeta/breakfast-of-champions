import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { Room, RoomMode } from '../types/room';
import * as store from './store';

type RoomContextValue = {
  room: Room | null;
  selfId: string | null;
  create: (opts?: { displayName?: string; mode?: RoomMode }) => { code: string };
  join: (
    code: string,
    displayName?: string,
  ) => { ok: true; code: string } | { ok: false; error: string };
  refresh: (code: string) => void;
  setReady: (isReady: boolean) => void;
  addGuest: () => void;
  leave: () => void;
  isHost: boolean;
  everyoneReady: boolean;
};

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);

  const create = useCallback(
    (opts?: { displayName?: string; mode?: RoomMode }) => {
      const { room: created, selfId: id } = store.createRoom(opts);
      setRoom(created);
      setSelfId(id);
      return { code: created.code };
    },
    [],
  );

  const join = useCallback((code: string, displayName?: string) => {
    const result = store.joinRoom(code, displayName);
    if (!result.ok) {
      const messages: Record<string, string> = {
        not_found: 'Room not found. Check the code and try again.',
        full: 'This room is full.',
        invalid_code: 'Enter a valid 6-character code.',
      };
      return { ok: false as const, error: messages[result.error] ?? 'Could not join.' };
    }
    setRoom(result.room);
    setSelfId(result.selfId);
    return { ok: true as const, code: result.room.code };
  }, []);

  const refresh = useCallback((code: string) => {
    const latest = store.getRoom(code);
    if (latest) setRoom(latest);
  }, []);

  const setReady = useCallback(
    (isReady: boolean) => {
      if (!room || !selfId) return;
      const updated = store.setParticipantReady(room.code, selfId, isReady);
      if (updated) setRoom(updated);
    },
    [room, selfId],
  );

  const addGuest = useCallback(() => {
    if (!room) return;
    const updated = store.addSimulatedGuest(room.code);
    if (updated) setRoom(updated);
  }, [room]);

  const leave = useCallback(() => {
    if (room && selfId) {
      store.leaveRoom(room.code, selfId);
    }
    setRoom(null);
    setSelfId(null);
  }, [room, selfId]);

  const isHost = useMemo(
    () => Boolean(room && selfId && room.host_id === selfId),
    [room, selfId],
  );

  const everyoneReady = useMemo(
    () => (room ? store.allReady(room) : false),
    [room],
  );

  const value = useMemo(
    () => ({
      room,
      selfId,
      create,
      join,
      refresh,
      setReady,
      addGuest,
      leave,
      isHost,
      everyoneReady,
    }),
    [
      room,
      selfId,
      create,
      join,
      refresh,
      setReady,
      addGuest,
      leave,
      isHost,
      everyoneReady,
    ],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return ctx;
}
