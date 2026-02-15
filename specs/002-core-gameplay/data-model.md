````markdown
# Data Model: Core Gameplay

**Feature**: 002-core-gameplay
**Date**: 2026-02-15

## Entities

### Formula

Represents a single multiplication fact. Defined by an unordered pair of factors and their product.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `factorA` | `number` | Integer, 1–12 | First factor in the formula (displayed first) |
| `factorB` | `number` | Integer, 1–12 | Second factor in the formula (displayed second) |
| `product` | `number` | Integer, A × B | The result of the multiplication |
| `hiddenPosition` | `'A' \| 'B' \| 'C'` | One of three values | Which value is hidden from the player |

**Validation Rules**:
- `factorA` and `factorB` MUST be integers in the range [1, 12].
- `product` MUST equal `factorA * factorB`.
- `hiddenPosition` MUST be exactly one of `'A'`, `'B'`, or `'C'`.
- The hidden value is determined by `hiddenPosition`: `'A'` → `factorA`, `'B'` → `factorB`, `'C'` → `product`.

**Uniqueness**:
- Two formulas are considered the same if they share the same unordered factor pair: `{min(A,B), max(A,B)}`.
- Within a single game, no two primary rounds may share the same underlying formula.
- Total possible unique unordered pairs: 78 (12 × 13 / 2, including pairs where A = B).

### Round

Represents a single question within a game. Contains the formula, the player's response, and scoring data.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `formula` | `Formula` | Valid formula | The multiplication formula for this round |
| `playerAnswer` | `number \| null` | null until answered | The value the player entered |
| `isCorrect` | `boolean \| null` | null until answered | Whether the answer matches the hidden value |
| `elapsedMs` | `number \| null` | ≥ 0, null until answered | Response time in milliseconds |
| `points` | `number \| null` | null until scored | Points awarded (or deducted) for this round |

**Derived Values**:
- `correctAnswer`: Determined by `formula.hiddenPosition` — returns `factorA`, `factorB`, or `product` accordingly.
- `isCorrect`: `playerAnswer === correctAnswer`.
- `points`: Calculated from `isCorrect` and `elapsedMs` using the scoring function (null during replay).

**State Transitions**:
```
[Unanswered] ---(player submits)---> [Answered]
   playerAnswer: null                   playerAnswer: number
   isCorrect: null                      isCorrect: boolean
   elapsedMs: null                      elapsedMs: number
   points: null                         points: number | null (null if replay)
```

### Game

Represents a complete play session consisting of primary rounds and optional replay rounds.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `status` | `GameStatus` | Enum value | Current game phase |
| `rounds` | `Round[]` | Exactly 10 items | The 10 primary rounds |
| `replayQueue` | `number[]` | Indices into `rounds` | Indices of rounds that need to be replayed |
| `currentRoundIndex` | `number` | ≥ 0 | Index into `rounds` (playing) or `replayQueue` (replay) |
| `currentPhase` | `'input' \| 'feedback'` | Sub-state | Whether awaiting input or showing feedback |
| `score` | `number` | Integer (may be negative) | Running total score |

**Game Status (enum)**:
```
'not-started' → Game not yet begun
'playing'     → Primary rounds in progress (1–10)
'replay'      → Replaying incorrectly answered rounds
'completed'   → All rounds (including replays) answered correctly
```

**State Transitions**:
```
[not-started] ---(START_GAME)---> [playing, round 0, input]
[playing, input] ---(SUBMIT_ANSWER)---> [playing, feedback]
[playing, feedback] ---(NEXT_ROUND, more rounds)---> [playing, next round, input]
[playing, feedback] ---(NEXT_ROUND, round 10, has failed)---> [replay, round 0, input]
[playing, feedback] ---(NEXT_ROUND, round 10, all correct)---> [completed]
[replay, input] ---(SUBMIT_ANSWER)---> [replay, feedback]
[replay, feedback] ---(NEXT_ROUND, correct, more in queue)---> [replay, next in queue, input]
[replay, feedback] ---(NEXT_ROUND, incorrect)---> [replay, re-queued, input]
[replay, feedback] ---(NEXT_ROUND, correct, queue empty)---> [completed]
```

**Invariants**:
- `rounds` always has exactly 10 entries.
- `replayQueue` is populated only after all 10 primary rounds are complete.
- During `replay`, incorrectly answered rounds are re-appended to `replayQueue`.
- `score` is only modified during primary rounds, never during replay.
- `currentPhase` toggles between `'input'` and `'feedback'` within each round.

## Scoring Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `SCORING_TIERS` | `[{maxMs: 2000, points: 5}, {maxMs: 3000, points: 3}, {maxMs: 4000, points: 2}, {maxMs: 5000, points: 1}]` | Time-based point tiers for correct answers |
| `DEFAULT_POINTS` | `0` | Points when correct but > 5000ms |
| `INCORRECT_PENALTY` | `-2` | Points deducted for incorrect answers |
| `FEEDBACK_DURATION_MS` | `1200` | Duration of correct/incorrect feedback display |
| `ROUNDS_PER_GAME` | `10` | Number of primary rounds |

## TypeScript Type Definitions

```typescript
// types/game.ts

/** Which value in the formula is hidden from the player. */
export type HiddenPosition = 'A' | 'B' | 'C';

/** A multiplication formula with one value hidden. */
export interface Formula {
  /** First factor (1–12). */
  factorA: number;
  /** Second factor (1–12). */
  factorB: number;
  /** Product (factorA × factorB). */
  product: number;
  /** Which value is hidden: 'A' (factorA), 'B' (factorB), or 'C' (product). */
  hiddenPosition: HiddenPosition;
}

/** Current phase of the game. */
export type GameStatus = 'not-started' | 'playing' | 'replay' | 'completed';

/** A single round within a game. */
export interface Round {
  /** The multiplication formula for this round. */
  formula: Formula;
  /** The player's submitted answer, or null if not yet answered. */
  playerAnswer: number | null;
  /** Whether the answer was correct, or null if not yet answered. */
  isCorrect: boolean | null;
  /** Response time in milliseconds, or null if not yet answered. */
  elapsedMs: number | null;
  /** Points awarded (primary rounds) or null (unanswered or replay). */
  points: number | null;
}

/** The full game state. */
export interface GameState {
  /** Current game phase. */
  status: GameStatus;
  /** The 10 primary rounds. */
  rounds: Round[];
  /** Indices into rounds[] for rounds that need replay. */
  replayQueue: number[];
  /** Current position: index into rounds (playing) or replayQueue (replay). */
  currentRoundIndex: number;
  /** Whether the current round is awaiting input or showing feedback. */
  currentPhase: 'input' | 'feedback';
  /** Running total score. */
  score: number;
}

/** A scoring tier threshold. */
export interface ScoringTier {
  /** Maximum elapsed time in ms (inclusive) for this tier. */
  maxMs: number;
  /** Points awarded if answered correctly within this time. */
  points: number;
}
```

## Relationships

```
Game 1 ──── * Round (exactly 10 primary rounds)
Round 1 ──── 1 Formula
Game.replayQueue ──── * Round (references by index, 0 to 10 items)
```

- A Game contains exactly 10 Rounds.
- Each Round contains exactly one Formula.
- The Game's `replayQueue` references Rounds by their index in the `rounds` array.
- Game state is ephemeral — not persisted to any storage. Lives only in React component state.
- The Game is independent of the Player/Session model from feature 001. The session provides the player's name/avatar/color for display in the Header, but gameplay does not read or write player data.
````
