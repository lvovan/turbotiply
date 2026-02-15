````markdown
# Quickstart: Core Gameplay

**Feature**: 002-core-gameplay
**Branch**: `002-core-gameplay`

## Prerequisites

- Node.js 18+
- Feature 001 (Player Sessions) fully implemented and passing tests
- Working `frontend/` directory with existing components, hooks, and services

## Setup

```bash
cd frontend
npm install   # No new dependencies needed — all on React 19.2 + Vite 7.3 + Vitest 4.0
npm run dev   # Start dev server at localhost:5173
```

No new packages are required. The feature uses only React built-ins (`useReducer`, `useRef`, `useCallback`, `useEffect`, `requestAnimationFrame`, `performance.now()`).

## Implementation Order

Build bottom-up: pure functions first, then hooks, then components, then page integration.

### Layer 1: Types & Constants (no dependencies)

1. **`src/types/game.ts`** — `Formula`, `HiddenPosition`, `Round`, `GameState`, `GameStatus`, `ScoringTier`
   - See [data-model.md](data-model.md) for full type definitions
   - All types are interfaces/type aliases — no runtime code

2. **`src/constants/scoring.ts`** — `SCORING_TIERS`, `DEFAULT_POINTS`, `INCORRECT_PENALTY`, `FEEDBACK_DURATION_MS`, `ROUNDS_PER_GAME`, `calculateScore()`
   - `calculateScore(isCorrect: boolean, elapsedMs: number): number` — pure function
   - See [data-model.md](data-model.md) Scoring Constants table

### Layer 2: Services (pure functions, no React)

3. **`src/services/formulaGenerator.ts`** — `generateFormulas()`, `getAllUnorderedPairs()`
   - See [contracts/formula-generator.md](contracts/formula-generator.md)
   - Test file: `tests/services/formulaGenerator.test.ts`

4. **`src/services/gameEngine.ts`** — `gameReducer()`, `initialGameState`, `getCorrectAnswer()`, `getCurrentRound()`, `GameAction` type
   - See [contracts/game-engine.md](contracts/game-engine.md)
   - Test file: `tests/services/gameEngine.test.ts`

### Layer 3: Hooks (React wrappers)

5. **`src/hooks/useRoundTimer.ts`** — `useRoundTimer()` returning `{ displayRef, start, stop, reset }`
   - See [contracts/react-hooks.md](contracts/react-hooks.md#useRoundTimer)
   - Test file: `tests/hooks/useRoundTimer.test.ts`

6. **`src/hooks/useGame.ts`** — `useGame()` returning `{ gameState, currentRound, correctAnswer, startGame, submitAnswer, nextRound, resetGame }`
   - See [contracts/react-hooks.md](contracts/react-hooks.md#useGame)
   - Test file: `tests/hooks/useGame.test.tsx`

### Layer 4: Components (UI)

7. **`src/components/GamePlay/FormulaDisplay/`** — Renders "A × ? = C" with the hidden placeholder
   - Props: `formula: Formula`
   - Displays two visible values and one `?` or input placeholder
   - Test file: `tests/components/FormulaDisplay.test.tsx`

8. **`src/components/GamePlay/AnswerInput/`** — Numeric input field + submit button
   - Props: `onSubmit: (answer: number) => void`, `disabled: boolean`
   - Accepts digits only (FR-017), strips leading zeros
   - Submit disabled when input is empty
   - Test file: `tests/components/AnswerInput.test.tsx`

9. **`src/components/GamePlay/RoundFeedback/`** — Correct/incorrect feedback overlay
   - Props: `isCorrect: boolean`, `correctAnswer: number`
   - Green + ✓ + "Correct!" or Red + ✗ + "Not quite! The answer was {X}."
   - `aria-live="assertive"` region for screen reader announcement
   - Displays for 1.2s (auto-advances via parent)
   - Test file: `tests/components/RoundFeedback.test.tsx`

10. **`src/components/GamePlay/GameStatus/`** — Round counter + running score + timer
    - Props: `roundNumber: number`, `totalRounds: number`, `score: number`, `timerRef: React.RefObject<HTMLElement>`, `isReplay: boolean`
    - Displays "Round 3 of 10" or "Replay" indicator
    - Test file: `tests/components/GameStatus.test.tsx`

11. **`src/components/GamePlay/ScoreSummary/`** — End-of-game results
    - Props: `rounds: Round[]`, `score: number`, `onPlayAgain: () => void`, `onBackToMenu: () => void`
    - Round-by-round table: formula, answer, correct/incorrect, time, points
    - "Play again" button + "Back to menu" link
    - Test file: `tests/components/ScoreSummary.test.tsx`

### Layer 5: Page Integration

12. **`src/pages/MainPage.tsx`** — Replace stub with full gameplay
    - Orchestrates `useGame()` + `useRoundTimer()`
    - Manages feedback timeout (`setTimeout` → 1.2s → `nextRound()`)
    - Renders appropriate component based on `gameState.status`
    - Test file: `tests/pages/MainPage.test.tsx`

13. **`tests/integration/gameplayFlow.test.tsx`** — End-to-end game flow test
    - Renders full page, plays a complete game, verifies score summary

14. **`tests/a11y/accessibility.test.tsx`** — Add gameplay screen axe-core tests
    - Test game screen, feedback state, and score summary for a11y violations

## Test Commands

```bash
# Run all tests
npm test

# Run only game-related tests
npx vitest run --reporter=verbose tests/services/formulaGenerator.test.ts tests/services/gameEngine.test.ts

# Run with coverage
npx vitest run --coverage

# Type-check
npx tsc --noEmit

# Lint
npx eslint src/
```

## Key Patterns

### State Management

```typescript
// In MainPage.tsx or a GamePlay container:
const { gameState, currentRound, correctAnswer, startGame, submitAnswer, nextRound, resetGame } = useGame();
const { displayRef, start, stop, reset } = useRoundTimer();

// Start game → start first round timer
const handleStartGame = () => {
  startGame();
  start(); // begin timer for round 1
};

// Submit answer → stop timer → record elapsed
const handleSubmit = (answer: number) => {
  const elapsed = stop();
  submitAnswer(answer, elapsed);
  // feedback shows for 1.2s, then:
  setTimeout(() => {
    nextRound();
    reset();
    start(); // begin timer for next round
  }, FEEDBACK_DURATION_MS);
};
```

### Feedback Accessibility

```tsx
{/* Persistent aria-live region — always in DOM */}
<div aria-live="assertive" role="status">
  {gameState.currentPhase === 'feedback' && (
    <RoundFeedback isCorrect={currentRound.isCorrect} correctAnswer={correctAnswer} />
  )}
</div>
```

### Formula Display

```tsx
// FormulaDisplay shows: "3 × ? = 21" or "? × 7 = 21" or "3 × 7 = ?"
<FormulaDisplay formula={currentRound.formula} />
```

## Files Checklist

| File | Type | Tests |
|------|------|-------|
| `src/types/game.ts` | Types | N/A (compile-only) |
| `src/constants/scoring.ts` | Constants + pure fn | `tests/services/gameEngine.test.ts` (scoring cases) |
| `src/services/formulaGenerator.ts` | Service | `tests/services/formulaGenerator.test.ts` |
| `src/services/gameEngine.ts` | Service | `tests/services/gameEngine.test.ts` |
| `src/hooks/useRoundTimer.ts` | Hook | `tests/hooks/useRoundTimer.test.ts` |
| `src/hooks/useGame.ts` | Hook | `tests/hooks/useGame.test.tsx` |
| `src/components/GamePlay/FormulaDisplay/` | Component | `tests/components/FormulaDisplay.test.tsx` |
| `src/components/GamePlay/AnswerInput/` | Component | `tests/components/AnswerInput.test.tsx` |
| `src/components/GamePlay/RoundFeedback/` | Component | `tests/components/RoundFeedback.test.tsx` |
| `src/components/GamePlay/GameStatus/` | Component | `tests/components/GameStatus.test.tsx` |
| `src/components/GamePlay/ScoreSummary/` | Component | `tests/components/ScoreSummary.test.tsx` |
| `src/pages/MainPage.tsx` | Page (modified) | `tests/pages/MainPage.test.tsx` |
| `tests/integration/gameplayFlow.test.tsx` | Integration | — |
| `tests/a11y/accessibility.test.tsx` | A11y (modified) | — |
````
