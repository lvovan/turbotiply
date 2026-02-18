# Research: Hide Sparkline in Practice/Improve Mode

**Feature**: 025-hide-practice-sparkline  
**Date**: 2026-02-18

## Research Tasks

### RT-001: Where is the sparkline conditionally rendered on the result screen?

**Decision**: The sparkline is conditionally rendered in `ScoreSummary.tsx` at a single point: `{history && <ProgressionGraph history={history} />}`. The guard checks only for truthiness of `history`, with no game-mode awareness.

**Rationale**: The existing code already has an `isImprove` boolean (`const isImprove = gameMode === 'improve'`) in the same component. Adding `!isImprove` to the existing guard is the minimal change needed.

**Alternatives considered**:
- **Stop passing `history` from MainPage in improve mode**: Would work but couples the decision to the parent component rather than keeping it in ScoreSummary where all other mode-based rendering decisions are made. Rejected for inconsistency.
- **Add mode filtering inside ProgressionGraph**: Would break single-responsibility — ProgressionGraph is a pure chart component that renders whatever data it receives. Rejected for violating separation of concerns.
- **Conditionally pass `history` prop as `undefined` in improve mode**: Functionally equivalent to option 1, same rejection reasoning.

### RT-002: Does the pre-game sparkline need changes?

**Decision**: No. The pre-game sparkline (in `MainPage.tsx`) already filters to play-mode history via `getGameHistory()` which returns only `gameMode === 'play'` records. The pre-game screen is mode-agnostic — it appears before any mode is selected.

**Rationale**: `getGameHistory(player)` from `playerStorage.ts` already filters: `(r.gameMode ?? 'play') === 'play'`. No change needed.

**Alternatives considered**: None — the existing implementation is already correct.

### RT-003: Does the history array passed to ScoreSummary need filtering?

**Decision**: No. On the result screen, `MainPage.tsx` passes `history={[...gameHistory, { score, completedAt, rounds, gameMode }]}`. In improve mode, the appended record has `gameMode: 'improve'`, but since we're hiding the entire sparkline in improve mode, the contents of the `history` array are irrelevant — the sparkline won't render at all.

**Rationale**: If the sparkline is hidden, there's no point filtering the data that feeds it. The simplest approach is to gate on mode, not on data.

**Alternatives considered**:
- **Filter improve records from the history array before passing**: Unnecessary complexity since the entire sparkline is hidden in improve mode. Would only matter if we wanted to show the sparkline with play-only data in improve mode (not requested).

### RT-004: Existing test coverage and test approach

**Decision**: `ScoreSummary.test.tsx` already tests sparkline rendering (≥2 entries → visible, undefined → hidden, <2 entries → hidden). Three new test cases needed:
1. Sparkline NOT rendered when `gameMode='improve'` even with sufficient history
2. Sparkline still rendered when `gameMode='play'` with sufficient history (regression guard)
3. Sparkline NOT rendered when `gameMode='improve'` and history is undefined (compound edge case)

**Rationale**: Tests must cover the new conditional branch. The existing test helpers and patterns in the test file provide a clear template for adding these cases.

**Alternatives considered**: None — test coverage follows directly from the implementation change.

## Summary

All research items resolved. No external dependencies, no architectural decisions, no NEEDS CLARIFICATION items. The implementation is a single conditional guard (~1 LOC) with ~3 new test cases.
