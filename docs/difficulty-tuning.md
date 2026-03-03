# Difficulty Tuning Guide

Reference for developers calibrating difficulty across all games. Covers the shared engine ramp, per-game scaling formulas, and practical tuning knobs.

## Engine-Level Difficulty Ramp

All games share the same difficulty advancement system in `src/game-shell/difficulty.ts`.

- **Starting level**: 1 (no game currently overrides `initialDifficulty`)
- **Level-up trigger**: After every 2–3 consecutive correct answers (threshold chosen randomly per step via seeded RNG)
- **No level cap**: The engine imposes no maximum — games are responsible for clamping or saturating internally
- **No level-down**: Difficulty never decreases within a run, even on wrong answers

### Progression Example

| Total Correct | Approx. Level | Notes |
|---|---|---|
| 0 | 1 | Start of run |
| 2–3 | 2 | First level-up |
| 4–6 | 3 | |
| 7–9 | 4 | |
| 10–12 | 5 | |

Exact thresholds vary per run because each step randomly requires 2 or 3 correct answers.

## Per-Game Difficulty Scaling

### Speed Arithmetic

**Source**: `src/games/speed-arithmetic/logic.ts`
**Max difficulty**: 6 (clamped internally)

Four question types are chosen at random with equal probability: `add`, `sub`, `mul1`, `mul2`.

#### Operand Ranges by Level

| Level | add / sub | mul1 (single×single) | mul2 (multi×single) |
|---|---|---|---|
| 1 | 10–99 | 2–9 | 10–99 × 2–9 |
| 2 | 18–124 | 3–11 | 22–121 × 3–10 |
| 3 | 26–149 | 4–13 | 34–143 × 4–11 |
| 4 | 34–174 | 5–15 | 46–165 × 5–12 |
| 5 | 42–199 | 6–17 | 58–187 × 5–13 |
| 6 | 50–224 | 6–17 | 70–209 × 5–14 |

**Formulas**:
- `add/sub`: min = 10 + (L-1)×8, max = 99 + (L-1)×25
- `mul1`: min = 2 + min(L-1, 4), max = 9 + min((L-1)×2, 8)
- `mul2` first operand: min = 10 + (L-1)×12, max = 99 + (L-1)×22
- `mul2` second operand: min = 2 + min(L-1, 3), max = 9 + min(L-1, 5)

**Tuning knobs**: The linear coefficients (8, 25, 12, 22) in the range formulas and the `MAX_DIFFICULTY` cap.

**Saturation**: All ranges plateau at level 6. Levels 7+ produce identical questions to level 6.

---

### Factor Rush

**Source**: `src/games/factor-rush/logic.ts`

Players pick 3 prime factors from a grid of primes under 50: `[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]` (15 primes total).

#### Prime Pool Size by Level

| Level | Pool Size | Available Primes | Largest Possible Product |
|---|---|---|---|
| 1 | 5 | 2, 3, 5, 7, 11 | 5 × 7 × 11 = 385 |
| 2 | 7 | …through 17 | 11 × 13 × 17 = 2,431 |
| 3 | 9 | …through 23 | 17 × 19 × 23 = 7,429 |
| 4 | 11 | …through 31 | 23 × 29 × 31 = 20,677 |
| 5 | 13 | …through 41 | 31 × 37 × 41 = 46,957 |
| 6+ | 15 (all) | …through 47 | 37 × 43 × 47 = 74,863 |

**Formula**: `poolSize = min(15, 5 + (L-1) × 2)`

**Tuning knobs**: The base pool size (5), step size (2), and the prime list itself.

**Saturation**: At level 6 the full prime set is available. Levels 7+ are identical to level 6. Products stay under 10,000 through level 3.

---

### Power Blitz

**Source**: `src/games/power-blitz/logic.ts`

Players compute base^exponent. Bases range 2–9, answers capped at 10,000.

#### Max Exponent by Level

| Level | Max Exponent | Example Hardest Question | Answer |
|---|---|---|---|
| 1–2 | 3 | 9³ | 729 |
| 3 | 4 | 9⁴ | 6,561 |
| 4 | 5 | 6⁵ | 7,776 |
| 5–6 | 6 | 4⁶ | 4,096 |
| 7 | 7 | 3⁷ | 2,187 |
| 8 | 8 | 3⁸ | 6,561 |
| 9+ | 9 | 2⁹ | 512 |

**Formula**: `maxExponent = min(9, 3 + floor((L-1) × ¾))`

Pairs are pre-computed and filtered to answer ≤ 10,000. Higher exponents don't always mean harder questions — 2⁹ = 512 is easier than 9³ = 729. The pool just gets more varied. The ¾ multiplier creates plateau levels (1–2, 5–6) where difficulty holds steady.

**Tuning knobs**: `STARTING_MAX_EXPONENT` (3), `MAX_EXPONENT` (9), `MAX_ANSWER` (10,000), base range (2–9), and the ¾ ramp multiplier.

**Saturation**: At level 9 all exponents 2–9 are unlocked. Levels 10+ are identical to level 9.

**Note**: The file also has a legacy `generateQuestion(rng, totalCorrect)` path that ramps by correct-answer count directly (5 per step). The engine uses `generateQuestionForDifficulty` instead.

---

### Target 24

**Source**: `src/games/target-24/logic.ts`

Players combine 4 numbers with +, -, ×, ÷ to make exactly 24. Only solvable sets are generated.

#### Number Range by Level

| Level | Number Range | Multi-digit Numbers? |
|---|---|---|
| 1–2 | 1–9 | No |
| 3–4 | 1–13 | Yes (10–13) |
| 5+ | 1–20 | Yes (10–20) |

**Tuning knobs**: The three difficulty brackets in `getDifficultyRange()` and their min/max values.

**Saturation**: At level 5 the full 1–20 range is available. Levels 6+ are identical to level 5.

**Note**: Higher numbers don't just make arithmetic harder — they also reduce the fraction of 4-number sets that are solvable, so the generator may need more attempts. The 500-attempt cap with `[8, 8, 3, 3]` fallback handles this.

---

### A+ Number Sense

**Source**: `src/games/number-sense/generators.ts`

Number Sense operates in **exam mode only** — 80 questions generated upfront, 10-minute countdown, free navigation, deferred scoring at the end. There is no sprint/survival mode for this game.

#### Exam Set Generation (`generateExamSet`)

The exam engine does **not** use the standard sequential difficulty ramp. Instead, `generateExamSet` produces all 80 questions at once using three mechanisms:

1. **Position-based difficulty** — difficulty is fixed per question position, not adaptive
2. **Forced approximate questions** — every 10th question (Q10, Q20, …, Q80) is a starred (*) approximate question, matching the UIL convention
3. **Category balancing** — weighted selection with no-repeat constraints ensures topic variety

##### Difficulty Bands

`getDifficultyForExamPosition(index, 80)` assigns difficulty by position:

| Questions | Index Range | Difficulty | Eligible Generators |
|-----------|-------------|------------|---------------------|
| 1–10      | 0–9         | 1          | 7 (basic arithmetic, series, expanded notation) |
| 11–20     | 10–19       | 2          | 13 (+rounding, remainder, counting, diff-of-squares, roman numerals, approximate) |
| 21–40     | 20–39       | 3          | 21 (+order-of-ops, fractions, %, proportions, units, primes, LCM/GCD, fraction comparison) |
| 41–60     | 40–59       | 4          | 28 (+mixed numbers, squares/roots, geometry, algebra, decimals, angles, sequences) |
| 61–70     | 60–69       | 5          | 34 (+base conversion, negative arithmetic, probability, percent word problems, inequalities, number line) |
| 71–80     | 70–79       | 6          | 34 (same pool, harder parameters within generators) |

##### Category Selection Algorithm

For each non-approximate position:

1. **Filter** — eligible generators are those with `minDifficulty ≤ position difficulty`, excluding the `approximate` generator and the last two used categories
2. **Weight** — each eligible generator gets weight 3 (underrepresented) or 1 (overrepresented), based on whether its usage count exceeds the running average by more than 1
3. **Roll** — a weighted random selection picks the generator

This produces exams where:
- No category appears three times in a row
- No single category dominates the exam (the 3:1 weight ratio pushes toward even distribution)
- Every exam is different (seeded RNG from `Date.now()`)

##### Approximate Questions

Approximate questions (prefixed with `*` in the question text) are forced at indices 9, 19, 29, 39, 49, 59, 69, 79 (Q10, Q20, …, Q80 in 1-indexed). These use `isWithin5Percent` for answer evaluation instead of exact matching.

Variants by difficulty:
- **Diff 1–2**: Large multiplication only (e.g., `*249 × 398`)
- **Diff 3–4**: +Large addition (e.g., `*1776 + 2017 + 16`)、+multi-term expressions (e.g., `*124 × 16 + 8 × 180`)
- **Diff 5–6**: +Squares product (e.g., `*13² × 11²`)

#### Generator Registry (34 generators)

| ID | Min Diff | Question Type | Example |
|----|----------|---------------|---------|
| `addition` | 1 | 2–4 addend sums | `27 + 16`, `12 + 16 + 20 + 24` |
| `subtraction` | 1 | Subtraction or fill-in-blank | `721 − 127`, `53 − ___ = 27` |
| `multiplication` | 1 | 2-factor or 3-factor products | `14 × 6`, `11 × 5 × 3` |
| `division` | 1 | Clean division | `415 ÷ 5` |
| `multiplyTricks` | 1 | ×11, ×25, ×50, ×75, ×111, near-100 | `28 × 75`, `111 × 579` |
| `seriesSum` | 1 | Arithmetic series | `2 + 3 + 4 + . . . + 10` |
| `expandedNotation` | 1 | Place-value expression | `1 × 1000 + 9 × 100 + 7 × 10 + 4 × 1` |
| `roundingPlaceValue` | 2 | Rounding or digit identification | `Round 958307 to nearest 1000` |
| `remainder` | 2 | Division remainder, expression remainder | `20583 ÷ 5, remainder?` |
| `counting` | 2 | Count odd/even in range | `How many odd numbers from 11 to 48?` |
| `differenceOfSquares` | 2 | Products near a perfect square | `19 × 21` (= 20² − 1) |
| `romanNumerals` | 2 | Roman → Arabic conversion | `MCMXXV = ?` |
| `approximate` | 2 | Starred estimation questions | `*249 × 398 ≈ ?` |
| `orderOfOperations` | 3 | PEMDAS, distributive property | `12 + 8 × 2`, `30 × 47 − 30 × 40` |
| `fractions` | 3 | Same-denom add/sub, division by fraction | `7/24 + 13/24`, `18 ÷ 3/5` |
| `percentConversion` | 3 | Percent ↔ fraction | `14/25 = ___%`, `75% as a fraction?` |
| `proportions` | 3 | Proportional reasoning | `If 16 cost 48¢, then 12 cost ?` |
| `unitConversion` | 3 | Time, money, distance | `1/4 of an hour = ___ minutes` |
| `primes` | 3 | Largest/smallest prime, largest prime factor | `Largest prime < 30?`, `Largest prime factor of 78?` |
| `lcmGcd` | 3 | GCD or LCM | `GCD of 24 and 32?` |
| `fractionComparison` | 3 | Compare two fractions | `Which is larger: 9/13 or 3/4?` |
| `mixedNumbers` | 4 | Mixed number add/sub/multiply | `5 1/5 × 10`, `6 3/8 − 2 1/2` |
| `squaresRootsPowers` | 4 | Squares, roots, powers, sum of squares | `23² = ?`, `√529 = ?`, `2^8 = ?` |
| `geometry` | 4 | Rectangle, triangle, square, trapezoid, equilateral triangle, circle, diagonal, volume | `Area of trapezoid: bases 5 and 7, height 12?` |
| `algebraSubstitution` | 4 | Evaluate expression given x | `If x = 7, then 12 + 4x = ?` |
| `decimalToFraction` | 4 | Decimal → common fraction | `.88 = ? (as a fraction)` |
| `triangleAngleSum` | 4 | Find missing angle | `Two angles are 24° and 46°. Third?` |
| `sequences` | 4 | Arithmetic, quadratic, geometric patterns | `3, 12, 27, k, 75, 108 … k = ?` |
| `baseConversion` | 5 | Binary, octal, base-4, base-6 | `241 (base 6) = ? (base 10)` |
| `negativeArithmetic` | 5 | Negative ops, additive inverse | `(−10) + (−3) × 5`, `Additive inverse of −2/3?` |
| `probability` | 5 | Cards, dice, coins | `P(red ace from 52-card deck)?` |
| `percentWordProblem` | 5 | Percent equations | `18% of what = 36% of 54?` |
| `inequalities` | 5 | Solve linear inequality | `If 4x − 11 < 53, then x < ?` |
| `numberLineDistance` | 5 | Distance between points | `Distance from −19 to 12?` |

#### Within-Generator Difficulty Scaling

Individual generators also scale internally with the difficulty parameter:

- **Operand ranges expand** — e.g., `addition` uses max 100 at diff 1 vs 150 at diff 2
- **Variants unlock** — e.g., `multiplication` adds 3-factor products; `geometry` adds circle/volume/diagonal at diff 5+
- **Problem complexity increases** — e.g., `fractions` adds division-by-fraction at diff 4+; `primes` adds largest-prime-factor at diff 4+
- **Number pools grow** — e.g., `romanNumerals` ranges up to 100 at diff 2, 500 at diff 3, 2000 at diff 4+

#### Scoring

UIL Number Sense scoring: **+5 correct, −4 wrong, 0 blank**. Invalid input (unparseable) is scored as wrong (−4). Approximate answers must be within 5% of the exact value. Scores can be negative. Best scores are saved to local storage under the key `number-sense|exam`.

---

## Cross-Game Comparison

| Game | Mode | Saturates At | Difficulty Model | ~Correct Answers to Saturate |
|---|---|---|---|---|
| Speed Arithmetic | Sprint/Survival | Level 6 | Engine ramp (2–3 correct per level) | ~12–15 |
| Factor Rush | Sprint/Survival | Level 6 | Engine ramp | ~12–15 |
| Power Blitz | Sprint/Survival | Level 9 | Engine ramp | ~19–24 |
| Target 24 | Sprint/Survival | Level 5 | Engine ramp | ~10–12 |
| Number Sense | Exam (80 questions) | Level 6 | Fixed by position (no adaptation) | N/A |

The first four games share the engine's adaptive ramp. Number Sense uses a completely different model — difficulty is fixed by question position, matching the UIL exam format where early questions are easy and later questions are hard regardless of student performance.

The sprint/survival games all ramp at a similar pace. Factor Rush and Speed Arithmetic share the same saturation point. Power Blitz has the longest ramp due to the ¾ exponent multiplier. Target 24 saturates fastest but its difficulty ceiling (4 numbers up to 20) is inherently constrained.

## Calibration Considerations

1. **Ramp speed is shared** — changing the engine's 2–3 threshold range affects all games equally. To make one game ramp faster/slower, adjust its internal scaling formula instead.

2. **Saturation means no further challenge increase** — once a game saturates, longer runs become a test of endurance rather than increasing difficulty. Consider extending the range (more brackets, higher numbers) if this matters.

3. **Survival mode amplifies difficulty** — one wrong answer ends the run, so reaching higher levels is inherently harder. Sprint mode is more forgiving (3 wrong answers allowed).

4. **`initialDifficulty`** — any `GameDefinition` can set this to start at a higher level, but no game currently does. This could be used for a "hard mode" variant.

5. **Answer magnitude vs. cognitive load** — bigger numbers don't always mean harder questions (Power Blitz 2⁹ = 512 vs 9³ = 729). When tuning, consider the actual mental effort, not just the operand sizes.
