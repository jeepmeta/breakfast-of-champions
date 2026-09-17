export type GroupWheelPhase = 'ready' | 'spinning' | 'celebration';

export type GroupWheelSpin = {
  nonce: number;
  velocity: number;
  start_rotation: number;
  /** Precomputed landing rotation (deterministic). */
  final_rotation: number;
  winner_id: string;
  started_at: string;
};

export type GroupWheelHistoryEntry = {
  winner_id: string;
  winner_name: string;
  at: string;
};

export type GroupWheelState = {
  type: 'group_wheel';
  phase: GroupWheelPhase;
  spin: GroupWheelSpin | null;
  /** participant_id → win count */
  tallies: Record<string, number>;
  history: GroupWheelHistoryEntry[];
  current_winner_id: string | null;
};

export function emptyGroupWheelState(
  participantIds: string[],
): GroupWheelState {
  const tallies: Record<string, number> = {};
  for (const id of participantIds) tallies[id] = 0;
  return {
    type: 'group_wheel',
    phase: 'ready',
    spin: null,
    tallies,
    history: [],
    current_winner_id: null,
  };
}

export function isGroupWheelState(state: unknown): state is GroupWheelState {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as GroupWheelState).type === 'group_wheel'
  );
}
