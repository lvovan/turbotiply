# Research: Practice Mode Update

**Feature**: 017-practice-mode-update
**Date**: 2026-02-16

## Research Task 1: Multi-Game Aggregation Algorithm

**Question**: How should `getChallengingPairsForPlayer` be refactored to analyze up to 10 recent games instead of just the most recent one?

**Decision**: Replace the current single-game scan-backwards approach with a multi-game aggregation that:
1. Filters `gameHistory` to games with per-round data (`record.rounds?.length > 0`)
2. Takes the last 10 such games (`.slice(-10)`)
3. Flattens all `RoundResult[]` entries into a single stream
4. Groups by unordered pair key `(min(a,b), max(a,b))`
5. For each pair, computes: `mistakeCount` (total incorrect) and `avgMs` (mean `elapsedMs` across all occurrences)
6. Primary sort: `mistakeCount` descending
7. When `mistakeCount > 0` for any pair: return only pairs with `mistakeCount > 0`, use `avgMs` desc as tiebreaker
8. When all pairs have `mistakeCount === 0`: fall back to sorting all pairs by `avgMs` descending (slowest = most tricky)

**Rationale**: This approach directly implements FR-001 through FR-005. Grouping by unordered pair key follows the existing normalization convention (factorA ≤ factorB). Aggregating across multiple games surfaces persistent weaknesses rather than one-off mistakes.

**Alternatives considered**:
- *Weighted recency*: Give more weight to recent games. Rejected — spec does not call for weighting, and it adds complexity without clear user benefit.
- *Separate mistake-count and time-based lists*: Generate two separate ranked lists and merge. Rejected — the spec is explicit that time-based ranking is a fallback, not a parallel signal.
- *Keep `difficultyRatio` computation*: The existing per-game `difficultyRatio = elapsedMs / gameAverageMs` doesn't translate well across games with different average speeds. Direct `mistakeCount` + `avgMs` is simpler and spec-aligned.

## Research Task 2: `ChallengingPair` Type Evolution

**Question**: Should the `ChallengingPair` interface change to support `mistakeCount` and `avgMs`?

**Decision**: Update the `ChallengingPair` interface in `types/game.ts`:
```typescript
export interface ChallengingPair {
  factorA: number;
  factorB: number;
  mistakeCount: number;
  avgMs: number;
}
```
Remove the `difficultyRatio` field entirely.

**Rationale**: `difficultyRatio` was a single-game metric (round elapsed / game average). The new algorithm produces `mistakeCount` and `avgMs` as its two ranking signals. Since `difficultyRatio` is only consumed by `extractTrickyNumbers` (which uses the pairs' order, not the ratio value) and `generateImproveFormulas` (which uses pair order for slot priority), replacing the field is backward-safe. No consumer reads `difficultyRatio` for its numeric value other than tests.

**Alternatives considered**:
- *Keep `difficultyRatio` as computed from `mistakeCount` + `avgMs`*: Rejected — the two-field model is more transparent and test-friendly.
- *Add fields alongside `difficultyRatio`*: Rejected — adds dead code; `difficultyRatio` would become meaningless in a multi-game context.

## Research Task 3: Conditional Countdown Bar Hiding

**Question**: How to cleanly hide the countdown bar and timer text in Practice mode?

**Decision**: Pass `gameMode` to `GameStatus` (already done) and conditionally render the timer `<span>` and `<CountdownBar>` component only when `gameMode !== 'improve'`. The `useRoundTimer` hook continues to run in all modes (it tracks `elapsedMs` imperatively via `performance.now()`) — only the visual output is suppressed.

Implementation approach in `GameStatus.tsx`:
```tsx
{gameMode !== 'improve' && (
  <>
    <div className={styles.timer}>
      <span ref={timerRef} ...>5.0s</span>
    </div>
    <CountdownBar barRef={barRef} />
  </>
)}
```

**Rationale**: This is the simplest approach — no new props, no new hooks, no refactoring of `useRoundTimer`. The hook already writes to refs; if those refs are never mounted (because the component isn't rendered), the writes simply no-op on null refs. The hook's `stop()` still returns accurate `elapsedMs` since it uses `performance.now()` internally, not the DOM.

**Alternatives considered**:
- *Add a `showCountdown` prop to `GameStatus`*: Works but adds an unnecessary indirection — `gameMode` already carries the signal.
- *Disable the timer hook entirely in Practice mode*: Rejected — the hook is needed for `elapsedMs` measurement (FR-009).
- *CSS `display: none`*: Rejected — leaves DOM elements (including ARIA attributes) in the tree, which confuses screen readers.

## Research Task 4: Test Extension Strategy

**Question**: How should existing tests be extended/rewritten for the new behavior?

**Decision**:

1. **`challengeAnalyzer.test.ts`**: The `identifyChallengingPairs` function signature changes from `(rounds: RoundResult[]) → ChallengingPair[]` to a new internal aggregation function or the existing function is repurposed. The main test target becomes `getChallengingPairsForPlayer`, which now contains all the multi-game logic. New test scenarios:
   - Player with 5 games, mistakes on specific pairs → those pairs ranked by mistake count
   - Player with 10+ games → only last 10 used
   - Player with 0 mistakes → fallback to avg response time
   - Tiebreaker: same mistake count → sorted by avgMs desc
   - Mix of Play and Improve game records
   - Legacy records without rounds skipped
   - Single game with rounds → works like before (1-game window)

2. **`GameStatus.test.tsx`**: Add tests in the "Practice indicator" describe block:
   - Timer text not rendered when `gameMode='improve'`
   - CountdownBar not rendered when `gameMode='improve'`
   - Timer text rendered when `gameMode='play'`
   - CountdownBar rendered when `gameMode='play'`

3. **`improveMode.test.tsx`**: Add integration test:
   - Countdown bar absent during Practice gameplay
   - Multi-game tricky number analysis surfaces repeat mistakes

4. **`CountdownBar.test.tsx`**: No changes needed — the component itself is unchanged, it's just conditionally mounted.

**Rationale**: Follow existing test patterns — unit tests for service logic, component tests for rendering behavior, integration tests for full flows. The test-first approach (Constitution V) requires writing failing tests before implementation.

## Research Task 5: Impact on `generateImproveFormulas`

**Question**: Does the formula generator need changes?

**Decision**: No changes needed. `generateImproveFormulas` takes `ChallengingPair[]` and uses `.slice(0, 10)` to pick top pairs, then fills remaining slots randomly. It only reads `factorA` and `factorB` from each pair — it never reads `difficultyRatio`. The new `mistakeCount`/`avgMs` fields are irrelevant to this function. The pairs will already be sorted by the new ranking algorithm before being passed in.

**Rationale**: Separation of concerns — the analyzer ranks, the generator selects and shuffles.

## Research Task 6: Impact on `extractTrickyNumbers`

**Question**: Does the tricky-number extraction function need changes?

**Decision**: No changes needed. `extractTrickyNumbers` simply extracts unique factor numbers from the pairs array, sorts them ascending, and caps at 8. It reads only `factorA` and `factorB`. The ordering of the input pairs determines which numbers appear when there are more than 8 unique factors, which is already correct since the pairs will be pre-sorted by the new ranking algorithm.

**Rationale**: The function is agnostic to the ranking criteria — it operates on the already-ranked output.

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Aggregation algorithm | Analyze up to 10 most recent games with per-round data; rank by mistake count, fall back to avg response time |
| `ChallengingPair` type | Replace `difficultyRatio` with `mistakeCount` + `avgMs` |
| Countdown bar hiding | Conditionally render timer + bar in `GameStatus` based on `gameMode` |
| `useRoundTimer` hook | No changes — continues measuring `elapsedMs` regardless of mode |
| `generateImproveFormulas` | No changes — consumes only `factorA`/`factorB` |
| `extractTrickyNumbers` | No changes — consumes only `factorA`/`factorB` |
| Test strategy | Extend existing test files; no new test files needed |
