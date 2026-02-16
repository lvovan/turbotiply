# Research: Improve Game Mode

**Feature**: 012-improve-game-mode  
**Date**: 2026-02-16

## 1. localStorage Storage Size Impact

**Decision**: Keep 100-game history cap and readable JSON keys. Worst-case fits within 5MB.

**Rationale**: Current `GameRecord` is ~38 bytes. Extended with 10 `RoundResult` objects + `gameMode` field, each record grows to ~630 bytes (~16× increase). Worst-case: 50 players × 100 games = 3.15 MB (~63% of the standard 5MB localStorage limit). In practice, a typical household (5 players × 30 games) uses ~95 KB — well within limits. The existing `StorageUnavailableError` try/catch pattern handles quota-exceeded gracefully.

**Alternatives Considered**:
- Reduce history cap from 100 to 50: halves worst-case to ~1.58 MB. Rejected — unnecessary given typical usage profiles.
- Use short JSON keys (`a`, `b`, `c`, `t`): saves ~30 bytes/round but reduces readability and debuggability. Rejected — premature optimization.
- Compress with LZ-string: adds dependency and CPU cost on every read/write. Rejected — not needed at this scale.

## 2. Data Migration Strategy (v4 → v5)

**Decision**: Sequential version bump in `readStore()`. Increment version to 5 without modifying existing `GameRecord` objects. New fields (`rounds`, `gameMode`) are only populated on newly created records.

**Rationale**: Old records genuinely lack per-round data — it was never captured. Backfilling `rounds: []` would be semantically misleading (empty array implies zero rounds, but these games had 10 rounds whose data wasn't recorded). Backfilling `gameMode: 'play'` adds bytes for no value — consumers default `undefined` to `'play'` via `?? 'play'`.

**Alternatives Considered**:
- Backfill `gameMode: 'play'` on all existing records: unnecessary write amplification, consumers handle `undefined` anyway. Rejected.
- Backfill `rounds: []`: semantically misleading. Rejected.
- Skip version bump: prevents future migrations from knowing schema state. Rejected.

## 3. TypeScript Type Design for Backward Compatibility

**Decision**: Make `rounds` and `gameMode` optional fields on `GameRecord`.

**Rationale**: Consistent with existing codebase pattern (`gameHistory?: GameRecord[]`). Consumers use `?? []` / `?? 'play'` defaults. TypeScript accurately models the reality that old records lack these fields. New records always populate them.

```typescript
interface RoundResult {
  factorA: number;
  factorB: number;
  isCorrect: boolean;
  elapsedMs: number;
}

interface GameRecord {
  score: number;
  completedAt: number;
  rounds?: RoundResult[];
  gameMode?: 'play' | 'improve';
}
```

**Alternatives Considered**:
- Required fields with migration backfill: eliminates optionality checks but introduces semantic confusion. Rejected.
- Discriminated union (`GameRecordV4 | GameRecordV5`): over-engineering for two optional fields. Rejected.

## 4. Challenge Analysis: Average Response Time Calculation

**Decision**: Compute the game average using only the 10 primary rounds' initial-attempt response times. Exclude all replay-attempt times.

**Rationale**: The average serves as a baseline for the child's unprimed response speed. Replay rounds are systematically faster (the child just saw the correct answer during feedback) and would deflate the average, making the 1.5× threshold harder to trigger. The 10 primary rounds form a consistent, fixed-size sample.

**Alternatives Considered**:
- Include replay times: deflates average, biases threshold. Rejected.
- Use only non-replayed rounds: sample size varies (0–10), introduces selection bias. Rejected.

## 5. Challenge Analysis: Which Response Time for Replayed Pairs

**Decision**: Use the initial (wrong) attempt's response time for the ≥ 1.5× comparison.

**Rationale**: The initial attempt captures the child's genuine struggle — they saw the problem fresh and failed. The replay time is contaminated by recency (just saw the answer). Using initial time correctly identifies pairs where the child was both slow AND incorrect.

**Data Implication**: The per-round data must preserve the initial-attempt `elapsedMs` and `isCorrect` status. Since the current game engine overwrites `Round` fields during replay via `SUBMIT_ANSWER`, the recording logic must snapshot initial-attempt data at game completion (from the primary rounds array) before replay modifications take effect. In practice, the `Round` objects in `gameState.rounds[]` already hold the initial-attempt data (index 0–9), while replay rounds are tracked via `replayQueue`. The snapshot is taken from `rounds[0..9]` at game completion.

## 6. Challenge Analysis: Edge Case — All Rounds Incorrect

**Decision**: No special-casing needed. The algorithm works correctly as-is.

**Rationale**: When all 10 rounds are incorrect, Signal 1 is satisfied for all pairs. Signal 2 (≥ 1.5× average) naturally filters to only the disproportionately slow ones. Example: if times are `[1200, 1500, 2000, 2200, 2500, 3000, 3500, 4000, 4500, 5000]`, mean = 2940, threshold = 4410, only 4500 and 5000 qualify. If all times are identical, no pair exceeds the threshold → 0 challenging pairs, which is correct (no pair stands out as especially hard).

## 7. Algorithm Pseudocode

```
FUNCTION identifyChallengingPairs(rounds: RoundResult[]) → ChallengingPair[]

  // Step 1: Compute game average response time (10 primary rounds)
  averageMs ← SUM(round.elapsedMs for round in rounds) / 10
  slowThreshold ← averageMs × 1.5

  // Step 2: Apply dual-signal filter
  challengingPairs ← []
  FOR EACH round IN rounds:
    isIncorrect ← NOT round.isCorrect
    isSlow ← round.elapsedMs ≥ slowThreshold

    IF isIncorrect AND isSlow:
      // Normalize to unordered pair (a ≤ b)
      a ← MIN(round.factorA, round.factorB)
      b ← MAX(round.factorA, round.factorB)
      difficultyRatio ← round.elapsedMs / averageMs
      challengingPairs.APPEND({ factorA: a, factorB: b, difficultyRatio })

  // Step 3: Rank by difficulty (descending)
  SORT challengingPairs BY difficultyRatio DESCENDING

  RETURN challengingPairs

FUNCTION extractTrickyNumbers(pairs: ChallengingPair[]) → number[]
  numbers ← unique set of factorA and factorB from all pairs
  RETURN SORTED(numbers) capped at 8
```

**Complexity**: O(n log n) where n = 10 rounds → effectively constant.

**Key property**: Within a single game, `generateFormulas()` guarantees 10 unique unordered pairs, so no deduplication is needed.

## 8. Improve Formula Generation Strategy

**Decision**: Use challenging pairs first, fill remaining slots with random pairs from the remaining pool.

**Rationale**: If analysis identifies `k` challenging pairs:
- If `k ≥ 10`: take top 10 by difficulty rank.
- If `k < 10`: take all `k`, then randomly select `10 - k` from the remaining 56+ pairs (66 total minus `k`).
Each round randomly assigns `hiddenPosition` and display order, identical to standard formula generation.

**Alternatives Considered**:
- Duplicate challenging pairs to fill 10 slots: repetitive and boring for the child. Rejected.
- Weight random selection toward neighbouring difficulty pairs: over-complicated for the benefit. Rejected.

## 9. Per-Round Data Capture Point

**Decision**: Snapshot per-round data from `gameState.rounds[0..9]` at game completion, before persisting. The existing `Round` objects in the game state already contain the initial-attempt data needed.

**Rationale**: Examining the game engine, `gameState.rounds[]` is populated during `START_GAME` with 10 entries. `SUBMIT_ANSWER` fills in `playerAnswer`, `isCorrect`, `elapsedMs`, and `points` on the current round. During replay, the replay queue references the same round indices but the `SUBMIT_ANSWER` action operates on `replayQueue[currentRoundIndex]`.

The key insight: the `rounds[]` array (indices 0–9) retains the primary-attempt data throughout the game. Replay rounds reference these same `Round` objects via `replayQueue`, but examining the reducer logic, replay `SUBMIT_ANSWER` modifies the round at `state.replayQueue[state.currentRoundIndex]` — which is an index into `rounds[]`. This means the initial `isCorrect` and `elapsedMs` values ARE overwritten during replay.

**Mitigation**: Before replay begins (i.e., when transitioning from `'playing'` to `'replay'` status in `NEXT_ROUND`), snapshot the initial-attempt data from `rounds[]`. Alternatively, track `wasCorrectOnFirstAttempt` as a separate boolean that is set during the primary phase and never overwritten.

**Chosen approach**: Add a `wasCorrectOnFirstAttempt` field to the `Round` type (or derive it: if a round index appears in `replayQueue`, it was incorrect on first attempt). For `elapsedMs`, capture the initial value during the primary phase before replay overwrites it — either by adding `initialElapsedMs` to `Round` or by extracting round results at the moment the game transitions to replay/completed status.

Simplest implementation: extend `Round` with `initialElapsedMs?: number` that is populated during primary-phase `SUBMIT_ANSWER` and never overwritten during replay.
