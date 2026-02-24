# Data Model: First-Try Result Indicator

**Feature**: 027-first-try-result  
**Date**: 2026-02-24

## Entity Changes

### Round (modified)

**File**: `frontend/src/types/game.ts`

| Field | Type | Description | Change |
|-------|------|-------------|--------|
| formula | `Formula` | The multiplication formula for this round | Unchanged |
| playerAnswer | `number \| null` | The player's submitted answer (overwritten during replay) | Unchanged |
| isCorrect | `boolean \| null` | Whether the current/last answer was correct (overwritten during replay) | Unchanged |
| elapsedMs | `number \| null` | Response time in ms (overwritten during replay) | Unchanged |
| points | `number \| null` | Points earned during primary phase; `null` during replay | Unchanged |
| **firstTryCorrect** | **`boolean \| null`** | **Whether the player's first answer (during primary playing phase) was correct. Set once when `status === 'playing'`; never overwritten during replay. `null` while unanswered.** | **NEW** |

### State Transitions

```
Round lifecycle:

  [Initialized]          firstTryCorrect: null
       │
       ▼
  [Primary Answer]       firstTryCorrect: true/false  (set from isCorrect)
       │
       ├─ correct ──────► [Final]  firstTryCorrect: true  (no replay)
       │
       └─ incorrect ────► [Replay Phase]
                               │
                               ▼
                          [Replay Answer]   firstTryCorrect: false (PRESERVED)
                               │                isCorrect: true/false (OVERWRITTEN)
                               │
                               ├─ correct ──► [Final]  firstTryCorrect: false
                               │
                               └─ incorrect ─► [Re-queued for replay]
```

### Key Invariants

1. `firstTryCorrect` is set exactly once per round, during the `'playing'` status phase.
2. `firstTryCorrect` is never modified during the `'replay'` status phase.
3. At game completion (`status: 'completed'`), every round has `firstTryCorrect !== null`.
4. If `firstTryCorrect === true`, the round was never replayed (no replay needed).
5. If `firstTryCorrect === false`, the round was replayed at least once; `isCorrect` reflects the final replay outcome.

### Unchanged Entities

The following types are **not modified**:

- **GameState** — no new fields needed; `firstTryCorrect` lives on `Round`
- **RoundResult** (persistence) — `firstTryCorrect` is not persisted; only needed for live session display
- **GameRecord** (persistence) — no change
- **Player** — no change
- **ScoreSummaryProps** — already receives `rounds: Round[]` which will include the new field
