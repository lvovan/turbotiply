# Data Model: Practice Mode Update

**Feature**: 017-practice-mode-update
**Date**: 2026-02-16

## Entity Changes

### Modified Entity: `ChallengingPair`

**File**: `frontend/src/types/game.ts`

#### Before (current)

```typescript
export interface ChallengingPair {
  factorA: number;       // Smaller factor (a ≤ b)
  factorB: number;       // Larger factor
  difficultyRatio: number; // round.elapsedMs / gameAverageMs
}
```

#### After (updated)

```typescript
export interface ChallengingPair {
  factorA: number;       // Smaller factor (a ≤ b), range 2–12
  factorB: number;       // Larger factor (a ≤ b), range 2–12
  mistakeCount: number;  // Total incorrect answers across analyzed games (≥ 0)
  avgMs: number;         // Mean response time in ms across all occurrences (> 0)
}
```

**Migration notes**: This is a breaking type change. `difficultyRatio` is removed. All consumers must be updated:
- `challengeAnalyzer.ts` — produces this type (primary change)
- `formulaGenerator.ts` — consumes only `factorA`/`factorB` (no code change needed)
- `extractTrickyNumbers` — consumes only `factorA`/`factorB` (no code change needed)
- Tests — all references to `difficultyRatio` must be replaced with `mistakeCount`/`avgMs`

### Unchanged Entities (referenced but not modified)

#### `RoundResult`

```typescript
export interface RoundResult {
  factorA: number;    // Range 2–12
  factorB: number;    // Range 2–12
  isCorrect: boolean;
  elapsedMs: number;  // Response time in milliseconds (> 0)
}
```

Used as input data — rounds from `GameRecord.rounds`.

#### `GameRecord`

```typescript
export interface GameRecord {
  score: number;
  completedAt: number;       // Epoch ms
  rounds?: RoundResult[];    // Absent in legacy (pre-v5) records
  gameMode?: GameMode;       // Absent in legacy records (implicitly 'play')
}
```

The algorithm filters to records where `rounds` exists and has length > 0.

#### `Player`

```typescript
export interface Player {
  name: string;
  avatarId: string;
  lastActive: number;
  createdAt: number;
  totalScore: number;
  gamesPlayed: number;
  gameHistory?: GameRecord[];  // Capped at 100 entries
}
```

The algorithm reads `gameHistory` to find the analysis window.

## Intermediate Data Structures (internal to algorithm, not persisted)

### `PairStats` (conceptual — not a named export)

During multi-game aggregation, the algorithm builds a `Map<string, PairStats>` keyed by `"min,max"` pair key:

| Field | Type | Description |
|-------|------|-------------|
| `factorA` | `number` | Smaller factor |
| `factorB` | `number` | Larger factor |
| `mistakeCount` | `number` | Count of incorrect answers for this pair |
| `totalMs` | `number` | Sum of all `elapsedMs` values for this pair |
| `occurrences` | `number` | Total times this pair appeared (correct + incorrect) |

`avgMs = totalMs / occurrences` is computed at the end for each pair.

## Data Flow

```
Player.gameHistory
  → filter: records with rounds data
  → slice: last 10
  → flatMap: all RoundResult[]
  → group by: unordered pair key (min, max)
  → aggregate: mistakeCount, totalMs, occurrences per pair
  → compute: avgMs = totalMs / occurrences
  → sort: mistakeCount desc, avgMs desc (tiebreaker)
  → if all mistakeCount === 0: sort by avgMs desc only
  → output: ChallengingPair[]
```

## Validation Rules

| Rule | Constraint |
|------|-----------|
| Pair normalization | `factorA ≤ factorB` always (pair `(8,3)` stored as `(3,8)`) |
| Analysis window | At most 10 games, only those with `rounds?.length > 0` |
| Factor range | 2 ≤ factor ≤ 12 (enforced by formula generation) |
| `mistakeCount` | Non-negative integer |
| `avgMs` | Positive number (at least one occurrence exists for each tracked pair) |
| Tricky numbers cap | Max 8 unique factor numbers displayed (existing constraint, unchanged) |

## State Transitions

No new state transitions. The `GameState` machine (`not-started → playing → replay → completed`) is unchanged. The only change is in the pre-game analysis phase (before `START_GAME` is dispatched).
