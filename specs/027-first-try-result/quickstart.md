# Quickstart: First-Try Result Indicator

**Feature**: 027-first-try-result  
**Date**: 2026-02-24

## What This Feature Does

Changes the Result column in the post-game results table from showing ✓/✗ (based on the last attempt) to showing ✅/❌ (based on the first attempt). A round that was answered incorrectly on the first try but corrected during replay now shows ❌ instead of ✓.

## Key Design Decision

A new `firstTryCorrect: boolean | null` field is added to the `Round` interface. This field is set once during the primary playing phase and never overwritten during replay, unlike `isCorrect` which gets overwritten. See [research.md](research.md) for rationale.

## Files to Change

| File | What changes |
|------|-------------|
| `frontend/src/types/game.ts` | Add `firstTryCorrect` to `Round` interface |
| `frontend/src/services/gameEngine.ts` | Set `firstTryCorrect` during primary play; preserve during replay |
| `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` | Render ✅/❌ based on `firstTryCorrect` with `role="img"` |
| `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.module.css` | Remove `color` from badge classes |
| `frontend/tests/services/gameEngine.test.ts` | Add tests for `firstTryCorrect` preservation |
| `frontend/tests/components/ScoreSummary.test.tsx` | Update to test ✅/❌ rendering and aria-labels |
| `frontend/tests/a11y/ScoreSummary.a11y.test.tsx` | Verify axe compliance with new emoji markup |

## What NOT to Change

- `RoundResult` / `GameRecord` / persistence layer — `firstTryCorrect` is session-only
- `ScoreSummaryProps` — already receives `Round[]`
- Row coloring logic — continues to use `points`
- Other columns in the results table
- Any page or component outside ScoreSummary

## How to Verify

1. Run existing tests: `cd frontend && npx vitest run`
2. Play a game where some rounds are wrong → verify ❌ appears even after successful replay
3. Play a perfect game → verify all ✅
4. Check screen reader output with browser dev tools or assistive technology
