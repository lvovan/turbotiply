/** The two valid game modes. */
export type GameMode = 'play' | 'improve';

/** A record of a single round's outcome within a completed game. */
export interface RoundResult {
  /** First multiplication factor (2–12). */
  factorA: number;
  /** Second multiplication factor (2–12). */
  factorB: number;
  /** Whether the player answered correctly on the initial (primary-phase) attempt. */
  isCorrect: boolean;
  /** Response time in milliseconds for the initial (primary-phase) attempt. */
  elapsedMs: number;
}

/** An individual completed game result, stored within a player's gameHistory. */
export interface GameRecord {
  /** Total points earned in the game session (0–50 range based on scoring tiers). */
  score: number;
  /** Epoch ms timestamp of game completion. */
  completedAt: number;
  /** Per-round results from the primary phase. Absent for pre-v5 records. */
  rounds?: RoundResult[];
  /** Which mode this game was played in. Absent for pre-v5 records (implicitly 'play'). */
  gameMode?: GameMode;
}

/** Represents a player profile stored in localStorage. */
export interface Player {
  /** Display name chosen by the child (1–20 chars, trimmed). */
  name: string;
  /** Identifier referencing a predefined avatar (e.g., "cat", "rocket"). */
  avatarId: string;
  /** Timestamp of the most recent session start or activity (Date.now() epoch ms). */
  lastActive: number;
  /** Timestamp of profile creation, immutable after creation (Date.now() epoch ms). */
  createdAt: number;
  /** Sum of all completed game scores. Default 0. */
  totalScore: number;
  /** Count of completed games. Default 0. */
  gamesPlayed: number;
  /** Ordered list of individual game results (oldest first). Capped at 100. Optional for pre-v4 data. */
  gameHistory?: GameRecord[];
}

/** Represents a single play session, stored in sessionStorage (tab-scoped). */
export interface Session {
  /** The name of the player this session belongs to. */
  playerName: string;
  /** Avatar identifier copied from Player at session start. */
  avatarId: string;
  /** When the session was started (Date.now() epoch ms). */
  startedAt: number;
}

/** Top-level object persisted in localStorage under key "turbotiply_players". */
export interface PlayerStore {
  /** Schema version for migration support (starts at 1). */
  version: number;
  /** Array of all stored player profiles, max 50, sorted by lastActive desc. */
  players: Player[];
}
