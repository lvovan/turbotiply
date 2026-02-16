# Quickstart: Minimum Factor of Two

**Feature**: 005-min-factor-two  
**Date**: 2026-02-16

## What Changed

Multiplication factors now range from **2 to 12** (previously 1 to 12). This eliminates trivial ×1 questions that don't test multiplication skills.

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/services/formulaGenerator.ts` | Change loop start from `1` to `2` in `getAllUnorderedPairs()`. Update JSDoc comments. |
| `frontend/src/types/game.ts` | Update JSDoc comments on `factorA` and `factorB` fields. |
| `frontend/tests/services/formulaGenerator.test.ts` | Update pair count (78 → 66) and factor range assertions (≥1 → ≥2). |

## Implementation Steps

1. **Update tests first** (Test-First per constitution):
   - Change expected pair count from 78 to 66
   - Change `toBeGreaterThanOrEqual(1)` to `toBeGreaterThanOrEqual(2)` for factor range checks
   - Change `[1, 12]` references to `[2, 12]` in test descriptions

2. **Run tests** — confirm they fail (red phase)

3. **Update source code**:
   - `formulaGenerator.ts` line 11: `for (let a = 1;` → `for (let a = 2;`
   - Update JSDoc in `formulaGenerator.ts` (78 → 66, 1 → 2)
   - Update JSDoc in `types/game.ts` (1–12 → 2–12)

4. **Run tests** — confirm they pass (green phase)

5. **Verify** — no refactoring needed (code is already clean)

## How to Verify

```bash
cd frontend
npx vitest run tests/services/formulaGenerator.test.ts
```

All tests should pass with the updated expectations.

## What's NOT Changing

- Game mechanics (scoring, timing, replay)
- Number of rounds per game (10)
- UI components
- Player data or storage
- Any other service or hook
