import { describe, it, expect } from 'vitest';
import { generateFormulas, generateImproveFormulas, getAllUnorderedPairs } from '../../src/services/formulaGenerator';
import type { ChallengingPair } from '../../src/types/game';

describe('getAllUnorderedPairs', () => {
  it('returns exactly 66 unique unordered pairs', () => {
    const pairs = getAllUnorderedPairs();
    expect(pairs).toHaveLength(66);
  });

  it('all pairs have a <= b and both in [2, 12]', () => {
    const pairs = getAllUnorderedPairs();
    pairs.forEach(([a, b]) => {
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(12);
      expect(b).toBeGreaterThanOrEqual(2);
      expect(b).toBeLessThanOrEqual(12);
      expect(a).toBeLessThanOrEqual(b);
    });
  });

  it('contains no duplicate pairs', () => {
    const pairs = getAllUnorderedPairs();
    const keys = pairs.map(([a, b]) => `${a},${b}`);
    expect(new Set(keys).size).toBe(66);
  });
});

describe('generateFormulas', () => {
  // Create a simple seeded random for deterministic tests
  function createSeededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  it('generates exactly 10 formulas', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    expect(formulas).toHaveLength(10);
  });

  it('all factors are in [2, 12] range', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.forEach((f) => {
      expect(f.factorA).toBeGreaterThanOrEqual(2);
      expect(f.factorA).toBeLessThanOrEqual(12);
      expect(f.factorB).toBeGreaterThanOrEqual(2);
      expect(f.factorB).toBeLessThanOrEqual(12);
    });
  });

  it('product equals factorA × factorB for all formulas', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.forEach((f) => {
      expect(f.product).toBe(f.factorA * f.factorB);
    });
  });

  it('no duplicate unordered pairs', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    const pairs = formulas.map((f) => {
      const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
      return `${sorted[0]},${sorted[1]}`;
    });
    expect(new Set(pairs).size).toBe(10);
  });

  it('hiddenPosition is A, B, or C for all formulas', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.forEach((f) => {
      expect(['A', 'B', 'C']).toContain(f.hiddenPosition);
    });
  });

  it('produces deterministic output with injected randomFn', () => {
    const formulas1 = generateFormulas(createSeededRandom(42));
    const formulas2 = generateFormulas(createSeededRandom(42));
    expect(formulas1).toEqual(formulas2);
  });

  it('produces different output with different seeds', () => {
    const formulas1 = generateFormulas(createSeededRandom(42));
    const formulas2 = generateFormulas(createSeededRandom(99));
    // At least one formula should differ
    const same = formulas1.every(
      (f, i) =>
        f.factorA === formulas2[i].factorA &&
        f.factorB === formulas2[i].factorB &&
        f.hiddenPosition === formulas2[i].hiddenPosition,
    );
    expect(same).toBe(false);
  });

  it('works with default Math.random (no randomFn)', () => {
    const formulas = generateFormulas();
    expect(formulas).toHaveLength(10);
    formulas.forEach((f) => {
      expect(f.factorA).toBeGreaterThanOrEqual(2);
      expect(f.factorA).toBeLessThanOrEqual(12);
      expect(f.product).toBe(f.factorA * f.factorB);
    });
  });
});

describe('generateFormulas — statistical validation (US4)', () => {
  it('no duplicate unordered pairs in any of 100 generated games', () => {
    for (let g = 0; g < 100; g++) {
      const formulas = generateFormulas();
      const pairs = formulas.map((f) => {
        const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
        return `${sorted[0]},${sorted[1]}`;
      });
      expect(new Set(pairs).size).toBe(10);
    }
  });

  it('hidden position distribution is roughly uniform across 100 games', () => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
    for (let g = 0; g < 100; g++) {
      const formulas = generateFormulas();
      formulas.forEach((f) => {
        counts[f.hiddenPosition]++;
      });
    }
    // 1000 total formulas, expect ~333 each. Allow 20% deviation.
    const total = counts.A + counts.B + counts.C;
    expect(total).toBe(1000);
    expect(counts.A).toBeGreaterThan(200);
    expect(counts.A).toBeLessThan(470);
    expect(counts.B).toBeGreaterThan(200);
    expect(counts.B).toBeLessThan(470);
    expect(counts.C).toBeGreaterThan(200);
    expect(counts.C).toBeLessThan(470);
  });

  it('both display orders (A,B vs B,A) appear across 100 games', () => {
    // For pairs where A !== B, the display order should vary.
    // Track whether we see factorA < factorB AND factorA > factorB.
    let seenAscending = false;
    let seenDescending = false;

    for (let g = 0; g < 100 && !(seenAscending && seenDescending); g++) {
      const formulas = generateFormulas();
      for (const f of formulas) {
        if (f.factorA < f.factorB) seenAscending = true;
        if (f.factorA > f.factorB) seenDescending = true;
      }
    }

    expect(seenAscending).toBe(true);
    expect(seenDescending).toBe(true);
  });

  it('all factors are within [2, 12] range across 100 games', () => {
    for (let g = 0; g < 100; g++) {
      const formulas = generateFormulas();
      formulas.forEach((f) => {
        expect(f.factorA).toBeGreaterThanOrEqual(2);
        expect(f.factorA).toBeLessThanOrEqual(12);
        expect(f.factorB).toBeGreaterThanOrEqual(2);
        expect(f.factorB).toBeLessThanOrEqual(12);
        expect(f.product).toBe(f.factorA * f.factorB);
      });
    }
  });
});

describe('generateImproveFormulas', () => {
  function makePair(a: number, b: number, ratio = 2.0): ChallengingPair {
    return { factorA: a, factorB: b, difficultyRatio: ratio };
  }

  it('returns exactly 10 formulas', () => {
    const pairs = [makePair(7, 8), makePair(6, 9)];
    const formulas = generateImproveFormulas(pairs);
    expect(formulas).toHaveLength(10);
  });

  it('includes all challenging pairs when fewer than 10', () => {
    const pairs = [makePair(7, 8, 3.0), makePair(6, 9, 2.5)];
    const formulas = generateImproveFormulas(pairs);

    // Both challenging pairs should appear in the formulas
    const formulaPairs = formulas.map((f) => {
      const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
      return `${sorted[0]},${sorted[1]}`;
    });
    expect(formulaPairs).toContain('7,8');
    expect(formulaPairs).toContain('6,9');
  });

  it('fills remaining slots with random pairs when fewer than 10 challenging pairs', () => {
    const pairs = [makePair(7, 8)];
    const formulas = generateImproveFormulas(pairs);
    expect(formulas).toHaveLength(10);

    // 7×8 should be included
    const formulaPairs = formulas.map((f) => {
      const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
      return `${sorted[0]},${sorted[1]}`;
    });
    expect(formulaPairs).toContain('7,8');
  });

  it('caps at 10 challenging pairs when more than 10 provided', () => {
    // Create 15 challenging pairs
    const pairs: ChallengingPair[] = [];
    for (let i = 2; i <= 12 && pairs.length < 15; i++) {
      for (let j = i; j <= 12 && pairs.length < 15; j++) {
        pairs.push(makePair(i, j, 15 - pairs.length));
      }
    }
    const formulas = generateImproveFormulas(pairs);
    expect(formulas).toHaveLength(10);
  });

  it('has no duplicate unordered pairs', () => {
    const pairs = [makePair(7, 8), makePair(6, 9), makePair(3, 4)];
    const formulas = generateImproveFormulas(pairs);
    const keys = formulas.map((f) => {
      const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
      return `${sorted[0]},${sorted[1]}`;
    });
    expect(new Set(keys).size).toBe(10);
  });

  it('random fill pairs do not duplicate challenging pairs', () => {
    const pairs = [makePair(7, 8), makePair(6, 9)];
    const formulas = generateImproveFormulas(pairs);
    const keys = formulas.map((f) => {
      const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
      return `${sorted[0]},${sorted[1]}`;
    });
    // All 10 should be unique
    expect(new Set(keys).size).toBe(10);
  });

  it('assigns valid hiddenPosition to all formulas', () => {
    const pairs = [makePair(7, 8), makePair(6, 9)];
    const formulas = generateImproveFormulas(pairs);
    formulas.forEach((f) => {
      expect(['A', 'B', 'C']).toContain(f.hiddenPosition);
    });
  });

  it('computes product correctly for all formulas', () => {
    const pairs = [makePair(7, 8), makePair(6, 9)];
    const formulas = generateImproveFormulas(pairs);
    formulas.forEach((f) => {
      expect(f.product).toBe(f.factorA * f.factorB);
    });
  });

  it('all factors are in [2, 12] range', () => {
    const pairs = [makePair(7, 8), makePair(6, 9)];
    const formulas = generateImproveFormulas(pairs);
    formulas.forEach((f) => {
      expect(f.factorA).toBeGreaterThanOrEqual(2);
      expect(f.factorA).toBeLessThanOrEqual(12);
      expect(f.factorB).toBeGreaterThanOrEqual(2);
      expect(f.factorB).toBeLessThanOrEqual(12);
    });
  });

  it('shuffles formulas (challenging pairs not always first)', () => {
    // Run multiple times; at least once the first formula should not be a challenging pair
    const pairs = [makePair(11, 12)];
    let foundNonChallengingFirst = false;
    for (let i = 0; i < 50; i++) {
      const formulas = generateImproveFormulas(pairs);
      const first = formulas[0];
      const sorted = [first.factorA, first.factorB].sort((a, b) => a - b);
      if (sorted[0] !== 11 || sorted[1] !== 12) {
        foundNonChallengingFirst = true;
        break;
      }
    }
    expect(foundNonChallengingFirst).toBe(true);
  });
});
