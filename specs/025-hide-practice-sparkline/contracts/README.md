# Contracts: Hide Sparkline in Practice/Improve Mode

**Feature**: 025-hide-practice-sparkline  
**Date**: 2026-02-18

## API Contracts

None. This feature is a UI-only conditional rendering change. No new endpoints, no data format changes, no service interface modifications.

## Component Interface Changes

No props or interfaces are added or modified. The existing `ScoreSummaryProps` interface already includes `gameMode?: GameMode` which provides the information needed for the conditional.

```typescript
// UNCHANGED — existing interface in ScoreSummary.tsx
interface ScoreSummaryProps {
  rounds: Round[];
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  gameMode?: GameMode;    // Already present — used for conditional
  history?: GameRecord[]; // Already present — sparkline data
}
```
