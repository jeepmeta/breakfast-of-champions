/**
 * Multiplayer group wheel — participants as segments, tallied wins.
 */

import { supabase } from '../lib/supabase';
import type { Room } from '../types/room';
import {
  emptyGroupWheelState,
  isGroupWheelState,
  type GroupWheelState,
} from '../types/group-wheel';
import { fetchRoomById } from './supabaseStore';
import {
  randomSpinVelocity,
  resolveWinnerId,
  simulateFinalRotation,
} from './wheelSim';

export async function startGroupWheel(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room) return null;

  const state = emptyGroupWheelState(room.participants.map((p) => p.id));

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'active',
      mode: 'group_wheel',
      state,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .eq('status', 'lobby');

  if (error) throw error;
  return fetchRoomById(roomId);
}

/** Host starts a physics spin; all clients animate from shared params. */
export async function hostStartSpin(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isGroupWheelState(room.state)) {
    throw new Error('Room is not in group wheel mode');
  }
  if (room.state.phase === 'spinning') return room;
  if (room.participants.length < 1) {
    throw new Error('Need at least one participant');
  }

  const segments = room.participants.map((p) => ({
    id: p.id,
    weight: 1,
  }));

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

/** After animation completes — lock tally + celebration. */
export async function completeSpin(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isGroupWheelState(room.state)) return null;
  if (room.state.phase !== 'spinning' || !room.state.spin) return room;

  const winnerId = room.state.spin.winner_id;
  const winner = room.participants.find((p) => p.id === winnerId);
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
        winner_name: winner?.display_name ?? 'Unknown',
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

/** Ready for another spin (keeps tallies). */
export async function resetForNextSpin(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isGroupWheelState(room.state)) return null;

  const tallies = { ...room.state.tallies };
  for (const p of room.participants) {
    if (tallies[p.id] == null) tallies[p.id] = 0;
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
