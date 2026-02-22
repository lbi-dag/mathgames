# Implementation Plan: Remove "Sprint" from game names and align messaging

## Goal
Align product language with the unified mode model:
- **Mode names**: Sprint + Survival (shared across all games)
- **Game names**: game identity only (no mode suffix)
- **Session messaging**: reflects current Sprint lengths (1/3/5 minutes)

## Constraints to respect
- Do not alter game-engine determinism.
- Do not change leaderboard key structure: `${gameId}|${mode}`.
- Keep lifecycle logic centralized in `GameShell`/`game-shell`.

## Step-by-step plan

1. **Inventory and decide final naming map**
   - Confirm target names (example candidates):
     - `Number Sense Sprint` -> `Number Sense`
     - `Exponent Sprint` -> `Exponent Trainer` or `Exponent Practice`
   - Ensure names are consistent across page titles, cards, and metadata.

2. **Update game definitions (display text first)**
   - Edit `title`/`subtitle` in per-game `definition.tsx` files.
   - Verify no UI surfaces still render old "Sprint" names.

3. **Rename routing/page identifiers (internal consistency)**
   - Rename page components/files that encode "Sprint" where practical.
   - Update route imports/usages to keep navigation stable.
   - Decide whether URL paths remain backward-compatible or migrate to cleaner names.

4. **Keep engine and IDs stable unless migration is explicitly planned**
   - Prefer preserving `gameId` values initially to avoid leaderboard reset.
   - If `gameId` rename is desired, add a versioned migration strategy for local storage.

5. **Update landing copy for session duration accuracy**
   - Replace "2-5 minute bursts" with wording that includes 1/3/5-minute sessions.
   - Validate tone still matches current product messaging.

6. **Test and validate**
   - Run full test suite.
   - Smoke-check key pages/routes load and render updated names.
   - Confirm Sprint minute buttons remain 1m/3m/5m and mode toggle remains Sprint/Survival.

7. **Documentation touch-up**
   - If any docs mention old game names or 2-5 minute sessions, update them.

## Risks and mitigations
- **Risk**: Renaming `gameId` can split or reset local leaderboard data.
  - **Mitigation**: Keep existing IDs, or add explicit storage migration.
- **Risk**: Route renames break external/deep links.
  - **Mitigation**: Add redirects/aliases or preserve current paths.
- **Risk**: Text-only changes miss hidden UI labels.
  - **Mitigation**: Use targeted search for "Sprint" occurrences and manually verify surfaces.

## Definition of done
- Game names no longer contain "Sprint".
- Shared mode labels remain Sprint/Survival.
- Landing messaging reflects 1/3/5-minute Sprint durations.
- Tests pass and no regression in core game shell behavior.
