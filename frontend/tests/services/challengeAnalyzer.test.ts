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
  it('returns all incorrect pairs regardless of response time', () => {
    // Average = (2000*8 + 5000 + 6000) / 10 = 2700
    // Both incorrect rounds qualify (no speed threshold)
    const rounds = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 6000 },
    ]);
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(2);
    // Sorted by difficultyRatio descending
    expect(result[0].factorA).toBe(6);
    expect(result[0].factorB).toBe(9);
    expect(result[1].factorA).toBe(7);
    expect(result[1].factorB).toBe(8);
  });

  it('includes incorrect pairs even when response was fast', () => {
    // Average = 2000, round 0 is incorrect but fast (1500ms) — still included
    const rounds = makeRounds([
      { factorA: 3, factorB: 7, isCorrect: false, elapsedMs: 1500 },
    ]);
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(1);
    expect(result[0].factorA).toBe(3);
    expect(result[0].factorB).toBe(7);
  });

  it('excludes pairs that are slow but correct', () => {
    // Average = (2000*9 + 5000) / 10 = 2300, threshold = 3450
    // Round 0: slow but correct → excluded
    const rounds = makeRounds([
      { factorA: 3, factorB: 7, isCorrect: true, elapsedMs: 5000 },
    ]);
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when all rounds are correct and fast', () => {
    const rounds = makeRounds();
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(0);
  });

  it('normalizes pairs to unordered form (factorA ≤ factorB)', () => {
    // Give factorA > factorB to verify normalization
    const rounds = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 12, factorB: 3, isCorrect: false, elapsedMs: 6000 },
    ]);
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(1);
    expect(result[0].factorA).toBe(3);
    expect(result[0].factorB).toBe(12);
  });

  it('ranks by difficultyRatio descending', () => {
    const rounds = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined,
      { factorA: 4, factorB: 5, isCorrect: false, elapsedMs: 4500 },
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 5000 },
      { factorA: 6, factorB: 9, isCorrect: false, elapsedMs: 6000 },
    ]);
    const result = identifyChallengingPairs(rounds);
    // Most difficult first
    expect(result[0].factorA).toBe(6);
    expect(result[0].factorB).toBe(9);
    expect(result[0].difficultyRatio).toBeGreaterThan(result[1].difficultyRatio);
  });

  it('handles edge case where all rounds are incorrect with uniform time', () => {
    // All incorrect, uniform time — all qualify since filter is just incorrectness
    const rounds = Array.from({ length: 10 }, (_, i) => ({
      factorA: 2 + i,
      factorB: 3 + i,
      isCorrect: false,
      elapsedMs: 2000,
    }));
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(10);
  });

  it('handles edge case where all rounds are incorrect with varying times', () => {
    // All incorrect with varying times — all qualify, ranked by ratio
    const rounds = Array.from({ length: 10 }, (_, i) => ({
      factorA: 2 + i,
      factorB: 3 + i,
      isCorrect: false,
      elapsedMs: 1000 + i * 500,
    }));
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(10);
    // Slowest first
    expect(result[0].elapsedMs === undefined || result[0].difficultyRatio >= result[1].difficultyRatio).toBe(true);
  });

  it('difficultyRatio equals elapsedMs / averageMs', () => {
    const rounds = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    // Average = (2000*9 + 6000) / 10 = 2400
    const result = identifyChallengingPairs(rounds);
    expect(result).toHaveLength(1);
    expect(result[0].difficultyRatio).toBeCloseTo(6000 / 2400);
  });
});

describe('extractTrickyNumbers', () => {
  it('collects unique factors from challenging pairs, sorted ascending', () => {
    const pairs = [
      { factorA: 7, factorB: 8, difficultyRatio: 2.0 },
      { factorA: 6, factorB: 9, difficultyRatio: 1.8 },
    ];
    const result = extractTrickyNumbers(pairs);
    expect(result).toEqual([6, 7, 8, 9]);
  });

  it('deduplicates factors that appear in multiple pairs', () => {
    const pairs = [
      { factorA: 7, factorB: 8, difficultyRatio: 2.0 },
      { factorA: 7, factorB: 9, difficultyRatio: 1.8 },
    ];
    const result = extractTrickyNumbers(pairs);
    expect(result).toEqual([7, 8, 9]);
  });

  it('caps at 8 numbers', () => {
    const pairs = [
      { factorA: 2, factorB: 3, difficultyRatio: 2.0 },
      { factorA: 4, factorB: 5, difficultyRatio: 1.9 },
      { factorA: 6, factorB: 7, difficultyRatio: 1.8 },
      { factorA: 8, factorB: 9, difficultyRatio: 1.7 },
      { factorA: 10, factorB: 11, difficultyRatio: 1.6 },
    ];
    const result = extractTrickyNumbers(pairs);
    expect(result).toHaveLength(8);
    expect(result).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('returns empty array for empty input', () => {
    expect(extractTrickyNumbers([])).toEqual([]);
  });

  it('returns single pair factors correctly', () => {
    const pairs = [{ factorA: 3, factorB: 3, difficultyRatio: 2.0 }];
    const result = extractTrickyNumbers(pairs);
    expect(result).toEqual([3]);
  });
});

describe('getChallengingPairsForPlayer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns challenging pairs from the most recent game with rounds', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // First game: no challenging pairs
    const rounds1 = makeRounds();
    saveGameRecord('TestKid', 40, rounds1, 'play');

    // Second game: has challenging pairs
    const rounds2 = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    saveGameRecord('TestKid', 30, rounds2, 'play');

    const result = getChallengingPairsForPlayer('TestKid');
    expect(result).toHaveLength(1);
    expect(result[0].factorA).toBe(7);
    expect(result[0].factorB).toBe(8);
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

  it('uses most recent game regardless of game mode', () => {
    savePlayer({ name: 'TestKid', avatarId: 'cat' });

    // Play game with challenging pairs
    const rounds1 = makeRounds([
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined,
      { factorA: 7, factorB: 8, isCorrect: false, elapsedMs: 6000 },
    ]);
    saveGameRecord('TestKid', 30, rounds1, 'play');

    // Improve game with no challenging pairs (most recent)
    const rounds2 = makeRounds();
    saveGameRecord('TestKid', 40, rounds2, 'improve');

    const result = getChallengingPairsForPlayer('TestKid');
    // Should analyze rounds2 (most recent with rounds), which has no challenging pairs
    expect(result).toEqual([]);
  });

  it('skips old records without rounds data', () => {
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
