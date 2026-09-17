/**
 * From animation-haptic-constants.md — do not invent alternate values.
 */

export const WHEEL_PHYSICS = {
  initial_velocity_range: { min: 18, max: 32 },
  friction: 0.985,
  min_velocity_to_stop: 0.08,
  segment_snap_duration_ms: 420,
  full_rotations_before_decel: { min: 4, max: 7 },
  haptic_tick_interval_deg: 8,
} as const;

/** Segment palette cycling brand tokens */
export const WHEEL_SEGMENT_COLORS = [
  '#F59E0B', // amber 500
  '#10B981', // emerald 500
  '#EC4899', // pink 500
  '#FBBF24', // amber 400
  '#059669', // emerald 600
  '#DB2777', // pink 600
  '#D97706', // amber 600
  '#34D399', // emerald 400
] as const;
