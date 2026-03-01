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

## Cross-Game Comparison

| Game | Saturates At | Engine Levels 1→Saturation | ~Correct Answers to Saturate |
|---|---|---|---|
| Speed Arithmetic | Level 6 | 5 level-ups | ~12–15 |
| Factor Rush | Level 6 | 5 level-ups | ~12–15 |
| Power Blitz | Level 9 | 8 level-ups | ~19–24 |
| Target 24 | Level 5 | 4 level-ups | ~10–12 |

All four games now ramp at a similar pace. Factor Rush and Speed Arithmetic share the same saturation point. Power Blitz has the longest ramp due to the ¾ exponent multiplier. Target 24 saturates fastest but its difficulty ceiling (4 numbers up to 20) is inherently constrained.

## Calibration Considerations

1. **Ramp speed is shared** — changing the engine's 2–3 threshold range affects all games equally. To make one game ramp faster/slower, adjust its internal scaling formula instead.

2. **Saturation means no further challenge increase** — once a game saturates, longer runs become a test of endurance rather than increasing difficulty. Consider extending the range (more brackets, higher numbers) if this matters.

3. **Survival mode amplifies difficulty** — one wrong answer ends the run, so reaching higher levels is inherently harder. Sprint mode is more forgiving (3 wrong answers allowed).

4. **`initialDifficulty`** — any `GameDefinition` can set this to start at a higher level, but no game currently does. This could be used for a "hard mode" variant.

5. **Answer magnitude vs. cognitive load** — bigger numbers don't always mean harder questions (Power Blitz 2⁹ = 512 vs 9³ = 729). When tuning, consider the actual mental effort, not just the operand sizes.
