# Production Font Audit (mathgames.win)

Date: 2026-02-22

## Scope
Audited deployed routes on `https://mathgames.win`:

- `/`
- `/about`
- `/games/number-sense-sprint`
- `/games/exponent-sprint`
- `/games/prime-factor-challenge`

## Current fonts observed in production
Across all sampled routes, computed styles show three font stacks in use:

1. `"Space Grotesk", "Segoe UI", sans-serif`
   - Primary body/UI font.
2. `Fraunces, "Times New Roman", serif`
   - Headline/display font.
3. `Arial`
   - Appears on several native form controls and buttons in gameplay screens.

## Interpretation
The first two stacks match the intended design system in `src/index.css` and module styles:

- Sans for body/UI text.
- Serif display for major headings.

The extra `Arial` usage is most likely not intentional branding. It commonly appears when native controls do not inherit the page font stack consistently.

## Proposed changes

### 1) Eliminate unintentional Arial fallback (recommended, low risk)
Add explicit font inheritance for interactive controls globally:

- `button, input, select, textarea { font: inherit; }`

This should align control typography with Space Grotesk and remove mixed-font moments in game controls.

### 2) Centralize typography tokens (recommended)
Define explicit variables in the root theme layer and consume them everywhere:

- `--font-sans: "Space Grotesk", "Segoe UI", sans-serif;`
- `--font-display: "Fraunces", "Times New Roman", serif;`

Then replace hard-coded stacks in module CSS with variables for consistency and easier future swaps.

### 3) Tighten Google Fonts payload (optional optimization)
Current import pulls:

- Fraunces: 600, 700
- Space Grotesk: 400, 500, 600

If weight 500 is not used in shipped CSS, remove it from the import URL to reduce font transfer size. Keep this only after confirming no visual regressions.

### 4) Future-proof option for Phase 2+ (optional)
Consider self-hosting WOFF2 fonts to reduce third-party dependency and improve cache control. This is optional in Phase 1.5 but can improve performance stability later.

## Suggested rollout order
1. Ship control font inheritance fix.
2. Tokenize font stacks.
3. Audit used weights and trim imports.
4. Re-check all routes for consistency.
