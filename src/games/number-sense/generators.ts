import { randomInt, type Rng } from "../../game-shell/rng";
import { gcd, reduce } from "./parsing";
import type { GeneratorEntry, NumberSenseQuestion } from "./types";

function intQ(text: string, answer: number, category: string, isApproximate = false): NumberSenseQuestion {
  return { text, answer: { num: answer, den: 1 }, isApproximate, answerFormat: "integer", category };
}

function fracQ(text: string, num: number, den: number, category: string): NumberSenseQuestion {
  return { text, answer: reduce({ num, den }), isApproximate: false, answerFormat: "fraction", category };
}

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[randomInt(rng, 0, arr.length - 1)];
}

// --- Generator functions ---

function addition(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty >= 3) {
    // Multi-addend: 3-4 numbers
    const count = randomInt(rng, 3, 4);
    const nums: number[] = [];
    for (let i = 0; i < count; i++) {
      nums.push(randomInt(rng, 10, 50 + difficulty * 20));
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    return intQ(nums.join(" + "), sum, "addition");
  }
  const max = 50 + difficulty * 50;
  const a = randomInt(rng, 10, max);
  const b = randomInt(rng, 10, max);
  return intQ(`${a} + ${b}`, a + b, "addition");
}

function subtraction(rng: Rng, difficulty: number): NumberSenseQuestion {
  const max = 100 + difficulty * 100;
  let a = randomInt(rng, 50, max);
  let b = randomInt(rng, 10, max);
  if (b > a) [a, b] = [b, a];

  if (difficulty >= 3 && rng() > 0.5) {
    // "X minus what = Y"
    const diff = a - b;
    return intQ(`${a} \u2212 ___ = ${diff}`, b, "subtraction");
  }
  return intQ(`${a} \u2212 ${b}`, a - b, "subtraction");
}

function multiplication(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty <= 2) {
    // single x double
    const a = randomInt(rng, 2, 9);
    const b = randomInt(rng, 10, 50 + difficulty * 30);
    return intQ(`${a} \u00d7 ${b}`, a * b, "multiplication");
  }
  // double x double at higher difficulty
  const a = randomInt(rng, 11, 20 + difficulty * 8);
  const b = randomInt(rng, 11, 20 + difficulty * 8);
  return intQ(`${a} \u00d7 ${b}`, a * b, "multiplication");
}

function multiplyTricks(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, 3);
  switch (variant) {
    case 0: { // x11
      const a = randomInt(rng, 11, 30 + difficulty * 15);
      return intQ(`${a} \u00d7 11`, a * 11, "multiplyTricks");
    }
    case 1: { // x25
      const a = randomInt(rng, 4, 20 + difficulty * 8);
      return intQ(`${a} \u00d7 25`, a * 25, "multiplyTricks");
    }
    case 2: { // x50
      const a = randomInt(rng, 4, 20 + difficulty * 8);
      return intQ(`${a} \u00d7 50`, a * 50, "multiplyTricks");
    }
    default: { // near-100
      const base = pick(rng, [99, 101, 102]);
      const b = randomInt(rng, 10, 30 + difficulty * 10);
      return intQ(`${base} \u00d7 ${b}`, base * b, "multiplyTricks");
    }
  }
}

function division(rng: Rng, difficulty: number): NumberSenseQuestion {
  const divisor = randomInt(rng, 2, 5 + difficulty * 2);
  const quotient = randomInt(rng, 10, 100 + difficulty * 80);
  const dividend = divisor * quotient;
  return intQ(`${dividend} \u00f7 ${divisor}`, quotient, "division");
}

function differenceOfSquares(rng: Rng, difficulty: number): NumberSenseQuestion {
  const n = randomInt(rng, 10, 25 + difficulty * 10);
  const k = randomInt(rng, 1, Math.min(5, difficulty + 1));
  const a = n - k;
  const b = n + k;
  return intQ(`${a} \u00d7 ${b}`, a * b, "differenceOfSquares");
}

function remainder(rng: Rng, difficulty: number): NumberSenseQuestion {
  const divisor = pick(rng, [3, 4, 5, 6, 7, 8, 9]);
  const quotient = randomInt(rng, 100, 1000 + difficulty * 2000);
  const rem = randomInt(rng, 1, divisor - 1);
  const dividend = divisor * quotient + rem;
  return intQ(`${dividend} \u00f7 ${divisor}, remainder?`, rem, "remainder");
}

function roundingPlaceValue(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (rng() > 0.5) {
    // Rounding
    const num = randomInt(rng, 100, 10000 + difficulty * 5000);
    const places = pick(rng, difficulty >= 3 ? [100, 1000] : [10, 100]);
    const rounded = Math.round(num / places) * places;
    return intQ(`Round ${num} to the nearest ${places}`, rounded, "roundingPlaceValue");
  }
  // Place value: what digit is in the ___ place
  const num = randomInt(rng, 1000, 99999);
  const digits = String(num);
  const placeIndex = randomInt(rng, 0, digits.length - 1);
  const placeNames = ["ones", "tens", "hundreds", "thousands", "ten-thousands"];
  const placeName = placeNames[digits.length - 1 - placeIndex];
  const digit = parseInt(digits[placeIndex], 10);
  return intQ(`What digit is in the ${placeName} place of ${num}?`, digit, "roundingPlaceValue");
}

function counting(rng: Rng, difficulty: number): NumberSenseQuestion {
  const isOdd = rng() > 0.5;
  const start = randomInt(rng, 1, 20 + difficulty * 10);
  const end = start + randomInt(rng, 20, 50 + difficulty * 20);
  const label = isOdd ? "odd" : "even";

  let count = 0;
  for (let i = start; i <= end; i++) {
    if (isOdd ? i % 2 !== 0 : i % 2 === 0) count++;
  }
  return intQ(`How many ${label} numbers from ${start} to ${end}?`, count, "counting");
}

function orderOfOperations(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty >= 3 && rng() > 0.4) {
    // Distributive: a*b - a*c = a*(b-c)
    const a = randomInt(rng, 10, 50 + difficulty * 10);
    const b = randomInt(rng, 10, 30);
    const c = randomInt(rng, 1, b - 1);
    return intQ(`${a} \u00d7 ${b} \u2212 ${a} \u00d7 ${c}`, a * (b - c), "orderOfOperations");
  }
  // a + b * c
  const a = randomInt(rng, 2, 20 + difficulty * 5);
  const b = randomInt(rng, 2, 10);
  const c = randomInt(rng, 2, 10);
  return intQ(`${a} + ${b} \u00d7 ${c}`, a + b * c, "orderOfOperations");
}

function fractions(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty >= 4 && rng() > 0.5) {
    // Division by fraction: a ÷ (b/c) = a * c / b
    const c = randomInt(rng, 2, 10);
    const b = randomInt(rng, 1, c - 1 || 1);
    const a = randomInt(rng, 4, 30) * b; // ensure integer result
    const result = (a * c) / b;
    return intQ(`${a} \u00f7 ${b}/${c}`, result, "fractions");
  }
  // Same-denom add/sub
  const den = pick(rng, [4, 6, 8, 10, 12, 15, 20, 24]);
  const a = randomInt(rng, 1, den - 1);
  let b = randomInt(rng, 1, den - 1);
  if (rng() > 0.5 && a > b) {
    return fracQ(`${a}/${den} \u2212 ${b}/${den}`, a - b, den, "fractions");
  }
  if (a + b > den) b = den - a;
  return fracQ(`${a}/${den} + ${b}/${den}`, a + b, den, "fractions");
}

function mixedNumbers(rng: Rng, difficulty: number): NumberSenseQuestion {
  const den = pick(rng, [2, 3, 4, 5, 6, 8, 10]);
  const w1 = randomInt(rng, 1, 8 + difficulty);
  const n1 = randomInt(rng, 1, den - 1);
  const w2 = randomInt(rng, 1, Math.min(w1, 6));
  const n2 = randomInt(rng, 1, den - 1);

  const r1 = w1 * den + n1;
  const r2 = w2 * den + n2;

  if (rng() > 0.5 && r1 >= r2) {
    // Subtraction
    return fracQ(`${w1} ${n1}/${den} \u2212 ${w2} ${n2}/${den}`, r1 - r2, den, "mixedNumbers");
  }
  // Addition
  return fracQ(`${w1} ${n1}/${den} + ${w2} ${n2}/${den}`, r1 + r2, den, "mixedNumbers");
}

function percentConversion(rng: Rng, difficulty: number): NumberSenseQuestion {
  // Common percent <-> fraction pairs
  const pairs: [number, number, number][] = [
    [50, 1, 2], [25, 1, 4], [75, 3, 4], [20, 1, 5], [40, 2, 5],
    [60, 3, 5], [80, 4, 5], [10, 1, 10], [30, 3, 10], [70, 7, 10],
    [12, 3, 25], [16, 4, 25], [36, 9, 25], [56, 14, 25], [76, 19, 25],
  ];

  const harder: [number, number, number][] = [
    [33, 1, 3], [66, 2, 3], [87, 7, 8], [62, 5, 8], [37, 3, 8],
  ];

  const pool = difficulty >= 3 ? [...pairs, ...harder] : pairs;
  const [pct, num, den] = pick(rng, pool);

  if (rng() > 0.5) {
    // Percent to fraction
    return fracQ(`${pct}% as a fraction?`, num, den, "percentConversion");
  }
  // Fraction to percent
  return intQ(`${num}/${den} = ___% ?`, pct, "percentConversion");
}

function proportions(rng: Rng, difficulty: number): NumberSenseQuestion {
  const baseCost = randomInt(rng, 5, 20 + difficulty * 5);
  const baseQty = randomInt(rng, 3, 12);
  const factor = randomInt(rng, 2, 5);
  const targetQty = baseQty * factor;
  const totalCost = baseCost * factor;

  if (rng() > 0.5) {
    return intQ(
      `If ${baseQty} items cost $${baseCost}, how much do ${targetQty} items cost?`,
      totalCost, "proportions",
    );
  }
  const unitPrice = baseCost;
  const qty2 = randomInt(rng, 2, 8);
  return intQ(
    `If 1 item costs $${unitPrice}, how much do ${qty2} items cost?`,
    unitPrice * qty2, "proportions",
  );
}

function unitConversion(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, 2);
  switch (variant) {
    case 0: {
      // Minutes in fraction of hour
      const den = pick(rng, [2, 3, 4, 6, 12]);
      const num = randomInt(rng, 1, den - 1);
      const minutes = (num * 60) / den;
      return intQ(`${num}/${den} of an hour = ___ minutes`, minutes, "unitConversion");
    }
    case 1: {
      // Quarters in dollars
      const dollars = randomInt(rng, 1, 10 + difficulty * 3);
      const extraQuarters = randomInt(rng, 0, 3);
      const cents = dollars * 100 + extraQuarters * 25;
      const totalQuarters = cents / 25;
      const display = extraQuarters > 0
        ? `$${dollars}.${String(extraQuarters * 25).padStart(2, "0")}`
        : `$${dollars}.00`;
      return intQ(`${display} = ___ quarters`, totalQuarters, "unitConversion");
    }
    default: {
      // Inches in feet
      const feet = randomInt(rng, 2, 8 + difficulty);
      return intQ(`${feet} feet = ___ inches`, feet * 12, "unitConversion");
    }
  }
}

function primes(rng: Rng, difficulty: number): NumberSenseQuestion {
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const maxN = 40 + difficulty * 15;

  if (rng() > 0.5) {
    // Largest prime less than N
    const n = randomInt(rng, 20, maxN);
    let largest = 2;
    for (const p of smallPrimes) {
      if (p < n) largest = p;
      else break;
    }
    return intQ(`Largest prime less than ${n}?`, largest, "primes");
  }
  // Smallest prime greater than N
  const n = randomInt(rng, 10, maxN);
  let smallest = 97;
  for (const p of smallPrimes) {
    if (p > n) { smallest = p; break; }
  }
  return intQ(`Smallest prime greater than ${n}?`, smallest, "primes");
}

function lcmGcd(rng: Rng, difficulty: number): NumberSenseQuestion {
  const a = randomInt(rng, 4, 20 + difficulty * 5);
  const b = randomInt(rng, 4, 20 + difficulty * 5);

  if (rng() > 0.5) {
    const g = gcd(a, b);
    return intQ(`GCD of ${a} and ${b}?`, g, "lcmGcd");
  }
  const g = gcd(a, b);
  const lcm = (a * b) / g;
  return intQ(`LCM of ${a} and ${b}?`, lcm, "lcmGcd");
}

function squaresRootsPowers(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, 3);
  switch (variant) {
    case 0: {
      // Perfect square
      const base = randomInt(rng, 4, 15 + difficulty * 3);
      return intQ(`${base}\u00b2 = ?`, base * base, "squaresRootsPowers");
    }
    case 1: {
      // Square root of perfect square
      const root = randomInt(rng, 4, 15 + difficulty * 3);
      return intQ(`\u221a${root * root} = ?`, root, "squaresRootsPowers");
    }
    case 2: {
      // Power of 2
      const exp = randomInt(rng, 2, 6 + Math.min(difficulty, 4));
      return intQ(`2^${exp} = ?`, Math.pow(2, exp), "squaresRootsPowers");
    }
    default: {
      // Sum of squares: a² + b²
      const a = randomInt(rng, 3, 10 + difficulty);
      const b = randomInt(rng, 2, 8);
      return intQ(`${a}\u00b2 + ${b}\u00b2 = ?`, a * a + b * b, "squaresRootsPowers");
    }
  }
}

function geometry(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, difficulty >= 5 ? 3 : 2);
  switch (variant) {
    case 0: {
      // Rectangle perimeter -> area or vice versa
      const w = randomInt(rng, 3, 12 + difficulty * 2);
      const h = randomInt(rng, 3, 12 + difficulty * 2);
      if (rng() > 0.5) {
        return intQ(`Area of rectangle: ${w} \u00d7 ${h}?`, w * h, "geometry");
      }
      return intQ(`Perimeter of rectangle: ${w} by ${h}?`, 2 * (w + h), "geometry");
    }
    case 1: {
      // Triangle area
      const base = randomInt(rng, 4, 16 + difficulty * 2);
      const height = randomInt(rng, 2, 10 + difficulty) * 2; // even for integer area
      return intQ(`Area of triangle: base ${base}, height ${height}?`, (base * height) / 2, "geometry");
    }
    case 2: {
      // Square side from perimeter or area
      const side = randomInt(rng, 3, 15);
      if (rng() > 0.5) {
        return intQ(`Side of square with perimeter ${side * 4}?`, side, "geometry");
      }
      return intQ(`Side of square with area ${side * side}?`, side, "geometry");
    }
    default: {
      // Trapezoid area: (b1+b2)/2 * h
      const b1 = randomInt(rng, 4, 12);
      const b2 = randomInt(rng, 6, 16);
      const h = randomInt(rng, 2, 8) * 2; // even to make (b1+b2)*h/2 more likely integer
      const area = ((b1 + b2) * h) / 2;
      return intQ(`Area of trapezoid: bases ${b1} and ${b2}, height ${h}?`, area, "geometry");
    }
  }
}

function approximate(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty >= 5) {
    // Large multiplication
    const a = randomInt(rng, 100, 500);
    const b = randomInt(rng, 100, 900);
    const answer = a * b;
    return {
      text: `*${a} \u00d7 ${b} \u2248 ?`,
      answer: { num: answer, den: 1 },
      isApproximate: true,
      answerFormat: "integer",
      category: "approximate",
    };
  }
  // Large addition
  const count = randomInt(rng, 3, 4);
  const nums: number[] = [];
  for (let i = 0; i < count; i++) {
    nums.push(randomInt(rng, 100, 2000));
  }
  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    text: `*${nums.join(" + ")} \u2248 ?`,
    answer: { num: sum, den: 1 },
    isApproximate: true,
    answerFormat: "integer",
    category: "approximate",
  };
}

function romanNumerals(rng: Rng, difficulty: number): NumberSenseQuestion {
  const romanValues: [string, number][] = [
    ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400],
    ["C", 100], ["XC", 90], ["L", 50], ["XL", 40],
    ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
  ];

  function toRoman(n: number): string {
    let result = "";
    let remaining = n;
    for (const [sym, val] of romanValues) {
      while (remaining >= val) {
        result += sym;
        remaining -= val;
      }
    }
    return result;
  }

  const max = difficulty >= 4 ? 2000 : difficulty >= 3 ? 500 : 100;
  const value = randomInt(rng, 1, max);
  const roman = toRoman(value);

  if (rng() > 0.5) {
    return intQ(`${roman} = ?`, value, "romanNumerals");
  }
  // Show number, ask for roman -> integer answer (since we only accept numbers)
  // Instead, always do roman -> arabic for clarity
  return intQ(`${roman} = ?`, value, "romanNumerals");
}

function baseConversion(rng: Rng, difficulty: number): NumberSenseQuestion {
  const base = pick(rng, [2, 8]);
  const value = randomInt(rng, 4, 30 + difficulty * 10);

  if (base === 2) {
    const binary = value.toString(2);
    if (rng() > 0.5) {
      return intQ(`${binary} (base 2) = ? (base 10)`, value, "baseConversion");
    }
    return intQ(`${value} (base 10) = ? (base 2)`, parseInt(binary, 10), "baseConversion");
  }
  const octal = value.toString(8);
  return intQ(`${octal} (base 8) = ? (base 10)`, value, "baseConversion");
}

function negativeArithmetic(rng: Rng, difficulty: number): NumberSenseQuestion {
  const a = randomInt(rng, -30 - difficulty * 5, -1);
  const b = randomInt(rng, -20 - difficulty * 5, 20 + difficulty * 5);
  const ops = ["+", "\u2212", "\u00d7"] as const;
  const op = pick(rng, ops);

  let answer: number;
  let text: string;
  switch (op) {
    case "+":
      answer = a + b;
      text = `(${a}) + (${b})`;
      break;
    case "\u2212":
      answer = a - b;
      text = `(${a}) \u2212 (${b})`;
      break;
    default:
      answer = a * b;
      text = `(${a}) \u00d7 (${b})`;
      break;
  }
  return intQ(text, answer, "negativeArithmetic");
}

// --- Generator registry ---

export const GENERATORS: GeneratorEntry[] = [
  { id: "addition", minDifficulty: 1, generate: addition },
  { id: "subtraction", minDifficulty: 1, generate: subtraction },
  { id: "multiplication", minDifficulty: 1, generate: multiplication },
  { id: "division", minDifficulty: 1, generate: division },
  { id: "multiplyTricks", minDifficulty: 1, generate: multiplyTricks },
  { id: "roundingPlaceValue", minDifficulty: 2, generate: roundingPlaceValue },
  { id: "remainder", minDifficulty: 2, generate: remainder },
  { id: "counting", minDifficulty: 2, generate: counting },
  { id: "differenceOfSquares", minDifficulty: 2, generate: differenceOfSquares },
  { id: "romanNumerals", minDifficulty: 2, generate: romanNumerals },
  { id: "orderOfOperations", minDifficulty: 3, generate: orderOfOperations },
  { id: "fractions", minDifficulty: 3, generate: fractions },
  { id: "percentConversion", minDifficulty: 3, generate: percentConversion },
  { id: "proportions", minDifficulty: 3, generate: proportions },
  { id: "unitConversion", minDifficulty: 3, generate: unitConversion },
  { id: "primes", minDifficulty: 3, generate: primes },
  { id: "lcmGcd", minDifficulty: 3, generate: lcmGcd },
  { id: "mixedNumbers", minDifficulty: 4, generate: mixedNumbers },
  { id: "squaresRootsPowers", minDifficulty: 4, generate: squaresRootsPowers },
  { id: "geometry", minDifficulty: 4, generate: geometry },
  { id: "approximate", minDifficulty: 2, generate: approximate },
  { id: "baseConversion", minDifficulty: 5, generate: baseConversion },
  { id: "negativeArithmetic", minDifficulty: 5, generate: negativeArithmetic },
];

export function pickAndGenerate(rng: Rng, difficulty: number): NumberSenseQuestion {
  const eligible = GENERATORS.filter((g) => g.minDifficulty <= difficulty);
  const chosen = pick(rng, eligible);
  return chosen.generate(rng, difficulty);
}
