import type { Rational } from "./types";

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function reduce(r: Rational): Rational {
  if (r.den === 0) return { num: 0, den: 1 };
  const sign = r.den < 0 ? -1 : 1;
  const g = gcd(Math.abs(r.num), Math.abs(r.den));
  return { num: (sign * r.num) / g, den: (sign * r.den) / g };
}

export function rationalsEqual(a: Rational, b: Rational): boolean {
  const ar = reduce(a);
  const br = reduce(b);
  return ar.num * br.den === br.num * ar.den;
}

export function isWithin5Percent(user: Rational, exact: Rational): boolean {
  if (exact.den === 0) return false;
  const exactVal = exact.num / exact.den;
  const userVal = user.num / user.den;
  if (exactVal === 0) return Math.abs(userVal) <= 0.05;
  return Math.abs((userVal - exactVal) / exactVal) <= 0.05;
}

export function parseRational(input: string): Rational | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  // Mixed number: "3 7/8" or "-3 7/8"
  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den === 0 || !Number.isFinite(whole) || !Number.isFinite(num)) return null;
    const sign = whole < 0 ? -1 : 1;
    return reduce({ num: sign * (Math.abs(whole) * den + num), den });
  }

  // Fraction: "5/6" or "-1/12"
  const fracMatch = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den === 0 || !Number.isFinite(num)) return null;
    return reduce({ num, den });
  }

  // Integer: "43" or "-25"
  const intMatch = trimmed.match(/^-?\d+$/);
  if (intMatch) {
    const num = parseInt(trimmed, 10);
    if (!Number.isFinite(num)) return null;
    return { num, den: 1 };
  }

  return null;
}

export function formatRational(r: Rational): string {
  const reduced = reduce(r);
  if (reduced.den === 1) return String(reduced.num);
  if (Math.abs(reduced.num) > reduced.den) {
    const sign = reduced.num < 0 ? -1 : 1;
    const absNum = Math.abs(reduced.num);
    const whole = Math.floor(absNum / reduced.den);
    const remainder = absNum % reduced.den;
    if (remainder === 0) return String(sign * whole);
    return `${sign * whole} ${remainder}/${reduced.den}`;
  }
  return `${reduced.num}/${reduced.den}`;
}
