/**
 * In-memory room registry (local-first).
 * Swap implementations later for Supabase Realtime without changing UI.
 */

import {
  Room,
  Participant,
  RoomMode,
  DEFAULT_ROOM_SETTINGS,
} from '../types/room';
import { createId } from '../utils/ids';
import { generateRoomCode, normalizeRoomCode } from '../utils/room-code';

const roomsByCode = new Map<string, Room>();

function now(): string {
  return new Date().toISOString();
}

function makeParticipant(
  displayName: string,
  isHost: boolean,
  vetoLimit: number,
): Participant {
  const t = now();
  return {
    id: createId('p'),
    user_id: null,
    display_name: displayName,
    avatar_url: null,
    is_host: isHost,
    is_ready: isHost,
    joined_at: t,
    last_seen_at: t,
    connection_status: 'connected',
    vetoes_remaining: vetoLimit,
  };
}

export type CreateRoomInput = {
  displayName?: string;
  mode?: RoomMode;
};

export type CreateRoomResult = {
  room: Room;
  selfId: string;
};

export function createRoom(input: CreateRoomInput = {}): CreateRoomResult {
  const code = generateRoomCode();
  if (roomsByCode.has(code)) {
    return createRoom(input);
  }

  const settings = { ...DEFAULT_ROOM_SETTINGS };
  const host = makeParticipant(input.displayName ?? 'Host', true, settings.veto_limit_per_user);
  const t = now();

  const room: Room = {
    id: createId('room'),
    code,
    mode: input.mode ?? 'swipe_match',
    status: 'lobby',
    created_at: t,
    updated_at: t,
    expires_at: null,
    host_id: host.id,
    settings,
    item_payload: [],
    participants: [host],
    state: {},
  };

  roomsByCode.set(code, room);
  return { room, selfId: host.id };
}

export type JoinRoomResult =
  | { ok: true; room: Room; selfId: string }
  | { ok: false; error: 'not_found' | 'full' | 'invalid_code' };

export function joinRoom(rawCode: string, displayName?: string): JoinRoomResult {
  const code = normalizeRoomCode(rawCode);
  if (code.length !== 6) {
    return { ok: false, error: 'invalid_code' };
  }

  const room = roomsByCode.get(code);
  if (!room) {
    return { ok: false, error: 'not_found' };
  }

  if (room.participants.length >= room.settings.max_participants) {
    return { ok: false, error: 'full' };
  }

  const guest = makeParticipant(
    displayName ?? `Guest ${room.participants.length + 1}`,
    false,
    room.settings.veto_limit_per_user,
  );

  const updated: Room = {
    ...room,
    updated_at: now(),
    participants: [...room.participants, guest],
  };
  roomsByCode.set(code, updated);
  return { ok: true, room: updated, selfId: guest.id };
}

export function getRoom(rawCode: string): Room | null {
  return roomsByCode.get(normalizeRoomCode(rawCode)) ?? null;
}

export function setParticipantReady(
  code: string,
  participantId: string,
  isReady: boolean,
): Room | null {
  const room = getRoom(code);
  if (!room) return null;

  const participants = room.participants.map((p) =>
    p.id === participantId
      ? { ...p, is_ready: isReady, last_seen_at: now() }
      : p,
  );

  const updated: Room = {
    ...room,
    updated_at: now(),
    participants,
  };
  roomsByCode.set(room.code, updated);
  return updated;
}

/** Host-only helper: add a simulated guest for local demos. */
export function addSimulatedGuest(code: string): Room | null {
  const result = joinRoom(code);
  return result.ok ? result.room : null;
}

export function leaveRoom(code: string, participantId: string): Room | null {
  const room = getRoom(code);
  if (!room) return null;

  const participants = room.participants.filter((p) => p.id !== participantId);

  let host_id = room.host_id;
  if (participantId === room.host_id && participants.length > 0) {
    host_id = participants[0].id;
    participants[0] = { ...participants[0], is_host: true };
  }

  if (participants.length === 0) {
    roomsByCode.delete(room.code);
    return null;
  }

  const updated: Room = {
    ...room,
    host_id,
    updated_at: now(),
    participants,
  };
  roomsByCode.set(room.code, updated);
  return updated;
}

export function allReady(room: Room): boolean {
  if (room.participants.length === 0) return false;
  return room.participants.every((p) => p.is_ready);
}
