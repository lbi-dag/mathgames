# MathGames.win Product Roadmap (Phases 1-3)

## Vision
MathGames.win aims to become a Lichess-style open math competition platform, starting with frictionless solo play and evolving into a trusted, identity-based competitive environment.

This document defines the staged evolution of the platform through Phase 3. Real-time multiplayer is intentionally excluded at this time.

## Phase 1 - The Soloist (Client-Only Foundation)
### Goal
Deliver a polished, fast, addictive solo math experience with clean architecture and zero backend dependency.

### Hosting
Cloudflare Pages (static).

### Core Features
#### Gameplay
- Unified GameShell architecture.
- Two modes available for all games:
  - Sprint (timed): 1 / 3 / 5 minutes. Ends on time = 0 OR 3 wrong answers.
  - Survival (untimed): Ends on first wrong answer.
- Score = number of correct answers.
- Difficulty increases every 2 or 3 correct answers (randomized per level).
- Seeded RNG per run (deterministic within run, different across sessions).

#### Leaderboard
- Local best score per `(gameId, mode)` stored in versioned localStorage.
- No global leaderboard.
- Sprint duration does NOT affect leaderboard key.

#### Architecture
- All gameplay logic runs through `src/game-shell/`.
- Each game implements `GameDefinition`.
- UI does not embed game logic.
- Engine must remain deterministic.

### Daily Challenge (Optional Phase 1 Enhancement)
- Seed = `YYYY-MM-DD`.
- Same challenge for all players (but not globally verified).

### Non-Goals
- No backend.
- No global leaderboard.
- No user login.
- No anti-cheat.
- No cross-device persistence.

### Exit Criteria
- All games run through unified GameShell.
- Deterministic engine tests pass.
- Local leaderboard works consistently.

## Phase 2 - The Trusted Referee (Global Stats and Lightweight Validation)
### Goal
Introduce global visibility and light trust without adding full account infrastructure.

### Hosting
Cloudflare Workers + KV or D1.

### Core Features
#### Global Leaderboard
- Global best score per `(gameId, mode)`.
- Optional separate Daily leaderboard.
- Anonymous submissions allowed.

#### Anonymous Identity
- Client generates persistent random `clientId`.
- Display random nickname (example: `CuriousKoala`).

#### Basic Anti-Cheat
- Validate structural integrity of run:
  - Reasonable score vs duration.
  - No impossible values.
- Future-ready for deterministic seed replay.
- Verified runs marked separately from unverified.

#### Players Online Counter
- `POST /heartbeat` every 60 seconds.
- Online = clients active in last 120 seconds.
- UI refresh every 60 seconds.
- No login required.

### Non-Goals
- No accounts.
- No rating system.
- No long-term personal history.

### Exit Criteria
- Global leaderboard stable.
- Online counter functioning.
- Abuse manageable.
- Workers cost within free tier or minimal paid tier.

## Phase 3 - The Persona (Identity and Retention)
### Goal
Turn players into returning users with identity, progression, and personal stats.

### Hosting
Cloudflare Workers + Auth provider (Clerk or similar) + D1.

### Core Features
#### Authentication
- Social login (Google, etc.).
- Persistent user profile.
- Username + optional avatar.

#### Personal Dashboard
- Personal best per game.
- Historical performance tracking.
- Daily streak tracking.
- Performance charts (basic analytics).

#### Skill Rating (Math Elo) 
- Rating per game/mode.
- Daily challenge contributes to rating.
- Verified runs required for rating updates.

#### Enhanced Validation
- Deterministic replay of runs using seed.
- Verified badge system.
- Separate verified leaderboard.

### Non-Goals
- No real-time multiplayer.
- No live tournaments.
- No chat or social feeds.

### Exit Criteria
- Users can log in and view stats.
- Rating system operational.
- Verified leaderboard functional.
- Retention metrics measurable.

## Strategic Philosophy
- Phase 1 delivers fun.
- Phase 2 delivers trust.
- Phase 3 delivers retention.

Multiplayer is optional future expansion, not required for product success.

## Architectural Invariants Across All Phases
- Game engine must remain deterministic.
- RNG must be seeded per run.
- Game logic must remain separate from UI.
- Leaderboard keys must remain stable.
- Backward compatibility for stored data must be preserved via versioning.

## Definition of "Complete Product"
The product is considered viable and complete at the end of Phase 3 if:
- Solo gameplay is smooth.
- Global leaderboard works.
- Users can log in.
- Users can track personal progress.
- Rating system drives return engagement.

Real-time multiplayer is not required for success.
