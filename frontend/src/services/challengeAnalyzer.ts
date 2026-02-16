import type { RoundResult } from '../types/player';
import type { ChallengingPair } from '../types/game';
import { getPlayers } from './playerStorage';

/** Maximum number of tricky numbers to display. */
const MAX_TRICKY_NUMBERS = 8;

/**
 * Analyze a completed game's primary rounds to identify challenging multiplication pairs.
 *
 * A pair qualifies as challenging if the player answered incorrectly on the initial attempt.
 * Response time relative to the game average is used only for ranking (difficultyRatio),
 * so that even a single wrong answer after 1 game unlocks Practice mode.
 *
 * @param rounds Array of exactly 10 RoundResult objects from a completed game.
 * @returns Challenging pairs sorted by difficultyRatio descending. May be empty.
 */
export function identifyChallengingPairs(rounds: RoundResult[]): ChallengingPair[] {
  if (rounds.length === 0) return [];

  // Compute game average response time (used for ranking only)
  const totalMs = rounds.reduce((sum, r) => sum + r.elapsedMs, 0);
  const averageMs = totalMs / rounds.length;

  // Collect all incorrect rounds as challenging pairs
  const challengingPairs: ChallengingPair[] = [];

  for (const round of rounds) {
    if (!round.isCorrect) {
      // Normalize to unordered pair (factorA ≤ factorB)
      const a = Math.min(round.factorA, round.factorB);
      const b = Math.max(round.factorA, round.factorB);
      const difficultyRatio = averageMs > 0 ? round.elapsedMs / averageMs : 1;

      challengingPairs.push({ factorA: a, factorB: b, difficultyRatio });
    }
  }

  // Rank by difficulty (descending) — slower wrong answers rank higher
  challengingPairs.sort((x, y) => y.difficultyRatio - x.difficultyRatio);

  return challengingPairs;
}

/**
 * Extract unique factor numbers from challenging pairs for display.
 *
 * @param pairs Output of identifyChallengingPairs().
 * @returns Sorted ascending array of unique factor numbers, capped at 8.
 */
export function extractTrickyNumbers(pairs: ChallengingPair[]): number[] {
  if (pairs.length === 0) return [];

  const numberSet = new Set<number>();
  for (const pair of pairs) {
    numberSet.add(pair.factorA);
    numberSet.add(pair.factorB);
  }

  return Array.from(numberSet)
    .sort((a, b) => a - b)
    .slice(0, MAX_TRICKY_NUMBERS);
}

/**
 * Convenience function: load a player's most recent game with per-round data
 * and run challenge analysis on it.
 *
 * @param playerName Case-insensitive player name.
 * @returns Challenging pairs from the most recent analyzable game, or empty array.
 */
export function getChallengingPairsForPlayer(playerName: string): ChallengingPair[] {
  const players = getPlayers();
  const lowerName = playerName.toLowerCase();
  const player = players.find((p) => p.name.toLowerCase() === lowerName);

  if (!player || !player.gameHistory || player.gameHistory.length === 0) {
    return [];
  }

  // Find the most recent GameRecord with a non-empty rounds array
  for (let i = player.gameHistory.length - 1; i >= 0; i--) {
    const record = player.gameHistory[i];
    if (record.rounds && record.rounds.length > 0) {
      return identifyChallengingPairs(record.rounds);
    }
  }

  return [];
}
