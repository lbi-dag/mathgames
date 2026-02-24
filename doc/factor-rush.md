# Factor Rush Rules

[Back to README](../README.md)

## Objective
Given a target composite number, select the 3 prime factors that multiply to that target.

## Question Format
- Target number is the product of exactly 3 distinct primes.
- Prime choices come from primes under 50.
- You answer by selecting primes in the grid, then submitting.

## Answer Rules
- You must select exactly 3 primes before submission.
- Fewer or more than 3 selections is invalid and does not submit a scored attempt.
- Correct answer: selected primes match the target factor set.
- Wrong answer: score does not increase.

## Modes
- Sprint: choose 1, 3, or 5 minutes. Run ends when time reaches 0 or after 3 wrong answers.
- Survival: untimed. Run ends on the first wrong answer.

## Difficulty
- Questions are generated from deterministic seeded RNG for each run.
- Difficulty level increases after rolling thresholds of 2 or 3 correct answers.
- Higher difficulty expands the prime pool used to build target numbers.

## Scoring and Best Score
- Current score policy: `score = total correct answers`.
- Best score is saved locally by key: `factor-rush|mode`.
