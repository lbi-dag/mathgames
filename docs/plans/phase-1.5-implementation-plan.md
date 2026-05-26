# Phase 1.5 Implementation Plan

## Goal
Finish Phase 1.5 as a coherent, documented, replay-ready client-only foundation.

This is not a greenfield Phase 1 plan. The repo already has the core shared engine, local leaderboard, static deployment path, and exam support. The remaining work is to close the gaps between the roadmap, the docs, and the current implementation so the project can exit Phase 1.5 cleanly.

## Current State Snapshot
Already implemented:
- Shared `GameShell` flow for sprint/survival games
- Shared `ExamShell` and exam engine for A+ Number Sense
- Deterministic seeded generation inside engine/game logic
- Shared session helpers that centralize run/exam seed creation and exam slot generation
- Versioned local leaderboard and sprint preference storage
- Legacy game ID migrations
- Static metadata and generated sitemap/robots flow
- Passing test suite and production build

Current validation baseline as of March 10, 2026:
- `npm test`: 109 tests passing
- `npm run build`: passing

## Phase 1.5 Exit Criteria
Phase 1.5 should be considered complete when:
- The documentation matches the current product shape.
- The run and exam architecture boundaries are explicit and enforced.
- Deterministic generation is documented and tested well enough for future replay validation.
- Local storage identity and migration behavior are stable.
- Static-site deployment inputs are consistent across docs, env, and generated assets.

## Out Of Scope
Do not add:
- Backend APIs
- Global leaderboards
- Authentication
- Remote submission
- Anti-cheat
- Ratings
- Profiles

## Workstreams

### 1. Documentation Alignment
Priority: Highest

Problem:
- Some docs still describe Phase 1 as only sprint/survival under a single `GameShell`.
- The repo now includes `exam` mode, `ExamShell`, and A+ Number Sense as a first-class path.
- `AGENTS.md` previously referenced a stale roadmap path.

Tasks:
1. Make `AGENTS.md` the concise architectural contract for the current repo.
2. Update `README.md` to distinguish arcade run flows from exam flows.
3. Update `docs/plans/roadmap.md` to clarify that Phase 1.5 allows exam-format solo experiences while remaining fully client-only.
4. Add a gameplay rules doc for Number Sense so every shipped game has a corresponding rules document.
5. Normalize wording across docs for:
   - current phase name
   - supported modes
   - current game list
   - scoring policies

Definition of done:
- No core doc contradicts the actual route/mode architecture.
- Every shipped game has a player-facing rules doc.
- Source-of-truth doc references are accurate.

### 2. Architecture Hardening
Priority: High

Problem:
- The engine split is conceptually sound, but Phase 1.5 should leave behind clear rules for what belongs in `GameShell` versus `ExamShell`.
- Future Phase 2 replay validation will depend on stable generation boundaries.

Tasks:
1. Audit `src/game-shell/` for shared concerns that are duplicated or implicit between run and exam flows.
2. Decide whether the current single `GameDefinition` contract remains sufficient for both shells or whether a complementary exam-specific type would reduce ambiguity.
3. Centralize seed creation/hand-off rules so seed lifecycle is explicit, documented, and testable.
4. Ensure storage writes remain centralized in shared engine/storage utilities, not shells or pages.
5. Document route-level responsibilities:
   - `pages/` only compose shells
   - `components/` render UI
   - `games/` stay pure except intentional input/render adapters

Definition of done:
- Shared lifecycle boundaries are explicit.
- Deterministic seed ownership is clear.
- No new game needs to invent its own lifecycle or storage path.

### 3. Determinism And Replay Readiness
Priority: High

Problem:
- The project is meant to be Phase 2 validation-ready, but that readiness should be made concrete rather than assumed.

Tasks:
1. Add or expand tests that prove same-seed generation yields stable question sequences for both run and exam paths.
2. Add targeted tests around difficulty progression thresholds and any edge cases where prior question context matters.
3. Confirm answer evaluation is pure and independent of UI state for all games.
4. Document the deterministic contract in code comments or tests where the behavior is not obvious.
5. Identify any remaining uses of `Date.now()` or implicit runtime state that should be isolated behind seed initialization boundaries.

Definition of done:
- Deterministic behavior is enforced by tests, not just by convention.
- Replay assumptions for a future validator are easy to understand from the codebase.

### 4. Storage And Identity Stability
Priority: Medium

Problem:
- Local data is already versioned, but Phase 1.5 should leave behind durable key and migration guarantees.

Tasks:
1. Reconfirm leaderboard key stability for all shipped games and modes, including exam flows.
2. Add migration coverage for any remaining legacy names or route-derived assumptions.
3. Document storage schemas in one place and link to that doc from `AGENTS.md` or `README.md`.
4. Ensure resets are intentional and scoped, not broad localStorage clears.

Definition of done:
- Storage identity is explicit.
- Renames can happen later without accidental score loss.

### 5. Static Site And Deployment Hygiene
Priority: Medium

Problem:
- Canonical URL config can drift unless `.env`, fallback defaults, docs, and generated assets all stay aligned.

Tasks:
1. Keep `https://mathgm.org` as the authoritative canonical domain unless a deployment explicitly overrides `VITE_SITE_URL`.
2. Align `.env`, fallback defaults, README guidance, generated sitemap expectations, and deployment configuration.
3. Keep metadata generation static and environment-driven.
4. Verify every public route is represented in generated SEO assets.

Definition of done:
- The canonical domain is unambiguous.
- Build outputs do not silently disagree with product docs.

### 6. Product Polish For Phase Exit
Priority: Medium

Problem:
- Phase 1.5 should feel complete to a solo player, not just structurally correct to developers.

Tasks:
1. Review landing/about copy for consistency with the actual game set and mode model.
2. Ensure each route has coherent metadata and intro copy.
3. Smoke-test navigation, redirects, theme behavior, and local best-score surfaces.
4. Decide whether any Phase 1.5 UI cleanup is still required for Number Sense discoverability and rules clarity.

Definition of done:
- The product presents one coherent story to players and contributors.

## Suggested Execution Order
1. Documentation alignment
2. Static-site/domain decision
3. Determinism and storage hardening
4. Architecture cleanup if the audit reveals ambiguity
5. Product polish and release pass

## Recommended Deliverables
- Updated core docs: `AGENTS.md`, `README.md`, `docs/plans/roadmap.md`
- New `docs/gameplay/number-sense.md`
- Additional deterministic/replay-oriented tests where needed
- Final Phase 1.5 release checklist doc or issue

## Success Metric
A new contributor should be able to read the docs, inspect the source tree, and reach the same conclusion about:
- what Phase 1.5 is
- which modes and games exist
- how determinism works
- where lifecycle logic lives
- what must not be built yet
