/**
 * Wafflr semantic color tokens.
 * Source of truth: design-tokens.md + branding-kit.html — never hard-code hex elsewhere.
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
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    pink: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899',
      600: '#DB2777',
      700: '#BE185D',
      800: '#9D174D',
      900: '#831843',
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
    red: {
      500: '#EF4444',
      600: '#DC2626',
    },
    white: '#FFFFFF',
    black: '#000000',
  },
  canvas: {
    light: '#F8FAFC',
    dark: '#0F172A',
  },
  elevated: {
    light: '#FFFFFF',
    dark: '#1E293B',
  },
  surface: {
    light: '#F1F5F9',
    dark: '#334155',
  },
  text: {
    primary: {
      light: '#0F172A',
      dark: '#F8FAFC',
    },
    secondary: {
      light: '#475569',
      dark: '#94A3B8',
    },
    muted: {
      light: '#64748B',
      dark: '#94A3B8',
    },
    onPrimary: '#0F172A',
  },
  border: {
    light: '#E2E8F0',
    dark: '#334155',
    focus: '#F59E0B',
  },
  fill: {
    primary: '#F59E0B',
    primaryHover: '#D97706',
    success: '#10B981',
    accent: '#EC4899',
    destructive: '#EF4444',
  },
  match: '#10B981',
  veto: '#EC4899',
  chance: '#F59E0B',
} as const;

export type Colors = typeof colors;
