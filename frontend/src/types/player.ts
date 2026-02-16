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
