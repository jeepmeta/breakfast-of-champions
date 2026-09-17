import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Room, RoomMode } from '../types/room';
import type { VoteDirection } from '../types/swipe';
import * as api from './supabaseStore';
import * as swipe from './swipeMatch';
import * as groupWheel from './groupWheel';

type RoomContextValue = {
  room: Room | null;
  selfId: string | null;
  isLoading: boolean;
  error: string | null;
  create: (opts?: {
    displayName?: string;
    mode?: RoomMode;
  }) => Promise<{ code: string }>;
  join: (
    code: string,
    displayName?: string,
  ) => Promise<{ ok: true; code: string } | { ok: false; error: string }>;
  refresh: (code: string) => Promise<void>;
  setReady: (isReady: boolean) => Promise<void>;
  addGuest: () => Promise<void>;
  leave: () => Promise<void>;
  startGame: () => Promise<void>;
  startGroupWheel: () => Promise<void>;
  hostSpinWheel: () => Promise<void>;
  completeWheelSpin: () => Promise<void>;
  nextWheelSpin: () => Promise<void>;
  castVote: (itemId: string, direction: VoteDirection) => Promise<void>;
  castVeto: (itemId: string) => Promise<void>;
  dismissMatch: () => Promise<void>;
  isHost: boolean;
  everyoneReady: boolean;
};

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const attachRealtime = useCallback((roomId: string) => {
    unsubRef.current?.();
    unsubRef.current = api.subscribeToRoom(roomId, (next) => {
      setRoom(next);
    });
  }, []);

  useEffect(() => {
    return () => {
      unsubRef.current?.();
    };
  }, []);

  const create = useCallback(
    async (opts?: { displayName?: string; mode?: RoomMode }) => {
      setIsLoading(true);
      setError(null);
      try {
        const { room: created, selfId: id } = await api.createRoom(opts);
        setRoom(created);
        setSelfId(id);
        attachRealtime(created.id);
        return { code: created.code };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to create room';
        setError(message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [attachRealtime],
  );

  const join = useCallback(
    async (code: string, displayName?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await api.joinRoom(code, displayName);
        if (!result.ok) {
          const messages: Record<string, string> = {
            not_found: 'Room not found. Check the code and try again.',
            full: 'This room is full.',
            invalid_code: 'Enter a valid 6-character code.',
          };
          return {
            ok: false as const,
            error: messages[result.error] ?? 'Could not join.',
          };
        }
        setRoom(result.room);
        setSelfId(result.selfId);
        attachRealtime(result.room.id);
        return { ok: true as const, code: result.room.code };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not join room';
        setError(message);
        return { ok: false as const, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [attachRealtime],
  );

  const refresh = useCallback(
    async (code: string) => {
      try {
        const latest = await api.fetchRoomByCode(code);
        if (latest) {
          setRoom(latest);
          attachRealtime(latest.id);
        }
      } catch (e) {
        console.warn('[room] refresh failed', e);
      }
    },
    [attachRealtime],
  );

  const setReady = useCallback(
    async (isReady: boolean) => {
      if (!selfId) return;
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === selfId ? { ...p, is_ready: isReady } : p,
          ),
        };
      });
      try {
        await api.setParticipantReady(selfId, isReady);
      } catch (e) {
        console.warn('[room] setReady failed', e);
      }
    },
    [selfId],
  );

  const addGuest = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await api.addSimulatedGuest(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] addGuest failed', e);
    }
  }, [room]);

  const leave = useCallback(async () => {
    if (room && selfId) {
      try {
        await api.leaveRoom(room.id, selfId);
      } catch (e) {
        console.warn('[room] leave failed', e);
      }
    }
    unsubRef.current?.();
    unsubRef.current = null;
    setRoom(null);
    setSelfId(null);
  }, [room, selfId]);

  const startGame = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await swipe.startSwipeMatch(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] startGame failed', e);
      setError(e instanceof Error ? e.message : 'Could not start');
    }
  }, [room]);

  const startGroupWheel = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await groupWheel.startGroupWheel(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] startGroupWheel failed', e);
      setError(e instanceof Error ? e.message : 'Could not start wheel');
    }
  }, [room]);

  const hostSpinWheel = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await groupWheel.hostStartSpin(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] hostSpinWheel failed', e);
    }
  }, [room]);

  const completeWheelSpin = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await groupWheel.completeSpin(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] completeWheelSpin failed', e);
    }
  }, [room]);

  const nextWheelSpin = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await groupWheel.resetForNextSpin(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] nextWheelSpin failed', e);
    }
  }, [room]);

  const castVote = useCallback(
    async (itemId: string, direction: VoteDirection) => {
      if (!room || !selfId) return;
      try {
        const updated = await swipe.castSwipeVote({
          roomId: room.id,
          participantId: selfId,
          itemId,
          direction,
          participantCount: room.participants.length,
        });
        if (updated) setRoom(updated);
      } catch (e) {
        console.warn('[room] castVote failed', e);
      }
    },
    [room, selfId],
  );

  const castVeto = useCallback(
    async (itemId: string) => {
      if (!room || !selfId) return;
      try {
        const updated = await swipe.castSecretVeto({
          roomId: room.id,
          participantId: selfId,
          itemId,
        });
        if (updated) setRoom(updated);
      } catch (e) {
        console.warn('[room] castVeto failed', e);
        setError(e instanceof Error ? e.message : 'Veto failed');
      }
    },
    [room, selfId],
  );

  const dismissMatch = useCallback(async () => {
    if (!room) return;
    try {
      const updated = await swipe.dismissCelebration(room.id);
      if (updated) setRoom(updated);
    } catch (e) {
      console.warn('[room] dismissMatch failed', e);
    }
  }, [room]);

  const isHost = useMemo(
    () => Boolean(room && selfId && room.host_id === selfId),
    [room, selfId],
  );

  const everyoneReady = useMemo(
    () => (room ? api.allReady(room) : false),
    [room],
  );

  const value = useMemo(
    () => ({
      room,
      selfId,
      isLoading,
      error,
      create,
      join,
      refresh,
      setReady,
      addGuest,
      leave,
      startGame,
      startGroupWheel,
      hostSpinWheel,
      completeWheelSpin,
      nextWheelSpin,
      castVote,
      castVeto,
      dismissMatch,
      isHost,
      everyoneReady,
    }),
    [
      room,
      selfId,
      isLoading,
      error,
      create,
      join,
      refresh,
      setReady,
      addGuest,
      leave,
      startGame,
      startGroupWheel,
      hostSpinWheel,
      completeWheelSpin,
      nextWheelSpin,
      castVote,
      castVeto,
      dismissMatch,
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
