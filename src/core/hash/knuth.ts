/**
 * Knuth multiplicative hash for deterministic time computation.
 * SINGLE SOURCE OF TRUTH — see INV-1.
 *
 * Used by:
 *   - Moment of Power (daily time calculation)
 *   - Seed-based practice variations
 *
 * DO NOT duplicate this formula anywhere.
 */

export function computeKnuthHash(
  year: number,
  month: number,
  day: number,
  userSeed: number
): number {
  let x =
    (year * 2654435761) ^
    (month * 2246822519) ^
    (day * 3266489917) ^
    ((userSeed | 0) * 668265263);

  x = Math.imul(x >>> 16, 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = x ^ (x >>> 16);

  return x >>> 0; // unsigned 32-bit
}

export function hashToMinuteOfDay(
  hash: number,
  windowStartMin: number,
  windowEndMin: number
): number {
  const range = windowEndMin - windowStartMin;
  return windowStartMin + (hash % range);
}
