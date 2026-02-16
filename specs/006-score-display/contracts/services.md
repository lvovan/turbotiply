# Service Contracts: Score Display Rework

**Feature**: 006-score-display  
**Date**: 2026-02-16

---

## playerStorage.ts (modified)

### New Type Export

#### `GameRecord`

```typescript
export interface GameRecord {
  score: number;
  completedAt: number;
}
```

Re-exported from `types/player.ts` for convenience.

### New Exports

#### `getRecentAverage(player: Player, count?: number): number | null`

Computes the arithmetic mean of the player's most recent game scores.

**Parameters**:
- `player` — Player object (with optional `gameHistory`)
- `count` — Number of recent games to average (default: 10)

**Returns**: `Math.round(mean)` as an integer, or `null` if `gameHistory` is empty or absent.

**Behavior**:
1. `history = player.gameHistory ?? []`
2. If `history.length === 0`, return `null`
3. Take `history.slice(-count)` (last `count` entries)
4. Compute sum / slice.length
5. Return `Math.round(result)`

#### `getRecentHighScores(player: Player, count?: number): GameRecord[]`

Returns the player's most recent game scores sorted by score descending.

**Parameters**:
- `player` — Player object (with optional `gameHistory`)
- `count` — Number of recent games to retrieve (default: 5)

**Returns**: Array of `GameRecord` sorted by `score` descending. Ties broken by most recent `completedAt` first. Empty array if no history.

**Behavior**:
1. `history = player.gameHistory ?? []`
2. Take `history.slice(-count)` (last `count` chronological entries)
3. Sort by `score` descending; if equal, sort by `completedAt` descending
4. Return sorted array

#### `getGameHistory(player: Player): GameRecord[]`

Returns the player's full game history in chronological order.

**Parameters**:
- `player` — Player object (with optional `gameHistory`)

**Returns**: Copy of `gameHistory` array in chronological order (oldest first). Empty array if no history.

**Behavior**:
1. Return `[...(player.gameHistory ?? [])]` (defensive copy)

### Modified Functions

#### `readStore(): PlayerStore` (internal)

**Changes**:
- After existing v2→v3 migration, checks `store.version === 3`:
  - For each player where `gameHistory` is absent:
    - If `gamesPlayed > 0`: `player.gameHistory = [{ score: Math.round(player.totalScore / player.gamesPlayed), completedAt: player.lastActive }]`
    - If `gamesPlayed === 0`: `player.gameHistory = []`
  - Sets `store.version = 4`
  - Writes store back

#### `updatePlayerScore(name: string, gameScore: number): void`

**Changes** (additions to existing behavior):
- After finding the player, appends `{ score: gameScore, completedAt: Date.now() }` to `player.gameHistory` (initializing to `[]` if absent)
- If `player.gameHistory.length > 100`, discards oldest: `player.gameHistory = player.gameHistory.slice(-100)`
- Existing behavior retained: `player.totalScore += gameScore`, `player.gamesPlayed += 1`

#### `savePlayer(data: Pick<Player, 'name' | 'avatarId'>): SavePlayerResult`

**Changes**:
- When constructing a new player object, includes `gameHistory: []` alongside existing `totalScore: 0` and `gamesPlayed: 0` defaults

#### `getPlayers(): Player[]`

**Changes**: Return type now includes optional `gameHistory` field on each Player.
