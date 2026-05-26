# Storage Schema

Versioned local storage reference for the current Phase 1.5 client app.

## Keys

### `mathgames.leaderboard`
Best score per stable leaderboard identity.

```json
{
  "version": 1,
  "scores": {
    "speed-arithmetic|sprint": 17,
    "speed-arithmetic|survival": 9,
    "power-blitz|sprint": 14,
    "number-sense|exam": 312
  },
  "migratedLegacyKeys": true
}
```

Rules:
- Key format: `${gameId}|${mode}`
- Sprint duration is not part of the key
- Exam best scores use the same identity model, for example `number-sense|exam`
- Sprint and survival scores are clamped to non-negative integers
- Exam scores may be negative and are stored as signed integers
- The highest score wins for a given identity

Legacy migration:
- `exponentSprintBestScore` -> `power-blitz|sprint`
- `numberSenseBest:sprint` + `numberSenseSprintBestScore` -> `speed-arithmetic|sprint` using the higher value
- `numberSenseBest:survival` -> `speed-arithmetic|survival`

Legacy game ID normalization inside stored v1 entries:
- `number-sense-sprint` -> `speed-arithmetic`
- `prime-factor-challenge` -> `factor-rush`
- `exponent-sprint` -> `power-blitz`

### `mathgames.sprintPrefs`
Preferred sprint duration by arcade game.

```json
{
  "version": 1,
  "byGame": {
    "speed-arithmetic": 3,
    "power-blitz": 1
  }
}
```

Rules:
- Stored per normalized game ID
- Allowed values are `1`, `3`, or `5`
- Missing or invalid values fall back to `1`

### `mathgames.ui.theme`
Saved theme preference for the shell UI.

```json
{
  "version": 1,
  "mode": "system"
}
```

Rules:
- Allowed values are `light`, `dark`, or `system`
- Invalid or missing values fall back to `system`

## Ownership
- `src/game-shell/leaderboard.ts` owns leaderboard and sprint preference reads, writes, and migrations
- `src/components/theme/storage.ts` owns theme preference storage
- Route pages and presentation components must not write leaderboard data directly

## Migration Policy
- All stored payloads must remain versioned
- Renames of game IDs, modes, or storage keys require explicit migration logic
- Schema changes must preserve existing user scores and preferences
