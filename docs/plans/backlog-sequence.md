# Backlog Sequence

This is the current recommended implementation order for agents. Work top-to-bottom unless a maintainer updates this file or the user explicitly chooses another task.

After completing an issue, update this sequence if priorities changed, remove completed items when appropriate, and keep the corresponding GitHub issue linked to this file.

## Active Sequence

1. #24 - Create Phase 1.5 release checklist and smoke-test pass
   - Plan: `docs/plans/issue-24-phase-1.5-release-checklist-plan.md`
   - Checklist: `docs/plans/phase-1.5-release-checklist.md`
   - Goal: provide a final Phase 1.5 exit gate before Phase 2 planning or implementation.
   - Done when: the checklist is completed against a release candidate and its run record is attached to the issue.

2. #25 - Create a MathGames UI Codex skill for consistent enhancement work
   - Goal: capture repo-specific UI, product, and architecture constraints in a reusable local Codex skill.
   - Done when: the skill documents UI conventions, Phase 1.5 constraints, architecture boundaries, asset guidance, and a UI enhancement checklist without changing app runtime behavior.

3. #22 - Set up conservative Dependabot dependency updates
   - Goal: keep dependency maintenance safe and low-noise.
   - Done when: Dependabot config is scoped, conservative, and compatible with the existing CI checks.

4. #19 - Define and implement client-only Daily Challenge mode
   - Goal: add the optional Phase 1 daily challenge using deterministic date-based seeds.
   - Done when: daily seed behavior is deterministic, client-only, documented, and covered by tests.

5. #21 - Write Phase 2 API contract without implementing backend calls
   - Goal: prepare Phase 2 planning without violating Phase 1.5 static-client constraints.
   - Done when: API contract docs exist and no backend code, remote submission, auth, or global leaderboard is implemented.

## Label Suggestions

Suggested labels for backlog grooming:

- `phase-1.5`: #24
- `phase-2-planning`: #21
- `architecture`: none currently active
- `determinism`: none currently active
- `storage`: none currently active
- `product`: #19, #24
- `documentation`: #17, #21, #24, #25
- `maintenance`: #22, #23, #25
- `dependencies`: #22
- `tooling`: #25
- `priority-high`: none currently active
- `priority-medium`: #22, #24, #25
- `priority-low`: #19, #21 until Phase 1.5 exit is complete
