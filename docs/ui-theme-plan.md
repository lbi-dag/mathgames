# UI Themes Feature Plan (System-Aware Light/Dark)

## Issue Alignment
This plan updates the original draft to align with **GitHub Issue #4** ([link](https://github.com/lbi-dag/mathgames/issues/4)) by defining a concrete, implementation-ready path for a **system-aware theme toggle** with explicit rollout scope, milestones, and acceptance checks for Phase 1.5.

## Goal
Improve accessibility and UI polish by implementing client-only theme support that:
- defaults to system preference,
- allows manual light/dark override,
- persists safely in versioned local storage,
- and remains fully compliant with current Phase 1.5 constraints.

## Phase 1.5 Constraints (Must Hold)
- No backend APIs.
- No authentication or profile-level sync.
- No game engine / RNG / scoring behavior changes.
- No leaderboard key or storage contract regressions.

---

## Product Requirements (Issue #4)
1. Users can choose **Light**, **Dark**, or **System** theme mode.
2. First-time users default to **System**.
3. Selection persists across refreshes and sessions.
4. In **System** mode, theme updates when OS/browser preference changes.
5. Theme is applied globally and consistently across pages/games.
6. Toggle is accessible by keyboard and readable by assistive tech.

---

## Architecture Design

### 1) Theme Domain (UI-only)
Create a dedicated module under `src/components/theme/`:
- `type ThemeMode = 'light' | 'dark' | 'system'`
- `type EffectiveTheme = 'light' | 'dark'`
- `resolveTheme(mode: ThemeMode, prefersDark: boolean): EffectiveTheme`

Keep this domain isolated from `src/game-shell/`.

### 2) Versioned Storage Contract
Introduce a versioned storage key for preferences, e.g.:
- key: `mathgames.ui.theme`
- shape:

```ts
interface ThemePreferenceV1 {
  version: 1;
  mode: 'light' | 'dark' | 'system';
}
```

Rules:
- invalid/corrupt payload => safe fallback to `{ version: 1, mode: 'system' }`
- migration functions must be explicit and test-covered

### 3) Runtime Integration
Add a `ThemeProvider` + `useTheme()` hook that:
- loads stored `ThemeMode`
- subscribes to `window.matchMedia('(prefers-color-scheme: dark)')`
- computes effective theme with `resolveTheme`
- applies `data-theme="light|dark"` on `document.documentElement`
- writes back user preference when mode changes

### 4) Placement of Toggle
Add a compact `ThemeToggle` in shared shell navigation (sidebar/header region) so all routes inherit behavior.

### 5) Styling Strategy
Current project already has global tokens in `src/styles/tokens.css`. Extend this with semantic theme tokens:
- base surface/background (`--bg`, `--surface`, `--surface-elevated`)
- text (`--text-primary`, `--text-secondary`)
- borders/dividers (`--border`)
- interactive/accent (`--accent`, `--accent-contrast`, `--focus-ring`)
- feedback (`--success`, `--error`, `--warning`)

Use `[data-theme='light']` and `[data-theme='dark']` blocks and migrate shared styles first (`src/index.css`, shell/layout styles), then game-level modules.

---

## Delivery Milestones

### Milestone 1 — Theme Core + Tests
- Add theme types, resolver, storage helpers.
- Add unit tests for:
  - resolver matrix (all 3 modes × system dark/light)
  - storage parse/fallback behavior
  - version migration path

### Milestone 2 — Provider Wiring
- Implement `ThemeProvider` and `useTheme`.
- Mount provider at app root (`src/main.tsx` or `src/App.tsx`).
- Apply `data-theme` on document root.

### Milestone 3 — Tokenization and Base UI
- Add semantic tokens for light/dark.
- Update global/base styles to consume semantic tokens.
- Ensure default contrast remains WCAG AA.

### Milestone 4 — Accessible Toggle UI
- Add `ThemeToggle` component with:
  - visible label + icon support
  - ARIA name/state
  - keyboard operation and focus ring
- Integrate into shared navigation.

### Milestone 5 — QA, Visual Pass, and Hardening
- Manual pass for all pages/routes in both themes.
- Verify `system` mode live updates when OS theme changes.
- Check no flash-of-wrong-theme on reload (apply preference pre-paint when feasible).

---

## Accessibility Checklist
- WCAG AA contrast for text and interactive controls in both themes.
- Keyboard-only usability (Tab/Shift+Tab, Enter/Space as applicable).
- Persistent visible focus styles.
- Respect `prefers-reduced-motion` for theme transitions.
- Non-color cues preserved for status/feedback where applicable.

---

## Testing Plan

### Automated
- `theme/resolveTheme.test.ts`
- `theme/storage.test.ts`
- `ThemeProvider.test.tsx` (or equivalent integration test)

### Manual
- Toggle mode changes across all main routes.
- Refresh persistence checks.
- OS theme switch behavior while in `system`.
- Keyboard-only toggle interaction.
- Quick regression scan of game pages for readability.

---

## Risks and Mitigations
- **Legacy hard-coded colors** may reduce dark-mode readability.
  - Mitigation: migrate shared shell first, then per-game styles incrementally.
- **Initial theme flash** on app boot.
  - Mitigation: resolve/apply stored mode before full React paint where possible.
- **Storage schema drift** over time.
  - Mitigation: strict version field + explicit migration tests.

---

## Definition of Done (Issue #4)
- [ ] Theme selector supports Light / Dark / System.
- [ ] Default mode is System for new users.
- [ ] Preference persists with versioned local storage.
- [ ] System mode reacts to `prefers-color-scheme` changes.
- [ ] Global styles are theme-aware on all current pages.
- [ ] Toggle is keyboard-accessible and screen-reader friendly.
- [ ] Automated tests added for resolver + storage (and provider behavior if practical).
- [ ] No Phase 2/3 scope creep introduced.
