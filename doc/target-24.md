# Target 24

## Gameplay
Target 24 presents four numbers each round. Build an arithmetic expression that uses **all 4 numbers exactly once** and evaluates to **24**.

Allowed operators:
- Addition (`+`)
- Subtraction (`-`)
- Multiplication (`*`)
- Division (`/`)
- Parentheses for grouping

Example: `(8 - 3) * (7 - 1)`

## Modes

### Timed Sprint
- You choose a sprint length (1, 3, or 5 minutes).
- Score is the number of correct solutions before time expires.
- Sprint ends when timer reaches zero or after 3 wrong submissions.

### Untimed Survival
- No timer.
- You continue until your first wrong submission.
- Difficulty ramps progressively as you answer correctly.

## Scoring
- Current scoring policy follows the platform Phase 1 rule: **score = number of correct answers**.
- The scoreboard shows current score, total answered, streak, best score, and wrong attempts.
- Leaderboard keys continue using `${gameId}|${mode}` with `gameId = target-24`.

## Input interaction
- Mouse/touch-friendly keypad includes digits, operators, and parentheses for expression building.
- Backspace and clear controls are available without requiring keyboard input.
- Keyboard entry still works, and `Enter` submits the expression.
