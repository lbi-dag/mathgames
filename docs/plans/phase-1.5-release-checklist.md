# Phase 1.5 Release Checklist

Use this checklist before declaring a Phase 1.5 release candidate ready. It
verifies the static client build as a player experiences it; it does not add
Phase 2 functionality or replace the existing deterministic and storage test
coverage.

## Run record

Record each release pass here or in the corresponding GitHub issue.

| Field | Value |
| --- | --- |
| Commit | `<commit>` |
| Date | `<YYYY-MM-DD>` |
| Environment | `<local preview / Cloudflare Pages preview / production>` |
| `VITE_SITE_URL` | `<canonical URL>` |
| Browser and viewports | `<browser; narrow and desktop widths>` |
| Tester | `<name>` |
| Result | `pass / fail / pass with approved exception` |
| Exceptions | `<issue links and release decision, if any>` |

Every blocking item must pass. A failed item blocks release unless its linked
exception is explicitly approved. Perform browser checks in an isolated
profile, or clear storage only before the run—not while verifying an in-app
reset.

## 1. Automated baseline

- [ ] From a clean checkout, `npm test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] The build regenerates `public/robots.txt` and `public/sitemap.xml`.
- [ ] Both generated files use the intended `VITE_SITE_URL` canonical domain.

## 2. Canonical routes and navigation

At both a narrow mobile viewport and a desktop viewport, direct-load each
canonical route. Confirm it renders, has a sensible page title, and exposes
usable primary controls without clipping or overlap.

- [ ] `/`
- [ ] `/about`
- [ ] `/speed-arithmetic`
- [ ] `/factor-rush`
- [ ] `/power-blitz`
- [ ] `/target-24`
- [ ] `/number-sense`

For each game page, use **Back to games** and confirm it returns to the
launcher. From the launcher, open each game card and confirm it reaches the
matching canonical route.

## 3. Legacy redirect coverage

Direct-load every retained legacy route. It must redirect once to the stated
canonical destination.

| Legacy route | Expected destination |
| --- | --- |
| `/games/number-sense-sprint` | `/speed-arithmetic` |
| `/games/number-sense` | `/speed-arithmetic` |
| `/games/prime-factor-challenge` | `/factor-rush` |
| `/games/factor-rush` | `/factor-rush` |
| `/games/exponent-sprint` | `/power-blitz` |
| `/games/exponent-practice` | `/power-blitz` |
| `/games/power-blitz` | `/power-blitz` |
| `/games/speed-arithmetic` | `/speed-arithmetic` |

## 4. Arcade gameplay and local bests

Repeat this for Speed Arithmetic, Factor Rush, Power Blitz, and Target 24.

- [ ] Choose a duration and start a **Sprint** run. Answer at least one
  question correctly, then finish the run by timer expiry or three wrong
  answers. Confirm the timer, wrong-answer limit, and final score match the
  selected mode.
- [ ] Start a **Survival** run, answer at least one question correctly, then
  submit a wrong answer. Confirm that it ends the run with a positive score.
- [ ] Record the positive best in each mode. Reload, select each mode again,
  and verify both recorded bests persist. Scores are saved when a run ends;
  starting a run or submitting an answer alone does not verify persistence.
- [ ] Change the Sprint duration, reload, and confirm that game retains its
  preferred duration.
- [ ] Confirm best score is displayed for the active `(gameId, mode)` only;
  changing the Sprint duration does not create a separate best.
- [ ] Before using **Reset Best**, establish and record nonzero bests in the
  selected game/mode, its other mode, and another game. Reset the selected
  best, then reload and verify it is zero while both other recorded bests
  remain unchanged. Re-establish these nonzero controls before each reset
  check; an all-zero profile cannot demonstrate reset isolation.

## 5. A+ Number Sense exam flow

- [ ] The landing card is discoverable, labelled **UIL Exam**, and opens
  `/number-sense`.
- [ ] The route introduces an 80-question, 10-minute exam and its `+5 / -4 /
  0` scoring.
- [ ] The player-facing [A+ Number Sense rules](../gameplay/number-sense.md)
  are reachable from repository documentation and match the in-app format.
- [ ] Start an exam, enter an answer, and verify next/previous and question
  grid navigation retain the answer.
- [ ] Submit with blanks and verify the confirmation dialog reports the blank
  count; canceling returns to the exam.
- [ ] Submit the exam and verify score breakdown, result review, local best,
  and scoped **Reset Best** behavior.

## 6. Theme persistence

- [ ] Select light, dark, and system in the theme toggle on a game route.
- [ ] Reload and navigate to another route; the selected preference persists.
- [ ] At both target viewports, the toggle remains operable and does not cover
  game controls.

## 7. Static SEO assets

- [ ] `robots.txt` allows crawling and points at `<canonical-url>/sitemap.xml`.
- [ ] `sitemap.xml` contains exactly these seven indexable routes: `/`,
  `/about`, `/speed-arithmetic`, `/factor-rush`, `/power-blitz`, `/target-24`,
  and `/number-sense`.
- [ ] No redirect-only legacy route appears in the sitemap.
- [ ] If using an overridden `VITE_SITE_URL`, regenerate assets and verify the
  override is normalized without duplicated trailing slashes.

## Completion

Attach the completed run record to the release issue, record any approved
exception, and update the backlog sequence. Do not close the release gate
until every blocking item has passed.
