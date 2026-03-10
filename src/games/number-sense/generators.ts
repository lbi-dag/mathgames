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
    const diff = a - b;
    return intQ(`${a} \u2212 ___ = ${diff}`, b, "subtraction");
  }
  return intQ(`${a} \u2212 ${b}`, a - b, "subtraction");
}

function multiplication(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (rng() > 0.7) {
    const a = randomInt(rng, 2, 11);
    const b = randomInt(rng, 2, 9);
    const c = randomInt(rng, 2, 5 + difficulty);
    return intQ(`${a} \u00d7 ${b} \u00d7 ${c}`, a * b * c, "multiplication");
  }
  if (difficulty <= 2) {
    const a = randomInt(rng, 2, 9);
    const b = randomInt(rng, 10, 50 + difficulty * 30);
    return intQ(`${a} \u00d7 ${b}`, a * b, "multiplication");
  }
  const a = randomInt(rng, 11, 20 + difficulty * 8);
  const b = randomInt(rng, 11, 20 + difficulty * 8);
  return intQ(`${a} \u00d7 ${b}`, a * b, "multiplication");
}

function multiplyTricks(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, 5);
  switch (variant) {
    case 0: {
      const a = randomInt(rng, 11, 30 + difficulty * 15);
      return intQ(`${a} \u00d7 11`, a * 11, "multiplyTricks");
    }
    case 1: {
      const a = randomInt(rng, 4, 20 + difficulty * 8);
      return intQ(`${a} \u00d7 25`, a * 25, "multiplyTricks");
    }
    case 2: {
      const a = randomInt(rng, 4, 20 + difficulty * 8);
      return intQ(`${a} \u00d7 50`, a * 50, "multiplyTricks");
    }
    case 3: {
      const base = pick(rng, [99, 101, 102]);
      const b = randomInt(rng, 10, 30 + difficulty * 10);
      return intQ(`${base} \u00d7 ${b}`, base * b, "multiplyTricks");
    }
    case 4: {
      const a = randomInt(rng, 10, 50 + difficulty * 15);
      return intQ(`${a} \u00d7 111`, a * 111, "multiplyTricks");
    }
    default: {
      const a = randomInt(rng, 4, 20 + difficulty * 8);
      return intQ(`${a} \u00d7 75`, a * 75, "multiplyTricks");
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
  if (difficulty >= 4 && rng() > 0.5) {
    const c = pick(rng, [3, 4, 5, 7, 8, 9]);
    const a = randomInt(rng, 10, 50);
    const b = randomInt(rng, 10, 60);
    const product = a * b;
    const rem = product % c;
    return intQ(`(${a} \u00d7 ${b}) \u00f7 ${c}, remainder?`, rem, "remainder");
  }
  const divisor = pick(rng, [3, 4, 5, 6, 7, 8, 9]);
  const quotient = randomInt(rng, 100, 1000 + difficulty * 2000);
  const rem = randomInt(rng, 1, divisor - 1);
  const dividend = divisor * quotient + rem;
  return intQ(`${dividend} \u00f7 ${divisor}, remainder?`, rem, "remainder");
}

function roundingPlaceValue(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (rng() > 0.5) {
    const num = randomInt(rng, 100, 10000 + difficulty * 5000);
    const places = pick(rng, difficulty >= 3 ? [100, 1000] : [10, 100]);
    const rounded = Math.round(num / places) * places;
    return intQ(`Round ${num} to the nearest ${places}`, rounded, "roundingPlaceValue");
  }
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
    const a = randomInt(rng, 10, 50 + difficulty * 10);
    const b = randomInt(rng, 10, 30);
    const c = randomInt(rng, 1, b - 1);
    return intQ(`${a} \u00d7 ${b} \u2212 ${a} \u00d7 ${c}`, a * (b - c), "orderOfOperations");
  }
  const a = randomInt(rng, 2, 20 + difficulty * 5);
  const b = randomInt(rng, 2, 10);
  const c = randomInt(rng, 2, 10);
  return intQ(`${a} + ${b} \u00d7 ${c}`, a + b * c, "orderOfOperations");
}

function fractions(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty >= 4 && rng() > 0.5) {
    const c = randomInt(rng, 2, 10);
    const b = randomInt(rng, 1, c - 1 || 1);
    const a = randomInt(rng, 4, 30) * b;
    const result = (a * c) / b;
    return intQ(`${a} \u00f7 ${b}/${c}`, result, "fractions");
  }
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

  if (difficulty >= 4 && rng() > 0.6) {
    const whole = randomInt(rng, 2, 10);
    const product = r1 * whole;
    return fracQ(`${w1} ${n1}/${den} \u00d7 ${whole}`, product, den, "mixedNumbers");
  }
  if (rng() > 0.5 && r1 >= r2) {
    return fracQ(`${w1} ${n1}/${den} \u2212 ${w2} ${n2}/${den}`, r1 - r2, den, "mixedNumbers");
  }
  return fracQ(`${w1} ${n1}/${den} + ${w2} ${n2}/${den}`, r1 + r2, den, "mixedNumbers");
}

function percentConversion(rng: Rng, difficulty: number): NumberSenseQuestion {
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
    return fracQ(`${pct}% as a fraction?`, num, den, "percentConversion");
  }
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
  const variant = randomInt(rng, 0, difficulty >= 3 ? 4 : 2);
  switch (variant) {
    case 0: {
      const den = pick(rng, [2, 3, 4, 6, 12]);
      const num = randomInt(rng, 1, den - 1);
      const minutes = (num * 60) / den;
      return intQ(`${num}/${den} of an hour = ___ minutes`, minutes, "unitConversion");
    }
    case 1: {
      const dollars = randomInt(rng, 1, 10 + difficulty * 3);
      const extraQuarters = randomInt(rng, 0, 3);
      const cents = dollars * 100 + extraQuarters * 25;
      const totalQuarters = cents / 25;
      const display = extraQuarters > 0
        ? `$${dollars}.${String(extraQuarters * 25).padStart(2, "0")}`
        : `$${dollars}.00`;
      return intQ(`${display} = ___ quarters`, totalQuarters, "unitConversion");
    }
    case 2: {
      const feet = randomInt(rng, 2, 8 + difficulty);
      return intQ(`${feet} feet = ___ inches`, feet * 12, "unitConversion");
    }
    case 3: {
      const years = randomInt(rng, 2, 15 + difficulty);
      return intQ(`${years} years = ___ months`, years * 12, "unitConversion");
    }
    default: {
      const minutes = randomInt(rng, 2, 10);
      return intQ(`${minutes * 60} seconds = ___ minutes`, minutes, "unitConversion");
    }
  }
}

function primes(rng: Rng, difficulty: number): NumberSenseQuestion {
  const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  const variant = randomInt(rng, 0, difficulty >= 4 ? 2 : 1);
  if (variant === 0) {
    const maxN = 40 + difficulty * 15;
    const n = randomInt(rng, 20, maxN);
    let largest = 2;
    for (const p of smallPrimes) {
      if (p < n) largest = p;
      else break;
    }
    return intQ(`Largest prime less than ${n}?`, largest, "primes");
  }
  if (variant === 1) {
    const maxN = 40 + difficulty * 15;
    const n = randomInt(rng, 10, maxN);
    let smallest = 97;
    for (const p of smallPrimes) {
      if (p > n) { smallest = p; break; }
    }
    return intQ(`Smallest prime greater than ${n}?`, smallest, "primes");
  }
  const base = randomInt(rng, 20, 80 + difficulty * 10);
  let largest = 1;
  let remaining = base;
  for (const p of smallPrimes) {
    while (remaining % p === 0) {
      largest = p;
      remaining = remaining / p;
    }
    if (remaining === 1) break;
  }
  if (remaining > 1) largest = remaining;
  return intQ(`Largest prime factor of ${base}?`, largest, "primes");
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
      const base = randomInt(rng, 4, 15 + difficulty * 3);
      return intQ(`${base}\u00b2 = ?`, base * base, "squaresRootsPowers");
    }
    case 1: {
      const root = randomInt(rng, 4, 15 + difficulty * 3);
      return intQ(`\u221a${root * root} = ?`, root, "squaresRootsPowers");
    }
    case 2: {
      const exp = randomInt(rng, 2, 6 + Math.min(difficulty, 4));
      return intQ(`2^${exp} = ?`, Math.pow(2, exp), "squaresRootsPowers");
    }
    default: {
      const a = randomInt(rng, 3, 10 + difficulty);
      const b = randomInt(rng, 2, 8);
      return intQ(`${a}\u00b2 + ${b}\u00b2 = ?`, a * a + b * b, "squaresRootsPowers");
    }
  }
}

function geometry(rng: Rng, difficulty: number): NumberSenseQuestion {
  const maxVariant = difficulty >= 5 ? 7 : difficulty >= 4 ? 5 : 2;
  const variant = randomInt(rng, 0, maxVariant);
  switch (variant) {
    case 0: {
      const w = randomInt(rng, 3, 12 + difficulty * 2);
      const h = randomInt(rng, 3, 12 + difficulty * 2);
      if (rng() > 0.5) {
        return intQ(`Area of rectangle: ${w} \u00d7 ${h}?`, w * h, "geometry");
      }
      return intQ(`Perimeter of rectangle: ${w} by ${h}?`, 2 * (w + h), "geometry");
    }
    case 1: {
      const base = randomInt(rng, 4, 16 + difficulty * 2);
      const height = randomInt(rng, 2, 10 + difficulty) * 2;
      return intQ(`Area of triangle: base ${base}, height ${height}?`, (base * height) / 2, "geometry");
    }
    case 2: {
      const side = randomInt(rng, 3, 15);
      if (rng() > 0.5) {
        return intQ(`Side of square with perimeter ${side * 4}?`, side, "geometry");
      }
      return intQ(`Side of square with area ${side * side}?`, side, "geometry");
    }
    case 3: {
      const b1 = randomInt(rng, 4, 12);
      const b2 = randomInt(rng, 6, 16);
      const h = randomInt(rng, 2, 8) * 2;
      const area = ((b1 + b2) * h) / 2;
      return intQ(`Area of trapezoid: bases ${b1} and ${b2}, height ${h}?`, area, "geometry");
    }
    case 4: {
      const side = randomInt(rng, 5, 20);
      return intQ(`Perimeter of equilateral triangle with side ${side}?`, side * 3, "geometry");
    }
    case 5: {
      const r = randomInt(rng, 3, 12);
      const areaCoeff = r * r;
      return intQ(`Diameter of circle with area ${areaCoeff}\u03c0?`, 2 * r, "geometry");
    }
    case 6: {
      const d = randomInt(rng, 4, 16) * 2;
      return intQ(`Area of square with diagonal ${d}?`, (d * d) / 2, "geometry");
    }
    default: {
      const l = randomInt(rng, 3, 12);
      const w = randomInt(rng, 3, 12);
      const h = randomInt(rng, 2, 8);
      return intQ(`Volume: ${l} \u00d7 ${w} \u00d7 ${h}?`, l * w * h, "geometry");
    }
  }
}

function approximate(rng: Rng, difficulty: number): NumberSenseQuestion {
  const maxVariant = difficulty >= 5 ? 3 : difficulty >= 3 ? 2 : 1;
  const variant = randomInt(rng, 0, maxVariant);
  switch (variant) {
    case 0: {
      const a = randomInt(rng, 100, 500 + difficulty * 100);
      const b = randomInt(rng, 10, 500 + difficulty * 100);
      return intQ(`*${a} \u00d7 ${b} \u2248 ?`, a * b, "approximate", true);
    }
    case 1: {
      const count = randomInt(rng, 3, 4);
      const nums: number[] = [];
      for (let i = 0; i < count; i++) {
        nums.push(randomInt(rng, 100, 2000 + difficulty * 500));
      }
      const sum = nums.reduce((a, b) => a + b, 0);
      return intQ(`*${nums.join(" + ")} \u2248 ?`, sum, "approximate", true);
    }
    case 2: {
      const a = randomInt(rng, 50, 200);
      const b = randomInt(rng, 10, 30);
      const c = randomInt(rng, 5, 15);
      const d = randomInt(rng, 100, 300);
      return intQ(`*${a} \u00d7 ${b} + ${c} \u00d7 ${d} \u2248 ?`, a * b + c * d, "approximate", true);
    }
    default: {
      const a = randomInt(rng, 8, 20);
      const b = randomInt(rng, 8, 15);
      return intQ(`*${a}\u00b2 \u00d7 ${b}\u00b2 \u2248 ?`, a * a * b * b, "approximate", true);
    }
  }
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
  return intQ(`${roman} = ?`, value, "romanNumerals");
}

function baseConversion(rng: Rng, difficulty: number): NumberSenseQuestion {
  const base = pick(rng, difficulty >= 5 ? [2, 4, 6, 8] : [2, 8]);
  const value = randomInt(rng, 4, 30 + difficulty * 10);
  if (base === 2) {
    const binary = value.toString(2);
    if (rng() > 0.5) {
      return intQ(`${binary} (base 2) = ? (base 10)`, value, "baseConversion");
    }
    return intQ(`${value} (base 10) = ? (base 2)`, parseInt(binary, 10), "baseConversion");
  }
  const converted = value.toString(base);
  return intQ(`${converted} (base ${base}) = ? (base 10)`, value, "baseConversion");
}

function negativeArithmetic(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (rng() > 0.8) {
    const den = pick(rng, [2, 3, 4, 5, 7, 8]);
    const num = randomInt(rng, 1, den - 1);
    const sign = rng() > 0.5 ? -1 : 1;
    const displayNum = sign * num;
    return fracQ(`Additive inverse of ${displayNum}/${den}?`, -displayNum, den, "negativeArithmetic");
  }
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

// --- New generators ---

function seriesSum(rng: Rng, difficulty: number): NumberSenseQuestion {
  if (difficulty >= 3 && rng() > 0.5) {
    const step = pick(rng, [2, 3, 4, 5]);
    const start = randomInt(rng, 2, 20) * step;
    const count = randomInt(rng, 3, 5);
    const nums: number[] = [];
    for (let i = 0; i < count; i++) nums.push(start + i * step);
    const sum = nums.reduce((a, b) => a + b, 0);
    return intQ(nums.join(" + "), sum, "seriesSum");
  }
  const a = randomInt(rng, 1, 5);
  const b = a + randomInt(rng, 4, 6 + difficulty * 2);
  const count = b - a + 1;
  const sum = (count * (a + b)) / 2;
  return intQ(`${a} + ${a + 1} + ${a + 2} + . . . + ${b}`, sum, "seriesSum");
}

function expandedNotation(rng: Rng, difficulty: number): NumberSenseQuestion {
  const numDigits = randomInt(rng, 3, Math.min(5, 3 + difficulty));
  const parts: string[] = [];
  let value = 0;
  const placeValues = [1, 10, 100, 1000, 10000];
  for (let i = numDigits - 1; i >= 0; i--) {
    const d = i === numDigits - 1 ? randomInt(rng, 1, 9) : randomInt(rng, 0, 9);
    parts.push(`${d} \u00d7 ${placeValues[i]}`);
    value += d * placeValues[i];
  }
  return intQ(parts.join(" + "), value, "expandedNotation");
}

function fractionComparison(rng: Rng, _difficulty: number): NumberSenseQuestion {
  const denOptions = [3, 4, 5, 6, 7, 8, 10, 12, 13];
  const den1 = pick(rng, denOptions);
  const num1 = randomInt(rng, 1, den1 - 1);
  const den2 = pick(rng, denOptions.filter(d => d !== den1));
  let num2 = randomInt(rng, 1, den2 - 1);
  if (num1 * den2 === num2 * den1) {
    num2 = num2 > 1 ? num2 - 1 : num2 + 1;
    if (num2 >= den2) num2 = den2 - 1;
  }
  const isFirstLarger = num1 * den2 > num2 * den1;
  const largerNum = isFirstLarger ? num1 : num2;
  const largerDen = isFirstLarger ? den1 : den2;
  return fracQ(
    `Which is larger: ${num1}/${den1} or ${num2}/${den2}?`,
    largerNum, largerDen, "fractionComparison",
  );
}

function algebraSubstitution(rng: Rng, difficulty: number): NumberSenseQuestion {
  const x = randomInt(rng, 2, 8 + difficulty);
  const variant = randomInt(rng, 0, difficulty >= 5 ? 2 : 1);
  switch (variant) {
    case 0: {
      const a = randomInt(rng, 5, 20);
      const b = randomInt(rng, 2, 8);
      return intQ(`If x = ${x}, then ${a} + ${b}x = ?`, a + b * x, "algebraSubstitution");
    }
    case 1: {
      const a = randomInt(rng, 3, 10);
      const b = randomInt(rng, 1, 15);
      return intQ(`If x = ${x}, then ${a}x \u2212 ${b} = ?`, a * x - b, "algebraSubstitution");
    }
    default: {
      const a = randomInt(rng, 1, 3);
      const b = randomInt(rng, 1, 10);
      return intQ(`If x = ${x}, then ${a}x\u00b2 + ${b} = ?`, a * x * x + b, "algebraSubstitution");
    }
  }
}

function decimalToFraction(rng: Rng, difficulty: number): NumberSenseQuestion {
  const basicPairs: [string, number, number][] = [
    [".5", 1, 2], [".25", 1, 4], [".75", 3, 4],
    [".2", 1, 5], [".4", 2, 5], [".6", 3, 5], [".8", 4, 5],
    [".1", 1, 10], [".3", 3, 10], [".7", 7, 10], [".9", 9, 10],
  ];
  const hardPairs: [string, number, number][] = [
    [".125", 1, 8], [".375", 3, 8], [".625", 5, 8], [".875", 7, 8],
    [".12", 3, 25], [".16", 4, 25], [".24", 6, 25], [".36", 9, 25],
    [".44", 11, 25], [".52", 13, 25], [".56", 14, 25], [".64", 16, 25],
    [".68", 17, 25], [".72", 18, 25], [".76", 19, 25], [".84", 21, 25],
    [".88", 22, 25], [".92", 23, 25], [".96", 24, 25],
  ];
  const pool = difficulty >= 5 ? [...basicPairs, ...hardPairs] : basicPairs;
  const [decimal, num, den] = pick(rng, pool);
  return fracQ(`${decimal} = ? (as a fraction)`, num, den, "decimalToFraction");
}

function triangleAngleSum(rng: Rng, _difficulty: number): NumberSenseQuestion {
  const a = randomInt(rng, 15, 80);
  const b = randomInt(rng, 15, 160 - a);
  const c = 180 - a - b;
  return intQ(
    `Two angles of a triangle are ${a}\u00b0 and ${b}\u00b0. Third angle?`,
    c, "triangleAngleSum",
  );
}

function sequences(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, difficulty >= 5 ? 2 : 1);
  switch (variant) {
    case 0: {
      const a = randomInt(rng, 2, 20);
      const d = randomInt(rng, 3, 10 + difficulty * 2);
      const terms = Array.from({ length: 6 }, (_, i) => a + i * d);
      const pos = randomInt(rng, 2, 4);
      const answer = terms[pos];
      const display = terms.map((t, i) => i === pos ? "k" : String(t));
      return intQ(`${display.join(", ")}, . . . k = ?`, answer, "sequences");
    }
    case 1: {
      const a = pick(rng, [2, 3, 4, 5]);
      const terms = Array.from({ length: 6 }, (_, i) => a * (i + 1) * (i + 1));
      const pos = randomInt(rng, 2, 4);
      const answer = terms[pos];
      const display = terms.map((t, i) => i === pos ? "k" : String(t));
      return intQ(`${display.join(", ")}, . . . k = ?`, answer, "sequences");
    }
    default: {
      const base = pick(rng, [2, 3]);
      const terms = Array.from({ length: 6 }, (_, i) => Math.pow(base, i + 1));
      const pos = randomInt(rng, 2, 4);
      const answer = terms[pos];
      const display = terms.map((t, i) => i === pos ? "k" : String(t));
      return intQ(`${display.join(", ")}, . . . k = ?`, answer, "sequences");
    }
  }
}

function probability(rng: Rng, _difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, 2);
  switch (variant) {
    case 0: {
      const targets: [string, number][] = [
        ["a red ace", 2], ["a king", 4], ["a heart", 13],
        ["a face card", 12], ["a red card", 26], ["a black queen", 2],
        ["a diamond", 13], ["an ace", 4], ["a club", 13],
      ];
      const [desc, favorable] = pick(rng, targets);
      const g = gcd(favorable, 52);
      return fracQ(
        `Probability of drawing ${desc} from a 52-card deck?`,
        favorable / g, 52 / g, "probability",
      );
    }
    case 1: {
      const targets: [string, number][] = [
        ["an even number", 3], ["an odd number", 3],
        ["a number greater than 4", 2], ["a 6", 1],
        ["a number less than 3", 2], ["a prime number", 3],
      ];
      const [desc, favorable] = pick(rng, targets);
      const g = gcd(favorable, 6);
      return fracQ(
        `Probability of rolling ${desc} on a standard die?`,
        favorable / g, 6 / g, "probability",
      );
    }
    default: {
      const n = randomInt(rng, 2, 4);
      const total = Math.pow(2, n);
      return fracQ(
        `Probability of ${n} heads in a row with a fair coin?`,
        1, total, "probability",
      );
    }
  }
}

function percentWordProblem(rng: Rng, difficulty: number): NumberSenseQuestion {
  const variant = randomInt(rng, 0, 2);
  switch (variant) {
    case 0: {
      const pctA = pick(rng, [10, 15, 18, 20, 25, 30]);
      const multiplier = randomInt(rng, 2, 4);
      const pctB = pctA * multiplier;
      const z = randomInt(rng, 10, 60);
      const answer = z * multiplier;
      return intQ(`${pctA}% of what = ${pctB}% of ${z}?`, answer, "percentWordProblem");
    }
    case 1: {
      const pct = pick(rng, [10, 20, 25, 50, 75]);
      const factor = 100 / gcd(pct, 100);
      const base = randomInt(rng, 2, 10 + difficulty) * factor;
      const answer = (pct * base) / 100;
      return intQ(`What is ${pct}% of ${base}?`, answer, "percentWordProblem");
    }
    default: {
      const pct = pick(rng, [10, 20, 25, 30, 40, 50, 60, 75, 80]);
      const factor = 100 / gcd(pct, 100);
      const base = randomInt(rng, 2, 8 + difficulty) * factor;
      const part = (pct * base) / 100;
      return intQ(`${part} is what percent of ${base}?`, pct, "percentWordProblem");
    }
  }
}

function inequalities(rng: Rng, _difficulty: number): NumberSenseQuestion {
  const a = randomInt(rng, 2, 6);
  const answer = randomInt(rng, 5, 25);
  const b = randomInt(rng, 3, 20);
  const c = a * answer - b;
  return intQ(`If ${a}x \u2212 ${b} < ${c}, then x < ?`, answer, "inequalities");
}

function numberLineDistance(rng: Rng, difficulty: number): NumberSenseQuestion {
  const a = -randomInt(rng, 1, 30 + difficulty * 5);
  const b = randomInt(rng, 1, 30 + difficulty * 5);
  return intQ(`Distance from ${a} to ${b} on the number line?`, Math.abs(b - a), "numberLineDistance");
}

// --- Generator registry ---

export const GENERATORS: GeneratorEntry[] = [
  { id: "addition", minDifficulty: 1, generate: addition },
  { id: "subtraction", minDifficulty: 1, generate: subtraction },
  { id: "multiplication", minDifficulty: 1, generate: multiplication },
  { id: "division", minDifficulty: 1, generate: division },
  { id: "multiplyTricks", minDifficulty: 1, generate: multiplyTricks },
  { id: "seriesSum", minDifficulty: 1, generate: seriesSum },
  { id: "expandedNotation", minDifficulty: 1, generate: expandedNotation },
  { id: "roundingPlaceValue", minDifficulty: 2, generate: roundingPlaceValue },
  { id: "remainder", minDifficulty: 2, generate: remainder },
  { id: "counting", minDifficulty: 2, generate: counting },
  { id: "differenceOfSquares", minDifficulty: 2, generate: differenceOfSquares },
  { id: "romanNumerals", minDifficulty: 2, generate: romanNumerals },
  { id: "approximate", minDifficulty: 2, generate: approximate },
  { id: "orderOfOperations", minDifficulty: 3, generate: orderOfOperations },
  { id: "fractions", minDifficulty: 3, generate: fractions },
  { id: "percentConversion", minDifficulty: 3, generate: percentConversion },
  { id: "proportions", minDifficulty: 3, generate: proportions },
  { id: "unitConversion", minDifficulty: 3, generate: unitConversion },
  { id: "primes", minDifficulty: 3, generate: primes },
  { id: "lcmGcd", minDifficulty: 3, generate: lcmGcd },
  { id: "fractionComparison", minDifficulty: 3, generate: fractionComparison },
  { id: "mixedNumbers", minDifficulty: 4, generate: mixedNumbers },
  { id: "squaresRootsPowers", minDifficulty: 4, generate: squaresRootsPowers },
  { id: "geometry", minDifficulty: 4, generate: geometry },
  { id: "algebraSubstitution", minDifficulty: 4, generate: algebraSubstitution },
  { id: "decimalToFraction", minDifficulty: 4, generate: decimalToFraction },
  { id: "triangleAngleSum", minDifficulty: 4, generate: triangleAngleSum },
  { id: "sequences", minDifficulty: 4, generate: sequences },
  { id: "baseConversion", minDifficulty: 5, generate: baseConversion },
  { id: "negativeArithmetic", minDifficulty: 5, generate: negativeArithmetic },
  { id: "probability", minDifficulty: 5, generate: probability },
  { id: "percentWordProblem", minDifficulty: 5, generate: percentWordProblem },
  { id: "inequalities", minDifficulty: 5, generate: inequalities },
  { id: "numberLineDistance", minDifficulty: 5, generate: numberLineDistance },
];

export function pickAndGenerate(rng: Rng, difficulty: number): NumberSenseQuestion {
  const eligible = GENERATORS.filter((g) => g.minDifficulty <= difficulty);
  const chosen = pick(rng, eligible);
  return chosen.generate(rng, difficulty);
}

// --- Exam set generation ---

function getDifficultyForExamPosition(index: number, total: number): number {
  const fraction = index / total;
  if (fraction < 0.125) return 1;
  if (fraction < 0.25) return 2;
  if (fraction < 0.5) return 3;
  if (fraction < 0.75) return 4;
  if (fraction < 0.875) return 5;
  return 6;
}

export function generateExamSet(
  rng: Rng,
  totalQuestions: number,
): { question: NumberSenseQuestion; difficulty: number }[] {
  const approxIndices = new Set<number>();
  for (let i = 9; i < totalQuestions; i += 10) {
    approxIndices.add(i);
  }

  const results: { question: NumberSenseQuestion; difficulty: number }[] = [];
  let lastCategory = "";
  let secondLastCategory = "";
  const categoryCounts = new Map<string, number>();

  for (let i = 0; i < totalQuestions; i++) {
    const difficulty = getDifficultyForExamPosition(i, totalQuestions);

    if (approxIndices.has(i)) {
      const q = approximate(rng, difficulty);
      results.push({ question: q, difficulty });
      secondLastCategory = lastCategory;
      lastCategory = "approximate";
      continue;
    }

    // Eligible generators: right difficulty, not approximate, not same as last two
    const eligible = GENERATORS.filter(
      (g) =>
        g.minDifficulty <= difficulty &&
        g.id !== "approximate" &&
        g.id !== lastCategory &&
        g.id !== secondLastCategory,
    );

    // Weighted selection: underrepresented categories get higher weight
    const totalSoFar = Math.max(1, results.length);
    const avgCount = totalSoFar / Math.max(1, categoryCounts.size);
    const weighted: { generator: GeneratorEntry; weight: number }[] = eligible.map((g) => {
      const count = categoryCounts.get(g.id) ?? 0;
      const weight = count >= avgCount + 1 ? 1 : 3;
      return { generator: g, weight };
    });

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let roll = rng() * totalWeight;
    let chosen = weighted[0].generator;
    for (const w of weighted) {
      roll -= w.weight;
      if (roll <= 0) {
        chosen = w.generator;
        break;
      }
    }

    const q = chosen.generate(rng, difficulty);
    results.push({ question: q, difficulty });
    categoryCounts.set(chosen.id, (categoryCounts.get(chosen.id) ?? 0) + 1);
    secondLastCategory = lastCategory;
    lastCategory = chosen.id;
  }

  return results;
}
