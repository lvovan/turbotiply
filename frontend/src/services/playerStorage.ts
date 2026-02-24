import type { Player, PlayerStore, GameRecord, RoundResult, GameMode } from '../types/player';

export type { GameRecord } from '../types/player';

/** localStorage key for player data. */
export const STORAGE_KEY = 'multis_players';

/** Current schema version. */
const CURRENT_VERSION = 5;

/** Maximum number of players stored. */
const MAX_PLAYERS = 50;

/** Mapping from removed avatar IDs to their replacement IDs. */
export const AVATAR_REMAP: Record<string, string> = {
  dog: 'cat',
  planet: 'rocket',
  flower: 'star',
  crown: 'star',
};

/** Error thrown when localStorage is not available or writable. */
export class StorageUnavailableError extends Error {
  constructor() {
    super('Browser storage is not available');
    this.name = 'StorageUnavailableError';
  }
}

/**
 * Check if localStorage is available and writable.
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__multis_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the PlayerStore from localStorage.
 * Returns a default empty store if data is missing or invalid.
 */
function readStore(): PlayerStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: CURRENT_VERSION, players: [] };
    }
    const parsed = JSON.parse(raw) as PlayerStore;
    if (!parsed || !Array.isArray(parsed.players)) {
      return { version: CURRENT_VERSION, players: [] };
    }

    // Migrate v1 → v2: add totalScore and gamesPlayed fields
    if (parsed.version === 1) {
      for (const player of parsed.players) {
        if (player.totalScore === undefined) player.totalScore = 0;
        if (player.gamesPlayed === undefined) player.gamesPlayed = 0;
      }
      parsed.version = 2;
      writeStore(parsed);
    }

    // Migrate v2 → v3: remove colorId from all players
    if (parsed.version === 2) {
      for (const player of parsed.players) {
        delete (player as unknown as Record<string, unknown>)['colorId'];
      }
      parsed.version = 3;
      writeStore(parsed);
    }

    // Migrate v3 → v4: add gameHistory to all players
    if (parsed.version === 3) {
      for (const player of parsed.players) {
        if (player.gamesPlayed > 0) {
          player.gameHistory = [{
            score: Math.round(player.totalScore / player.gamesPlayed),
            completedAt: player.lastActive,
          }];
        } else {
          player.gameHistory = [];
        }
      }
      parsed.version = 4;
      writeStore(parsed);
    }

    // Migrate v4 → v5: version bump only (new fields are optional)
    if (parsed.version === 4) {
      parsed.version = 5;
      writeStore(parsed);
    }

    // Remap removed avatars
    let dirty = false;
    for (const player of parsed.players) {
      if (player.avatarId in AVATAR_REMAP) {
        player.avatarId = AVATAR_REMAP[player.avatarId];
        dirty = true;
      }
    }
    if (dirty) {
      writeStore(parsed);
    }

    return parsed;
  } catch {
    return { version: CURRENT_VERSION, players: [] };
  }
}

/**
 * Write the PlayerStore to localStorage.
 * Sorts players by lastActive descending and enforces the 50-player cap.
 * Returns the names of evicted players (if any).
 */
function writeStore(store: PlayerStore): string[] {
  if (!isStorageAvailable()) {
    throw new StorageUnavailableError();
  }
  // Sort by lastActive descending
  store.players.sort((a, b) => b.lastActive - a.lastActive);
  // Enforce cap — collect evicted names
  const evicted: string[] = [];
  if (store.players.length > MAX_PLAYERS) {
    const removed = store.players.slice(MAX_PLAYERS);
    evicted.push(...removed.map((p) => p.name));
    store.players = store.players.slice(0, MAX_PLAYERS);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return evicted;
}

/**
 * Retrieve all stored players, ordered by lastActive descending.
 * Returns empty array if no data exists or storage is unavailable.
 */
export function getPlayers(): Player[] {
  const store = readStore();
  // Ensure sorted and capped
  store.players.sort((a, b) => b.lastActive - a.lastActive);
  return store.players.slice(0, MAX_PLAYERS);
}

/**
 * Result of a savePlayer operation.
 */
export interface SavePlayerResult {
  player: Player;
  evictedNames: string[];
}

/**
 * Add a new player or overwrite an existing player (by name, case-insensitive).
 * - Sets lastActive and createdAt to Date.now() for new players.
 * - Preserves createdAt, updates lastActive for overwrites.
 * - Re-sorts array by lastActive desc.
 * - Enforces 50-player cap (evicts oldest inactive).
 * - Throws StorageUnavailableError if localStorage is not accessible.
 */
export function savePlayer(data: Pick<Player, 'name' | 'avatarId'>): SavePlayerResult {
  const store = readStore();
  const trimmedName = data.name.trim();
  const now = Date.now();

  const existingIndex = store.players.findIndex(
    (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  let player: Player;

  if (existingIndex >= 0) {
    // Overwrite: preserve createdAt and gameHistory, update everything else
    const existing = store.players[existingIndex];
    player = {
      name: trimmedName,
      avatarId: data.avatarId,
      lastActive: now,
      createdAt: existing.createdAt,
      totalScore: existing.totalScore ?? 0,
      gamesPlayed: existing.gamesPlayed ?? 0,
      gameHistory: existing.gameHistory ?? [],
    };
    store.players[existingIndex] = player;
  } else {
    // New player
    player = {
      name: trimmedName,
      avatarId: data.avatarId,
      lastActive: now,
      createdAt: now,
      totalScore: 0,
      gamesPlayed: 0,
      gameHistory: [],
    };
    store.players.push(player);
  }

  const evictedNames = writeStore(store);
  return { player, evictedNames };
}

/**
 * Remove a player by name (case-insensitive).
 * No-op if player does not exist.
 */
export function deletePlayer(name: string): void {
  const store = readStore();
  const lowerName = name.toLowerCase();
  store.players = store.players.filter((p) => p.name.toLowerCase() !== lowerName);
  writeStore(store);
}

/**
 * Check if a player with the given name exists (case-insensitive).
 */
export function playerExists(name: string): boolean {
  const players = getPlayers();
  const lowerName = name.toLowerCase();
  return players.some((p) => p.name.toLowerCase() === lowerName);
}

/**
 * Update the lastActive timestamp for a player (called on session start
 * and on visibilitychange events).
 */
export function touchPlayer(name: string): void {
  const store = readStore();
  const lowerName = name.toLowerCase();
  const player = store.players.find((p) => p.name.toLowerCase() === lowerName);
  if (player) {
    player.lastActive = Date.now();
    writeStore(store);
  }
}

/**
 * Clear all app data from browser storage (full reset).
 * Clears both localStorage and sessionStorage.
 * Throws StorageUnavailableError if the operation fails.
 */
export function clearAllStorage(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    throw new StorageUnavailableError();
  }
}

/**
 * Save a full game record for a player after game completion.
 * Creates a GameRecord with round data and game mode.
 * Only updates totalScore/gamesPlayed for 'play' mode.
 */
export function saveGameRecord(
  name: string,
  score: number,
  rounds: RoundResult[],
  gameMode: GameMode,
): void {
  const store = readStore();
  const lowerName = name.toLowerCase();
  const player = store.players.find((p) => p.name.toLowerCase() === lowerName);
  if (player) {
    if (!player.gameHistory) {
      player.gameHistory = [];
    }
    player.gameHistory.push({
      score,
      completedAt: Date.now(),
      rounds,
      gameMode,
    });
    // Enforce 100-record cap
    if (player.gameHistory.length > 100) {
      player.gameHistory = player.gameHistory.slice(-100);
    }
    // Only update aggregate scores for Play mode
    if (gameMode === 'play') {
      player.totalScore = (player.totalScore ?? 0) + score;
      player.gamesPlayed = (player.gamesPlayed ?? 0) + 1;
    }
    writeStore(store);
  }
}

/**
 * Update a player's cumulative score data after a game completes.
 * Finds player by name (case-insensitive), adds gameScore to totalScore,
 * increments gamesPlayed by 1, and writes back.
 */
export function updatePlayerScore(name: string, gameScore: number): void {
  const store = readStore();
  const lowerName = name.toLowerCase();
  const player = store.players.find((p) => p.name.toLowerCase() === lowerName);
  if (player) {
    // Append GameRecord
    if (!player.gameHistory) {
      player.gameHistory = [];
    }
    player.gameHistory.push({ score: gameScore, completedAt: Date.now() });
    // Enforce 100-record cap
    if (player.gameHistory.length > 100) {
      player.gameHistory = player.gameHistory.slice(-100);
    }
    // Legacy fields retained for backward compatibility
    player.totalScore = (player.totalScore ?? 0) + gameScore;
    player.gamesPlayed = (player.gamesPlayed ?? 0) + 1;
    writeStore(store);
  }
}

/**
 * Computes the arithmetic mean of a player's most recent play-mode game scores.
 * Excludes improve-mode games.
 * @param player — Player object
 * @param count — Number of recent games to average (default: 10)
 * @returns Math.round(mean) or null if no history
 */
export function getRecentAverage(player: Player, count: number = 10): number | null {
  const history = (player.gameHistory ?? []).filter(
    (r) => (r.gameMode ?? 'play') === 'play',
  );
  if (history.length === 0) return null;
  const slice = history.slice(-count);
  const sum = slice.reduce((acc, r) => acc + r.score, 0);
  return Math.round(sum / slice.length);
}

/**
 * Returns the player's top play-mode game scores from a sliding window of recent games.
 * Excludes improve-mode games.
 * Ties broken by most recent completedAt first.
 * @param player — Player object
 * @param windowSize — Number of most recent play-mode games to consider (default: 10)
 * @param topN — Number of top scores to return from the window (default: 3)
 * @returns Sorted array of up to topN GameRecord entries
 */
export function getRecentHighScores(player: Player, windowSize: number = 10, topN: number = 3): GameRecord[] {
  const history = (player.gameHistory ?? []).filter(
    (r) => (r.gameMode ?? 'play') === 'play',
  );
  if (history.length === 0) return [];
  const recent = history.slice(-windowSize);
  const sorted = [...recent].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.completedAt - a.completedAt;
  });
  return sorted.slice(0, topN);
}

/**
 * Returns the player's play-mode game history in chronological order (defensive copy).
 * Excludes improve-mode games.
 * @param player — Player object
 * @returns Copy of filtered gameHistory array
 */
export function getGameHistory(player: Player): GameRecord[] {
  return (player.gameHistory ?? []).filter(
    (r) => (r.gameMode ?? 'play') === 'play',
  );
}
