/**
 * From animation-haptic-constants.md — Reanimated spring configs.
 */

export const SPRINGS = {
  /** Card swipe release / snap-back */
  snappy: {
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  /** Match celebration, hero bounce */
  bouncy: {
    stiffness: 300,
    damping: 20,
    mass: 1,
  },
  /** Modal / sheet */
  gentle: {
    stiffness: 200,
    damping: 25,
    mass: 1,
  },
  /** Button press */
  stiff: {
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },
  /** Card exit fling — slightly underdamped for pop */
  exit: {
    stiffness: 280,
    damping: 26,
    mass: 0.9,
    overshootClamping: false,
  },
} as const;

/** Native-stack matched card exit duration (ms) when using timing fallback */
export const CARD_EXIT_MS = 320;
