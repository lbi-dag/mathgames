# Issue: Unify game mode naming and update Sprint duration messaging

## Summary
All games now share the same two game modes: **Sprint** and **Survival**. Existing game names still include "Sprint", which is now misleading because Sprint is a mode, not part of the game identity.

In addition, Sprint durations are now **1, 3, and 5 minutes**, but the landing page still says:

> "Short sessions — Each game is built for 2-5 minute bursts that fit into busy days."

This description is now inaccurate.

## Current behavior
- Game titles include "Sprint" for existing games (for example: "Number Sense Sprint", "Exponent Sprint").
- Routes/components/identifiers also carry "sprint" naming patterns for those games.
- Landing page short-session copy says "2-5 minute bursts".

## Expected behavior
- Existing games should be renamed to game-centric names without "Sprint".
- Sprint and Survival remain the universal mode options within `GameShell`.
- Landing page copy should reflect the current Sprint options (**1, 3, 5 minutes**).

## Scope
- Rename affected game display titles.
- Rename corresponding route/page/component identifiers where needed for consistency.
- Preserve deterministic engine behavior and leaderboard key format (`${gameId}|${mode}`).
- Update landing page marketing copy.
- Add/update tests impacted by naming and copy changes.

## Acceptance criteria
- No existing game title includes "Sprint".
- App still exposes only Sprint/Survival modes in the shared shell.
- Sprint minute options remain 1/3/5 and are accurately described on landing page.
- All tests pass after rename/copy updates.
