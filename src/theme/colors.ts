/**
 * Wafflr semantic color tokens.
 * Source of truth: design-tokens.md — never hard-code hex elsewhere.
 */

export const colors = {
  brand: {
    amber: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    emerald: {
      500: '#10B981',
      600: '#059669',
    },
    pink: {
      500: '#EC4899',
      600: '#DB2777',
    },
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
  },
  canvas: {
    light: '#F8FAFC',
    dark: '#0F172A',
  },
  text: {
    primary: {
      light: '#0F172A',
      dark: '#F8FAFC',
    },
    muted: {
      light: '#64748B',
      dark: '#94A3B8',
    },
  },
  border: {
    light: '#E2E8F0',
    dark: '#334155',
  },
  match: '#10B981',
  veto: '#EC4899',
} as const;
