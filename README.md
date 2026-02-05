# mathgames.win

React + Vite app for the mathgames.win launcher and games. 

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
- `src/games/number-sense-sprint/` game logic + tests
- `src/styles/` CSS modules and shared tokens
- `public/` static assets
- `dist/` production build output (generated)

## Routes
- `/` landing page
- `/about` about page
- `/games/number-sense-sprint` game
- `/games/coming-soon` placeholder for upcoming games

## Status
Launcher and first game migrated; more games coming next.
