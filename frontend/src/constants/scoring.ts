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
