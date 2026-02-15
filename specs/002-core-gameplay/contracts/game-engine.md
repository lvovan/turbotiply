````markdown
# Contract: Game Engine

**Module**: `frontend/src/services/gameEngine.ts`
**Type**: Pure reducer function (no side effects, no React dependency)
**Feature**: 002-core-gameplay

## Purpose

Implements the game state machine as a pure reducer function. Manages transitions between game phases (not-started → playing → replay → completed), processes answer submissions, manages the replay queue, and delegates scoring to the scoring function.

## Dependencies

- `GameState`, `Round`, `Formula`, `GameStatus` from `types/game.ts`
- `ScoringTier` from `types/game.ts`
- `calculateScore` from `constants/scoring.ts`
- `generateFormulas` from `services/formulaGenerator.ts`

## Exports

### Action Types

```typescript
type GameAction =
  | { type: 'START_GAME'; formulas: Formula[] }
  | { type: 'SUBMIT_ANSWER'; answer: number; elapsedMs: number }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };
```

| Action | Current Status | Description |
|--------|---------------|-------------|
| `START_GAME` | `not-started` | Initializes game with 10 formulas. Transitions to `playing`. |
| `SUBMIT_ANSWER` | `playing` or `replay` | Records answer, evaluates correctness, calculates score (playing only). Transitions `currentPhase` from `input` to `feedback`. |
| `NEXT_ROUND` | `playing` or `replay` (when `currentPhase === 'feedback'`) | Advances to next round or transitions game status. |
| `RESET_GAME` | any | Returns to `initialGameState`. |

### `gameReducer(state: GameState, action: GameAction): GameState`

Pure reducer function. Returns a new `GameState` for every dispatched action.

**Precondition**: `action` must be valid for the current `state.status` and `state.currentPhase`. Invalid actions return the current state unchanged (no-op, no throw).

**State Machine**:

```
                    START_GAME
    [not-started] ──────────────> [playing, round 0, input]
                                       │
                                  SUBMIT_ANSWER
                                       │
                                       ▼
                                [playing, round N, feedback]
                                       │
                                   NEXT_ROUND
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                    N < 9 (more)              N = 9 (last)
                          │                         │
                          ▼                    has failures?
                [playing, N+1, input]          │         │
                                             Yes        No
                                               │         │
                                               ▼         ▼
                                   [replay, 0, input] [completed]
                                          │
                                     SUBMIT_ANSWER
                                          │
                                          ▼
                                   [replay, N, feedback]
                                          │
                                      NEXT_ROUND
                                          │
                              ┌───────────┴──────────┐
                              │                      │
                         more in queue          queue empty
                              │                      │
                              ▼                      ▼
                    [replay, next, input]       [completed]
                    (if wrong: re-queued)

    RESET_GAME from any state ──────> [not-started]
```

### `initialGameState: GameState`

The starting state, exported as a constant:

```typescript
const initialGameState: GameState = {
  status: 'not-started',
  rounds: [],
  replayQueue: [],
  currentRoundIndex: 0,
  currentPhase: 'input',
  score: 0,
};
```

### `getCorrectAnswer(formula: Formula): number`

Returns the hidden value from a formula based on `hiddenPosition`.

| `hiddenPosition` | Returns |
|-------------------|---------|
| `'A'` | `formula.factorA` |
| `'B'` | `formula.factorB` |
| `'C'` | `formula.product` |

**Exported for**: Component display logic and testing.

### `getCurrentRound(state: GameState): Round | null`

Returns the current round being played, or `null` if the game is not in progress.

- During `playing`: `state.rounds[state.currentRoundIndex]`
- During `replay`: `state.rounds[state.replayQueue[state.currentRoundIndex]]`
- Otherwise: `null`

## Transition Details

### START_GAME

**Input**: `{ type: 'START_GAME'; formulas: Formula[] }`
**Guard**: `state.status === 'not-started'`

Creates 10 `Round` objects from the provided formulas, each with `playerAnswer: null`, `isCorrect: null`, `elapsedMs: null`, `points: null`.

**Result**:
- `status: 'playing'`
- `rounds`: 10 initialized rounds
- `currentRoundIndex: 0`
- `currentPhase: 'input'`
- `score: 0`
- `replayQueue: []`

### SUBMIT_ANSWER

**Input**: `{ type: 'SUBMIT_ANSWER'; answer: number; elapsedMs: number }`
**Guard**: `state.currentPhase === 'input'` AND `status` is `'playing'` or `'replay'`

1. Determine the current round (using `currentRoundIndex` and `replayQueue` if in replay).
2. Evaluate: `isCorrect = (answer === getCorrectAnswer(formula))`.
3. If `status === 'playing'`: calculate `points = calculateScore(isCorrect, elapsedMs)` and add to `score`.
4. If `status === 'replay'`: set `points = null` (no scoring). If incorrect, re-append round index to `replayQueue`.
5. Update the round: `playerAnswer`, `isCorrect`, `elapsedMs`, `points`.
6. Set `currentPhase: 'feedback'`.

### NEXT_ROUND

**Input**: `{ type: 'NEXT_ROUND' }`
**Guard**: `state.currentPhase === 'feedback'`

During `playing`:
- If `currentRoundIndex < 9`: advance to next round (`currentRoundIndex + 1`, `currentPhase: 'input'`).
- If `currentRoundIndex === 9`:
  - Build `replayQueue` from indices of rounds where `isCorrect === false`.
  - If `replayQueue` is empty: transition to `completed`.
  - If `replayQueue` has entries: transition to `replay`, `currentRoundIndex: 0`, `currentPhase: 'input'`.

During `replay`:
- If answer was correct AND more items remain in queue: `currentRoundIndex + 1`, `currentPhase: 'input'`.
- If answer was incorrect: round index re-appended to queue (done during SUBMIT_ANSWER), advance to next in queue.
- If queue is fully exhausted (all answered correctly): transition to `completed`.

### RESET_GAME

**Input**: `{ type: 'RESET_GAME' }`
**Guard**: None — valid from any state.

Returns `initialGameState`.

## Traceability

| Requirement | Coverage |
|-------------|----------|
| FR-001 | 10 primary rounds enforced |
| FR-005 | Answer evaluation in SUBMIT_ANSWER |
| FR-007 | elapsedMs recorded per round |
| FR-009 | `calculateScore` applied during `playing` |
| FR-010 | Incorrect penalty via `calculateScore` during `playing` |
| FR-011 | Replay queue built from incorrect rounds |
| FR-012 | Replay uses same formula/hiddenPosition (immutable Round reference) |
| FR-013 | No scoring during `replay` phase |
| FR-014 | Incorrect replays re-queued |
| FR-015 | Game ends only when all replays correct |

## Test Contract

```typescript
// Start → 10 rounds initialized
let state = gameReducer(initialGameState, {
  type: 'START_GAME',
  formulas: mockFormulas,
});
expect(state.status).toBe('playing');
expect(state.rounds).toHaveLength(10);
expect(state.currentRoundIndex).toBe(0);

// Submit correct answer → feedback + score update
state = gameReducer(state, {
  type: 'SUBMIT_ANSWER',
  answer: correctAnswer,
  elapsedMs: 1500,
});
expect(state.currentPhase).toBe('feedback');
expect(state.rounds[0].isCorrect).toBe(true);
expect(state.rounds[0].points).toBe(5); // ≤2s
expect(state.score).toBe(5);

// Next round → advance
state = gameReducer(state, { type: 'NEXT_ROUND' });
expect(state.currentRoundIndex).toBe(1);
expect(state.currentPhase).toBe('input');

// Submit incorrect → penalty
state = gameReducer(state, {
  type: 'SUBMIT_ANSWER',
  answer: wrongAnswer,
  elapsedMs: 800,
});
expect(state.rounds[1].isCorrect).toBe(false);
expect(state.rounds[1].points).toBe(-2);
expect(state.score).toBe(3); // 5 + (-2)

// After round 10 with failures → replay phase
// ...advance through remaining rounds...
expect(stateAfterRound10.status).toBe('replay');
expect(stateAfterRound10.replayQueue).toContain(1);

// Replay: no scoring
const replayState = gameReducer(replayStartState, {
  type: 'SUBMIT_ANSWER',
  answer: correctAnswer,
  elapsedMs: 2000,
});
expect(replayState.rounds[1].points).toBeNull();
expect(replayState.score).toBe(3); // unchanged

// Reset → back to initial
state = gameReducer(state, { type: 'RESET_GAME' });
expect(state).toEqual(initialGameState);
```
````
