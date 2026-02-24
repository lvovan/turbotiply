# Service Contract: `getRecentHighScores`

**Module**: `frontend/src/services/playerStorage.ts`
**Feature**: 026-high-scores-medals

## Current Signature

```ts
function getRecentHighScores(player: Player, count?: number): GameRecord[]
// count defaults to 5
```

## New Signature

```ts
function getRecentHighScores(player: Player, windowSize?: number, topN?: number): GameRecord[]
// windowSize defaults to 10
// topN defaults to 3
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| player | Player | (required) | Player object with gameHistory |
| windowSize | number | 10 | How many most-recent play-mode games to consider |
| topN | number | 3 | How many top scores to return from the window |

## Return Value

`GameRecord[]` — Array of 0 to `topN` game records, sorted by:
1. `score` descending (highest first)
2. `completedAt` descending (most recent first, as tiebreaker)

## Behavior Contract

### Preconditions
- `player` is a valid `Player` object (may have `undefined` or empty `gameHistory`)
- `windowSize ≥ 1`
- `topN ≥ 1`

### Postconditions
- Returns only play-mode games (`gameMode === 'play'` or `gameMode` absent)
- Result length = `min(topN, playModeGamesInWindow)`
- Result is sorted by score DESC, then completedAt DESC
- Does not mutate `player.gameHistory`

### Algorithm
1. Filter `player.gameHistory` to play-mode games only
2. Take the last `windowSize` entries (chronological tail)
3. Sort by score descending, ties broken by completedAt descending
4. Return the first `topN` entries

## Call Sites

| Location | Current Call | New Call |
|----------|-------------|---------|
| `MainPage.tsx` L135 | `getRecentHighScores(currentPlayer, 3)` | `getRecentHighScores(currentPlayer)` |

## Test Expectations

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| No history | `gameHistory: undefined` | `[]` |
| Empty history | `gameHistory: []` | `[]` |
| 1 play-mode game | 1 game, score 25 | `[{score: 25}]` |
| 2 play-mode games | scores [20, 35] | `[{score: 35}, {score: 20}]` |
| 10 games, default params | scores [12,30,25,40,18,35,22,45,10,28] | `[{score:45}, {score:40}, {score:35}]` |
| 15 games, default params | most recent 10 have max score 40 | Top 3 from last 10 only |
| Tie-breaking | Two games score 40, different timestamps | More recent first |
| Custom windowSize=5, topN=2 | 10 games | Top 2 from last 5 |
| Improve-mode excluded | Mix of play + improve games | Only play-mode in results |
