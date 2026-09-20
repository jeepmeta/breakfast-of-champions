import type { TextStyle, ViewStyle } from 'react-native';

import { colors } from './colors';
import { affect } from './affect';
import { elevationStyle } from './shadows';

/**
 * Light candy / neumorph surface tokens.
 * Multi-layer depth + affective color roles (see affect.ts / shadows.ts).
 */
export const neu = {
  canvas: affect.comfort.canvas,
  canvasAlt: affect.comfort.canvasAlt,
  card: colors.brand.white,
  cardInset: affect.comfort.inset,
  text: affect.type.primary,
  muted: affect.type.muted,
  borderSoft: affect.reward.softBorder,
  border: colors.brand.amber[200],

  // Legacy single-layer (kept for gradual migration)
  shadow: {
    color: '#78350F',
    opacity: 0.12,
    radius: 12,
    offset: { width: 4, height: 6 },
    elevation: 4,
  },
  shadowSoft: {
    color: '#92400E',
    opacity: 0.08,
    radius: 8,
    offset: { width: 2, height: 3 },
    elevation: 2,
  },
  shadowDeep: {
    color: '#78350F',
    opacity: 0.18,
    radius: 16,
    offset: { width: 6, height: 10 },
    elevation: 6,
  },
} as const;

/** Raised white card — multi-layer card elevation */
export const neuCard: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: neu.borderSoft,
  ...elevationStyle('card'),
};

/** Softer raised chip / pill */
export const neuPill: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 999,
  borderWidth: 1.5,
  borderColor: neu.borderSoft,
  ...elevationStyle('soft'),
};

/** Primary amber CTA — reward-tinted lift */
export const neuPrimaryBtn: ViewStyle = {
  backgroundColor: affect.reward.solid,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: affect.reward.solidStrong,
  ...elevationStyle('cta'),
  minHeight: 52,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
};

export const neuPrimaryBtnText: TextStyle = {
  color: affect.type.primary,
  fontSize: 16,
  fontWeight: '800',
};

/** Secondary / ghost raised button */
export const neuSecondaryBtn: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: neu.border,
  ...elevationStyle('soft'),
  minHeight: 48,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
};

export const neuSecondaryBtnText: TextStyle = {
  color: neu.text,
  fontSize: 15,
  fontWeight: '700',
};

/** Floating modal / winner plane */
export const neuFloat: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 22,
  borderWidth: 2,
  borderColor: affect.success.softBorder,
  ...elevationStyle('float'),
};

/** Inset well — pressed / input recess */
export const neuInset: ViewStyle = {
  backgroundColor: neu.cardInset,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: affect.reward.softBorder,
  ...elevationStyle('inset'),
};

/** Success soft surface (match / ready) */
export const neuSuccessSoft: ViewStyle = {
  backgroundColor: affect.success.soft,
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: affect.success.softBorder,
  ...elevationStyle('card'),
};

/** Delight soft surface (dice / celebration accent) */
export const neuDelightSoft: ViewStyle = {
  backgroundColor: affect.delight.soft,
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: affect.delight.softBorder,
  ...elevationStyle('card'),
};

/** Section label */
export const neuSection: TextStyle = {
  fontSize: 12,
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: neu.muted,
};

export { affect } from './affect';
export { elevationStyle, shadowLayers, ambientHost, contactFace } from './shadows';
export type { ElevationName, ShadowLayer } from './shadows';
