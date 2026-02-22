import type { GameMode, SprintMinutes } from "./types";

export const LEADERBOARD_STORAGE_KEY = "mathgames.leaderboard";
export const SPRINT_PREFS_STORAGE_KEY = "mathgames.sprintPrefs";

export type LeaderboardV1 = {
  version: 1;
  scores: Record<string, number>;
  migratedLegacyKeys?: boolean;
};

export type SprintPrefsV1 = {
  version: 1;
  byGame: Record<string, SprintMinutes>;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const DEFAULT_LEADERBOARD: LeaderboardV1 = {
  version: 1,
  scores: {},
  migratedLegacyKeys: false,
};

const DEFAULT_SPRINT_PREFS: SprintPrefsV1 = {
  version: 1,
  byGame: {},
};

function getStorage(storage?: StorageLike) {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function parseInteger(value: string | null) {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}

function makeLeaderboardEntryKey(gameId: string, mode: GameMode) {
  return `${gameId}|${mode}`;
}

function saveLeaderboard(data: LeaderboardV1, storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;
  target.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
}

function saveSprintPrefs(data: SprintPrefsV1, storage?: StorageLike) {
  const target = getStorage(storage);
  if (!target) return;
  target.setItem(SPRINT_PREFS_STORAGE_KEY, JSON.stringify(data));
}

function migrateLegacyIfNeeded(data: LeaderboardV1, storage?: StorageLike) {
  if (data.migratedLegacyKeys) {
    return data;
  }

  const target = getStorage(storage);
  if (!target) {
    return { ...data, migratedLegacyKeys: true };
  }

  const next: LeaderboardV1 = {
    version: 1,
    scores: { ...data.scores },
    migratedLegacyKeys: true,
  };

  const exponentSprintBest = parseInteger(target.getItem("exponentSprintBestScore"));
  if (exponentSprintBest > 0) {
    const key = makeLeaderboardEntryKey("exponent-sprint", "sprint");
    next.scores[key] = Math.max(next.scores[key] ?? 0, exponentSprintBest);
  }

  const numberSenseSprintBest = Math.max(
    parseInteger(target.getItem("numberSenseBest:sprint")),
    parseInteger(target.getItem("numberSenseSprintBestScore")),
  );
  if (numberSenseSprintBest > 0) {
    const key = makeLeaderboardEntryKey("number-sense-sprint", "sprint");
    next.scores[key] = Math.max(next.scores[key] ?? 0, numberSenseSprintBest);
  }

  const numberSenseSurvivalBest = parseInteger(target.getItem("numberSenseBest:survival"));
  if (numberSenseSurvivalBest > 0) {
    const key = makeLeaderboardEntryKey("number-sense-sprint", "survival");
    next.scores[key] = Math.max(next.scores[key] ?? 0, numberSenseSurvivalBest);
  }

  return next;
}

export function readLeaderboard(storage?: StorageLike): LeaderboardV1 {
  const target = getStorage(storage);
  if (!target) return { ...DEFAULT_LEADERBOARD };

  const raw = target.getItem(LEADERBOARD_STORAGE_KEY);
  let parsed: LeaderboardV1 = { ...DEFAULT_LEADERBOARD };

  if (raw) {
    try {
      const candidate = JSON.parse(raw) as Partial<LeaderboardV1>;
      if (candidate.version === 1 && candidate.scores && typeof candidate.scores === "object") {
        parsed = {
          version: 1,
          scores: Object.fromEntries(
            Object.entries(candidate.scores).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
          ),
          migratedLegacyKeys: Boolean(candidate.migratedLegacyKeys),
        };
      }
    } catch {
      parsed = { ...DEFAULT_LEADERBOARD };
    }
  }

  const migrated = migrateLegacyIfNeeded(parsed, target);
  saveLeaderboard(migrated, target);
  return migrated;
}

export function getBestScore(gameId: string, mode: GameMode, storage?: StorageLike) {
  const data = readLeaderboard(storage);
  return data.scores[makeLeaderboardEntryKey(gameId, mode)] ?? 0;
}

export function saveBestScore(gameId: string, mode: GameMode, score: number, storage?: StorageLike) {
  const safeScore = Math.max(0, Math.floor(score));
  const data = readLeaderboard(storage);
  const entryKey = makeLeaderboardEntryKey(gameId, mode);
  const currentBest = data.scores[entryKey] ?? 0;
  if (safeScore <= currentBest) {
    return { updated: false as const, bestScore: currentBest };
  }

  const next: LeaderboardV1 = {
    ...data,
    scores: {
      ...data.scores,
      [entryKey]: safeScore,
    },
  };
  saveLeaderboard(next, storage);
  return { updated: true as const, bestScore: safeScore };
}

export function resetBestScore(gameId: string, mode: GameMode, storage?: StorageLike) {
  const data = readLeaderboard(storage);
  const entryKey = makeLeaderboardEntryKey(gameId, mode);
  if (!(entryKey in data.scores)) return;
  const nextScores = { ...data.scores };
  delete nextScores[entryKey];
  saveLeaderboard({ ...data, scores: nextScores }, storage);
}

export function readSprintPrefs(storage?: StorageLike): SprintPrefsV1 {
  const target = getStorage(storage);
  if (!target) return { ...DEFAULT_SPRINT_PREFS };

  const raw = target.getItem(SPRINT_PREFS_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_SPRINT_PREFS };

  try {
    const candidate = JSON.parse(raw) as Partial<SprintPrefsV1>;
    if (candidate.version !== 1 || !candidate.byGame || typeof candidate.byGame !== "object") {
      return { ...DEFAULT_SPRINT_PREFS };
    }

    const byGame = Object.fromEntries(
      Object.entries(candidate.byGame).map(([gameId, value]) => {
        const minute = Number(value);
        const safeValue: SprintMinutes = minute === 3 || minute === 5 ? minute : 1;
        return [gameId, safeValue];
      }),
    ) as Record<string, SprintMinutes>;

    return { version: 1, byGame };
  } catch {
    return { ...DEFAULT_SPRINT_PREFS };
  }
}

export function getSprintMinutesForGame(gameId: string, storage?: StorageLike): SprintMinutes {
  const prefs = readSprintPrefs(storage);
  return prefs.byGame[gameId] ?? 1;
}

export function setSprintMinutesForGame(gameId: string, minutes: SprintMinutes, storage?: StorageLike) {
  const prefs = readSprintPrefs(storage);
  const next: SprintPrefsV1 = {
    version: 1,
    byGame: {
      ...prefs.byGame,
      [gameId]: minutes,
    },
  };
  saveSprintPrefs(next, storage);
}
