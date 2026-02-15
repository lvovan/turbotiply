````markdown
# Contract: Formula Generator

**Module**: `frontend/src/services/formulaGenerator.ts`
**Type**: Pure function (no side effects, no React dependency)
**Feature**: 002-core-gameplay

## Purpose

Generates 10 unique multiplication formulas for a single game. Each formula is an unordered factor pair {A, B} from the 1–12 times table with one randomly hidden value. Guarantees uniqueness by construction (shuffle-and-slice, not rejection sampling).

## Dependencies

- `Formula`, `HiddenPosition` from `types/game.ts`

## Exports

### `generateFormulas(randomFn?: () => number): Formula[]`

Generates an array of exactly 10 unique `Formula` objects.

**Parameters**:

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `randomFn` | `() => number` | `Math.random` | Random number generator returning [0, 1). Inject for deterministic testing. |

**Returns**: `Formula[]` — Exactly 10 elements.

**Algorithm**:
1. Build all 78 unique unordered pairs: `{A, B}` where `1 ≤ A ≤ B ≤ 12`.
2. Fisher-Yates shuffle the array using `randomFn`.
3. Take the first 10 pairs.
4. For each pair, randomly assign `hiddenPosition` (`'A'`, `'B'`, or `'C'`) with uniform ⅓ probability using `randomFn`.
5. For each pair, randomly decide display order (which factor is `factorA` vs `factorB`) using `randomFn`.
6. Compute `product = factorA * factorB`.

**Postconditions**:
- Result has exactly 10 elements.
- All `factorA` and `factorB` values are in [1, 12].
- All `product` values are `factorA * factorB`.
- No two formulas share the same unordered factor pair `{min(factorA, factorB), max(factorA, factorB)}`.
- Each `hiddenPosition` is one of `'A'`, `'B'`, `'C'`.

**Error Conditions**: None — function always succeeds.

### `getAllUnorderedPairs(): [number, number][]`

Returns all 78 unique unordered pairs from 1–12.

**Returns**: `[number, number][]` — 78 tuples, each `[a, b]` where `a ≤ b`.

**Purpose**: Exported for testing. The main `generateFormulas` function uses this internally.

## Traceability

| Requirement | Coverage |
|-------------|----------|
| FR-002 | Factors in [1–12], C = A × B |
| FR-003 | Hidden position randomly chosen per round |
| FR-006 | No duplicate unordered pairs (by construction) |
| FR-012 | Not this module — replay uses original formula from Round |

## Test Contract

```typescript
// Deterministic test: fixed seed produces predictable output
const mockRandom = createSeededRandom(42);
const formulas = generateFormulas(mockRandom);

expect(formulas).toHaveLength(10);
formulas.forEach(f => {
  expect(f.factorA).toBeGreaterThanOrEqual(1);
  expect(f.factorA).toBeLessThanOrEqual(12);
  expect(f.factorB).toBeGreaterThanOrEqual(1);
  expect(f.factorB).toBeLessThanOrEqual(12);
  expect(f.product).toBe(f.factorA * f.factorB);
  expect(['A', 'B', 'C']).toContain(f.hiddenPosition);
});

// Uniqueness: no duplicate unordered pairs
const pairs = formulas.map(f => {
  const sorted = [f.factorA, f.factorB].sort((a, b) => a - b);
  return `${sorted[0]},${sorted[1]}`;
});
expect(new Set(pairs).size).toBe(10);

// All 78 pairs exist
expect(getAllUnorderedPairs()).toHaveLength(78);
```
````
