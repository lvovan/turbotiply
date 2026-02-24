# Research: High Scores Medals — Best of Last 10 Games

**Feature**: 026-high-scores-medals
**Date**: 2026-02-24

## Research Task 1: Function Signature Design for `getRecentHighScores`

### Context
The current `getRecentHighScores(player, count)` uses a single `count` parameter that controls both the window of recent games considered AND the number of results returned. The feature requires separating these: window = 10, results = 3.

### Decision: Add a `topN` parameter

Update the function signature to:
```ts
getRecentHighScores(player: Player, windowSize: number = 10, topN: number = 3): GameRecord[]
```

### Rationale
- **Backward-compatible semantics**: The old `count=3` call from MainPage was implicitly using `count` as both window and result size. The new signature makes this explicit.
- **No new function needed**: A new function would create redundant code paths. Modifying the existing function with clear parameter names is simpler (YAGNI).
- **Default values match the new requirement**: `windowSize=10, topN=3` makes the common case require zero arguments beyond `player`.

### Alternatives considered
1. **New function `getTopScoresFromRecent(player, windowSize, topN)`**: Rejected because it duplicates logic already in `getRecentHighScores`. Would need to deprecate or remove the old function — unnecessary churn.
2. **Options object `{ windowSize, topN }`**: Rejected as over-engineered for a 2-parameter function. The codebase uses positional args consistently for simple service functions.
3. **Keep `count` and add `topN`**: Rejected because renaming `count` to `windowSize` is clearer about what it controls.

---

## Research Task 2: Call-Site Impact Analysis

### Context
Need to identify all call sites of `getRecentHighScores` and confirm the change is safe.

### Findings
- **Single call site**: `MainPage.tsx` line 135: `getRecentHighScores(currentPlayer, 3)`
- **Test file**: `playerStorage.test.ts` line 666+: 6 tests that call `getRecentHighScores` with various arguments
- **No other consumers** exist in the codebase.

### Decision: Update call site to `getRecentHighScores(currentPlayer)`
Since the new defaults (`windowSize=10, topN=3`) match the desired behavior exactly, the call site can simply drop the second argument and rely on defaults. This is cleaner and more readable.

### Impact
- `MainPage.tsx`: Change `getRecentHighScores(currentPlayer, 3)` → `getRecentHighScores(currentPlayer)`
- Tests: Update to cover the new windowing behavior (last 10, top 3)

---

## Research Task 3: Component Compatibility

### Context
Does the `RecentHighScores` component need changes to display 0–3 scores from a 10-game window?

### Findings
- Component receives `scores: GameRecord[]` and `isEmpty: boolean`
- Renders `scores.map(...)` — handles any array length naturally
- `MEDALS` array is `['🥇', '🥈', '🥉']` — ranks 1–3 get emojis, 4+ get ordinals
- Since `topN=3`, the component will never receive more than 3 items
- Existing test confirms 2-item array renders 2 `<li>` elements correctly
- Empty state (`isEmpty=true`) already handled

### Decision: No component changes needed
The component is already fully compatible with the new data selection logic.

---

## Research Task 4: Test Strategy

### Context
Identify what tests need updating and what new test cases are needed.

### Findings — existing tests in `playerStorage.test.ts`:
1. Returns empty for absent history ✅ (still valid)
2. Returns empty for empty history ✅ (still valid)
3. Last 5 sorted by score desc — ❌ needs update (default is now 10, not 5)
4. Tie-breaking by completedAt ✅ (still valid)
5. Fewer than N games returns fewer items ✅ (still valid, but verify wording)
6. Custom count excludes older entries — ❌ needs update (parameter name change)

### Decision: Update existing tests + add new windowing test cases

New/updated test cases:
- Default window=10: Given 15 play-mode games, returns top 3 from last 10
- Custom topN: Given 10 games, `getRecentHighScores(player, 10, 2)` returns only top 2
- Fewer than 10 games: Given 5 games, returns top 3 from all 5
- Fewer than 3 games: Given 2 games, returns both (topN > available)
- Window + topN interaction: Ensure 11th-oldest game is excluded from rankings

---

## Research Task 5: i18n Impact

### Context
Are any translation keys affected?

### Findings
- `scores.title`: "Recent High Scores" — still accurate, no change
- `scores.listLabel`: "Recent high scores, ranked highest to lowest" — still accurate
- `scores.empty` / `scores.scorePoints` / `scores.placeScore` — unchanged
- Medal emojis are emoji literals in the component, not i18n keys

### Decision: No i18n changes needed
All existing translation keys remain semantically correct with the new windowing logic.
