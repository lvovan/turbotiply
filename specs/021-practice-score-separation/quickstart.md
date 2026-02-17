# Quickstart: Practice Score Separation

**Date**: 2026-02-17 | **Branch**: `021-practice-score-separation`

## What This Feature Does

Changes how the Multis app displays scores and tricky numbers on the main menu:

1. **High Scores** — Already filtered to Play-mode only (no code change needed)
2. **Sparkline** — Already filtered to Play-mode only (no code change needed)
3. **Tricky Number Analysis** — Already uses both Play and Improve modes (no change needed)
4. **Improve Button Descriptor** — Changes from showing up to 8 tricky numbers to showing at most 3, ranked by per-factor aggregate mistake count

## Files to Change

| File | Change |
|------|--------|
| `frontend/src/services/challengeAnalyzer.ts` | Rewrite `extractTrickyNumbers()`: per-factor ranking, cap 8→3 |
| `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx` | `MAX_DISPLAY`: 8→3 |

## Files to Add (Tests)

| File | Purpose |
|------|---------|
| `frontend/tests/services/challengeAnalyzer.test.ts` | Unit tests for new `extractTrickyNumbers` algorithm |
| `frontend/tests/components/ModeSelector.test.tsx` | Component tests for 3-number display cap |

## Algorithm: `extractTrickyNumbers` (New)

```
Input: ChallengingPair[] (ranked by mistakeCount desc, avgMs desc)

1. If empty → return []
2. Build factor map: for each pair, add pair's mistakeCount to both factorA and factorB
3. For each factor, compute weighted avgMs across pairs containing it
4. Sort factors by aggregateMistakes desc, then weightedAvgMs desc
5. Take top 3
6. Sort selected factors ascending
7. Return
```

## How to Test Locally

```bash
cd frontend
npm test -- --run tests/services/challengeAnalyzer.test.ts
npm test -- --run tests/components/ModeSelector.test.tsx
```

## Verification Checklist

- [ ] `extractTrickyNumbers([])` returns `[]`
- [ ] With 1 pair (7×8, 5 mistakes) → returns `[7, 8]`
- [ ] With pairs producing >3 factors → returns exactly 3
- [ ] Factor ranking: 7×8 (5 mistakes) + 4×7 (2 mistakes) → factor 7 has 7 aggregate → appears in top 3
- [ ] Ties broken by avgMs (slowest first)
- [ ] ModeSelector shows at most 3 numbers in descriptor
- [ ] No ellipsis when ≤3 numbers
- [ ] High scores still play-only (regression check)
- [ ] Sparkline still play-only (regression check)
