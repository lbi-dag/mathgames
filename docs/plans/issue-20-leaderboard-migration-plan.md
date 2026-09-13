# Issue #20: Leaderboard Migration and Reset Hardening Plan

## Objective

Protect the versioned `mathgames.leaderboard` store from malformed or legacy
browser data while preserving the stable `${gameId}|${mode}` identity. Keep all
reads, writes, migrations, and resets in `src/game-shell/leaderboard.ts`.

## Current Findings

- The v1 store already normalizes the three renamed game IDs, migrates the
  documented standalone legacy keys once, and retains signed `exam` scores.
- `readLeaderboard` falls back for invalid JSON and non-v1 payloads, then
  records a migrated v1 payload; its behavior needs explicit regression tests.
- Existing tests prove the basic migration and exam high-score behavior, but do
  not assert malformed/unsupported payload behavior, duration-independent
  sprint identity, or that a reset leaves every unrelated mode intact.

## Implementation Steps

1. Add focused cases in `src/game-shell/leaderboard.test.ts` for invalid JSON,
   invalid leaderboard shapes, and unsupported schema versions. Assert the safe
   v1 result is persisted and that documented legacy values are still merged
   when migration is pending, rather than being silently lost.
2. Extend migration coverage with collisions: stored canonical and aliased v1
   keys should resolve to the canonical identity and retain the higher score;
   legacy standalone values must not overwrite a higher existing v1 best.
3. Make leaderboard-key behavior observable through public APIs (rather than
   exposing internal key helpers). Save scores before and after changing a
   game's sprint preference from 1 to 3 or 5 minutes, then assert a single
   `gameId|sprint` best is read and persisted.
4. Add reset-isolation cases for a game with sprint and survival scores plus an
   unrelated game's score; include an exam score if the reset contract is
   shared. Assert only the selected normalized `(gameId, mode)` entry is
   removed and no broad storage clearing occurs.
5. If the new tests reveal ambiguous recovery behavior, make the smallest
   change in `src/game-shell/leaderboard.ts` needed to validate payload shape
   before normalization and preserve recoverable values. Update
   `docs/storage.md` only if implemented recovery semantics differ from the
   current schema documentation.

## Verification

- Run `npx vitest run src/game-shell/leaderboard.test.ts`.
- Run `npm test`, `npm run lint`, and `npm run build` before merging.
- Manually inspect serialized mock-storage values in the new tests to confirm
  the persisted key remains `${gameId}|${mode}` with no sprint-duration suffix.

## Out of Scope

- New storage schema versions or key renames.
- Backend, global leaderboard, authentication, or remote score behavior.
- Changes to scoring policy beyond preserving the current optional signed exam
  score path.
