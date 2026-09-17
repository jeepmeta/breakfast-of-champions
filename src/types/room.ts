/**
 * Canonical room types — mirror of room-state-schemas.md.
 * Keep in sync with the project reference file.
 */

export type RoomMode =
  | 'solo_wheel'
  | 'swipe_match'
  | 'bracket'
  | 'series'
  | 'dice'
  | 'straw'
  | 'coin'
  | 'office_poll';

export type RoomStatus = 'lobby' | 'active' | 'revealing' | 'completed' | 'expired';

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
  display_name: string;
  avatar_url: string | null;
  is_host: boolean;
  is_ready: boolean;
  joined_at: string;
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
  state: Record<string, unknown>; // ModeSpecificState — expand per mode
}
