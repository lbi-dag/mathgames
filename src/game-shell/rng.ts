export type Rng = () => number;

export function createSeedFromTimestamp(timestamp: number = Date.now()) {
  return timestamp >>> 0;
}

export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng: Rng, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
