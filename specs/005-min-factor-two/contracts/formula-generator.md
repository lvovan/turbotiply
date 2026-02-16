# Contract: Formula Generator

**Feature**: 005-min-factor-two  
**Date**: 2026-02-16  
**Source file**: `frontend/src/services/formulaGenerator.ts`

## Function: `getAllUnorderedPairs()`

Returns all unique unordered pairs {a, b} for formula generation.

### Signature

```typescript
export function getAllUnorderedPairs(): [number, number][]
```

### Contract (updated)

| Property | Before | After |
|----------|--------|-------|
| Return count | 78 pairs | 66 pairs |
| Value range | 1 ≤ a ≤ b ≤ 12 | 2 ≤ a ≤ b ≤ 12 |
| Minimum a | 1 | 2 |
| Ordering | a ≤ b (ascending within pair) | a ≤ b (unchanged) |

### Postconditions

- Returns exactly 66 elements
- Every pair [a, b] satisfies: a ≥ 2, b ≥ 2, a ≤ b, a ≤ 12, b ≤ 12
- No duplicate pairs
- Pairs are generated in deterministic order (a ascending, then b ascending for each a)

---

## Function: `generateFormulas(randomFn?)`

Generates 10 unique multiplication formulas for a single game.

### Signature

```typescript
export function generateFormulas(randomFn?: () => number): Formula[]
```

### Contract (updated)

| Property | Before | After |
|----------|--------|-------|
| Factor range | 1–12 | 2–12 |
| Pool size | 78 pairs | 66 pairs |
| Output count | 10 formulas | 10 formulas (unchanged) |
| Hidden position | A, B, or C with ⅓ probability | Unchanged |
| Display order | Random swap | Unchanged |

### Postconditions

- Returns exactly 10 Formula objects
- Every formula has factorA ∈ [2, 12] and factorB ∈ [2, 12]
- Every formula has product = factorA × factorB (range: 4–144)
- All 10 formulas have unique unordered factor pairs
- hiddenPosition is one of 'A', 'B', 'C'

### Unchanged Behaviors

- Fisher-Yates shuffle algorithm
- Deterministic output with injected `randomFn`
- Default to `Math.random` when no `randomFn` provided
- Equal probability distribution for hidden positions and display order
