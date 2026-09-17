/**
 * Brand typefaces — source: branding-kit.html (Fredoka for bubble/wordmark).
 * Loaded in app/_layout.tsx via @expo-google-fonts/fredoka + expo-font.
 */
export const fonts = {
  fredoka: {
    /** Display / wordmark */
    bold: 'Fredoka_700Bold',
    semibold: 'Fredoka_600SemiBold',
  },
} as const;

export type BrandFont = (typeof fonts.fredoka)[keyof typeof fonts.fredoka];
