# Data Model: Score Display Rework

**Feature**: 006-score-display  
**Date**: 2026-02-16  
**Source**: [spec.md](spec.md), [research.md](research.md)

---

## Entity Changes

### GameRecord (new)

An individual completed game result. Stored within the player's `gameHistory` array.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| score | number | yes | Total points earned in the game session (0–50 range based on current scoring tiers). |
| completedAt | number | yes | Epoch ms timestamp of game completion. |

### Player (modified)

The `Player` interface gains an optional `gameHistory` field. Existing fields are unchanged and retained for backward compatibility.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | 1–20 chars, trimmed. Unique key (case-insensitive). |
| avatarId | string | yes | References an avatar from the current set of 8. |
| lastActive | number | yes | Epoch ms, updated on session start and visibility changes. |
| createdAt | number | yes | Epoch ms, immutable after creation. |
| totalScore | number | yes | Sum of all completed game scores. Default 0. **Retained for backward compatibility.** |
| gamesPlayed | number | yes | Count of completed games. Default 0. **Retained for backward compatibility.** |
| **gameHistory** | **GameRecord[]** | **no** | **NEW. Ordered list of individual game results (oldest first). Absent before v4 migration; initialized to `[]` by `savePlayer()` for new players. Capped at 100 entries.** |

**Optional typing rationale** (from [research.md](research.md#r31)): The field is optional (`gameHistory?: GameRecord[]`) because raw JSON from pre-v4 stores will not have it. After `readStore()` runs migration, the field is always populated. All consumers use helpers or `?? []` to handle the absent case.

**Derived properties** (not stored):
- `recentAverage = getRecentAverage(player, 10)` — arithmetic mean of last 10 game scores, rounded to nearest integer. Returns `null` if `gameHistory` is empty.
- `recentHighScores = getRecentHighScores(player, 5)` — last 5 game records sorted by score descending (ties by most recent `completedAt` first).

### PlayerStore (modified)

| Field | Type | Notes |
|-------|------|-------|
| version | number | Incremented from 3 → 4 to trigger migration. |
| players | Player[] | Max 50, sorted by lastActive desc. |

**Migration (v3 → v4)**: When loading a v3 store, for each player:
- If `gamesPlayed > 0`: set `gameHistory = [{ score: Math.round(totalScore / gamesPlayed), completedAt: lastActive }]`
- If `gamesPlayed === 0`: set `gameHistory = []`
- Set version to 4 and write back.

### Session (unchanged)

No changes to the Session type.

---

## Validation Rules

### GameRecord

- `score` must be a finite number (typically 0–50 based on SCORING_TIERS).
- `completedAt` must be a positive integer (epoch ms).

### Player.gameHistory

- Maximum 100 entries per player (enforced on write in `updatePlayerScore()`).
- Entries are chronologically ordered (oldest first, newest last).
- When appending a new record causes length > 100, the oldest entry (index 0) is discarded.

---

## State Transitions

### Game Completion Flow (score persistence)

```
Game status: 'completed'
  → useEffect fires (MainPage.tsx)
    → updatePlayerScore(session.playerName, gameState.score)
      → Reads store
      → Finds player by name (case-insensitive)
      → Appends GameRecord { score, completedAt: Date.now() }
      → Enforces 100-record cap (slice oldest if needed)
      → Increments totalScore += gameScore
      → Increments gamesPlayed += 1
      → Writes store
```

### Schema Migration Flow (on first load after update)

```
readStore() called
  → JSON.parse(localStorage.getItem(STORAGE_KEY))
  → version === 3 detected
    → For each player:
      → If gamesPlayed > 0: gameHistory = [{ score: avg, completedAt: lastActive }]
      → If gamesPlayed === 0: gameHistory = []
    → version = 4
    → writeStore()
  → Return migrated store
```

### Average Computation Flow

```
PlayerCard renders
  → Calls getRecentAverage(player, 10)
    → history = player.gameHistory ?? []
    → If history.length === 0: return null
    → Take last min(10, history.length) entries
    → Compute arithmetic mean
    → Return Math.round(mean)
  → Display "Avg: N" or "–"
```

---

## Storage Budget

Per-player storage impact of `gameHistory`:

| Item | Size estimate |
|------|---------------|
| Single GameRecord JSON | ~45 bytes (`{"score":35,"completedAt":1739712000000}`) |
| 100 GameRecords (cap) | ~4.5 KB |
| Array overhead + brackets | ~200 bytes |
| **Total per player (max)** | **~5 KB** |
| **Total for 50 players (max)** | **~250 KB** |

This is well within browser localStorage limits (typically 5–10 MB per origin).
