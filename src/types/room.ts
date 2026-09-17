/**
 * Canonical room types — mirror of room-state-schemas.md.
 */

export type RoomMode =
  | 'solo_wheel'
  | 'group_wheel'
  | 'swipe_match'
  | 'bracket'
  | 'series'
  | 'dice'
  | 'straw'
  | 'coin'
  | 'office_poll';

export type RoomStatus = 'lobby' | 'active' | 'revealing' | 'completed' | 'expired';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface RoomSettings {
  max_participants: number;
  allow_anonymous: boolean;
  veto_enabled: boolean;
  veto_limit_per_user: number;
  require_all_ready: boolean;
  timer_seconds: number | null;
  is_public: boolean;
}

export interface Participant {
  id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  is_host: boolean;
  is_ready: boolean;
  joined_at: string;
  last_seen_at: string;
  connection_status: ConnectionStatus;
  vetoes_remaining: number;
}

export interface Room {
  id: string;
  code: string;
  mode: RoomMode;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  host_id: string;
  settings: RoomSettings;
  item_payload: unknown[];
  participants: Participant[];
  state: Record<string, unknown>;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  max_participants: 12,
  allow_anonymous: true,
  veto_enabled: true,
  veto_limit_per_user: 1,
  require_all_ready: true,
  timer_seconds: null,
  is_public: false,
};
