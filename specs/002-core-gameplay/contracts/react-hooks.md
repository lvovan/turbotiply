````markdown
# Contract: React Hooks

**Feature**: 002-core-gameplay
**Hooks**: `useGame`, `useRoundTimer`

---

## useGame

**Module**: `frontend/src/hooks/useGame.ts`
**Type**: React custom hook

### Purpose

Wraps `gameReducer` from `gameEngine.ts` via `useReducer`. Provides a clean API for components to interact with game state without knowing about the reducer or action types.

### Dependencies

- `useReducer` from React
- `gameReducer`, `initialGameState`, `getCorrectAnswer`, `getCurrentRound` from `services/gameEngine.ts`
- `generateFormulas` from `services/formulaGenerator.ts`
- `GameState`, `Round`, `Formula` from `types/game.ts`

### Interface

```typescript
interface UseGameReturn {
  /** Full game state. */
  gameState: GameState;

  /** The current round being played, or null if game not in progress. */
  currentRound: Round | null;

  /** The correct answer for the current round, or null if no active round. */
  correctAnswer: number | null;

  /** Start a new game. Generates formulas and dispatches START_GAME. */
  startGame: () => void;

  /** Submit an answer for the current round. */
  submitAnswer: (answer: number, elapsedMs: number) => void;

  /** Advance to the next round after feedback. */
  nextRound: () => void;

  /** Reset the game to not-started state. */
  resetGame: () => void;
}

function useGame(): UseGameReturn;
```

### Behavior

| Method | Action Dispatched | Side Effects |
|--------|-------------------|--------------|
| `startGame()` | `START_GAME` with `generateFormulas()` result | None |
| `submitAnswer(answer, elapsedMs)` | `SUBMIT_ANSWER` | None |
| `nextRound()` | `NEXT_ROUND` | None |
| `resetGame()` | `RESET_GAME` | None |

### Derived Values

- `currentRound`: Computed via `getCurrentRound(gameState)`.
- `correctAnswer`: Computed via `getCorrectAnswer(currentRound.formula)` when `currentRound` is not null.

### Notes

- `startGame()` calls `generateFormulas()` internally — callers do not provide formulas.
- The hook does NOT manage the timer. Timer is `useRoundTimer`'s responsibility.
- The hook does NOT manage the 1.2s feedback delay. Components handle `setTimeout` for `NEXT_ROUND`.
- All methods are stable references (wrapped in `useCallback`).

### Traceability

| Requirement | Coverage |
|-------------|----------|
| FR-001–FR-006 | Delegates to `gameReducer` and `generateFormulas` |
| FR-009–FR-010 | Scoring via `submitAnswer` → `gameReducer` |
| FR-011–FR-015 | Replay management via `gameReducer` |
| FR-020 | `resetGame()` for "Play again", navigation for "Back to menu" |

### Test Contract

```typescript
const { result } = renderHook(() => useGame());

// Initial state
expect(result.current.gameState.status).toBe('not-started');
expect(result.current.currentRound).toBeNull();

// Start game
act(() => result.current.startGame());
expect(result.current.gameState.status).toBe('playing');
expect(result.current.gameState.rounds).toHaveLength(10);
expect(result.current.currentRound).not.toBeNull();

// Submit answer
const correct = result.current.correctAnswer!;
act(() => result.current.submitAnswer(correct, 1500));
expect(result.current.gameState.currentPhase).toBe('feedback');

// Advance
act(() => result.current.nextRound());
expect(result.current.gameState.currentRoundIndex).toBe(1);

// Reset
act(() => result.current.resetGame());
expect(result.current.gameState.status).toBe('not-started');
```

---

## useRoundTimer

**Module**: `frontend/src/hooks/useRoundTimer.ts`
**Type**: React custom hook

### Purpose

Tracks elapsed time for a single game round. Uses `performance.now()` for precise measurement and `requestAnimationFrame` for smooth display updates without triggering React re-renders on every frame.

### Dependencies

- `useRef`, `useCallback`, `useEffect` from React
- `performance.now()` (Web API)
- `requestAnimationFrame` / `cancelAnimationFrame` (Web API)

### Interface

```typescript
interface UseRoundTimerReturn {
  /** Ref to attach to the display element. The timer writes directly to textContent. */
  displayRef: React.RefObject<HTMLElement>;

  /** Start the timer. Records performance.now() as the start time. */
  start: () => void;

  /** Stop the timer and return elapsed milliseconds since start(). */
  stop: () => number;

  /** Reset the timer. Stops rAF loop and clears display. */
  reset: () => void;
}

function useRoundTimer(): UseRoundTimerReturn;
```

### Behavior

| Method | Description |
|--------|-------------|
| `start()` | Records `performance.now()` as start time. Begins rAF loop writing elapsed seconds (e.g., "2.4s") to `displayRef.current.textContent`. |
| `stop()` | Stops the rAF loop. Computes final elapsed time as `performance.now() - startTime`. Returns elapsed milliseconds as a `number`. |
| `reset()` | Cancels rAF loop. Resets start time. Sets display text to "0.0s". |

### Display Format

The timer writes directly to the DOM element referenced by `displayRef`:
- Format: `X.Xs` (one decimal place, e.g., "0.0s", "1.3s", "12.7s")
- Update frequency: Every animation frame (~60fps)
- No React state updates during the rAF loop — zero re-renders

### Cleanup

- `useEffect` cleanup cancels any running `requestAnimationFrame` on unmount.
- `stop()` cancels the rAF loop immediately.

### Traceability

| Requirement | Coverage |
|-------------|----------|
| FR-007 | `start()` at round display, `stop()` at submission; difference = round time |
| FR-008 | Timer visible via `displayRef` attached to DOM element |
| SC-005 | `performance.now()` precision within 100ms of wall-clock time |

### Test Contract

```typescript
// Note: Tests use fake timers and mock performance.now()

const { result } = renderHook(() => useRoundTimer());

// Start timer
const mockNow = vi.spyOn(performance, 'now');
mockNow.mockReturnValue(1000);
act(() => result.current.start());

// Stop after simulated elapsed time
mockNow.mockReturnValue(2500);
let elapsed: number;
act(() => { elapsed = result.current.stop(); });
expect(elapsed!).toBe(1500); // 2500 - 1000

// Reset
act(() => result.current.reset());
// displayRef.current.textContent should be "0.0s"
```
````
