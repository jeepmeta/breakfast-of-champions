/**
 * Spacing, radius, type, and motion tokens.
 * Align with design-tokens.md + branding-kit.
 */

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
} as const;

/** Brand type roles — product UI uses system/Inter; display wordmark uses bubble style */
export const type = {
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  mono: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
} as const;
