# Power Blitz Rules

[Back to README](../README.md)

## Objective
Solve exponent expressions (`base^exponent`) as quickly and accurately as possible.

## Question Format
- Base range: 2 to 9
- Exponent range: starts at 2 to 3, then expands with difficulty
- Only questions with answers up to 10,000 are used

## Answer Rules
- Enter a whole number answer.
- Blank, decimal, or non-numeric input is invalid and does not submit a scored attempt.
- Correct answer: score increases by 1.
- Wrong answer: score does not increase.

## Modes
- Sprint: choose 1, 3, or 5 minutes. Run ends when time reaches 0 or after 3 wrong answers.
- Survival: untimed. Run ends on the first wrong answer.

## Difficulty
- Questions are generated from deterministic seeded RNG for each run.
- Difficulty level increases after rolling thresholds of 2 or 3 correct answers.
- As difficulty rises, the maximum allowed exponent increases (up to 9).

## Scoring and Best Score
- Current score policy: `score = total correct answers`.
- Best score is saved locally by key: `power-blitz|mode`.
