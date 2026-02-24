# Speed Arithmetic Rules

[Back to README](../README.md)

## Objective
Solve as many arithmetic questions as possible with speed and accuracy.

## Question Types
- Addition (`a + b`)
- Subtraction (`a - b`, generated so answers are non-negative)
- Single-digit multiplication (`a x b`)
- Multi-digit by single-digit multiplication

## Answer Rules
- Enter a whole number.
- Blank, decimal, or non-numeric input is invalid and does not submit a scored attempt.
- Correct answer: score increases by 1.
- Wrong answer: score does not increase.

## Modes
- Sprint: choose 1, 3, or 5 minutes. Run ends when time reaches 0 or after 3 wrong answers.
- Survival: untimed. Run ends on the first wrong answer.

## Difficulty
- Questions are generated from deterministic seeded RNG for each run.
- Difficulty level increases after rolling thresholds of 2 or 3 correct answers.
- Higher difficulty increases number ranges for addition/subtraction/multiplication.

## Scoring and Best Score
- Current score policy: `score = total correct answers`.
- Best score is saved locally by key: `speed-arithmetic|mode`.
