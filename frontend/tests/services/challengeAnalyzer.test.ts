import { describe, it, expect, beforeEach } from 'vitest';
import {
  identifyChallengingPairs,
  extractTrickyNumbers,
  getChallengingPairsForPlayer,
} from '../../src/services/challengeAnalyzer';
import { savePlayer, saveGameRecord, STORAGE_KEY } from '../../src/services/playerStorage';
import type { RoundResult } from '../../src/types/player';

/** Helper: build 10 RoundResult entries with customizable overrides. */
function makeRounds(overrides?: Partial<RoundResult>[]): RoundResult[] {
  const defaults: RoundResult[] = Array.from({ length: 10 }, (_, i) => ({
    factorA: 2 + i,
    factorB: 3 + i,
    isCorrect: true,
    elapsedMs: 2000,
  }));
  if (overrides) {
    overrides.forEach((o, i) => {
      if (i < defaults.length) {
        defaults[i] = { ...defaults[i], ...o };
      }
    });
  }
  return defaults;
}

describe('identifyChallengingPairs', () => {
  it('groups rounds by unordered pair and aggregates mistakeCount', () => {
    // Same pair (7,8) appears twice across rounds — one correct, one incorrect
    const rounds: RoundResult[] = [
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 8, factorB: 7, isCorrect: true, elapsedMs: 2000 },
      { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1500 },
    ];
    const result = identifyChallengingPairs(rounds);
    // Only pair (7,8) has mistakes
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      factorA: 7,
      factorB: 8,
      mistakeCount: 1,
      avgMs: 3500, // (5000+2000)/2
    });
  });

  it('returns pairs sorted by mistakeCount desc, then avgMs desc', () => {
    const rounds: RoundResult[] = [
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 4000 },
      { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 6000 },
      { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1500 },
    ];
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(2);
    // (7,8) has 2 mistakes, (6,9) has 1 mistake
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
    expect(result[0].mistakeCount).toBe(2);
    expect(result[1].factorA).toBe(6);
    expect(result[1].factorB).toBe(9);
    expect(result[1].mistakeCount).toBe(1);
  });

  it('uses avgMs as tiebreaker when mistakeCount is equal', () => {
    const rounds: RoundResult[] = [
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 3000 },
      { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 6000 },
      { factorA: 4, factorB: 5, isCorrect: true, elapsedMs: 1200 },
    ];
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(2);
    // Both have mistakeCount 1, but (6,9) has higher avgMs
    expect(result[0].factorA).toBe(6);
    expect(result[0].factorB).toBe(9);
    expect(result[1].factorA).toBe(7);
    expect(result[1].factorB).toBe(8);
  });

  it('falls back to avgMs desc ranking when all rounds are correct', () => {
    const rounds: RoundResult[] = [
      { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1500 },
      { factorA: 7, factorB: 8, isCorrect: true, elapsedMs: 4000 },
      { factorA: 6, factorB: 9, isCorrect: true, elapsedMs: 3000 },
    ];
    const result = identifyChallengingPairs(rounds);
    // All pairs returned, sorted by avgMs descending
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ factorA: 7, factorB: 8, mistakeCount: 0, avgMs: 4000 });
    expect(result[1]).toEqual({ factorA: 6, factorB: 9, mistakeCount: 0, avgMs: 3000 });
    expect(result[2]).toEqual({ factorA: 3, factorB: 4, mistakeCount: 0, avgMs: 1500 });
  });

  it('when mistakes exist, filters out pairs with zero mistakes', () => {
    const rounds: RoundResult[] = [
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 8000 }, // slow but correct
    ];
    const result = identifyChallengingPairs(rounds);
    // Only (7,8) returned — (3,4) excluded despite being slow
    expect(result).toHaveLength(1);
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
  });

  it('normalizes pairs to unordered form (factorA ≤ factorB)', () => {
    const rounds: RoundResult[] = [
      { factorA: 12, factorB: 3, isCorrect: false, elapsedMs: 6000 },
    ];
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(1);
    expect(result[0].factorA).toBe(3);
    expect(result[0].factorB).toBe(12);
  });

  it('computes avgMs as totalMs / occurrences across all rounds for each pair', () => {
    const rounds: RoundResult[] = [
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 3000 },
      { factorA: 7, factorB: 8, isCorrect: true, elapsedMs: 2000 },
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 4000 },
    ];
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(1);
    expect(result[0].mistakeCount).toBe(2);
    expect(result[0].avgMs).toBe(3000); // (3000+2000+4000)/3
  });

  it('returns empty array when given empty input', () => {
    expect(identifyChallengingPairs([])).toEqual([]);
  });

  it('handles multi-game flattened rounds with same pair across games', () => {
    // Simulates rounds from multiple games flattened together
    const rounds: RoundResult[] = [
      // Game 1: mistake on (7,8)
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1200 },
      // Game 2: another mistake on (7,8), plus mistake on (6,9)
      { factorA: 8, factorB: 7, isCorrect: false, elapsedMs: 4500 },
      { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 3500 },
      { factorA: 3, factorB: 4, isCorrect: true, elapsedMs: 1100 },
    ];
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(2);
    // (7,8) has 2 mistakes, (6,9) has 1
    expect(result[0]).toEqual({
      factorA: 7, factorB: 8,
      mistakeCount: 2,
      avgMs: 4750, // (5000+4500)/2
    });
    expect(result[1]).toEqual({
      factorA: 6, factorB: 9,
      mistakeCount: 1,
      avgMs: 3500,
    });
  });

  it('handles all rounds incorrect with uniform time', () => {
    const rounds = Array.from({ length: 10 }, (_, i) => ({
      factorA: 2 + i,
      factorB: 3 + i,
      isCorrect: false as const,
      elapsedMs: 2000,
    }));
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(10);
    // All have mistakeCount 1, avgMs 2000
    for (const pair of result) {
      expect(pair.mistakeCount).toBe(1);
      expect(pair.avgMs).toBe(2000);
    }
  });
});

describe('extractTrickyNumbers', () => {
  it('collects unique factors from challenging pairs, sorted ascending', () => {
    const pairs = [
      { factorA: 7, factorB: 8, mistakeCount: 2, avgMs: 5000 },
      { factorA: 6, factorB: 9, mistakeCount: 1, avgMs: 4000 },
    ];
    const result = extractTrickyNumbers(pairs);
    expect(result).toEqual([6, 7, 8, 9]);
  });

  it('deduplicates factors that appear in multiple pairs', () => {
    const pairs = [
      { factorA: 7, factorB: 8, mistakeCount: 2, avgMs: 5000 },
      { factorA: 7, factorB: 9, mistakeCount: 1, avgMs: 4000 },
    ];
    const result = extractTrickyNumbers(pairs);
    expect(result).toEqual([7, 8, 9]);
  });

  it('caps at 8 numbers', () => {
    const pairs = [
      { factorA: 2, factorB: 3, mistakeCount: 5, avgMs: 5000 },
      { factorA: 4, factorB: 5, mistakeCount: 4, avgMs: 4500 },
      { factorA: 6, factorB: 7, mistakeCount: 3, avgMs: 4000 },
      { factorA: 8, factorB: 9, mistakeCount: 2, avgMs: 3500 },
      { factorA: 10, factorB: 11, mistakeCount: 1, avgMs: 3000 },
    ];
    const result = extractTrickyNumbers(pairs);
    expect(result).toHaveLength(8);
    expect(result).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('returns empty array for empty input', () => {
    expect(extractTrickyNumbers([])).toEqual([]);
  });

  it('returns single pair factors correctly', () => {
    const pairs = [{ factorA: 3, factorB: 3, mistakeCount: 1, avgMs: 2000 }];
    const result = extractTrickyNumbers(pairs);
    expect(result).toEqual([3]);
  });
});

describe('getChallengingPairsForPlayer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('aggregates challenging pairs across multiple games', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Game 1: mistake on (7,8)
    const rounds1 = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    saveGameRecord('TestKid', 30, rounds1, 'play');

    // Game 2: another mistake on (7,8) plus mistake on (6,9)
    const rounds2 = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 4000 },
    ]);
    saveGameRecord('TestKid', 25, rounds2, 'play');

    const result = getChallengingPairsForPlayer('TestKid');
    // (7,8) has 2 mistakes, (6,9) has 1
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
    expect(result[0].mistakeCount).toBe(2);
    expect(result[1].factorA).toBe(6);
    expect(result[1].factorB).toBe(9);
    expect(result[1].mistakeCount).toBe(1);
  });

  it('analyzes all games when player has 5 games', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Create 5 games — mistake on (7,8) in each
    for (let g = 0; g < 5; g++) {
      const rounds = makeRounds([
        undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
        { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 3000 + g * 500 },
      ]);
      saveGameRecord('TestKid', 30, rounds, 'play');
    }

    const result = getChallengingPairsForPlayer('TestKid');
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
    expect(result[0].mistakeCount).toBe(5);
  });

  it('uses only last 10 games when player has 12 games', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Games 1-2: mistake on (3,4) — these should be excluded (outside 10-game window)
    for (let g = 0; g < 2; g++) {
      const rounds = makeRounds([
        undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined,
        { factorA: 3, factorB: 4, isCorrect: false, elapsedMs: 5000 },
      ]);
      saveGameRecord('TestKid', 30, rounds, 'play');
    }

    // Games 3-12: all correct (fast)
    for (let g = 0; g < 10; g++) {
      const rounds = makeRounds();
      saveGameRecord('TestKid', 40, rounds, 'play');
    }

    const result = getChallengingPairsForPlayer('TestKid');
    // (3,4) mistakes were in games 1-2, outside the 10-game window
    // All 10 recent games are correct → fallback to avgMs ranking (no mistakes)
    const hasMistake = result.some((p) => p.mistakeCount > 0);
    expect(hasMistake).toBe(false);
  });

  it('falls back to avgMs ranking when no mistakes in window', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Single game, all correct but with varying times
    const rounds = makeRounds([
      { factorA: 2, factorB: 3, isCorrect: true, elapsedMs: 1000 },
      { factorA: 4, factorB: 5, isCorrect: true, elapsedMs: 4000 },
      { factorA: 6, factorB: 7, isCorrect: true, elapsedMs: 3000 },
    ]);
    saveGameRecord('TestKid', 40, rounds, 'play');

    const result = getChallengingPairsForPlayer('TestKid');
    expect(result.length).toBeGreaterThan(0);
    // All have mistakeCount 0
    for (const pair of result) {
      expect(pair.mistakeCount).toBe(0);
    }
    // Sorted by avgMs descending
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].avgMs).toBeGreaterThanOrEqual(result[i].avgMs);
    }
  });

  it('analyzes both Play and Improve game records', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Play game: mistake on (7,8)
    const rounds1 = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    saveGameRecord('TestKid', 30, rounds1, 'play');

    // Improve game: mistake on (7,8) again
    const rounds2 = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
    ]);
    saveGameRecord('TestKid', 0, rounds2, 'improve');

    const result = getChallengingPairsForPlayer('TestKid');
    // Both games contribute: 2 total mistakes on (7,8)
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
    expect(result[0].mistakeCount).toBe(2);
  });

  it('skips legacy records without rounds data', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Manually insert a pre-v5 record without rounds
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    store.players[0].gameHistory = [
      { score: 20, completedAt: 1000 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

    const result = getChallengingPairsForPlayer('TestKid');
    expect(result).toEqual([]);
  });

  it('single game with rounds works as 1-game window', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    const rounds = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    saveGameRecord('TestKid', 30, rounds, 'play');

    const result = getChallengingPairsForPlayer('TestKid');
    expect(result).toHaveLength(1);
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
    expect(result[0].mistakeCount).toBe(1);
  });

  it('returns empty array for player with no game history', () => {
    savePlayer({ name: 'NewKid', avatarId: 'cat' });
    const result = getChallengingPairsForPlayer('NewKid');
    expect(result).toEqual([]);
  });

  it('returns empty array for non-existent player', () => {
    const result = getChallengingPairsForPlayer('Ghost');
    expect(result).toEqual([]);
  });

  it('finds player case-insensitively', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });
    const rounds = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    saveGameRecord('TestKid', 30, rounds, 'play');

    const result = getChallengingPairsForPlayer('testkid');
    expect(result).toHaveLength(1);
  });
});
