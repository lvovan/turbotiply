# Research: Minimum Factor of Two

**Feature**: 005-min-factor-two  
**Date**: 2026-02-16

## R1: Factor Range Change — Impact on Pair Pool

**Decision**: Change the minimum factor from 1 to 2 in `getAllUnorderedPairs()`.

**Rationale**: The current implementation generates all unique unordered pairs {a, b} where 1 ≤ a ≤ b ≤ 12, producing 78 pairs. Removing pairs where a = 1 leaves pairs where 2 ≤ a ≤ b ≤ 12, yielding 66 pairs. This is calculated as: for a from 2 to 12, count (12 - a + 1) for each a, i.e., 11 + 10 + 9 + ... + 1 = 66. The removed 12 pairs are {1,1}, {1,2}, {1,3}, ..., {1,12}.

66 pairs is more than sufficient for the 10 unique pairs required per game, maintaining strong variety (C(66,10) ≈ 1.6 × 10¹⁰ possible game combinations).

**Alternatives considered**:
- **Configurable minimum factor**: Rejected per spec — YAGNI. No user or stakeholder has requested variable difficulty.
- **Weighted sampling** (reduce probability of factor 1 instead of removing): Rejected — adds complexity for no benefit. The spec explicitly requires complete removal of factor 1.

## R2: Code Change Scope

**Decision**: Single-line change in `formulaGenerator.ts` (loop start index), plus JSDoc/comment updates and test adjustments.

**Rationale**: The entire pair generation logic is isolated in `getAllUnorderedPairs()`, which is called only by `generateFormulas()`. The change requires:
1. `formulaGenerator.ts` line 11: `for (let a = 1;` → `for (let a = 2;`
2. `formulaGenerator.ts`: Update JSDoc comments (78 → 66, 1 → 2)
3. `types/game.ts`: Update JSDoc comments on `factorA` and `factorB` fields (1–12 → 2–12)
4. `formulaGenerator.test.ts`: Update assertions — pair count (78 → 66), factor range lower bound (1 → 2)

No other files reference the factor range bounds. No UI text displays "1–12" to players.

**Alternatives considered**:
- **Extract MIN_FACTOR constant**: Considered but rejected per YAGNI. Only one place uses the value. A named constant would be over-engineering for a single loop initializer until a second use case emerges.

## R3: Test Strategy

**Decision**: Update existing tests in-place — no new test files needed.

**Rationale**: The existing `formulaGenerator.test.ts` already has comprehensive coverage:
- Pair count validation (78 → 66)
- Factor range boundary checks (`toBeGreaterThanOrEqual(1)` → `toBeGreaterThanOrEqual(2)`)
- Statistical distribution tests (hidden position uniformity, display order variety)
- Multi-game uniqueness validation

All tests follow a red-green pattern: update expectations first, run tests (they will fail against current code), then apply the code change.

**Alternatives considered**: None — existing test structure is ideal.

## Summary

All research items resolved with clear decisions. No open questions remain.
