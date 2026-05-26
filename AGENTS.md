# AGENTS.md

## Project Overview
MathGames is a math competition platform inspired by Lichess. It is being built in deliberate phases:

- Phase 1: fun, fast solo play
- Phase 2: trusted validation and global visibility
- Phase 3: identity, history, and retention

The product must be viable at the end of Phase 3 even if multiplayer is never built.

## Current Phase
### Phase 1.5 - Soloist Foundation
The repository is still in the client-only solo phase, but the architecture is already being hardened for later validation and richer game formats.

### Phase 1.5 characteristics
- Fully client-side on Cloudflare Pages
- No backend calls
- No authentication
- Local leaderboard only
- Deterministic seeded run/exam generation
- Shared engine infrastructure in `src/game-shell/`
- Shared UI shells for both timed runs and exam flows
- Current shipped game set:
  - `speed-arithmetic`
  - `factor-rush`
  - `power-blitz`
  - `target-24`
  - `number-sense`

### Mode model in this phase
- `sprint`: timed, 1 / 3 / 5 minutes
- `survival`: untimed, ends on first wrong answer
- `exam`: fixed-length assessment flow for standards-aligned experiences such as A+ Number Sense

Sprint and survival are the default shared modes for arcade-style games. `exam` is an allowed Phase 1.5 exception when the format itself is the product.

## Source Of Truth Docs
Consult these before changing architecture or roadmap assumptions:

- `docs/plans/roadmap.md` for phase boundaries and long-term direction
- `README.md` for current project structure, routes, and scripts
- `docs/storage.md` for local storage keys, schema, and migration behavior
- `docs/difficulty-tuning.md` for shared and per-game difficulty behavior
- `docs/gameplay/*.md` for current player-facing rules
- `docs/plans/*.md` for active implementation plans and product follow-ups

If a doc conflicts with the code, do not guess. Reconcile the discrepancy explicitly.

## Architectural Invariants
These rules must not be violated.

### 1. Engine Separation
- All gameplay and exam state flows through `src/game-shell/`.
- UI components must not contain core game logic.
- Arcade-style games must use the shared reducer/engine path.
- Exam-style games must use the shared exam engine path.
- Each game must implement a typed definition contract instead of bypassing shared lifecycle infrastructure.

### 2. Determinism
- Every run or exam must be generated from a seed.
- RNG must be consumed only by engine or generator logic.
- Rendering must never advance RNG state.
- Generated question sequences must remain replayable in a future server-validation environment.

### 3. Scoring Policy
- Sprint and survival games currently score by correct answers.
- Alternative scoring, such as Number Sense `+5 / -4 / 0`, must remain injectable through policy objects.
- UI must not hardcode scoring formulas.

### 4. Leaderboard Identity
- Leaderboard identity must remain stable and versioned.
- Run-mode leaderboard key format remains:

`${gameId}|${mode}`

- Sprint duration is not part of the leaderboard key.
- Exam modes may store against the same stable `(gameId|exam)` identity pattern.

### 5. Storage And Migration
- All local storage must be versioned.
- Migrations must preserve user data.
- Renames of game IDs, modes, or storage keys require explicit migration logic.
- Schema changes must not silently strand existing scores or preferences.

### 6. Static-Site Discipline
- Keep the app deployable as a static client build in Phase 1.5.
- Site metadata and canonical URLs must stay environment-driven.
- Do not introduce server dependencies to solve documentation, SEO, or routing problems that can be handled statically.

## Phase Constraints
### Until Phase 2
Do not introduce:
- Backend APIs
- Global leaderboards
- Global stats
- Remote score submission
- Authentication
- Anti-cheat or server trust logic
- Cross-device persistence

### Until Phase 3
Do not introduce:
- Login flows
- User profiles
- Rating persistence
- Personal dashboards
- Historical account data

## Directory Responsibilities
```text
src/
  game-shell/   -> engine, exam engine, RNG, difficulty, scoring, storage
  games/        -> per-game definitions and pure game logic
  components/   -> reusable shells and presentation components
  pages/        -> thin route-level wrappers
  site/         -> metadata and canonical site configuration
  styles/       -> visual styling only
docs/
  gameplay/     -> player-facing rules
  plans/        -> roadmap and implementation plans
scripts/        -> static asset generation and repo utilities
```

Rules:
- No gameplay logic in `pages/`.
- No direct leaderboard manipulation outside `src/game-shell/`.
- No per-game duplication of run/exam lifecycle logic.
- Do not hardcode canonical domains in page components when `src/site/` already owns that concern.

## Adding Or Changing Games
### Arcade-style game
1. Implement the game in `src/games/<game-id>/`.
2. Export a typed `GameDefinition`.
3. Render it through `<GameShell definition={...} />`.
4. Add a thin page under `src/pages/`.
5. Add tests for generation, answer evaluation, and any non-trivial difficulty behavior.

### Exam-style game
1. Keep generation and evaluation logic pure and deterministic.
2. Reuse the shared exam engine and shell rather than building a one-off flow.
3. Keep scoring policy injectable.
4. Add tests for exam generation, navigation/scoring behavior, and storage.

No game may bypass the shared engine layer.

## Coding Guidelines
- Use TypeScript strictly.
- Prefer explicit types for engine and storage state.
- Keep reducers and evaluators pure.
- Add tests for:
  - State transitions
  - Difficulty behavior
  - Exam scoring where applicable
  - Leaderboard/storage read-write and migration
  - Scoring policies
- Avoid unnecessary dependencies.

## Phase 1.5 Exit Criteria
Before advancing beyond Phase 1.5:
- Shared run and exam flows are stable.
- Deterministic engine tests pass.
- Seed-based generation is stable enough for future replay validation.
- Local leaderboard and preferences survive migrations.
- No hidden UI-engine coupling remains.
- Product and architecture docs describe the current repo accurately.

## Product Philosophy
- Phase 1 = Fun
- Phase 2 = Trust
- Phase 3 = Retention

## How To Work In This Repo
When implementing work:
- Refer to `docs/plans/roadmap.md`, not a stale roadmap path.
- Preserve deterministic engine design.
- Preserve storage migrations and redirects.
- Refactor rather than rewrite when possible.
- Treat existing docs as part of the product surface and keep them aligned with the code.
