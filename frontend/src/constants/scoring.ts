import type { ScoringTier } from '../types/game';

/** Time-based scoring tiers for correct answers. Checked in order (first match wins). */
export const SCORING_TIERS: ScoringTier[] = [
  { maxMs: 2000, points: 5 },
  { maxMs: 3000, points: 3 },
  { maxMs: 4000, points: 2 },
  { maxMs: 5000, points: 1 },
];

/** Points awarded for a correct answer slower than all tiers (>5000ms). */
export const DEFAULT_POINTS = 0;

/** Duration (ms) of the countdown bar — matches the last scoring tier boundary. */
export const COUNTDOWN_DURATION_MS = 5000;

/** CVD-safe colors for each countdown bar stage, keyed by scoring tier. */
export const COUNTDOWN_COLORS = {
  green: '#0e8a1e',      // 0–2s elapsed, 5 pts tier
  lightGreen: '#5ba829',  // 2–3s elapsed, 3 pts tier
  orange: '#d47604',      // 3–4s elapsed, 2 pts tier
  red: '#c5221f',         // 4–5s elapsed, 1 pt / 0 pts tier
} as const;

export type CountdownColor = typeof COUNTDOWN_COLORS[keyof typeof COUNTDOWN_COLORS];

/** Points deducted for an incorrect answer during primary rounds. */
export const INCORRECT_PENALTY = -2;

/** Duration (ms) to display correct/incorrect feedback before advancing. */
export const FEEDBACK_DURATION_MS = 1200;

/** Number of primary rounds per game. */
export const ROUNDS_PER_GAME = 10;

/**
 * Calculate points for a single round answer.
 * @param isCorrect Whether the answer was correct.
 * @param elapsedMs Response time in milliseconds.
 * @returns Points awarded (positive for correct, negative for incorrect).
 */
export function calculateScore(isCorrect: boolean, elapsedMs: number): number {
  if (!isCorrect) {
    return INCORRECT_PENALTY;
  }

  for (const tier of SCORING_TIERS) {
    if (elapsedMs <= tier.maxMs) {
      return tier.points;
    }
  }

  return DEFAULT_POINTS;
}
