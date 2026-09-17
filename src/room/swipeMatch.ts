/**
 * Swipe Match game ops — start session + cast votes with mutual-match detection.
 */

import { supabase } from '../lib/supabase';
import type { Room } from '../types/room';
import {
  emptySwipeState,
  isSwipeMatchState,
  type SwipeMatchState,
  type VoteDirection,
} from '../types/swipe';
import { buildSwipeDeck, DINNER_ITEMS } from '../data/sample-items';
import { fetchRoomById } from './supabaseStore';

export async function startSwipeMatch(roomId: string): Promise<Room | null> {
  const deck = buildSwipeDeck(DINNER_ITEMS);
  const state = emptySwipeState(deck);
  const item_payload = deck.map((d) => d.payload);

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'active',
      mode: 'swipe_match',
      item_payload,
      state,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .eq('status', 'lobby');

  if (error) throw error;
  return fetchRoomById(roomId);
}

export async function castSwipeVote(params: {
  roomId: string;
  participantId: string;
  itemId: string;
  direction: VoteDirection;
  participantCount: number;
}): Promise<Room | null> {
  const { roomId, participantId, itemId, direction, participantCount } = params;

  const room = await fetchRoomById(roomId);
  if (!room || !isSwipeMatchState(room.state)) {
    throw new Error('Room is not in swipe match');
  }

  const state: SwipeMatchState = {
    ...room.state,
    votes: { ...room.state.votes },
    matches: [...room.state.matches],
  };

  const existing = state.votes[itemId] ?? [];
  if (existing.some((v) => v.participant_id === participantId)) {
    return room;
  }

  const vote = {
    participant_id: participantId,
    direction,
    timestamp: new Date().toISOString(),
  };
  const votes = [...existing, vote];
  state.votes[itemId] = votes;

  if (direction === 'right') {
    const rights = votes.filter((v) => v.direction === 'right');
    if (rights.length >= participantCount && participantCount > 0) {
      const already = state.matches.some((m) => m.item_id === itemId);
      if (!already) {
        state.matches.push({
          item_id: itemId,
          matched_at: new Date().toISOString(),
          participant_ids: rights.map((r) => r.participant_id),
          celebration_triggered: true,
        });
        state.phase = 'celebration';
      }
    }
  }

  const current = state.items[state.current_item_index];
  if (current) {
    const currentVotes = state.votes[current.id] ?? [];
    if (currentVotes.length >= participantCount) {
      state.current_item_index = Math.min(
        state.current_item_index + 1,
        state.items.length,
      );
      if (
        state.current_item_index >= state.items.length &&
        state.phase === 'swiping'
      ) {
        state.phase = state.matches.length > 0 ? 'celebration' : 'finished';
      }
    }
  }

  let status = room.status;
  if (state.phase === 'celebration' || state.phase === 'finished') {
    status = state.phase === 'celebration' ? 'revealing' : 'completed';
  }

  const { error } = await supabase
    .from('rooms')
    .update({
      state,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (error) throw error;
  return fetchRoomById(roomId);
}

export async function dismissCelebration(roomId: string): Promise<Room | null> {
  const room = await fetchRoomById(roomId);
  if (!room || !isSwipeMatchState(room.state)) return room;

  const state: SwipeMatchState = {
    ...room.state,
    phase:
      room.state.current_item_index >= room.state.items.length
        ? 'finished'
        : 'swiping',
  };

  const { error } = await supabase
    .from('rooms')
    .update({
      state,
      status: state.phase === 'finished' ? 'completed' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (error) throw error;
  return fetchRoomById(roomId);
}
