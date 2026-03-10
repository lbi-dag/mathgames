# A+ Number Sense Rules

[Back to README](../../README.md)

## Objective
Work through an 80-question mental math exam modeled on UIL-style Number Sense.

## Format
- 80 questions per exam
- 10-minute countdown
- Free navigation between questions during the exam
- You may submit early, or the exam auto-submits when time expires

## Question Types
- Arithmetic and algebra fluency
- Fractions, percents, ratios, and proportions
- Number theory and counting
- Geometry and measurement
- Sequences, powers, roots, and base conversion
- Starred approximate questions at regular intervals

Approximate questions are marked with `*` and are scored using a 5% tolerance instead of exact equality.

## Answer Rules
- Blank answers are allowed and score as blank.
- Accepted answer formats include:
  - integers: `43`
  - negative integers: `-5`
  - fractions: `3/4`
  - mixed numbers: `2 1/3`
- Decimal input is not accepted.
- Invalid or unparseable answers are scored as wrong when the exam is submitted.

## Scoring
- Correct: `+5`
- Wrong: `-4`
- Blank: `0`

Best score is saved locally by key: `number-sense|exam`.

## Difficulty
- The exam is deterministic for a given seed.
- Questions are generated up front at exam start, not one-by-one after each answer.
- Difficulty is based on exam position rather than adaptive performance.
- Every 10th question is a starred approximate problem.

## Exam Flow
- Start the exam to generate the full question set.
- Move between questions freely with Prev, Next, or the question grid.
- Answers are evaluated when the exam is submitted or when the timer reaches zero.
- Results show correct, wrong, and blank questions along with the correct answers.
