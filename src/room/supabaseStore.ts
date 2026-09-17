/**
 * Supabase-backed room operations + Realtime helpers.
 * UI should go through RoomContext, not this module directly.
 */

import { supabase } from '../lib/supabase';
import type {
  Room,
  Participant,
  RoomMode,
  RoomSettings,
  ConnectionStatus,
} from '../types/room';
import { DEFAULT_ROOM_SETTINGS } from '../types/room';
import { generateRoomCode, normalizeRoomCode } from '../utils/room-code';

type RoomRow = {
  id: string;
  code: string;
  mode: RoomMode;
  status: Room['status'];
  host_id: string | null;
  settings: RoomSettings;
  item_payload: unknown[];
  state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};

type ParticipantRow = {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  is_host: boolean;
  is_ready: boolean;
  connection_status: ConnectionStatus;
  vetoes_remaining: number;
  joined_at: string;
  last_seen_at: string;
};

function mapParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    user_id: row.user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    is_host: row.is_host,
    is_ready: row.is_ready,
    joined_at: row.joined_at,
    last_seen_at: row.last_seen_at,
    connection_status: row.connection_status,
    vetoes_remaining: row.vetoes_remaining,
  };
}

function mapRoom(row: RoomRow, participants: Participant[]): Room {
  return {
    id: row.id,
    code: row.code,
    mode: row.mode,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
    host_id: row.host_id ?? '',
    settings: row.settings ?? DEFAULT_ROOM_SETTINGS,
    item_payload: row.item_payload ?? [],
    participants,
    state: row.state ?? {},
  };
}

async function fetchParticipants(roomId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return (data as ParticipantRow[]).map(mapParticipant);
}

export async function fetchRoomByCode(rawCode: string): Promise<Room | null> {
  const code = normalizeRoomCode(rawCode);
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const participants = await fetchParticipants(data.id);
  return mapRoom(data as RoomRow, participants);
}

export async function fetchRoomById(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const participants = await fetchParticipants(data.id);
  return mapRoom(data as RoomRow, participants);
}

export type CreateRoomResult = { room: Room; selfId: string };

export async function createRoom(input: {
  displayName?: string;
  mode?: RoomMode;
} = {}): Promise<CreateRoomResult> {
  const displayName = input.displayName ?? 'Host';
  const mode = input.mode ?? 'swipe_match';
  const settings = { ...DEFAULT_ROOM_SETTINGS };

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();

    const { data: roomRow, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        mode,
        status: 'lobby',
        settings,
        item_payload: [],
        state: {},
      })
      .select('*')
      .single();

    if (roomError) {
      if (roomError.code === '23505') continue;
      throw roomError;
    }

    const { data: hostRow, error: hostError } = await supabase
      .from('participants')
      .insert({
        room_id: roomRow.id,
        display_name: displayName,
        is_host: true,
        is_ready: true,
        vetoes_remaining: settings.veto_limit_per_user,
        connection_status: 'connected',
      })
      .select('*')
      .single();

    if (hostError) throw hostError;

    const { error: hostUpdateError } = await supabase
      .from('rooms')
      .update({ host_id: hostRow.id })
      .eq('id', roomRow.id);

    if (hostUpdateError) throw hostUpdateError;

    const room = mapRoom(
      { ...(roomRow as RoomRow), host_id: hostRow.id },
      [mapParticipant(hostRow as ParticipantRow)],
    );

    return { room, selfId: hostRow.id };
  }

  throw new Error('Could not allocate a unique room code');
}

export type JoinRoomResult =
  | { ok: true; room: Room; selfId: string }
  | { ok: false; error: 'not_found' | 'full' | 'invalid_code' };

export async function joinRoom(
  rawCode: string,
  displayName?: string,
): Promise<JoinRoomResult> {
  const code = normalizeRoomCode(rawCode);
  if (code.length !== 6) {
    return { ok: false, error: 'invalid_code' };
  }

  const existing = await fetchRoomByCode(code);
  if (!existing) {
    return { ok: false, error: 'not_found' };
  }

  if (existing.participants.length >= existing.settings.max_participants) {
    return { ok: false, error: 'full' };
  }

  const name =
    displayName ?? `Guest ${existing.participants.length + 1}`;

  const { data: guestRow, error } = await supabase
    .from('participants')
    .insert({
      room_id: existing.id,
      display_name: name,
      is_host: false,
      is_ready: false,
      vetoes_remaining: existing.settings.veto_limit_per_user,
      connection_status: 'connected',
    })
    .select('*')
    .single();

  if (error) throw error;

  const room = await fetchRoomById(existing.id);
  if (!room) return { ok: false, error: 'not_found' };

  return { ok: true, room, selfId: guestRow.id };
}

export async function setParticipantReady(
  participantId: string,
  isReady: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('participants')
    .update({
      is_ready: isReady,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', participantId);

  if (error) throw error;
}

export async function leaveRoom(
  roomId: string,
  participantId: string,
): Promise<void> {
  const room = await fetchRoomById(roomId);
  if (!room) return;

  const { error: delError } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId);

  if (delError) throw delError;

  const remaining = room.participants.filter((p) => p.id !== participantId);

  if (remaining.length === 0) {
    await supabase.from('rooms').delete().eq('id', roomId);
    return;
  }

  if (room.host_id === participantId) {
    const nextHost = remaining[0];
    await supabase
      .from('participants')
      .update({ is_host: true })
      .eq('id', nextHost.id);
    await supabase
      .from('rooms')
      .update({ host_id: nextHost.id })
      .eq('id', roomId);
  }
}

export async function addSimulatedGuest(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room) return null;
  const result = await joinRoom(room.code);
  return result.ok ? result.room : null;
}

export function allReady(room: Room): boolean {
  if (room.participants.length === 0) return false;
  return room.participants.every((p) => p.is_ready);
}

export function subscribeToRoom(
  roomId: string,
  onChange: (room: Room) => void,
): () => void {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        const room = await fetchRoomById(roomId);
        if (room) onChange(room);
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      async () => {
        const room = await fetchRoomById(roomId);
        if (room) onChange(room);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
