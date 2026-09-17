import { WHEEL_PHYSICS } from '../constants/wheel-physics';

export type WeightedSeg = { id: string; weight: number };

/** Run friction loop offline → final rotation. */
export function simulateFinalRotation(
  startRotation: number,
  initialVelocity: number,
): number {
  let rot = startRotation;
  let vel = initialVelocity;
  for (let i = 0; i < 5000; i++) {
    vel *= WHEEL_PHYSICS.friction;
    rot += vel;
    if (Math.abs(vel) < WHEEL_PHYSICS.min_velocity_to_stop) break;
  }
  return rot;
}

export function resolveWinnerId(
  finalRotation: number,
  segments: WeightedSeg[],
): string {
  const normalized = ((-finalRotation % 360) + 360) % 360;
  const total = segments.reduce((s, x) => s + x.weight, 0) || 1;
  let cursor = 0;
  for (const seg of segments) {
    const sweep = (seg.weight / total) * 360;
    if (normalized >= cursor && normalized < cursor + sweep) {
      return seg.id;
    }
    cursor += sweep;
  }
  return segments[segments.length - 1]?.id ?? '';
}

export function randomSpinVelocity(): number {
  const { min, max } = WHEEL_PHYSICS.initial_velocity_range;
  return min + Math.random() * (max - min);
}
