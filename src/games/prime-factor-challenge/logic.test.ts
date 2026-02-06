import { describe, expect, test } from "vitest";
import { formatTime, generateCompositeNumber, isCorrectSelection, PRIMES_UNDER_50 } from "./logic";

describe("generateCompositeNumber", () => {
  test("returns product of three unique primes", () => {
    const { number, factors } = generateCompositeNumber({ rng: () => 0.1 });
    const unique = new Set(factors);
    const product = factors.reduce((acc, f) => acc * f, 1);

    expect(factors).toHaveLength(3);
    expect(unique.size).toBe(3);
    expect(number).toBe(product);
    factors.forEach((prime) => {
      expect(PRIMES_UNDER_50).toContain(prime);
    });
  });

  test("returns increasing composites by round index", () => {
    const first = generateCompositeNumber({ roundIndex: 0 });
    const second = generateCompositeNumber({ roundIndex: 1 });
    const third = generateCompositeNumber({ roundIndex: 2 });

    expect(first.number).toBeLessThan(second.number);
    expect(second.number).toBeLessThan(third.number);
  });
});

describe("isCorrectSelection", () => {
  test("accepts match in any order", () => {
    expect(isCorrectSelection([2, 3, 5], [2, 3, 5])).toBe(true);
    expect(isCorrectSelection([5, 3, 2], [2, 3, 5])).toBe(true);
  });

  test("rejects when length differs", () => {
    expect(isCorrectSelection([2, 3], [2, 3, 5])).toBe(false);
  });
});

describe("formatTime", () => {
  test("formats under a minute", () => {
    expect(formatTime(7)).toBe("0:07");
  });

  test("formats minutes and seconds", () => {
    expect(formatTime(83)).toBe("1:23");
  });
});


