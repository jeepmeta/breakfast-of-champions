/**
 * Wheel deceleration + settle — tuned for a sticky, natural stop.
 * Lower friction + higher stop threshold = more “grab” at the end.
 */

export const WHEEL_PHYSICS = {
  /** deg per frame at spin start */
  initial_velocity_range: { min: 16, max: 28 },
  /**
   * Per-frame velocity multiplier.
   * Was 0.985 — lower = slower coast + stickier finish.
   */
  friction: 0.978,
  /**
   * Extra drag once slow — applied when |v| < sticky_threshold.
   * Multiplies friction again for a final “grab”.
   */
  sticky_friction: 0.92,
  sticky_threshold: 2.4,
  /** Stop when velocity falls below this (higher = earlier sticky settle) */
  min_velocity_to_stop: 0.16,
  segment_snap_duration_ms: 420,
  full_rotations_before_decel: { min: 3, max: 6 },
  haptic_tick_interval_deg: 10,
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
