import { describe, expect, test } from "vitest";
import { createSeededRng } from "../../game-shell/rng";
import { formatRational, gcd, isWithin5Percent, parseRational, rationalsEqual, reduce } from "./parsing";
import { evaluateAnswer, generateQuestion } from "./logic";
import { GENERATORS, generateExamSet, pickAndGenerate } from "./generators";

function createRng(values: number[]) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

describe("gcd", () => {
  test("basic cases", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 3)).toBe(1);
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(15, 15)).toBe(15);
  });
});

describe("reduce", () => {
  test("reduces fractions", () => {
    expect(reduce({ num: 6, den: 8 })).toEqual({ num: 3, den: 4 });
    expect(reduce({ num: -6, den: 8 })).toEqual({ num: -3, den: 4 });
  });

  test("normalizes negative denominator", () => {
    expect(reduce({ num: 3, den: -4 })).toEqual({ num: -3, den: 4 });
  });

  test("handles zero numerator", () => {
    expect(reduce({ num: 0, den: 5 })).toEqual({ num: 0, den: 1 });
  });
});

describe("parseRational", () => {
  test("parses integers", () => {
    expect(parseRational("43")).toEqual({ num: 43, den: 1 });
    expect(parseRational("-25")).toEqual({ num: -25, den: 1 });
    expect(parseRational("0")).toEqual({ num: 0, den: 1 });
  });

  test("parses fractions", () => {
    expect(parseRational("5/6")).toEqual({ num: 5, den: 6 });
    expect(parseRational("-1/12")).toEqual({ num: -1, den: 12 });
    expect(parseRational("3/4")).toEqual({ num: 3, den: 4 });
  });

  test("reduces fractions on parse", () => {
    expect(parseRational("2/4")).toEqual({ num: 1, den: 2 });
    expect(parseRational("6/8")).toEqual({ num: 3, den: 4 });
  });

  test("parses mixed numbers", () => {
    expect(parseRational("3 7/8")).toEqual({ num: 31, den: 8 });
    expect(parseRational("2 1/3")).toEqual({ num: 7, den: 3 });
    expect(parseRational("-3 1/4")).toEqual({ num: -13, den: 4 });
  });

  test("returns null for invalid input", () => {
    expect(parseRational("")).toBeNull();
    expect(parseRational("abc")).toBeNull();
    expect(parseRational("3.14")).toBeNull();
    expect(parseRational("5/0")).toBeNull();
    expect(parseRational("/5")).toBeNull();
  });
});

describe("rationalsEqual", () => {
  test("equal fractions", () => {
    expect(rationalsEqual({ num: 1, den: 2 }, { num: 2, den: 4 })).toBe(true);
    expect(rationalsEqual({ num: 3, den: 4 }, { num: 6, den: 8 })).toBe(true);
  });

  test("unequal fractions", () => {
    expect(rationalsEqual({ num: 1, den: 2 }, { num: 1, den: 3 })).toBe(false);
  });

  test("integers equal fractions", () => {
    expect(rationalsEqual({ num: 5, den: 1 }, { num: 10, den: 2 })).toBe(true);
  });
});

describe("isWithin5Percent", () => {
  test("exact match is within 5%", () => {
    expect(isWithin5Percent({ num: 100, den: 1 }, { num: 100, den: 1 })).toBe(true);
  });

  test("within 5% accepted", () => {
    expect(isWithin5Percent({ num: 103, den: 1 }, { num: 100, den: 1 })).toBe(true);
    expect(isWithin5Percent({ num: 96, den: 1 }, { num: 100, den: 1 })).toBe(true);
  });

  test("outside 5% rejected", () => {
    expect(isWithin5Percent({ num: 110, den: 1 }, { num: 100, den: 1 })).toBe(false);
    expect(isWithin5Percent({ num: 90, den: 1 }, { num: 100, den: 1 })).toBe(false);
  });

  test("works with larger numbers", () => {
    // 213 * 667 = 142071, 5% = ~7103
    expect(isWithin5Percent({ num: 142000, den: 1 }, { num: 142071, den: 1 })).toBe(true);
    expect(isWithin5Percent({ num: 130000, den: 1 }, { num: 142071, den: 1 })).toBe(false);
  });
});

describe("formatRational", () => {
  test("formats integers", () => {
    expect(formatRational({ num: 5, den: 1 })).toBe("5");
    expect(formatRational({ num: -3, den: 1 })).toBe("-3");
  });

  test("formats fractions", () => {
    expect(formatRational({ num: 3, den: 4 })).toBe("3/4");
    expect(formatRational({ num: -1, den: 3 })).toBe("-1/3");
  });

  test("formats mixed numbers", () => {
    expect(formatRational({ num: 7, den: 3 })).toBe("2 1/3");
    expect(formatRational({ num: 31, den: 8 })).toBe("3 7/8");
  });

  test("reduces before formatting", () => {
    expect(formatRational({ num: 6, den: 4 })).toBe("1 1/2");
  });
});

describe("evaluateAnswer", () => {
  test("correct integer answer", () => {
    const q = { text: "2 + 3", answer: { num: 5, den: 1 }, isApproximate: false, answerFormat: "integer" as const, category: "addition" };
    const result = evaluateAnswer(q, "5");
    expect(result.kind).toBe("correct");
  });

  test("wrong integer answer", () => {
    const q = { text: "2 + 3", answer: { num: 5, den: 1 }, isApproximate: false, answerFormat: "integer" as const, category: "addition" };
    const result = evaluateAnswer(q, "6");
    expect(result.kind).toBe("wrong");
  });

  test("correct fraction answer", () => {
    const q = { text: "1/4 + 1/4", answer: { num: 1, den: 2 }, isApproximate: false, answerFormat: "fraction" as const, category: "fractions" };
    expect(evaluateAnswer(q, "1/2").kind).toBe("correct");
    expect(evaluateAnswer(q, "2/4").kind).toBe("correct");
  });

  test("correct mixed number answer", () => {
    const q = { text: "test", answer: { num: 7, den: 3 }, isApproximate: false, answerFormat: "fraction" as const, category: "mixedNumbers" };
    expect(evaluateAnswer(q, "2 1/3").kind).toBe("correct");
    expect(evaluateAnswer(q, "7/3").kind).toBe("correct");
  });

  test("approximate answer within 5%", () => {
    const q = { text: "*100 x 100", answer: { num: 10000, den: 1 }, isApproximate: true, answerFormat: "integer" as const, category: "approximate" };
    expect(evaluateAnswer(q, "10000").kind).toBe("correct");
    expect(evaluateAnswer(q, "10400").kind).toBe("correct");
    expect(evaluateAnswer(q, "9600").kind).toBe("correct");
  });

  test("approximate answer outside 5%", () => {
    const q = { text: "*100 x 100", answer: { num: 10000, den: 1 }, isApproximate: true, answerFormat: "integer" as const, category: "approximate" };
    expect(evaluateAnswer(q, "12000").kind).toBe("wrong");
  });

  test("invalid input returns invalid", () => {
    const q = { text: "2 + 3", answer: { num: 5, den: 1 }, isApproximate: false, answerFormat: "integer" as const, category: "addition" };
    expect(evaluateAnswer(q, "").kind).toBe("invalid");
    expect(evaluateAnswer(q, "abc").kind).toBe("invalid");
  });
});

describe("generators", () => {
  test("each generator produces a valid question", () => {
    const rng = createRng([0.3, 0.5, 0.7, 0.1, 0.9, 0.2, 0.6, 0.4, 0.8]);
    for (const gen of GENERATORS) {
      const q = gen.generate(rng, gen.minDifficulty);
      expect(q.text).toBeTruthy();
      expect(q.answer).toBeDefined();
      expect(q.answer.den).not.toBe(0);
      expect(q.category).toBeTruthy();
    }
  });

  test("generators at high difficulty produce valid questions", () => {
    const rng = createRng([0.5, 0.3, 0.7, 0.9, 0.1, 0.6, 0.2, 0.8, 0.4]);
    for (const gen of GENERATORS) {
      const q = gen.generate(rng, 8);
      expect(q.text).toBeTruthy();
      expect(q.answer.den).not.toBe(0);
    }
  });

  test("pickAndGenerate selects from eligible generators only", () => {
    const rng = createRng([0.5, 0.3, 0.7, 0.1, 0.9]);
    const q = pickAndGenerate(rng, 1);
    const diff1Ids = GENERATORS.filter((g) => g.minDifficulty <= 1).map((g) => g.id);
    expect(diff1Ids).toContain(q.category);
  });

  test("approximate questions are marked as approximate", () => {
    const rng = createRng([0.5, 0.3, 0.7, 0.1, 0.2]);
    const gen = GENERATORS.find((g) => g.id === "approximate")!;
    const q = gen.generate(rng, 5);
    expect(q.isApproximate).toBe(true);
    expect(q.text.startsWith("*")).toBe(true);
  });
});

describe("generateQuestion", () => {
  test("generates a question at difficulty 1", () => {
    const rng = createRng([0.5, 0.3, 0.7, 0.1, 0.2, 0.6, 0.4]);
    const q = generateQuestion(rng, 1);
    expect(q.text).toBeTruthy();
    expect(q.answer).toBeDefined();
  });

  test("generates a question at difficulty 5", () => {
    const rng = createRng([0.9, 0.1, 0.5, 0.3, 0.7, 0.2, 0.8]);
    const q = generateQuestion(rng, 5);
    expect(q.text).toBeTruthy();
    expect(q.answer).toBeDefined();
  });
});

describe("generateExamSet", () => {
  test("same seed yields the same exam sequence", () => {
    const first = generateExamSet(createSeededRng(20260310), 80);
    const second = generateExamSet(createSeededRng(20260310), 80);

    expect(second).toEqual(first);
  });

  test("places approximate questions at every tenth slot only", () => {
    const exam = generateExamSet(createSeededRng(42), 80);

    exam.forEach(({ question }, index) => {
      const shouldBeApproximate = (index + 1) % 10 === 0;
      expect(question.isApproximate).toBe(shouldBeApproximate);
      expect(question.text.startsWith("*")).toBe(shouldBeApproximate);
    });
  });
});
