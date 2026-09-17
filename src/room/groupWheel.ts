/**
 * Multiplayer / solo group wheel — catalog items (or people) as segments.
 */

import { supabase } from '../lib/supabase';
import type { Room } from '../types/room';
import {
  emptyGroupWheelState,
  isGroupWheelState,
  type GroupWheelState,
} from '../types/group-wheel';
import type { CatalogItem } from '../data/catalogs';
import { fetchRoomById } from './supabaseStore';
import {
  randomSpinVelocity,
  resolveWinnerId,
  simulateFinalRotation,
} from './wheelSim';

function segmentIdsFromRoom(room: Room): string[] {
  const items = room.item_payload as CatalogItem[] | undefined;
  if (items && items.length > 0) {
    return items.map((i) => i.id);
  }
  return room.participants.map((p) => p.id);
}

function labelForId(room: Room, id: string): string {
  const items = room.item_payload as CatalogItem[] | undefined;
  const item = items?.find((i) => i.id === id);
  if (item) return item.title;
  return room.participants.find((p) => p.id === id)?.display_name ?? 'Unknown';
}

export async function startGroupWheel(
  roomId: string,
  items?: CatalogItem[],
): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room) return null;

  const payload =
    items && items.length > 0 ? items : (room.item_payload as CatalogItem[]);
  const ids =
    payload && payload.length > 0
      ? payload.map((i) => i.id)
      : room.participants.map((p) => p.id);

  const state = emptyGroupWheelState(ids);

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'active',
      mode: 'group_wheel',
      item_payload: payload && payload.length > 0 ? payload : room.item_payload,
      state,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .eq('status', 'lobby');

  if (error) throw error;
  return fetchRoomById(roomId);
}

export async function hostStartSpin(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isGroupWheelState(room.state)) {
    throw new Error('Room is not in group wheel mode');
  }
  if (room.state.phase === 'spinning') return room;

  const ids = segmentIdsFromRoom(room);
  if (ids.length < 1) {
    throw new Error('Need at least one segment');
  }

  const segments = ids.map((id) => ({ id, weight: 1 }));

  const startRotation = room.state.spin?.final_rotation ?? 0;
  const velocity = randomSpinVelocity();
  const finalRotation = simulateFinalRotation(startRotation, velocity);
  const winnerId = resolveWinnerId(finalRotation, segments);

  const state: GroupWheelState = {
    ...room.state,
    phase: 'spinning',
    current_winner_id: null,
    spin: {
      nonce: (room.state.spin?.nonce ?? 0) + 1,
      velocity,
      start_rotation: startRotation,
      final_rotation: finalRotation,
      winner_id: winnerId,
      started_at: new Date().toISOString(),
    },
  };

  const { error } = await supabase
    .from('rooms')
    .update({
      state,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (error) throw error;
  return fetchRoomById(roomId);
}

export async function completeSpin(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isGroupWheelState(room.state)) return null;
  if (room.state.phase !== 'spinning' || !room.state.spin) return room;

  const winnerId = room.state.spin.winner_id;
  const tallies = { ...room.state.tallies };
  tallies[winnerId] = (tallies[winnerId] ?? 0) + 1;

  const state: GroupWheelState = {
    ...room.state,
    phase: 'celebration',
    current_winner_id: winnerId,
    tallies,
    history: [
      ...room.state.history,
      {
        winner_id: winnerId,
        winner_name: labelForId(room, winnerId),
        at: new Date().toISOString(),
      },
    ],
  };

  const { error } = await supabase
    .from('rooms')
    .update({
      state,
      status: 'revealing',
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (error) throw error;
  return fetchRoomById(roomId);
}

export async function resetForNextSpin(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isGroupWheelState(room.state)) return null;

  const ids = segmentIdsFromRoom(room);
  const tallies = { ...room.state.tallies };
  for (const id of ids) {
    if (tallies[id] == null) tallies[id] = 0;
  }

  const state: GroupWheelState = {
    ...room.state,
    phase: 'ready',
    current_winner_id: null,
    tallies,
  };

  const { error } = await supabase
    .from('rooms')
    .update({
      state,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (error) throw error;
  return fetchRoomById(roomId);
}
