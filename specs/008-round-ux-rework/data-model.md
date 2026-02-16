# Data Model: Round UX Rework

**Feature**: 008-round-ux-rework  
**Date**: 2026-02-16

## Overview

This feature makes **no changes** to persisted data models or storage. All changes are visual/UI-only. The existing `GameState`, `Round`, `Formula`, and `ScoringTier` types remain unchanged.

## New Constants

### Countdown Colors (added to `scoring.ts`)

```typescript
export const COUNTDOWN_DURATION_MS = 5000;

export const COUNTDOWN_COLORS = {
  green: '#0e8a1e',      // 0–2s elapsed, 5 pts tier
  lightGreen: '#5ba829',  // 2–3s elapsed, 3 pts tier
  orange: '#d47604',      // 3–4s elapsed, 2 pts tier
  red: '#c5221f',         // 4–5s elapsed, 1 pt / 0 pts tier
} as const;

export type CountdownColor = typeof COUNTDOWN_COLORS[keyof typeof COUNTDOWN_COLORS];
```

These constants derive directly from the existing `SCORING_TIERS` thresholds and are defined alongside them for co-location.

## Modified Hook Return Type

### `useRoundTimer` Extended Return

```typescript
export interface UseRoundTimerReturn {
  displayRef: React.RefObject<HTMLElement | null>;  // existing — now shows countdown
  barRef: React.RefObject<HTMLElement | null>;       // NEW — bar width + color
  start: () => void;     // existing
  stop: () => number;    // existing
  reset: () => void;     // existing — now resets to "5.0s" and full-width green bar
}
```

No new state types. The hook writes directly to DOM via refs (no React state for animation).

## Existing Types (unchanged)

| Type | Location | Status |
|------|----------|--------|
| `GameState` | `types/game.ts` | Unchanged |
| `Round` | `types/game.ts` | Unchanged |
| `Formula` | `types/game.ts` | Unchanged |
| `ScoringTier` | `types/game.ts` | Unchanged |
| `GameStatus` | `types/game.ts` | Unchanged |
| `GameAction` | `services/gameEngine.ts` | Unchanged |

## Entity Relationships

```text
SCORING_TIERS ──defines──> COUNTDOWN_COLORS mapping
                           (same time boundaries)
                           
useRoundTimer ──writes to──> displayRef (countdown text)
              ──writes to──> barRef (width + color via COUNTDOWN_COLORS)
              ──reads from──> COUNTDOWN_DURATION_MS, COUNTDOWN_COLORS

GameStatus ──renders──> CountdownBar (receives barRef)
           ──renders──> countdown display (receives displayRef)

MainPage ──renders──> formulaArea wrapper
         ──swaps──> FormulaDisplay | InlineFeedback (based on currentPhase)
```
