/**
 * Lobby mode availability by participant count.
 *
 * 1        → wheel, dice, mystery_box
 * 2–7      → + swipe
 * 8–400    → + elimination bracket
 */

import type { RoomMode } from '../types/room';

export type PlayableMode =
  | 'wheel'
  | 'dice'
  | 'mystery_box'
  | 'swipe_match'
  | 'bracket';

export type ModeDef = {
  id: PlayableMode;
  /** Maps to Room.mode when starting */
  roomMode: RoomMode;
  label: string;
  emoji: string;
  blurb: string;
  /** Minimum participants required */
  minPlayers: number;
  /** Maximum participants (inclusive) */
  maxPlayers: number;
  /** Fully implemented in app */
  ready: boolean;
  needsCatalog: boolean;
};

export const MODE_DEFS: ModeDef[] = [
  {
    id: 'wheel',
    roomMode: 'group_wheel',
    label: 'Wheel',
    emoji: '🎡',
    blurb: 'Physics spin — fair & fast',
    minPlayers: 1,
    maxPlayers: 400,
    ready: true,
    needsCatalog: true,
  },
  {
    id: 'dice',
    roomMode: 'dice',
    label: 'Dice',
    emoji: '🎲',
    blurb: 'Sibling roll-off',
    minPlayers: 1,
    maxPlayers: 400,
    ready: false,
    needsCatalog: true,
  },
  {
    id: 'mystery_box',
    roomMode: 'solo_wheel',
    label: 'Mystery Box',
    emoji: '🎁',
    blurb: 'Tap to reveal',
    minPlayers: 1,
    maxPlayers: 400,
    ready: false,
    needsCatalog: true,
  },
  {
    id: 'swipe_match',
    roomMode: 'swipe_match',
    label: 'Swipe Match',
    emoji: '💚',
    blurb: 'Mutual yes wins',
    minPlayers: 2,
    maxPlayers: 400,
    ready: true,
    needsCatalog: true,
  },
  {
    id: 'bracket',
    roomMode: 'bracket',
    label: 'Bracket',
    emoji: '🏆',
    blurb: 'Elimination tournament',
    minPlayers: 8,
    maxPlayers: 400,
    ready: false,
    needsCatalog: true,
  },
];

export function modesForPlayerCount(count: number): ModeDef[] {
  const n = Math.max(1, count);
  return MODE_DEFS.filter((m) => n >= m.minPlayers && n <= m.maxPlayers);
}

export function tierLabel(count: number): string {
  if (count <= 1) return 'Solo';
  if (count <= 7) return 'Small group';
  return 'Large group';
}
