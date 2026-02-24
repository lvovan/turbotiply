# Quickstart: High Scores Medals — Best of Last 10 Games

**Feature**: 026-high-scores-medals
**Branch**: `026-high-scores-medals`

## What This Feature Does

Changes the high scores medals section to show the **best 3 scores from the last 10 play-mode games** instead of the current behavior (best scores from only the last 3 games). If fewer than 10 games exist, it uses all available games.

## Files to Change

| File | Change |
|------|--------|
| `frontend/src/services/playerStorage.ts` | Update `getRecentHighScores` signature: `(player, windowSize=10, topN=3)`. Add `.slice(0, topN)` after sorting. |
| `frontend/src/pages/MainPage.tsx` | Simplify call to `getRecentHighScores(currentPlayer)` (rely on defaults). |
| `frontend/tests/services/playerStorage.test.ts` | Update existing tests + add new windowing test cases. |

## Step-by-Step

### 1. Write/update tests first (red)

In `frontend/tests/services/playerStorage.test.ts`, update the `describe('getRecentHighScores')` block:

- Update test "returns last 5 sorted by score desc" → "returns top 3 from last 10 by default"
- Update test for custom count → test custom `windowSize` and `topN` params
- Add test: 15 games → only last 10 considered, top 3 returned
- Add test: 5 games → all 5 in window, top 3 returned
- Add test: 2 games → both returned (topN=3 but only 2 available)

### 2. Update `getRecentHighScores` (green)

```ts
export function getRecentHighScores(
  player: Player,
  windowSize: number = 10,
  topN: number = 3,
): GameRecord[] {
  const history = (player.gameHistory ?? []).filter(
    (r) => (r.gameMode ?? 'play') === 'play',
  );
  if (history.length === 0) return [];
  const window = history.slice(-windowSize);
  const sorted = [...window].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.completedAt - a.completedAt;
  });
  return sorted.slice(0, topN);
}
```

### 3. Update call site

In `frontend/src/pages/MainPage.tsx` line 135, change:
```ts
// Before:
const recentScores = currentPlayer ? getRecentHighScores(currentPlayer, 3) : [];
// After:
const recentScores = currentPlayer ? getRecentHighScores(currentPlayer) : [];
```

### 4. Run tests (green)

```bash
cd frontend && npx vitest run tests/services/playerStorage.test.ts
```

### 5. Verify no regressions

```bash
cd frontend && npx vitest run
```

## Verification Checklist

- [ ] `getRecentHighScores(player)` with 10+ games returns top 3 from last 10
- [ ] `getRecentHighScores(player)` with <10 games uses all available
- [ ] `getRecentHighScores(player)` with <3 games returns fewer than 3
- [ ] `getRecentHighScores(player)` with 0 games returns `[]`
- [ ] Improve-mode games are excluded from the window
- [ ] Ties broken by most recent first
- [ ] MainPage renders medals correctly with new data
- [ ] All existing tests pass
- [ ] No TypeScript errors
- [ ] ESLint clean
