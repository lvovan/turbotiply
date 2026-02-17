# Research: Practice Score Separation

**Date**: 2026-02-17 | **Branch**: `021-practice-score-separation`

## Research Tasks

### 1. Current Mode Filtering in Score Displays

**Task**: Verify whether high scores, sparkline, and profile average already filter by Play mode.

**Findings**:
- `getRecentHighScores(player, count)` in `playerStorage.ts` L345–L358: Filters `(r.gameMode ?? 'play') === 'play'`. **Already play-only.**
- `getGameHistory(player)` in `playerStorage.ts` L363–L370: Filters `(r.gameMode ?? 'play') === 'play'`. **Already play-only.** (Used by sparkline.)
- `getRecentAverage(player, count)` in `playerStorage.ts` L327–L343: Filters `(r.gameMode ?? 'play') === 'play'`. **Already play-only.**
- `saveGameRecord()` in `playerStorage.ts` L286: Only increments `totalScore`/`gamesPlayed` for play mode. **Already correct.**

**Decision**: No changes needed in `playerStorage.ts`. All score filtering is already correctly implemented.
**Rationale**: Feature 012 (Improve Game Mode) established these filters. They work correctly.
**Alternatives considered**: None — existing implementation matches spec requirements.

### 2. Tricky Number Analysis Mode Filtering

**Task**: Verify that `getChallengingPairsForPlayer` uses both Play and Improve games.

**Findings**:
- `getChallengingPairsForPlayer()` in `challengeAnalyzer.ts` L97–L126: Filters to games with `rounds` data, takes last 10. **Does NOT filter by mode.** Both Play and Improve games are included.

**Decision**: No change needed. Current behavior already matches FR-006 and FR-007 (tricky analysis uses both modes).
**Rationale**: The spec explicitly requires both modes to be analyzed for tricky numbers.
**Alternatives considered**: None — current behavior is correct per spec.

### 3. `extractTrickyNumbers` Algorithm Change

**Task**: Research how to change from "collect all unique factors from all pairs, cap at 8" to "rank individual factors by aggregate mistake count, take top 3".

**Current algorithm** (`challengeAnalyzer.ts` L74–L85):
1. Collect all unique factor numbers from all `ChallengingPair[]` into a Set
2. Sort ascending
3. Cap at `MAX_TRICKY_NUMBERS = 8`

**New algorithm required** (per FR-009 and clarification):
1. For each unique factor number (2–12), sum its `mistakeCount` across all pairs containing it
2. For tiebreaking, compute the factor's average response time across all pairs containing it
3. Sort by aggregate mistake count desc, then avgMs desc
4. Take top 3
5. Sort the selected 3 ascending for display

**Decision**: Replace `extractTrickyNumbers()` function body. Change `MAX_TRICKY_NUMBERS` from 8 to 3. Accept `ChallengingPair[]` as before but iterate differently.
**Rationale**: Per-factor ranking directly matches user intent ("the 3 numbers for which the player has the most trouble") and was confirmed in the clarification session.
**Alternatives considered**: Pair-iteration approach (iterate ranked pairs, collect factors until 3 unique) — rejected because boundary behavior is ambiguous when a pair straddles the cap.

### 4. `ModeSelector` Display Cap

**Task**: Research how the Improve button descriptor renders tricky numbers.

**Current behavior** (`ModeSelector.tsx` L28–L32):
- `MAX_DISPLAY = 8`
- Sorts ascending, slices to 8, adds `', …'` if more exist
- Passes to i18n key `mode.improveDescription` as `{ numbers: numbersText }`

**Decision**: Change `MAX_DISPLAY` from 8 to 3. However, since `extractTrickyNumbers()` will now return at most 3 factors, the `MAX_DISPLAY` in ModeSelector becomes redundant. Keep it as a safety cap at 3 for defense-in-depth but simplify: the ellipsis logic can remain but will never trigger.
**Rationale**: The algorithm change in `extractTrickyNumbers` is the authoritative cap. ModeSelector's cap is secondary.
**Alternatives considered**: Remove `MAX_DISPLAY` entirely from ModeSelector — rejected for defense-in-depth.

### 5. MainPage Data Flow

**Task**: Verify the data flow from storage → analysis → display doesn't need changes.

**Current flow** (`MainPage.tsx` L125–134):
```ts
const recentScores = getRecentHighScores(currentPlayer, 3);     // play-only ✓
const gameHistory = getGameHistory(currentPlayer);                // play-only ✓
const challengingPairs = getChallengingPairsForPlayer(name);     // all modes ✓
const trickyNumbers = extractTrickyNumbers(challengingPairs);     // currently 8-cap → will be 3-cap
```

**Decision**: No changes needed in `MainPage.tsx`. The data flow is correct; only the underlying function behavior changes.
**Rationale**: `extractTrickyNumbers` is the single function whose output changes. All consumers already use it correctly.
**Alternatives considered**: None.

## Summary

| Area | Change Needed? | Details |
|------|---------------|---------|
| `playerStorage.ts` (high scores, sparkline, average) | **No** | Already filters play-only |
| `challengeAnalyzer.ts` (`getChallengingPairsForPlayer`) | **No** | Already uses both modes |
| `challengeAnalyzer.ts` (`extractTrickyNumbers`) | **Yes** | New per-factor ranking algorithm, cap 8→3 |
| `ModeSelector.tsx` | **Yes** | `MAX_DISPLAY` 8→3 |
| `MainPage.tsx` | **No** | Data flow unchanged |
| Types (`player.ts`, `game.ts`) | **No** | No schema changes |
| Tests | **Yes** | New unit tests for ranking algorithm; update component test for 3-cap |

All NEEDS CLARIFICATION items resolved. No open questions remain.
