# MathGames.win

React + Vite app for the MathGames.win launcher and games.

## Tech Stack
- React 19
- TypeScript
- Vite
- ESLint
- React Router
- Vitest

## Getting Started
```bash
npm install
npm run dev
```

## Scripts
```bash
npm run dev      # start local dev server
npm run build    # typecheck + production build
npm run preview  # preview production build locally
npm run lint     # run ESLint
npm test         # run Vitest
```

## Project Structure
- `src/App.tsx` routes and app shell
- `src/pages/` route-level pages
- `src/components/` shared and landing page sections
- `src/components/GameShell.tsx` shared gameplay UI wrapper
- `src/game-shell/` reusable engine, RNG, difficulty, and storage modules
- `src/games/speed-arithmetic/` game logic, definition, and tests
- `src/games/power-blitz/` game logic, definition, and tests
- `src/games/factor-rush/` game logic, definition, and tests
- `src/styles/` CSS modules and shared tokens
- `public/` static assets
- `dist/` production build output (generated)

## Game Architecture
All active games now run through a shared `GameShell` + engine layer:
- `GameShell` owns mode selection, timer, wrong-answer rules, score display, start/reset flow, and leaderboard display.
- Each game only provides a `GameDefinition` implementation (`gameId`, `title`, question generation, answer evaluation, and rendering).
- Factor Rush uses `renderAnswerInput` for a custom prime-grid answer UI.
- The engine handles run state transitions, seeded RNG per run (`seed = Date.now()`), and difficulty ramping:
- Difficulty increases after a rolling threshold of 2 or 3 correct answers (chosen randomly each level-up).
- Sprint mode ends on timer expiry or 3 wrong answers.
- Survival mode ends on first wrong answer.

## Scoring
Current scoring policy is intentionally simple:
- score = number of correct answers

Scoring is injected through a `ScorePolicy`, so policy changes do not require UI rewrites.

## Local Storage Schema (versioned)
Leaderboard key: `mathgames.leaderboard`
```json
{
  "version": 1,
  "scores": {
    "speed-arithmetic|sprint": 17,
    "speed-arithmetic|survival": 9,
    "power-blitz|sprint": 14
  },
  "migratedLegacyKeys": true
}
```

Sprint preference key: `mathgames.sprintPrefs`
```json
{
  "version": 1,
  "byGame": {
    "speed-arithmetic": 3,
    "power-blitz": 1
  }
}
```

Legacy key migration runs once and maps:
- `exponentSprintBestScore` -> `power-blitz|sprint`
- `numberSenseBest:sprint` + `numberSenseSprintBestScore` -> `speed-arithmetic|sprint` (max)
- `numberSenseBest:survival` -> `speed-arithmetic|survival`

Existing v1 leaderboard and sprint preference entries that still use old game IDs are normalized automatically:
- `number-sense-sprint` -> `speed-arithmetic`
- `prime-factor-challenge` -> `factor-rush`
- `exponent-sprint` -> `power-blitz`

## Routes
- `/` landing page
- `/about` about page
- `/speed-arithmetic` game
- `/factor-rush` game
- `/power-blitz` game
- `/games/coming-soon` placeholder for upcoming games

Backward-compatible redirects are configured for older slugs, including:
- `/games/number-sense-sprint` -> `/speed-arithmetic`
- `/games/prime-factor-challenge` -> `/factor-rush`
- `/games/exponent-sprint` -> `/power-blitz`

## Game Rules Docs
- [Speed Arithmetic Rules](doc/speed-arithmetic.md)
- [Power Blitz Rules](doc/power-blitz.md)
- [Factor Rush Rules](doc/factor-rush.md)

## Add a New Game
1. Create a game folder in `src/games/<your-game>/`.
2. Implement game-specific logic and a `GameDefinition`.
3. Use `GameShell` in a route page: `src/pages/<YourGame>.tsx` -> `<GameShell definition={yourDefinition} />`
4. Add route wiring in `src/App.tsx`.
5. Add tests for question generation, answer evaluation, and difficulty behavior (if custom).
6. Add launcher card/link if needed in landing components.
