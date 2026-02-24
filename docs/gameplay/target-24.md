# Target 24 Rules

[Back to README](../../README.md)

## Objective
Use all 4 provided numbers exactly once to build an arithmetic expression that evaluates to 24.

## Question Format
- Each round shows 4 integers.
- Allowed operators: `+`, `-`, `*`, `/`.
- Parentheses are allowed for grouping.
- Example expression: `(8 - 3) * (7 - 1)`.

## Answer Rules
- You must use each shown number exactly once.
- You may only use numbers from the prompt, parentheses, and `+ - * /`.
- Blank input or invalid expression format is invalid and does not submit a scored attempt.
- Correct answer: expression evaluates to 24.
- Wrong answer: score does not increase.

## Modes
- Sprint: choose 1, 3, or 5 minutes. Run ends when time reaches 0 or after 3 wrong answers.
- Survival: untimed. Run ends on the first wrong answer.

## Difficulty
- Questions are generated from deterministic seeded RNG for each run.
- Difficulty level increases after rolling thresholds of 2 or 3 correct answers.
- Number ranges expand by difficulty bands: `1-9`, then `1-13`, then `1-20`.

## Scoring and Best Score
- Current score policy: `score = total correct answers`.
- Best score is saved locally by key: `target-24|mode`.
