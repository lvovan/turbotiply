import type { RoundResult } from '../types/player';
import type { ChallengingPair } from '../types/game';
import { getPlayers } from './playerStorage';

/** Maximum number of tricky numbers to display. */
const MAX_TRICKY_NUMBERS = 3;

/**
 * Analyze rounds (potentially from multiple games) to identify challenging multiplication pairs.
 *
 * Groups rounds by unordered pair, aggregates mistake counts and response times.
 * When mistakes exist: returns only pairs with mistakes, sorted by mistakeCount desc, avgMs desc.
 * When all correct: returns all pairs sorted by avgMs desc (slowest = trickiest).
 *
 * @param allRounds Flattened array of RoundResult objects from one or more games.
 * @returns Challenging pairs sorted by ranking criteria. May be empty.
 */
export function identifyChallengingPairs(allRounds: RoundResult[]): ChallengingPair[] {
  if (allRounds.length === 0) return [];

  // Group by unordered pair key "(min,max)"
  const pairMap = new Map<string, { factorA: number; factorB: number; mistakeCount: number; totalMs: number; occurrences: number }>();

  for (const round of allRounds) {
    const a = Math.min(round.factorA, round.factorB);
    const b = Math.max(round.factorA, round.factorB);
    const key = `${a},${b}`;

    let stats = pairMap.get(key);
    if (!stats) {
      stats = { factorA: a, factorB: b, mistakeCount: 0, totalMs: 0, occurrences: 0 };
      pairMap.set(key, stats);
    }

    if (!round.isCorrect) {
      stats.mistakeCount++;
    }
    stats.totalMs += round.elapsedMs;
    stats.occurrences++;
  }

  // Build result with avgMs computed
  const allPairs: ChallengingPair[] = [];
  for (const stats of pairMap.values()) {
    allPairs.push({
      factorA: stats.factorA,
      factorB: stats.factorB,
      mistakeCount: stats.mistakeCount,
      avgMs: stats.totalMs / stats.occurrences,
    });
  }

  // Check if any pair has mistakes
  const hasMistakes = allPairs.some((p) => p.mistakeCount > 0);

  if (hasMistakes) {
    // Filter to only pairs with mistakes, sort by mistakeCount desc, avgMs desc
    const mistakePairs = allPairs.filter((p) => p.mistakeCount > 0);
    mistakePairs.sort((a, b) => b.mistakeCount - a.mistakeCount || b.avgMs - a.avgMs);
    return mistakePairs;
  }

  // Fallback: all correct — sort by avgMs desc (slowest = trickiest)
  allPairs.sort((a, b) => b.avgMs - a.avgMs);
  return allPairs;
}

/**
 * Extract the top 3 most challenging individual factor numbers.
 *
 * Ranks each factor (2–12) by its total mistake count summed across
 * all challenging pairs containing it. Ties broken by weighted average
 * response time (slowest first). Returns at most 3 factors, sorted ascending.
 *
 * @param pairs Output of identifyChallengingPairs().
 * @returns Sorted ascending array of up to 3 factor numbers.
 */
export function extractTrickyNumbers(pairs: ChallengingPair[]): number[] {
  if (pairs.length === 0) return [];

  // Build per-factor aggregates
  const factorMap = new Map<number, { totalMistakes: number; weightedMsSum: number; totalOccurrences: number }>();

  for (const pair of pairs) {
    for (const factor of [pair.factorA, pair.factorB]) {
      let stats = factorMap.get(factor);
      if (!stats) {
        stats = { totalMistakes: 0, weightedMsSum: 0, totalOccurrences: 0 };
        factorMap.set(factor, stats);
      }
      stats.totalMistakes += pair.mistakeCount;
      stats.weightedMsSum += pair.avgMs;
      stats.totalOccurrences += 1;
    }
  }

  // Convert to sortable array
  const factors = Array.from(factorMap.entries()).map(([factor, stats]) => ({
    factor,
    aggregateMistakes: stats.totalMistakes,
    weightedAvgMs: stats.weightedMsSum / stats.totalOccurrences,
  }));

  // Sort by aggregate mistakes desc, then weighted avgMs desc
  factors.sort((a, b) => b.aggregateMistakes - a.aggregateMistakes || b.weightedAvgMs - a.weightedAvgMs);

  // Take top 3, sort ascending for display
  return factors
    .slice(0, MAX_TRICKY_NUMBERS)
    .map((f) => f.factor)
    .sort((a, b) => a - b);
}

/** Maximum number of recent games to analyze for challenging pairs. */
const MAX_GAME_WINDOW = 10;

/**
 * Convenience function: load a player's most recent games with per-round data
 * and run challenge analysis across all of them.
 *
 * Collects up to 10 most recent games that have round data, flattens all rounds,
 * and passes them to identifyChallengingPairs for aggregation.
 *
 * @param playerName Case-insensitive player name.
 * @returns Challenging pairs aggregated from up to 10 recent games, or empty array.
 */
export function getChallengingPairsForPlayer(playerName: string): ChallengingPair[] {
  const players = getPlayers();
  const lowerName = playerName.toLowerCase();
  const player = players.find((p) => p.name.toLowerCase() === lowerName);

  if (!player || !player.gameHistory || player.gameHistory.length === 0) {
    return [];
  }

  // Filter to records with round data, take last MAX_GAME_WINDOW
  const gamesWithRounds = player.gameHistory.filter(
    (record) => record.rounds && record.rounds.length > 0,
  );

  if (gamesWithRounds.length === 0) {
    return [];
  }

  const recentGames = gamesWithRounds.slice(-MAX_GAME_WINDOW);

  // Flatten all rounds from recent games
  const allRounds: RoundResult[] = recentGames.flatMap((record) => record.rounds!);

  return identifyChallengingPairs(allRounds);
}
