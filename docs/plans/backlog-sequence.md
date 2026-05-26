# Backlog Sequence

This is the current recommended implementation order for agents. Work top-to-bottom unless a maintainer updates this file or the user explicitly chooses another task.

After completing an issue, update this sequence if priorities changed, remove completed items when appropriate, and keep the corresponding GitHub issue linked to this file.

## Active Sequence

1. #23 - Remove unused legacy game components that bypass GameShell
   - Goal: eliminate stale code paths that bypass shared lifecycle, RNG, and storage rules.
   - Done when: unused files are removed or quarantined, related dead styles/imports are cleaned up, and test/lint/build pass.

2. #18 - Add deterministic replay coverage across all game definitions
   - Goal: prove same-seed generation is stable for run and exam paths.
   - Done when: replay-oriented tests cover all shipped games and relevant engine/session paths.

3. #20 - Harden local leaderboard migration and reset behavior
   - Goal: protect local user data and leaderboard identity through future renames and schema changes.
   - Done when: migration and reset tests cover current storage guarantees without broad localStorage clears.

4. #17 - Clarify Phase 1 mode requirements for exam-only games
   - Goal: make the arcade-mode default and exam-only exception explicit in docs and contracts.
   - Done when: docs and type-level expectations make sprint/survival vs exam requirements unambiguous.

5. #24 - Create Phase 1.5 release checklist and smoke-test pass
   - Goal: provide a final Phase 1.5 exit gate before Phase 2 planning or implementation.
   - Done when: the checklist covers navigation, redirects, theme persistence, local best-score surfaces, Number Sense discoverability, generated SEO assets, and the standard test/lint/build baseline.

6. #25 - Create a MathGames UI Codex skill for consistent enhancement work
   - Goal: capture repo-specific UI, product, and architecture constraints in a reusable local Codex skill.
   - Done when: the skill documents UI conventions, Phase 1.5 constraints, architecture boundaries, asset guidance, and a UI enhancement checklist without changing app runtime behavior.

7. #22 - Set up conservative Dependabot dependency updates
   - Goal: keep dependency maintenance safe and low-noise.
   - Done when: Dependabot config is scoped, conservative, and compatible with the existing CI checks.

8. #19 - Define and implement client-only Daily Challenge mode
   - Goal: add the optional Phase 1 daily challenge using deterministic date-based seeds.
   - Done when: daily seed behavior is deterministic, client-only, documented, and covered by tests.

9. #21 - Write Phase 2 API contract without implementing backend calls
   - Goal: prepare Phase 2 planning without violating Phase 1.5 static-client constraints.
   - Done when: API contract docs exist and no backend code, remote submission, auth, or global leaderboard is implemented.

## Label Suggestions

Suggested labels for backlog grooming:

- `phase-1.5`: #17, #18, #20, #23, #24
- `phase-2-planning`: #21
- `architecture`: #17, #18, #23
- `determinism`: #18
- `storage`: #20
- `product`: #19, #24
- `documentation`: #17, #21, #24, #25
- `maintenance`: #22, #23, #25
- `dependencies`: #22
- `tooling`: #25
- `priority-high`: #18, #20, #23
- `priority-medium`: #17, #22, #24, #25
- `priority-low`: #19, #21 until Phase 1.5 exit is complete
