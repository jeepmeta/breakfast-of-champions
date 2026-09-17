import type { CatalogItem } from '../data/sample-items';

export type VoteDirection = 'right' | 'left';

export type SwipeVote = {
  participant_id: string;
  direction: VoteDirection;
  timestamp: string;
};

export type SwipeItem = {
  id: string;
  order: number;
  payload: CatalogItem;
};

export type MatchResult = {
  item_id: string;
  matched_at: string;
  participant_ids: string[];
  celebration_triggered: boolean;
};

export type SwipeMatchState = {
  type: 'swipe_match';
  current_item_index: number;
  items: SwipeItem[];
  /** item_id → votes */
  votes: Record<string, SwipeVote[]>;
  matches: MatchResult[];
  vetoed_item_ids: string[];
  phase: 'swiping' | 'matching' | 'celebration' | 'finished';
};

export function emptySwipeState(items: SwipeItem[]): SwipeMatchState {
  return {
    type: 'swipe_match',
    current_item_index: 0,
    items,
    votes: {},
    matches: [],
    vetoed_item_ids: [],
    phase: 'swiping',
  };
}

export function isSwipeMatchState(state: unknown): state is SwipeMatchState {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as SwipeMatchState).type === 'swipe_match'
  );
}
