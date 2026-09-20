import { colors } from './colors';

/**
 * Affective color roles — tuned with color psychology for Wafflr.
 *
 * Warm cream + amber → comfort, appetite, play (decision fatigue ↓)
 * Emerald → agreement, success, “we’re good”
 * Pink → delight / micro-reward (dice, match pop)
 * Soft slate text → calm hierarchy without cold corporate grey
 */
export const affect = {
  /** Page stage — bakery warmth, lowers threat */
  comfort: {
    canvas: '#FFF8EB',
    canvasAlt: '#FFFDF7',
    surface: '#FFFBF3',
    inset: '#FFF3E0',
  },

  /** Primary action / chance — optimism, energy, “tap me” */
  reward: {
    solid: colors.brand.amber[400],
    solidStrong: colors.brand.amber[500],
    soft: colors.brand.amber[100],
    softBorder: colors.brand.amber[200],
    text: colors.brand.amber[800],
    glow: 'rgba(245, 158, 11, 0.28)',
  },

  /** Social success / ready / match — trust + completion */
  success: {
    solid: colors.brand.emerald[500],
    solidStrong: colors.brand.emerald[600],
    soft: colors.brand.emerald[50],
    softBorder: colors.brand.emerald[200],
    text: colors.brand.emerald[700],
    glow: 'rgba(16, 185, 129, 0.22)',
  },

  /** Delight / celebration — dopamine accent (use sparingly) */
  delight: {
    solid: colors.brand.pink[500],
    solidStrong: colors.brand.pink[600],
    soft: colors.brand.pink[50],
    softBorder: colors.brand.pink[200],
    text: colors.brand.pink[700],
    glow: 'rgba(236, 72, 153, 0.22)',
  },

  /** Hierarchy — readable, not stern */
  type: {
    primary: colors.brand.slate[900],
    secondary: colors.brand.slate[600],
    muted: colors.brand.slate[500],
    inverse: colors.brand.white,
  },

  /** Warm shadow pigment — never pure black (feels colder / harsher) */
  depth: {
    key: 'rgba(120, 53, 15, 0.14)',
    keySoft: 'rgba(120, 53, 15, 0.08)',
    ambient: 'rgba(146, 64, 14, 0.12)',
    ambientDeep: 'rgba(120, 53, 15, 0.18)',
    highlight: 'rgba(255, 255, 255, 0.92)',
    highlightSoft: 'rgba(255, 255, 255, 0.65)',
  },
} as const;

export type Affect = typeof affect;
