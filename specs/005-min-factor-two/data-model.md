# Data Model: Minimum Factor of Two

**Feature**: 005-min-factor-two  
**Date**: 2026-02-16

## Entities

### Formula (modified)

Represents a multiplication question with one hidden value.

| Field | Type | Constraints | Change |
|-------|------|-------------|--------|
| factorA | number | 2–12 inclusive | Min changed from 1 to 2 |
| factorB | number | 2–12 inclusive | Min changed from 1 to 2 |
| product | number | 4–144 (factorA × factorB) | Min changed from 1 to 4 |
| hiddenPosition | 'A' \| 'B' \| 'C' | Equal probability | No change |

**Validation rules**:
- factorA ≥ 2 AND factorA ≤ 12
- factorB ≥ 2 AND factorB ≤ 12
- product === factorA × factorB
- hiddenPosition ∈ {'A', 'B', 'C'}

### Factor Pair Pool (modified)

The set of unique unordered pairs used to generate formulas.

| Property | Before | After |
|----------|--------|-------|
| Range | {a, b} where 1 ≤ a ≤ b ≤ 12 | {a, b} where 2 ≤ a ≤ b ≤ 12 |
| Total pairs | 78 | 66 |
| Pairs per game | 10 | 10 (unchanged) |

**Removed pairs** (12 total): {1,1}, {1,2}, {1,3}, {1,4}, {1,5}, {1,6}, {1,7}, {1,8}, {1,9}, {1,10}, {1,11}, {1,12}

## Unchanged Entities

The following entities are NOT modified by this feature:

- **Round**: No structural changes. Rounds reference Formula objects which will naturally have the new constraints.
- **GameState**: No structural changes. Still contains 10 rounds, replay queue, scoring.
- **ScoringTier**: No changes. Scoring is based on response time, not factor values.
- **Player**: No changes. Player data is unrelated to formula generation.

## State Transitions

No state transition changes. The game state machine (not-started → playing → replay → completed) remains identical. The only difference is the values within Formula objects.
