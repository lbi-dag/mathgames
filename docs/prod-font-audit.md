# Production Font Audit (mathgames.win)

Date: 2026-02-22

## Scope
Audited deployed routes on `https://mathgames.win`:

- `/`
- `/about`
- `/games/number-sense-sprint`
- `/games/exponent-sprint`
- `/games/prime-factor-challenge`

## Historical observation (before refactor)
Across sampled routes, computed styles showed three font stacks:

1. `"Space Grotesk", "Segoe UI", sans-serif`
   - Primary body/UI font.
2. `Fraunces, "Times New Roman", serif`
   - Headline/display font.
3. `Arial`
   - Appears on several native form controls and buttons in gameplay screens.

## Sans-only policy (current target)
Typography is now aligned to a single sans-serif family while preserving semantic token structure:

- `--font-sans: "Space Grotesk", "Segoe UI", sans-serif;`
- `--font-display: var(--font-sans);`

This keeps heading/body semantics intact and allows future typography shifts in one place without selector churn.

## Implemented changes
1. Controls inherit body font globally via `button, input, select, textarea { font: inherit; }`.
2. Display token aliases sans (`--font-display: var(--font-sans)`).
3. Google Fonts import is reduced to Space Grotesk only, weights `400, 600, 700`.
4. Fraunces was removed from active CSS imports.

## Validation checklist
1. `npm run lint` passes.
2. `npm run test` passes, including typography regression checks.
3. `npm run build` passes.
4. Manual route QA confirms a single sans-serif experience on:
   - `/`
   - `/about`
   - `/games/number-sense-sprint`
   - `/games/exponent-sprint`
   - `/games/prime-factor-challenge`
