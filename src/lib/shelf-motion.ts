/** Geometry for the single-row shelf. The centered book turns from spine to cover. */

export function mod(value: number, length: number): number {
  if (length <= 0) return 0;
  return ((value % length) + length) % length;
}

export function wrapDelta(index: number, position: number, length: number): number {
  const raw = mod(index - position, length);
  return raw > length / 2 ? raw - length : raw;
}

/**
 * Horizontal slot for a book. While a book is turning to show its cover,
 * neighbors slide outward so the cover has room.
 */
export function trackOffset(
  delta: number,
  spine: number,
  gap: number,
  coverWidth: number,
): number {
  const pitch = spine + gap;
  const overhang = coverWidth - spine + gap * 1.6;
  const spread =
    Math.abs(delta) < 1
      ? (delta + Math.sin(Math.PI * delta) / Math.PI) / 2
      : 0.5 * Math.sign(delta);
  return delta * pitch + overhang * spread;
}

/** 0 at the sides, 1 when a book is centered and facing the reader. */
export function facing(delta: number): number {
  const closeness = Math.max(0, 1 - Math.abs(delta));
  return closeness * closeness * (3 - 2 * closeness);
}

export function damp(current: number, target: number, dt: number, rate: number): number {
  const next = current + (target - current) * (1 - Math.exp(-rate * dt));
  return Math.abs(target - next) < 1e-4 ? target : next;
}

export function coverInset(rect: DOMRect, width: number, height: number): string {
  const top = Math.max(0, rect.top);
  const right = Math.max(0, width - rect.right);
  const bottom = Math.max(0, height - rect.bottom);
  const left = Math.max(0, rect.left);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`;
}
