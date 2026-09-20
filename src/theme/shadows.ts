import { Platform, type ViewStyle } from 'react-native';
import { affect } from './affect';

export type ShadowLayer = {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  color: string;
  inset?: boolean;
};

export type ElevationName = 'flat' | 'soft' | 'card' | 'float' | 'cta' | 'inset';

/**
 * Multi-layer shadow recipes.
 * Light assumed from top-left → dark drifts bottom-right, highlight opposite.
 */
export const shadowLayers: Record<ElevationName, ShadowLayer[]> = {
  flat: [],

  soft: [
    {
      offsetX: 0,
      offsetY: 1,
      blurRadius: 2,
      color: affect.depth.keySoft,
    },
    {
      offsetX: 2,
      offsetY: 3,
      blurRadius: 8,
      color: affect.depth.ambient,
    },
  ],

  card: [
    {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
      color: affect.depth.keySoft,
    },
    {
      offsetX: 4,
      offsetY: 8,
      blurRadius: 16,
      color: affect.depth.ambient,
    },
  ],

  float: [
    {
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      color: affect.depth.key,
    },
    {
      offsetX: 0,
      offsetY: 14,
      blurRadius: 28,
      color: affect.depth.ambientDeep,
    },
  ],

  /** Candy CTA — amber-tinted lift (reward / approach) */
  cta: [
    {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
      color: affect.reward.glow,
    },
    {
      offsetX: 0,
      offsetY: 8,
      blurRadius: 18,
      color: 'rgba(146, 64, 14, 0.2)',
    },
  ],

  /** Pressed / well — dual inset (light + dark) */
  inset: [
    {
      offsetX: 3,
      offsetY: 4,
      blurRadius: 8,
      color: affect.depth.keySoft,
      inset: true,
    },
    {
      offsetX: -2,
      offsetY: -3,
      blurRadius: 6,
      color: affect.depth.highlightSoft,
      inset: true,
    },
  ],
};

const ELEVATION: Record<ElevationName, number> = {
  flat: 0,
  soft: 2,
  card: 4,
  float: 8,
  cta: 5,
  inset: 0,
};

function layersToBoxShadow(layers: ShadowLayer[]): string {
  return layers
    .map((l) => {
      const inset = l.inset ? 'inset ' : '';
      return `${inset}${l.offsetX}px ${l.offsetY}px ${l.blurRadius}px ${l.color}`;
    })
    .join(', ');
}

/**
 * Cross-platform style from a named elevation.
 * - New Arch / web: full multi-layer via `boxShadow` string
 * - Classic iOS: maps to strongest outer layer
 * - Android: matching elevation
 */
export function elevationStyle(name: ElevationName): ViewStyle {
  const layers = shadowLayers[name];
  const elevation = ELEVATION[name];

  if (name === 'flat' || layers.length === 0) {
    return { elevation: 0 };
  }

  const outer = layers.find((l) => !l.inset) ?? layers[0];
  // Approximate opacity from rgba if present; keep soft default
  const opacity =
    name === 'cta' ? 0.22 : name === 'float' ? 0.16 : name === 'soft' ? 0.08 : 0.12;

  const classic: ViewStyle = {
    shadowColor: '#78350F',
    shadowOffset: { width: outer.offsetX, height: outer.offsetY },
    shadowOpacity: opacity,
    shadowRadius: Math.max(outer.blurRadius * 0.55, 4),
    elevation,
  };

  // boxShadow string works on web + New Architecture native
  const withBox: ViewStyle = {
    ...classic,
    // @ts-expect-error RN New Arch / web
    boxShadow: layersToBoxShadow(layers),
  };

  if (Platform.OS === 'web') {
    return withBox;
  }

  // Native: keep classic + boxShadow when New Arch supports it (harmless if ignored)
  return withBox;
}

/** Ambient host style for nested dual-layer (outer soft shell). */
export function ambientHost(name: Exclude<ElevationName, 'flat' | 'inset'>): ViewStyle {
  const layers = shadowLayers[name];
  const ambient = layers[layers.length - 1] ?? layers[0];
  return {
    shadowColor: '#78350F',
    shadowOffset: { width: ambient.offsetX, height: ambient.offsetY },
    shadowOpacity: name === 'float' ? 0.14 : 0.1,
    shadowRadius: ambient.blurRadius * 0.6,
    elevation: ELEVATION[name],
    backgroundColor: 'transparent',
  };
}

/** Contact face style for nested dual-layer (tight near-edge shadow). */
export function contactFace(name: Exclude<ElevationName, 'flat' | 'inset'>): ViewStyle {
  const layers = shadowLayers[name];
  const contact = layers[0];
  return {
    shadowColor: '#78350F',
    shadowOffset: { width: contact.offsetX, height: Math.max(1, contact.offsetY) },
    shadowOpacity: 0.07,
    shadowRadius: Math.max(3, contact.blurRadius * 0.5),
    elevation: Math.max(1, ELEVATION[name] - 2),
  };
}
