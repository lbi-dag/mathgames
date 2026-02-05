import { describe, expect, test } from "vitest";
import { generateCompositeNumber, isCorrectSelection, PRIMES_UNDER_50 } from "./logic";

describe("generateCompositeNumber", () => {
  test("returns product of three unique primes", () => {
    const { number, factors } = generateCompositeNumber(() => 0.1);
    const unique = new Set(factors);
    const product = factors.reduce((acc, f) => acc * f, 1);

    expect(factors).toHaveLength(3);
    expect(unique.size).toBe(3);
    expect(number).toBe(product);
    factors.forEach((prime) => {
      expect(PRIMES_UNDER_50).toContain(prime);
    });
  });
});

describe("isCorrectSelection", () => {
  test("accepts exact sorted match", () => {
    expect(isCorrectSelection([2, 3, 5], [2, 3, 5])).toBe(true);
  });

  test("rejects when order differs", () => {
    expect(isCorrectSelection([5, 3, 2], [2, 3, 5])).toBe(false);
  });
});
