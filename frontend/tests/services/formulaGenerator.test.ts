import { describe, it, expect } from 'vitest';
import { generateFormulas, getAllUnorderedPairs } from '../../src/services/formulaGenerator';

describe('getAllUnorderedPairs', () => {
  it('returns exactly 78 unique unordered pairs', () => {
    const pairs = getAllUnorderedPairs();
    expect(pairs).toHaveLength(78);
  });

  it('all pairs have a <= b and both in [1, 12]', () => {
    const pairs = getAllUnorderedPairs();
    pairs.forEach(([a, b]) => {
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(12);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(12);
      expect(a).toBeLessThanOrEqual(b);
    });
  });

  it('contains no duplicate pairs', () => {
    const pairs = getAllUnorderedPairs();
    const keys = pairs.map(([a, b]) => `${a},${b}`);
    expect(new Set(keys).size).toBe(78);
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

  it('all factors are in [1, 12] range', () => {
    const formulas = generateFormulas(createSeededRandom(42));
    formulas.forEach((f) => {
      expect(f.factorA).toBeGreaterThanOrEqual(1);
      expect(f.factorA).toBeLessThanOrEqual(12);
      expect(f.factorB).toBeGreaterThanOrEqual(1);
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
      expect(f.factorA).toBeGreaterThanOrEqual(1);
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

  it('all factors are within [1, 12] range across 100 games', () => {
    for (let g = 0; g < 100; g++) {
      const formulas = generateFormulas();
      formulas.forEach((f) => {
        expect(f.factorA).toBeGreaterThanOrEqual(1);
        expect(f.factorA).toBeLessThanOrEqual(12);
        expect(f.factorB).toBeGreaterThanOrEqual(1);
        expect(f.factorB).toBeLessThanOrEqual(12);
        expect(f.product).toBe(f.factorA * f.factorB);
      });
    }
  });
});
