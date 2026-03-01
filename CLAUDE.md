# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MathGames.win is a client-only math competition platform (React 19 + TypeScript + Vite) deployed to Cloudflare Pages. Currently in **Phase 1.5** — no backend, no auth, local leaderboard only, deterministic seeded game engine. See AGENTS.md for the full phase roadmap and architectural invariants.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # TypeScript type-check + Vite production build
npm run lint      # ESLint
npm test          # Vitest (all tests)
npx vitest run src/game-shell/engine.test.ts   # Run a single test file
```

## Architecture

### Game Engine (`src/game-shell/`)

Central engine that all games run through — a pure `useReducer`-based state machine. Contains:
- `engine.ts` — game state reducer (timing, scoring, difficulty, run lifecycle)
- `useGameEngine.ts` — React hook connecting UI to the reducer
- `types.ts` — `GameDefinition<Q, A, N>`, `GameMode`, `AnswerOutcome`, `ScorePolicy`
- `difficulty.ts` — difficulty ramping (level up after 2-3 correct, chosen randomly)
- `rng.ts` — seeded RNG for deterministic runs (seed = `Date.now()`)
- `leaderboard.ts` — versioned local storage with legacy key migration
- `scorePolicy.ts` — injectable scoring (currently: 1 point per correct answer)

### Game Definitions (`src/games/<game-id>/`)

Each game folder provides:
- `logic.ts` — pure functions for question generation and answer evaluation
- `definition.tsx` — exports a `GameDefinition` constant
- Tests co-located as `*.test.ts` / `*.test.tsx`

Games with custom input UIs (Factor Rush prime grid, Target 24 expression keypad) implement `renderAnswerInput` in their definition.

### UI Layer

- `src/components/GameShell.tsx` — unified game wrapper (mode select, timer, score, history, leaderboard)
- `src/pages/` — thin route wrappers: `<GameShell definition={gameDefinition} />`
- `src/App.tsx` — React Router v7 routes plus legacy redirects

### Styling

CSS Modules (`*.module.css`) with design tokens in `src/styles/tokens.css`. Dark/light theme via `[data-theme]` attribute on `<html>`. Colors, spacing, and radii defined as CSS custom properties. Font: Space Grotesk.

## Adding a New Game

1. Create `src/games/<game-id>/` with `logic.ts` and `definition.tsx`
2. Implement `GameDefinition<Q, A, N>` — the engine handles all lifecycle
3. Create page in `src/pages/<GameName>.tsx` → `<GameShell definition={def} />`
4. Add route in `src/App.tsx`
5. Add tests for question generation and answer evaluation
6. Add launcher card in landing components if needed

## Key Constraints (from AGENTS.md)

- **No game logic in UI** — all gameplay flows through `src/game-shell/`
- **Deterministic runs** — seeded RNG consumed only by engine logic, never by rendering
- **Scoring is injectable** — UI must not depend on scoring formula details
- **Leaderboard key format** — `${gameId}|${mode}` (sprint duration is NOT part of key)
- **Versioned local storage** — migrations must preserve user data
- **No future-phase features** — no backend APIs, auth, global stats, or user accounts until the relevant phase
- **TypeScript strict mode** — no implicit any, unused locals/params are errors
