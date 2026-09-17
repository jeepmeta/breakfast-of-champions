/** Lightweight client-side IDs. */

export function createId(prefix = ''): string {
  const hex = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${hex}` : hex;
}
