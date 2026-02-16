# Service Contracts: Improve Game Mode

**Feature**: 012-improve-game-mode  
**Date**: 2026-02-16

> This is a static SPA with no backend API. Contracts define the internal TypeScript
> service function signatures and their behavioral guarantees.

## 1. Challenge Analyzer Service

**File**: `frontend/src/services/challengeAnalyzer.ts` (NEW)

### `identifyChallengingPairs(rounds: RoundResult[]): ChallengingPair[]`

Analyzes a completed game's primary rounds to identify challenging multiplication pairs.

**Input**:
- `rounds`: Array of exactly 10 `RoundResult` objects from the most recent completed game.

**Output**:
- Array of `ChallengingPair` objects, sorted by `difficultyRatio` descending. May be empty.

**Behavioral Contract**:
1. Computes the average `elapsedMs` across all 10 input rounds.
2. The slow threshold is `averageMs × 1.5`.
3. A pair qualifies as challenging only if BOTH: `isCorrect === false` AND `elapsedMs >= slowThreshold`.
4. Each qualifying pair is normalized to unordered form (`factorA ≤ factorB`).
5. `difficultyRatio` = `elapsedMs / averageMs`.
6. Result is sorted by `difficultyRatio` descending.
7. Returns empty array if no pairs meet the dual-signal threshold.

**Preconditions**: `rounds.length === 10`, all entries have valid factor values (2–12) and positive `elapsedMs`.

### `extractTrickyNumbers(pairs: ChallengingPair[]): number[]`

Extracts unique factor numbers from challenging pairs for display.

**Input**:
- `pairs`: Output of `identifyChallengingPairs()`.

**Output**:
- Sorted ascending array of unique factor numbers, capped at 8 elements.

**Behavioral Contract**:
1. Collects all `factorA` and `factorB` values from input pairs into a set.
2. Sorts ascending numerically.
3. Returns first 8 entries (or fewer if less than 8 unique numbers exist).
4. Returns empty array if input is empty.

### `getChallengingPairsForPlayer(playerName: string): ChallengingPair[]`

Convenience function that loads the player's most recent game record with per-round data and runs analysis.

**Input**:
- `playerName`: Case-insensitive player name.

**Output**:
- Challenging pairs from the most recent game with `rounds` data, or empty array if no analyzable games exist.

**Behavioral Contract**:
1. Loads player from storage.
2. Finds the most recent `GameRecord` with a non-empty `rounds` array (regardless of `gameMode`).
3. Passes that record's `rounds` to `identifyChallengingPairs()`.
4. Returns empty array if player not found, has no game history, or no records contain `rounds` data.

---

## 2. Formula Generator (EXTENDED)

**File**: `frontend/src/services/formulaGenerator.ts` (MODIFIED)

### `generateImproveFormulas(challengingPairs: ChallengingPair[]): Formula[]`

Generates 10 formulas for an Improve game, biased toward challenging pairs.

**Input**:
- `challengingPairs`: Non-empty array of `ChallengingPair` objects, sorted by difficulty.

**Output**:
- Array of exactly 10 `Formula` objects with randomized `hiddenPosition` and display order.

**Behavioral Contract**:
1. Takes the top `min(challengingPairs.length, 10)` pairs by difficulty rank.
2. If fewer than 10 challenging pairs, fills remaining slots with random pairs from the full 66-pair pool, excluding pairs already selected.
3. Each formula receives a random `hiddenPosition` ('A', 'B', or 'C') — uniform distribution ⅓ each.
4. Factor display order is randomized (which factor is shown first).
5. The 10 formulas are shuffled into a random order.

**Preconditions**: `challengingPairs.length > 0`.

---

## 3. Player Storage (EXTENDED)

**File**: `frontend/src/services/playerStorage.ts` (MODIFIED)

### `saveGameRecord(playerName: string, score: number, rounds: RoundResult[], gameMode: GameMode): void`

Replaces the current `updatePlayerScore()` for full game persistence.

**Input**:
- `playerName`: Case-insensitive player name.
- `score`: Total game score.
- `rounds`: Array of 10 `RoundResult` objects.
- `gameMode`: `'play'` or `'improve'`.

**Behavioral Contract**:
1. Creates a `GameRecord` with `score`, `completedAt: Date.now()`, `rounds`, and `gameMode`.
2. Appends to the player's `gameHistory`.
3. Enforces 100-record cap (oldest records removed).
4. If `gameMode === 'play'`:
   - Increments `player.gamesPlayed` by 1.
   - Adds `score` to `player.totalScore`.
5. If `gameMode === 'improve'`:
   - Does NOT modify `gamesPlayed` or `totalScore`.
6. Writes the store.

### `getRecentHighScores(player, count)` — MODIFIED behavior

**Contract change**: Excludes records where `gameMode === 'improve'` (or `gameMode` is absent, defaulting to `'play'`).

### `getGameHistory(player)` — MODIFIED behavior

**Contract change**: Excludes records where `gameMode === 'improve'`. Only `'play'` games appear in the progression graph.

### `getRecentAverage(player, count)` — MODIFIED behavior

**Contract change**: Only considers records where `(gameMode ?? 'play') === 'play'`.

---

## 4. Game Hook (EXTENDED)

**File**: `frontend/src/hooks/useGame.ts` (MODIFIED)

### `useGame()` — Return type extension

**New field**: `startGame` signature changes from `() => void` to `(mode?: GameMode) => void`, defaulting to `'play'`.

**New field**: `gameMode: GameMode` — exposes the current game's mode.

**Behavioral Contract**:
1. `startGame('play')` generates random formulas via `generateFormulas()`.
2. `startGame('improve')` generates targeted formulas via `generateImproveFormulas()`.
3. `gameMode` is set on `START_GAME` and available throughout the game lifecycle.
4. `gameMode` is passed to the persistence layer on game completion.

---

## 5. Game Engine (EXTENDED)

**File**: `frontend/src/services/gameEngine.ts` (MODIFIED)

### `GameState` — extended

**New field**: `gameMode: GameMode` — set by `START_GAME` action, defaults to `'play'`.

### `START_GAME` action — extended

**New field**: `mode?: GameMode` — optional, defaults to `'play'`.

**Behavioral Contract**: Sets `gameState.gameMode` from the action's `mode` field.

### Score calculation during Improve mode

**Contract change**: During an Improve game (`gameMode === 'improve'`), the internal score is still tracked (for replay-queue logic which depends on `isCorrect`) but is NOT displayed to the user and NOT persisted to the player's aggregate scores.

---

## 6. UI Component Contracts

### ModeSelector (NEW)

**File**: `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`

**Props**:
```typescript
interface ModeSelectorProps {
  onStartPlay: () => void;
  onStartImprove: () => void;
  trickyNumbers: number[];
  showImprove: boolean;
  showEncouragement: boolean;
}
```

**Behavioral Contract**:
1. Always renders a "Play" button with descriptor "Go for a high score!"
2. If `showImprove && trickyNumbers.length > 0`: renders "Improve" button with descriptor "Level up your tricky numbers: {numbers}".
3. If `showEncouragement && !showImprove`: renders encouraging message text.
4. Numbers in descriptor are comma-separated, ascending, capped at 8 with "…" if more.
5. All buttons meet 44×44 px touch target, are keyboard-focusable, and have ARIA labels.

### GameStatus — MODIFIED

**Contract change**: When `gameMode === 'improve'`, the score display is replaced with a "Practice" text indicator.

### ScoreSummary — MODIFIED (Improve variant)

**Contract change**: When `gameMode === 'improve'`:
1. Shows "You got X/10 right!" instead of the score.
2. Lists specific incorrect pairs (e.g., "Keep practising: 7 × 8, 6 × 9").
3. Does NOT show high scores, progression graph, or score-related metrics.
4. Shows "Play Again" and "Back to Menu" buttons.
