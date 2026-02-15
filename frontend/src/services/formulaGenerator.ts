import type { Formula, HiddenPosition } from '../types/game';

const HIDDEN_POSITIONS: HiddenPosition[] = ['A', 'B', 'C'];

/**
 * Returns all 78 unique unordered pairs {a, b} where 1 ≤ a ≤ b ≤ 12.
 * Exported for testing.
 */
export function getAllUnorderedPairs(): [number, number][] {
  const pairs: [number, number][] = [];
  for (let a = 1; a <= 12; a++) {
    for (let b = a; b <= 12; b++) {
      pairs.push([a, b]);
    }
  }
  return pairs;
}

/**
 * Fisher-Yates (Knuth) shuffle — mutates the array in place.
 */
function fisherYatesShuffle<T>(array: T[], randomFn: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates 10 unique multiplication formulas for a single game.
 *
 * Algorithm:
 * 1. Build all 78 unique unordered pairs {A, B} where 1 ≤ A ≤ B ≤ 12.
 * 2. Fisher-Yates shuffle using randomFn.
 * 3. Take the first 10 pairs.
 * 4. For each pair, randomly assign hiddenPosition (A, B, or C) with ⅓ probability.
 * 5. For each pair, randomly decide display order (which is factorA vs factorB).
 * 6. Compute product = factorA × factorB.
 *
 * @param randomFn Optional random number generator returning [0, 1). Defaults to Math.random.
 * @returns Array of exactly 10 Formula objects with unique unordered pairs.
 */
export function generateFormulas(randomFn: () => number = Math.random): Formula[] {
  const pairs = getAllUnorderedPairs();
  fisherYatesShuffle(pairs, randomFn);
  const selected = pairs.slice(0, 10);

  return selected.map(([a, b]) => {
    // Randomly assign hidden position
    const hiddenPosition = HIDDEN_POSITIONS[Math.floor(randomFn() * 3)];

    // Randomly decide display order
    const swap = randomFn() < 0.5;
    const factorA = swap ? b : a;
    const factorB = swap ? a : b;

    return {
      factorA,
      factorB,
      product: factorA * factorB,
      hiddenPosition,
    };
  });
}
