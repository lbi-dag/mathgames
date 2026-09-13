# Implementation Plan: #24 Phase 1.5 Release Checklist and Smoke Test

## Goal

Create one repeatable Phase 1.5 release gate that verifies the shipped
client-only product as a player experiences it and records the standard
engineering baseline. The deliverable is a checklist and its accompanying
smoke-test guidance, not a new feature or a move toward Phase 2.

## Current state

- The app has seven canonical routes in `src/App.tsx` and eight retained
  legacy redirects.
- Arcade best scores and sprint preferences are owned by
  `src/game-shell/leaderboard.ts`; A+ Number Sense stores its exam best under
  `number-sense|exam`.
- Theme preference is versioned separately under `mathgames.ui.theme`.
- The landing gallery already exposes A+ Number Sense as an `UIL Exam`, and
  the player rules live at `docs/gameplay/number-sense.md`.
- `scripts/generate-site-assets.mjs` produces `public/robots.txt` and
  `public/sitemap.xml` from the canonical route list during `predev` and
  `prebuild`.
- Unit coverage protects the engine, storage, theme storage, deterministic
  replay, and exam scoring, but there is no single release checklist for the
  browser-facing flow.

## Scope and constraints

- Keep the release process fully static and client-only.
- Do not add backend calls, authentication, global scores, analytics, or
  release tooling dependencies just for this checklist.
- Reuse existing routes, storage contracts, game shells, and test commands.
- Separate automated checks from manual browser checks so a passing build is
  not mistaken for a complete player-facing verification.

## Plan

1. **Add the canonical checklist document**
   - Create `docs/plans/phase-1.5-release-checklist.md` as the release-gate
     artifact linked from `docs/plans/backlog-sequence.md`.
   - Include the app version/commit, environment, canonical `VITE_SITE_URL`,
     browser/device coverage, tester, and date as a small run record at the
     top. Do not write test results into source-of-truth product docs.
   - State pass/fail rules: every blocking item must pass; known exceptions
     need an issue link and explicit release decision.

2. **Define the automated baseline section**
   - Require `npm test`, `npm run lint`, and `npm run build` from a clean
     checkout.
   - Confirm the build's asset-generation step regenerated `public/robots.txt`
     and `public/sitemap.xml` using the intended environment-driven canonical
     URL.
   - Add a lightweight test for `scripts/generate-site-assets.mjs` only if the
     checklist audit exposes an untested route or canonical-url regression;
     otherwise keep the existing script and build hook unchanged.

3. **Add navigation and redirect smoke cases**
   - List each canonical route: `/`, `/about`, `/speed-arithmetic`,
     `/factor-rush`, `/power-blitz`, `/target-24`, and `/number-sense`.
   - For each, verify direct-load rendering, a sensible page title, and a path
     back to the launcher where applicable.
   - Verify every retained legacy path redirects once to its documented modern
     destination:
     - `/games/number-sense-sprint` and `/games/number-sense` →
       `/speed-arithmetic`
     - `/games/prime-factor-challenge` and `/games/factor-rush` →
       `/factor-rush`
     - `/games/exponent-sprint`, `/games/exponent-practice`, and
       `/games/power-blitz` → `/power-blitz`
     - `/games/speed-arithmetic` → `/speed-arithmetic`
   - Include one narrow viewport and one desktop viewport in the manual pass;
     check no primary control is clipped or inaccessible.

4. **Add gameplay and local-data smoke cases**
   - On each arcade game, start a Sprint and Survival run, submit an answer,
     verify the selected mode and Sprint duration behave as displayed, and
     confirm the best-score/reset UI is scoped to the active game and mode.
   - Verify a changed Sprint duration survives reload for that game and does
     not create a duration-specific best-score identity.
   - On A+ Number Sense, verify the landing card, route, player rules link,
     80-question/10-minute intro, answer navigation, incomplete-exam
     confirmation, scoring summary, local exam best, and scoped reset.
   - Use an isolated browser profile (or documented storage reset procedure)
     for repeatable checks. Do not clear all localStorage during a normal
     in-app reset verification.

5. **Add theme persistence smoke cases**
   - Change between light, dark, and system theme modes on a game route.
   - Reload and navigate to a different route; confirm the selected preference
     persists and the `[data-theme]` state remains coherent.
   - Verify the toggle is usable at both viewport sizes and does not cover
     game controls.

6. **Add static SEO asset checks**
   - Inspect `robots.txt` for a permissive crawl rule and the canonical
     sitemap URL.
   - Inspect `sitemap.xml` for exactly the seven canonical indexable routes;
     redirects must not be included.
   - When testing a deployment override, rerun the generator with that
     `VITE_SITE_URL` and confirm both files use the override without a trailing
     slash duplication.

7. **Document completion and maintain the backlog**
   - After a successful run, record the release-gate result in the checklist
     run record or the #24 issue, including the commit and environment.
   - Close #24 only after all blocking cases pass.
   - Remove already-completed #18 and #20 from the active sequence and retain
     #24 as the active exit gate until its smoke pass is recorded.

## Definition of done

- A contributor can run one documented checklist without inferring routes,
  storage rules, or validation commands.
- The checklist covers navigation, legacy redirects, responsive controls,
  theme persistence, arcade and exam best-score surfaces, Number Sense
  discoverability/rules, and generated SEO assets.
- It distinguishes automated validation from manual browser verification.
- A completed run records its commit, environment, and any approved exception.
- No Phase 2 capability or runtime dependency is introduced.

## Risks and mitigations

- **Checklist becomes stale after a route change:** make the canonical route
  list and redirect map explicit, and require checklist updates in the same
  change.
- **Manual checks are inconsistent:** use an isolated profile, named viewport
  coverage, deterministic pass/fail wording, and a run record.
- **Generated assets use the wrong domain:** verify the environment value and
  generated files as part of every release pass.
- **Release confidence relies only on UI smoke testing:** retain the mandatory
  full test, lint, and production-build baseline.
