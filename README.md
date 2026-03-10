# Math Games

React + Vite app for the Math Games launcher and games.

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

## Domain Configuration
Primary site metadata is controlled by root env values:

```bash
VITE_SITE_NAME=Math Games
VITE_SITE_URL=https://mathgm.org
```

Override `VITE_SITE_URL` in Cloudflare Pages if you want a different primary canonical domain for a deployment.

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
- `src/components/GameShell.tsx` shared run-mode UI shell for sprint/survival games
- `src/components/ExamShell.tsx` shared exam-mode UI shell
- `src/game-shell/` reusable run/exam engines, RNG, difficulty, scoring, and storage modules
- `src/games/speed-arithmetic/` game logic, definition, and tests
- `src/games/power-blitz/` game logic, definition, and tests
- `src/games/factor-rush/` game logic, definition, and tests
- `src/games/target-24/` game logic, definition, and tests
- `src/games/number-sense/` exam logic, generators, definition, and tests
- `src/site/` site metadata and canonical URL helpers
- `src/styles/` CSS modules and shared tokens
- `public/` static assets
- `dist/` production build output (generated)

## Game Architecture
The app currently supports two shared solo gameplay shells:
- `GameShell` for arcade-style run modes (`sprint`, `survival`)
- `ExamShell` for fixed-length assessment flows (`exam`)

Shared architecture rules:
- Each game provides a typed `GameDefinition` for question generation, answer evaluation, labels, and optional custom input rendering.
- UI shells own lifecycle flow, timer handling, navigation, and best-score display.
- Core gameplay and storage logic lives in `src/game-shell/`, not in pages or route components.
- Game-specific custom answer UIs are supplied through the definition contract when needed.

Arcade run behavior:
- `GameShell` owns mode selection, timer, wrong-answer rules, score display, start/reset flow, and leaderboard display.
- Factor Rush uses `renderAnswerInput` for a custom prime-grid answer UI.
- Target 24 uses `renderAnswerInput` for a custom expression keypad input UI.
- The engine handles run state transitions, seeded RNG per run (`seed = Date.now()`), and difficulty ramping.
- Difficulty increases after a rolling threshold of 2 or 3 correct answers (chosen randomly each level-up).
- Sprint mode ends on timer expiry or 3 wrong answers.
- Survival mode ends on first wrong answer.

Exam behavior:
- `ExamShell` owns exam start, free navigation, timer countdown, end-of-exam scoring, and result review.
- A+ Number Sense uses `ExamShell` with a generated 80-question set and exam scoring.
- Number Sense currently uses `80` questions in `10` minutes.
- Exam runs are also seed-generated and stored locally under a stable `(gameId|exam)` identity.

## Scoring
Current scoring is mode-dependent and remains injectable:
- Sprint/survival games: `score = number of correct answers`
- Number Sense exam: `+5 correct, -4 wrong, 0 blank`

Scoring is injected through shared policy types, so policy changes do not require UI rewrites.

## Local Storage
Versioned browser storage is documented in [docs/storage.md](docs/storage.md).

Current keys:
- `mathgames.leaderboard` for best scores by `${gameId}|${mode}`
- `mathgames.sprintPrefs` for per-game sprint duration
- `mathgames.ui.theme` for shell theme preference

Exam best scores reuse the leaderboard store and are written under `number-sense|exam`.

## Routes
- `/` landing page
- `/about` about page
- `/speed-arithmetic` sprint/survival game
- `/factor-rush` sprint/survival game
- `/power-blitz` sprint/survival game
- `/target-24` sprint/survival game
- `/number-sense` exam game

Backward-compatible redirects are configured for older slugs, including:
- `/games/number-sense-sprint` -> `/speed-arithmetic`
- `/games/prime-factor-challenge` -> `/factor-rush`
- `/games/exponent-sprint` -> `/power-blitz`

## Game Rules Docs
- [Speed Arithmetic Rules](docs/gameplay/speed-arithmetic.md)
- [Power Blitz Rules](docs/gameplay/power-blitz.md)
- [Factor Rush Rules](docs/gameplay/factor-rush.md)
- [Target 24 Rules](docs/gameplay/target-24.md)
- [A+ Number Sense Rules](docs/gameplay/number-sense.md)

## Add a New Game
### Arcade-style game
1. Create a game folder in `src/games/<your-game>/`.
2. Implement game-specific logic and a `GameDefinition`.
3. Use `GameShell` in a route page: `src/pages/<YourGame>.tsx` -> `<GameShell definition={yourDefinition} />`
4. Add route wiring in `src/App.tsx`.
5. Add tests for question generation, answer evaluation, and difficulty behavior.
6. Add launcher card/link if needed in landing components.

### Exam-style game
1. Create the game folder in `src/games/<your-game>/`.
2. Keep generation and evaluation deterministic and pure.
3. Reuse `ExamShell` and the shared exam engine instead of building a one-off flow.
4. Add tests for exam generation, scoring, and storage behavior.
5. Add route wiring and launcher copy as needed.
