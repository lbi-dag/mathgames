# Implementation Plan: #18 Deterministic Replay Coverage

## Goal

Make replay readiness an executable contract: a fixed seed, identical player
outcomes, and identical difficulty progression must yield the same questions
for every shipped game. Answer evaluation and presentation must not advance
the gameplay RNG.

## Current gap

`createRunSessionFromSeed` is tested only with Speed Arithmetic. Number Sense
already checks its generated 80-question exam set, but Factor Rush, Power
Blitz, and Target 24 have no shared-session replay coverage. Existing
per-game tests primarily exercise a single generated question or individual
logic rules, rather than a multi-question engine progression.

The RNG is deliberately owned by `src/game-shell/session.ts` at session start
and by `useGameEngine.ts` while a run advances. The reducer receives generated
questions, rather than consuming randomness itself; the tests should preserve
that separation.

## Scope and constraints

- Cover the four arcade definitions through the shared seeded run/session
  boundary: Speed Arithmetic, Factor Rush, Power Blitz, and Target 24.
- Cover the Number Sense custom exam-set path and the generic exam-slot
  fallback at their shared session boundary.
- Keep production RNG ownership unchanged. Do not introduce UI-driven RNG,
  backend validation, or replay persistence.
- Keep game definitions and evaluators pure. Tests must not render components
  just to prove generator behavior.

## Plan

1. **Add a reusable test-only replay driver in `src/game-shell/`**
   - Start an arcade session with `createRunSessionFromSeed`.
   - Advance a bounded, scripted sequence of correct answers using the
     definition's `evaluateAnswer`, `advanceDifficultyOnCorrect`, and the
     session RNG; carry each generated question forward as `previousQuestion`.
   - Record a serializable trace: initial question, subsequent questions,
     resolved outcomes, difficulty levels, and thresholds.
   - Keep this helper in a test file or test utility so production lifecycle
     code does not gain testing-only APIs.

2. **Exercise every arcade definition with fixed-seed multi-question traces**
   - Add parameterized coverage (or one consistently shaped test per game) for
     Speed Arithmetic, Factor Rush, Power Blitz, and Target 24.
   - Run each trace twice from the same fixed seed and assert deep equality.
   - Include enough correct answers to cross multiple randomized 2–3 answer
     thresholds. This verifies that question generation and adaptive
     progression share one deterministic RNG stream.
   - Use each generated question's correct-answer label or a game-specific
     valid answer fixture to drive `evaluateAnswer`; do not hardcode random
     question values.

3. **Prove evaluation and presentation do not consume RNG**
   - For every arcade game, compare the next generated question after either
     (a) evaluating the current answer or (b) skipping evaluation. Both paths
     must use equivalent RNG state and produce the same next question.
   - Directly call `renderQuestion`, `getQuestionLabel` when present, and
     `getCorrectAnswerLabel` between equivalent RNG snapshots; assert the next
     RNG value/question is unchanged. Do not render React components—the
     definition contract is the relevant boundary.
   - Include invalid/wrong evaluation where the game has an input format whose
     evaluator could otherwise hide side effects.

4. **Complete exam replay coverage in `src/game-shell/session.test.ts` and
   `src/games/number-sense/logic.test.ts`**
   - Retain the existing Number Sense fixed-seed exam-set assertion, but make
     the expected invariant explicit: full slots, their ordered difficulties,
     and question labels match from the same seed.
   - Add an evaluation-purity check for representative Number Sense exact and
     approximate questions, confirming evaluation cannot alter a separately
     seeded generator's next result.
   - Keep a small fixed-seed assertion for `createExamSlotsFromSeed`'s generic
     fallback so both the specialized and generic exam paths remain protected.

5. **Use the existing reducer tests to protect the lifecycle boundary**
   - Extend `engine.test.ts` only if necessary to show `SUBMIT_RESOLVED` uses
     its supplied next question and never generates one itself.
   - Do not test React render timing as a determinism mechanism; rendering is
     already excluded from RNG ownership by design. The definition-level
     presentation checks above make regressions observable without coupling
     tests to component internals.

6. **Validate**
   - Run `npm test`, `npm run lint`, and `npm run build`.
   - Confirm no production files call `Math.random()` and all run/exam seed
     construction continues through `src/game-shell/session.ts` and
     `src/game-shell/rng.ts`.

## Definition of done

- All five shipped game definitions have fixed-seed replay coverage.
- Arcade traces include deterministic difficulty threshold progression, not
  merely first-question equality.
- Specialized Number Sense and generic exam generation remain replayable.
- Tests demonstrate that evaluation and definition presentation helpers do
  not advance RNG state.
- The standard test, lint, and production-build commands pass.

## Risks and mitigations

- **Brittle snapshots of question wording:** compare complete replay traces
  only across two runs in the same test instead of pinning a large generated
  corpus to literals.
- **Tests duplicating production logic:** use the public definition and shared
  session/difficulty contracts; keep the driver thin and avoid reimplementing
  game generators.
- **Target 24 generation cost:** use a short deterministic trace with a fixed
  seed, not broad randomized sampling.
