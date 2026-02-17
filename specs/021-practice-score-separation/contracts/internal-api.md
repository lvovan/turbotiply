# API Contracts: Practice Score Separation

**Date**: 2026-02-17 | **Branch**: `021-practice-score-separation`

## Overview

This feature has **no external API** — it is a pure client-side SPA with localStorage persistence. All "contracts" are internal TypeScript function signatures.

## Internal Function Contracts (Changed)

### `extractTrickyNumbers(pairs: ChallengingPair[]): number[]`

**Location**: `frontend/src/services/challengeAnalyzer.ts`

**Before** (current):
```typescript
// Collects all unique factors from all pairs, sorts ascending, caps at 8
export function extractTrickyNumbers(pairs: ChallengingPair[]): number[]
```

**After** (new):
```typescript
/**
 * Extract the top 3 most challenging individual factor numbers.
 *
 * Ranks each factor (2–12) by its total mistake count summed across
 * all challenging pairs containing it. Ties broken by weighted average
 * response time (slowest first). Returns at most 3 factors, sorted ascending.
 *
 * @param pairs Output of identifyChallengingPairs().
 * @returns Sorted ascending array of up to 3 factor numbers.
 */
export function extractTrickyNumbers(pairs: ChallengingPair[]): number[]
```

**Behavioral contract**:
- Input: `ChallengingPair[]` (may be empty)
- Output: `number[]` with 0–3 elements, sorted ascending
- Empty input → empty output
- Each factor scored by sum of `mistakeCount` across all pairs containing it
- Ties broken by weighted average `avgMs` (slowest first)
- Returns top 3 factors by score, then sorted ascending for display

### `ModeSelector` Component Props (Unchanged)

```typescript
interface ModeSelectorProps {
  onStartPlay: () => void;
  onStartImprove: () => void;
  trickyNumbers: number[];    // now always ≤ 3 elements (was ≤ 8)
  showImprove: boolean;
  showEncouragement: boolean;
}
```

The component's interface is unchanged. The internal `MAX_DISPLAY` constant changes from 8 to 3.

## Internal Function Contracts (Unchanged)

These functions are confirmed correct and require no changes:

| Function | File | Filtering |
|----------|------|-----------|
| `getRecentHighScores(player, count)` | `playerStorage.ts` | Play-only ✓ |
| `getGameHistory(player)` | `playerStorage.ts` | Play-only ✓ |
| `getRecentAverage(player, count)` | `playerStorage.ts` | Play-only ✓ |
| `getChallengingPairsForPlayer(name)` | `challengeAnalyzer.ts` | Both modes ✓ |
| `identifyChallengingPairs(rounds)` | `challengeAnalyzer.ts` | N/A (works on rounds) ✓ |
