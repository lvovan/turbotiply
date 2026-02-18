# Quickstart: Hide Sparkline in Practice/Improve Mode

**Feature**: 025-hide-practice-sparkline  
**Date**: 2026-02-18

## What This Feature Does

Hides the score progression sparkline chart from the result screen when a game is completed in Practice/Improve mode. The sparkline continues to appear on the result screen for Normal (play) mode games and on the pre-game screen for all players.

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` | Add `!isImprove` guard to sparkline rendering conditional |
| `frontend/tests/components/ScoreSummary.test.tsx` | Add test cases for sparkline visibility by game mode |

## How to Verify

1. **Start the dev server**: `cd frontend && npm run dev`
2. **Test Improve mode**: Select a player → Start "Improve" mode → Complete game → Result screen should NOT show sparkline
3. **Test Play mode**: Select a player → Start "Play" mode → Complete game → Result screen should show sparkline (if ≥2 play-mode games in history)
4. **Test pre-game screen**: Navigate to pre-game screen → Sparkline should appear (if ≥2 play-mode games in history, same as before)

## How to Run Tests

```bash
cd frontend
npx vitest run tests/components/ScoreSummary.test.tsx
```

## Key Implementation Detail

The change is a single conditional in `ScoreSummary.tsx`:

```diff
- {history && <ProgressionGraph history={history} />}
+ {!isImprove && history && <ProgressionGraph history={history} />}
```

The `isImprove` boolean already exists in the component (`const isImprove = gameMode === 'improve'`).
