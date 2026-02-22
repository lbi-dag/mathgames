# AGENTS.md

## Project Overview
MathGames.win is a math competition platform inspired by Lichess, beginning with fast solo gameplay and evolving toward trusted global competition and identity-based progression.

The platform is intentionally being built in structured phases. This document defines persistent architectural rules and current project constraints. All implementation decisions must respect these invariants.

## Current Phase
### Phase 1.5 - Soloist Foundation
We are currently in **Phase 1 (client-only)** with architecture hardened for future Phase 2 server validation.

### Characteristics
- Fully client-side (Cloudflare Pages).
- No backend calls.
- No authentication.
- Local leaderboard only.
- Deterministic seeded game engine.
- Unified GameShell for all games.
- Score = number of correct answers (for now).

## Roadmap Summary
### Phase 1 - Soloist
- Local gameplay only.
- Local leaderboard.
- Seeded deterministic runs.
- No backend.

### Phase 2 - Trusted Referee
- Global leaderboard.
- Lightweight server validation.
- Anonymous identity.
- Players online counter.
- No login yet.

### Phase 3 - Persona
- User accounts.
- Persistent profiles.
- Rating system (Math Elo).
- Performance history.
- Verified runs.

Multiplayer is intentionally excluded from the current product plan.

## Architectural Invariants
These rules must NOT be violated.

### 1. Game Engine Separation
- All gameplay flows through `src/game-shell/`.
- UI components must not contain game logic.
- Each game must implement `GameDefinition`.
- Engine must remain a pure reducer where possible.

### 2. Determinism
- Each run must use a seeded RNG.
- RNG must be consumed only by engine logic.
- Rendering must not alter RNG state.
- Engine must be replayable in future server environments.

### 3. Scoring Policy
- Current scoring = number of correct answers.
- Scoring must remain injectable via `ScorePolicy`.
- UI must not depend on scoring formula details.

### 4. Leaderboard Keys
Leaderboard key format must remain:

`${gameId}|${mode}`

Sprint duration is NOT part of leaderboard key.

### 5. Storage
- All local storage must be versioned.
- Migrations must preserve user data.
- Schema changes must not silently break older data.

## Phase Constraints
### Until Phase 2
The following are NOT allowed:
- Backend APIs
- Global stats
- Authentication
- Remote score submission
- Anti-cheat logic

### Until Phase 3
The following are NOT allowed:
- Login flows
- User database
- Rating persistence
- Profile pages

## Directory Responsibilities
```text
src/
  game-shell/   -> engine, RNG, difficulty, scoring, leaderboard utilities
  games/        -> per-game definitions (no engine duplication)
  components/   -> reusable UI
  pages/        -> thin routing layers
  styles/       -> visual styling only
```

Rules:
- No gameplay logic in `pages/`.
- No direct leaderboard manipulation outside `game-shell/`.
- No per-game duplication of lifecycle logic.

## Adding a New Game
1. Implement `GameDefinition`.
2. Use `<GameShell definition={...} />`.
3. Add page under `src/pages/`.
4. Add tests if generation logic is non-trivial.
5. Ensure difficulty-level mapping is deterministic.

No game may bypass the shared engine.

## Coding Guidelines
- Use TypeScript strictly.
- Prefer explicit types over implicit inference for engine state.
- Keep reducers pure.
- Add tests for:
  - State transitions
  - Difficulty ramp behavior
  - Leaderboard read/write
  - Scoring policy
- Avoid unnecessary dependencies.

## Phase Transition Rules
### Before moving to Phase 2
- Engine must be deterministic.
- Seed replay must be stable.
- Difficulty ramp must be tested.
- No hidden UI-engine coupling.

### Before moving to Phase 3
- Global leaderboard must be stable.
- Abuse manageable.
- Server validation architecture proven.

## Product Philosophy
- Phase 1 = Fun
- Phase 2 = Trust
- Phase 3 = Retention

The product must be viable and complete at the end of Phase 3 even if no multiplayer is ever built.

## How to Work With Codex
When implementing work:
- Refer to the phase roadmap in `docs/roadmap.md`.
- Do not introduce features from future phases.
- Preserve deterministic engine design.
- Do not remove version migrations.
- Refactor rather than rewrite when possible.
