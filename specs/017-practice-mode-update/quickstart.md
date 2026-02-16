# Quickstart: Practice Mode Update

**Feature**: 017-practice-mode-update
**Date**: 2026-02-16

## Overview

Two changes scoped to Practice (Improve) mode only:
1. **Smarter tricky-number identification** — analyze up to 10 recent games instead of just the most recent
2. **Hide countdown bar** — suppress the animated timer bar and seconds display during Practice rounds

## Prerequisites

```bash
cd frontend
npm install
```

No new dependencies required.

## Files to Modify

| File | Change |
|------|--------|
| `src/types/game.ts` | Update `ChallengingPair` interface: replace `difficultyRatio` with `mistakeCount` + `avgMs` |
| `src/services/challengeAnalyzer.ts` | Rewrite `identifyChallengingPairs` for multi-game aggregation; update `getChallengingPairsForPlayer` to pass up to 10 games' rounds |
| `src/components/GamePlay/GameStatus/GameStatus.tsx` | Conditionally render timer text and `CountdownBar` only when `gameMode !== 'improve'` |

## Files Unchanged (verified no impact)

| File | Reason |
|------|--------|
| `src/services/formulaGenerator.ts` | Reads only `factorA`/`factorB` from `ChallengingPair` |
| `src/hooks/useRoundTimer.ts` | Hook still runs in all modes; writes to refs that may be null (safe) |
| `src/hooks/useGame.ts` | Calls `getChallengingPairsForPlayer` — same signature |
| `src/pages/MainPage.tsx` | Calls `getChallengingPairsForPlayer` + `extractTrickyNumbers` — same signatures |
| `src/components/GamePlay/CountdownBar/CountdownBar.tsx` | Component unchanged; conditionally mounted by parent |

## Test Files to Update

| Test File | Changes |
|-----------|---------|
| `tests/services/challengeAnalyzer.test.ts` | Rewrite for multi-game aggregation scenarios; replace `difficultyRatio` assertions |
| `tests/components/GameStatus.test.tsx` | Add tests: timer/bar hidden in improve mode, visible in play mode |
| `tests/integration/improveMode.test.tsx` | Add tests: countdown bar absent during practice, multi-game tricky numbers |

## Development Workflow

```bash
# 1. Run existing tests to confirm baseline (all green)
npm test

# 2. Write failing tests first (Constitution V: Test-First)
# Update challengeAnalyzer.test.ts with multi-game scenarios
# Update GameStatus.test.tsx with countdown hiding scenarios
npm test  # Expect failures (red)

# 3. Implement type change
# Edit src/types/game.ts — ChallengingPair

# 4. Implement algorithm change
# Edit src/services/challengeAnalyzer.ts

# 5. Implement UI change
# Edit src/components/GamePlay/GameStatus/GameStatus.tsx

# 6. Run tests again (green)
npm test

# 7. Lint + type check
npm run lint
npx tsc --noEmit

# 8. Manual verification
npm run dev
# → Play a few games with deliberate mistakes
# → Check Practice button shows tricky numbers from multiple games
# → Start Practice → confirm no countdown bar
# → Start Play → confirm countdown bar present
```

## Key Design Decisions

1. **No new files** — all changes fit within existing modules
2. **`useRoundTimer` unchanged** — hook measures time regardless of visual output; refs are simply null when components aren't mounted
3. **`gameMode` prop reuse** — `GameStatus` already receives `gameMode` for the Practice badge; same prop now also controls timer/bar visibility
4. **No score impact** — Practice mode scoring exclusions remain unchanged
