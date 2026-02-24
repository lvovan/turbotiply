# Data Model: High Scores Medals — Best of Last 10 Games

**Feature**: 026-high-scores-medals
**Date**: 2026-02-24

## Entities

### GameRecord (existing — no changes)

| Field | Type | Description |
|-------|------|-------------|
| score | number | Final game score |
| completedAt | number | Epoch milliseconds when game was completed |
| rounds? | RoundResult[] | Optional per-round details |
| gameMode? | GameMode | `'play'` or `'improve'`; defaults to `'play'` if absent |

### Player (existing — no changes)

| Field | Type | Description |
|-------|------|-------------|
| name | string | Player display name |
| avatarId | string | Avatar identifier |
| gameHistory? | GameRecord[] | Chronological list of completed games (max 100) |
| gamesPlayed | number | Total play-mode games count |
| totalScore | number | Cumulative play-mode score |
| lastActive | number | Epoch ms of last activity |
| createdAt | number | Epoch ms of creation |

### Scoring Window (logical — not persisted)

A derived view, not a stored entity. Computed at read time from `player.gameHistory`.

| Property | Value | Description |
|----------|-------|-------------|
| windowSize | 10 | Number of most recent play-mode games to consider |
| topN | 3 | Number of highest scores to return from the window |
| filter | `gameMode === 'play'` | Only play-mode games enter the window |
| sort | score DESC, completedAt DESC | Primary: highest score first; secondary: most recent first |

### Medal Ranking (logical — not persisted)

The output of the scoring window computation. An array of 0–3 `GameRecord` items.

| Position | Medal | Condition |
|----------|-------|-----------|
| 1st | 🥇 | Highest score in window |
| 2nd | 🥈 | 2nd highest (if ≥ 2 games in window) |
| 3rd | 🥉 | 3rd highest (if ≥ 3 games in window) |

## State Transitions

No state transitions are introduced. The scoring window is a pure, stateless computation over existing persisted data.

## Validation Rules

- `windowSize` must be a positive integer (enforced by call site, not runtime validation)
- `topN` must be a positive integer ≤ `windowSize` (enforced by call site)
- Games with `gameMode === 'improve'` are always excluded
- Games without a `gameMode` field default to `'play'` (backward compatibility with schema v3)

## Schema Impact

**No schema changes required.** The `PlayerStore` version remains at 5. No migration is needed. The feature changes only the read-time computation logic, not the stored data structure.
