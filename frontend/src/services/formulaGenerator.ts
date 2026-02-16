import type { Formula, HiddenPosition, ChallengingPair } from '../types/game';

const HIDDEN_POSITIONS: HiddenPosition[] = ['A', 'B', 'C'];

/**
 * Returns all 66 unique unordered pairs {a, b} where 2 ≤ a ≤ b ≤ 12.
 * Exported for testing.
 */
export function getAllUnorderedPairs(): [number, number][] {
  const pairs: [number, number][] = [];
  for (let a = 2; a <= 12; a++) {
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
 * 1. Build all 66 unique unordered pairs {A, B} where 2 ≤ A ≤ B ≤ 12.
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

/**
 * Generates 10 formulas for an Improve game, biased toward challenging pairs.
 *
 * Algorithm:
 * 1. Take the top min(challengingPairs.length, 10) pairs by difficulty rank.
 * 2. Fill remaining slots with random pairs from the full 66-pair pool, excluding already-selected.
 * 3. Assign random hiddenPosition and display order to each formula.
 * 4. Shuffle the final 10 formulas.
 *
 * @param challengingPairs Non-empty array of ChallengingPair objects, sorted by difficulty.
 * @param randomFn Optional random number generator. Defaults to Math.random.
 */
export function generateImproveFormulas(
  challengingPairs: ChallengingPair[],
  randomFn: () => number = Math.random,
): Formula[] {
  // Take top 10 challenging pairs
  const selectedPairs: [number, number][] = challengingPairs
    .slice(0, 10)
    .map((p) => {
      const a = Math.min(p.factorA, p.factorB);
      const b = Math.max(p.factorA, p.factorB);
      return [a, b] as [number, number];
    });

  // Track selected pair keys to avoid duplicates
  const usedKeys = new Set(selectedPairs.map(([a, b]) => `${a},${b}`));

  // Fill remaining slots from the full pool
  if (selectedPairs.length < 10) {
    const allPairs = getAllUnorderedPairs();
    fisherYatesShuffle(allPairs, randomFn);
    for (const pair of allPairs) {
      if (selectedPairs.length >= 10) break;
      const key = `${pair[0]},${pair[1]}`;
      if (!usedKeys.has(key)) {
        selectedPairs.push(pair);
        usedKeys.add(key);
      }
    }
  }

  // Build formulas with random hiddenPosition and display order
  const formulas = selectedPairs.map(([a, b]) => {
    const hiddenPosition = HIDDEN_POSITIONS[Math.floor(randomFn() * 3)];
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

  // Shuffle final order
  fisherYatesShuffle(formulas, randomFn);
  return formulas;
}
