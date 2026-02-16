# Data Model: Improve Game Mode

**Feature**: 012-improve-game-mode  
**Date**: 2026-02-16  
**Source**: [spec.md](spec.md), [research.md](research.md)

## Entity Diagram

```
PlayerStore (v5)
└── Player[]
    └── gameHistory: GameRecord[]
        ├── score: number
        ├── completedAt: number
        ├── gameMode?: 'play' | 'improve'     ← NEW
        └── rounds?: RoundResult[]             ← NEW
            ├── factorA: number
            ├── factorB: number
            ├── isCorrect: boolean
            └── elapsedMs: number
```

## Entities

### RoundResult (NEW)

A record of a single round's outcome within a completed game. Captures the initial-attempt data from the primary phase.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `factorA` | `number` | Yes | First multiplication factor (2–12) |
| `factorB` | `number` | Yes | Second multiplication factor (2–12) |
| `isCorrect` | `boolean` | Yes | Whether the player answered correctly on the initial (primary-phase) attempt |
| `elapsedMs` | `number` | Yes | Response time in milliseconds for the initial (primary-phase) attempt |

**Notes**:
- Captures the **initial attempt** data, not replay data. If a round was replayed, `isCorrect` is `false` and `elapsedMs` reflects the time before replay.
- For the challenge analysis algorithm, `isCorrect: false` is equivalent to "this pair was replayed" (since incorrect rounds always enter the replay queue).

### GameRecord (EXTENDED)

Existing entity extended with two optional fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `score` | `number` | Yes | Total points scored (existing) |
| `completedAt` | `number` | Yes | Unix timestamp of game completion (existing) |
| `rounds` | `RoundResult[]` | No | Per-round results from the primary phase. Array of exactly 10 entries for games recorded post-v5. Absent for pre-v5 records. |
| `gameMode` | `'play' \| 'improve'` | No | Which mode this game was played in. Absent for pre-v5 records (implicitly `'play'`). |

**Notes**:
- `rounds` is optional because pre-v5 game records lack this data. Consumers default to `?? []`.
- `gameMode` is optional because pre-v5 records are implicitly `'play'`. Consumers default to `?? 'play'`.
- When `gameMode === 'improve'`, the record MUST be excluded from `updatePlayerScore()`, `getRecentHighScores()`, `getRecentAverage()`, `getGameHistory()` (for progression graph), `totalScore`, and `gamesPlayed` aggregations.

### GameMode (NEW — type alias)

```typescript
type GameMode = 'play' | 'improve';
```

Used by the game engine, hooks, and components to propagate mode context through the game lifecycle.

### ChallengingPair (DERIVED — not persisted)

Computed by the challenge analysis function from the most recent game's `RoundResult[]`.

| Field | Type | Description |
|-------|------|-------------|
| `factorA` | `number` | Smaller factor (normalized: `a ≤ b`) |
| `factorB` | `number` | Larger factor (normalized: `a ≤ b`) |
| `difficultyRatio` | `number` | `elapsedMs / averageMs` — how far above the game average |

**Notes**:
- Only pairs meeting BOTH signals qualify: `isCorrect === false` AND `elapsedMs ≥ 1.5 × gameAverageMs`.
- Ranked by `difficultyRatio` descending (highest = most difficult).

## Relationships

```
Player ──has-many──▶ GameRecord ──has-many──▶ RoundResult
                     │
                     └── gameMode distinguishes Play vs. Improve

GameRecord ──analyzed-by──▶ identifyChallengingPairs() ──produces──▶ ChallengingPair[]
                                                                      │
ChallengingPair[] ──used-by──▶ generateImproveFormulas() ──produces──▶ Formula[]
ChallengingPair[] ──used-by──▶ extractTrickyNumbers()    ──produces──▶ number[]
```

## Validation Rules

| Entity | Rule | Source |
|--------|------|--------|
| `RoundResult.factorA` | 2 ≤ value ≤ 12 | Multiplication table range |
| `RoundResult.factorB` | 2 ≤ value ≤ 12 | Multiplication table range |
| `RoundResult.elapsedMs` | value > 0 | Must be a positive response time |
| `GameRecord.rounds` | Length = 10 when present | 10 primary rounds per game |
| `GameRecord.gameMode` | `'play'` or `'improve'` when present | Two valid modes |
| `Player.gameHistory` | Length ≤ 100 | Existing cap, enforced on write |

## State Transitions

### Game Mode Selection

```
not-started ──[user selects Play]──▶ playing (gameMode='play')
not-started ──[user selects Improve]──▶ playing (gameMode='improve')
```

### Game Completion (score persistence)

```
completed ──[gameMode='play']──▶ updatePlayerScore() + saveRoundResults()
completed ──[gameMode='improve']──▶ saveRoundResults() only (NO score update)
```

### Challenging Pair Analysis

```
GameRecord (most recent with rounds[]) ──▶ identifyChallengingPairs()
  ├── pairs found ──▶ Improve button shown
  └── no pairs ──▶ Improve button hidden + encouraging message
```

## Migration

### v4 → v5

- Bump `CURRENT_VERSION` from 4 to 5.
- Add migration block: `if (parsed.version === 4) { parsed.version = 5; writeStore(parsed); }`
- No data transformation — existing `GameRecord` objects are not modified.
- New records created post-migration include `rounds` and `gameMode` fields.
