/**
 * Swipe Match game ops — start session, votes, mutual-match, secret veto.
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

  // Ignore votes on already-vetoed items
  if (room.state.vetoed_item_ids.includes(itemId)) {
    return room;
  }

  const state: SwipeMatchState = {
    ...room.state,
    votes: { ...room.state.votes },
    matches: [...room.state.matches],
    vetoed_item_ids: [...room.state.vetoed_item_ids],
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

  // Advance past current item once everyone has voted (or item was vetoed)
  advancePastFullyVoted(state, participantCount);

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

/**
 * Secret veto — one-time kill of an item. No one learns who vetoed.
 * Decrements participant.vetoes_remaining and adds item to vetoed_item_ids.
 */
export async function castSecretVeto(params: {
  roomId: string;
  participantId: string;
  itemId: string;
}): Promise<Room | null> {
  const { roomId, participantId, itemId } = params;

  const room = await fetchRoomById(roomId);
  if (!room || !isSwipeMatchState(room.state)) {
    throw new Error('Room is not in swipe match');
  }

  if (!room.settings.veto_enabled) {
    throw new Error('Veto is disabled in this room');
  }

  const self = room.participants.find((p) => p.id === participantId);
  if (!self) throw new Error('Participant not found');
  if (self.vetoes_remaining <= 0) {
    throw new Error('No vetoes remaining');
  }

  if (room.state.vetoed_item_ids.includes(itemId)) {
    return room; // already gone
  }

  // Already matched? too late
  if (room.state.matches.some((m) => m.item_id === itemId)) {
    throw new Error('Item already matched');
  }

  const state: SwipeMatchState = {
    ...room.state,
    votes: { ...room.state.votes },
    matches: [...room.state.matches],
    vetoed_item_ids: [...room.state.vetoed_item_ids, itemId],
  };

  // Clear any partial votes on the vetoed item
  delete state.votes[itemId];

  advancePastFullyVoted(state, room.participants.length);

  // Decrement veto on the participant row
  const { error: partError } = await supabase
    .from('participants')
    .update({
      vetoes_remaining: self.vetoes_remaining - 1,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', participantId);

  if (partError) throw partError;

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

function advancePastFullyVoted(
  state: SwipeMatchState,
  participantCount: number,
) {
  // Skip any items that are vetoed or fully voted
  while (state.current_item_index < state.items.length) {
    const current = state.items[state.current_item_index];
    if (!current) break;

    if (state.vetoed_item_ids.includes(current.id)) {
      state.current_item_index += 1;
      continue;
    }

    const currentVotes = state.votes[current.id] ?? [];
    if (currentVotes.length >= participantCount) {
      state.current_item_index += 1;
      continue;
    }

    break;
  }

  if (
    state.current_item_index >= state.items.length &&
    state.phase === 'swiping'
  ) {
    state.phase = state.matches.length > 0 ? 'celebration' : 'finished';
  }
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

  // Skip any leading vetoed items after dismiss
  while (
    state.current_item_index < state.items.length &&
    state.vetoed_item_ids.includes(state.items[state.current_item_index].id)
  ) {
    state.current_item_index += 1;
  }

  if (state.current_item_index >= state.items.length) {
    state.phase = state.matches.length > 0 ? 'celebration' : 'finished';
  }

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
