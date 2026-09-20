import { colors } from './colors';
import type { ViewStyle, TextStyle } from 'react-native';

/**
 * Light candy / neumorph surface tokens.
 * Soft raised cards on warm cream canvas — bubbly & tangible.
 */
export const neu = {
  canvas: '#FFF8EB',
  canvasAlt: '#FFFDF7',
  card: colors.brand.white,
  cardInset: '#FFF9F0',
  text: colors.brand.slate[900],
  muted: colors.brand.slate[500],
  borderSoft: colors.brand.amber[100],
  border: colors.brand.amber[200],
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

/** Raised white card — default surface */
export const neuCard: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 20,
  borderWidth: 1.5,
  borderColor: neu.borderSoft,
  shadowColor: neu.shadow.color,
  shadowOpacity: neu.shadow.opacity,
  shadowRadius: neu.shadow.radius,
  shadowOffset: neu.shadow.offset,
  elevation: neu.shadow.elevation,
};

/** Softer raised chip / pill */
export const neuPill: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 999,
  borderWidth: 1.5,
  borderColor: neu.borderSoft,
  shadowColor: neu.shadowSoft.color,
  shadowOpacity: neu.shadowSoft.opacity,
  shadowRadius: neu.shadowSoft.radius,
  shadowOffset: neu.shadowSoft.offset,
  elevation: neu.shadowSoft.elevation,
};

/** Primary amber CTA */
export const neuPrimaryBtn: ViewStyle = {
  backgroundColor: colors.brand.amber[400],
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: colors.brand.amber[500],
  shadowColor: colors.brand.amber[800],
  shadowOpacity: 0.22,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 5 },
  elevation: 4,
  minHeight: 52,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
};

export const neuPrimaryBtnText: TextStyle = {
  color: colors.brand.slate[900],
  fontSize: 16,
  fontWeight: '800',
};

/** Secondary / ghost raised button */
export const neuSecondaryBtn: ViewStyle = {
  backgroundColor: neu.card,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: neu.border,
  shadowColor: neu.shadowSoft.color,
  shadowOpacity: neu.shadowSoft.opacity,
  shadowRadius: neu.shadowSoft.radius,
  shadowOffset: neu.shadowSoft.offset,
  elevation: neu.shadowSoft.elevation,
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

/** Section label */
export const neuSection: TextStyle = {
  fontSize: 12,
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: neu.muted,
};
