import { colors } from './colors';

/**
 * Light candy / neumorph surface tokens — home + tab shells.
 * Soft raised cards on warm cream canvas.
 */
export const neu = {
  canvas: '#FFF8EB',
  canvasAlt: '#FFFDF7',
  card: colors.brand.white,
  cardInset: '#FFF9F0',
  text: colors.brand.slate[900],
  muted: colors.brand.slate[500],
  borderSoft: colors.brand.amber[100],
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
} as const;

export const neuCard = {
  backgroundColor: neu.card,
  borderRadius: 18,
  borderWidth: 1.5,
  borderColor: neu.borderSoft,
  shadowColor: neu.shadow.color,
  shadowOpacity: neu.shadow.opacity,
  shadowRadius: neu.shadow.radius,
  shadowOffset: neu.shadow.offset,
  elevation: neu.shadow.elevation,
} as const;
