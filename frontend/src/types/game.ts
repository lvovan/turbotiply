/** Which value in the formula is hidden from the player. */
export type HiddenPosition = 'A' | 'B' | 'C';

/** A multiplication formula with one value hidden. */
export interface Formula {
  /** First factor (2–12). */
  factorA: number;
  /** Second factor (2–12). */
  factorB: number;
  /** Product (factorA × factorB). */
  product: number;
  /** Which value is hidden: 'A' (factorA), 'B' (factorB), or 'C' (product). */
  hiddenPosition: HiddenPosition;
}

/** Current phase of the game. */
export type GameStatus = 'not-started' | 'playing' | 'replay' | 'completed';

/** A single round within a game. */
export interface Round {
  /** The multiplication formula for this round. */
  formula: Formula;
  /** The player's submitted answer, or null if not yet answered. */
  playerAnswer: number | null;
  /** Whether the answer was correct, or null if not yet answered. */
  isCorrect: boolean | null;
  /** Response time in milliseconds, or null if not yet answered. */
  elapsedMs: number | null;
  /** Points awarded (primary rounds) or null (unanswered or replay). */
  points: number | null;
}

/** A challenging multiplication pair identified by the analysis algorithm. Not persisted. */
export interface ChallengingPair {
  /** Smaller factor (normalized: a ≤ b). */
  factorA: number;
  /** Larger factor (normalized: a ≤ b). */
  factorB: number;
  /** elapsedMs / averageMs — how far above the game average. */
  difficultyRatio: number;
}

/** The full game state. */
export interface GameState {
  /** Current game phase. */
  status: GameStatus;
  /** The 10 primary rounds. */
  rounds: Round[];
  /** Indices into rounds[] for rounds that need replay. */
  replayQueue: number[];
  /** Current position: index into rounds (playing) or replayQueue (replay). */
  currentRoundIndex: number;
  /** Whether the current round is awaiting input or showing feedback. */
  currentPhase: 'input' | 'feedback';
  /** Running total score. */
  score: number;
  /** Which mode this game is being played in. */
  gameMode: 'play' | 'improve';
}

/** A scoring tier threshold. */
export interface ScoringTier {
  /** Maximum elapsed time in ms (inclusive) for this tier. */
  maxMs: number;
  /** Points awarded if answered correctly within this time. */
  points: number;
}
