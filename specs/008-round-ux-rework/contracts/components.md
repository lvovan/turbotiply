# Component Contracts: Round UX Rework

**Feature**: 008-round-ux-rework  
**Date**: 2026-02-16

This feature has no REST/GraphQL API — it's a pure client-side React SPA. These contracts define the component interfaces (props) and hook signatures that form the internal API surface.

---

## New Components

### CountdownBar

**Location**: `frontend/src/components/GamePlay/CountdownBar/CountdownBar.tsx`

```typescript
interface CountdownBarProps {
  /** Ref attached to the bar element — useRoundTimer writes width + backgroundColor directly */
  barRef: React.RefObject<HTMLDivElement | null>;
}
```

**Rendering contract**:
- Renders a container `<div>` with a child `<div ref={barRef}>` that represents the fill.
- The fill bar starts at `width: 100%` with `background-color: #0e8a1e` (green).
- The `useRoundTimer` hook drives the fill bar's `style.width` and `style.backgroundColor` via the ref.
- CSS applies `transition: background-color 200ms ease` (disabled under `prefers-reduced-motion`).
- The container has a fixed height, rounded corners, and a subtle track background.

**Accessibility contract**:
- `role="progressbar"` on the container.
- `aria-valuemin="0"`, `aria-valuemax="5"` (seconds).
- `aria-valuenow` and `aria-valuetext` are updated by `useRoundTimer` alongside the DOM writes.
- Decorative (supplementary to the numeric countdown — the numeric countdown is the primary accessible indicator).

---

### InlineFeedback

**Location**: `frontend/src/components/GamePlay/InlineFeedback/InlineFeedback.tsx`

```typescript
interface InlineFeedbackProps {
  /** Whether the player's answer was correct */
  isCorrect: boolean;
  /** The correct answer to display when incorrect */
  correctAnswer: number;
}
```

**Rendering contract**:
- Same interface as the existing `RoundFeedbackProps` — drop-in replacement at the props level.
- Renders within the formula area's fixed-height container (not as a separate panel).
- Correct: green-toned background, checkmark icon `✓`, text "Correct!".
- Incorrect: red-toned background, cross icon `✗`, text "Not quite!", sub-text "The answer was {correctAnswer}".
- Uses `role="status"` and `aria-live="assertive"` for screen reader announcement.
- Applies a subtle `fadeIn` animation (respects `prefers-reduced-motion`).

---

## Modified Components

### GameStatus (modified)

**Location**: `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`

```typescript
interface GameStatusProps {
  roundNumber: number;
  totalRounds: number;
  score: number;
  timerRef: React.RefObject<HTMLElement | null>;   // existing — now displays countdown
  barRef: React.RefObject<HTMLDivElement | null>;   // NEW — passed to CountdownBar
  isReplay: boolean;
}
```

**Changes**:
- Accepts new `barRef` prop to pass down to `CountdownBar`.
- Renders `CountdownBar` below the status info row (round/score/timer).
- Timer `<span>` initial text changes from `"0.0s"` to `"5.0s"`.

---

### FormulaDisplay (unchanged interface)

The component itself is unchanged. The **parent** (`MainPage`) wraps it in a fixed-height container and conditionally swaps it with `InlineFeedback`.

---

### AnswerInput (unchanged interface)

No changes. Already maintains DOM presence and ref-based focus via the `disabled` prop pattern.

---

## Modified Hook

### useRoundTimer (extended)

**Location**: `frontend/src/hooks/useRoundTimer.ts`

```typescript
export interface UseRoundTimerReturn {
  displayRef: React.RefObject<HTMLElement | null>;    // existing
  barRef: React.RefObject<HTMLDivElement | null>;     // NEW
  start: () => void;    // existing — resets bar to full/green + countdown to 5.0s
  stop: () => number;   // existing — freezes bar + countdown
  reset: () => void;    // existing — resets bar to full/green + countdown to 5.0s
}

// Optional: accepts reduced motion flag
export function useRoundTimer(reducedMotion?: boolean): UseRoundTimerReturn;
```

**Behavior changes**:
- `displayRef` now shows countdown: `"5.0s"` → `"0.0s"` (clamped, never negative).
- `barRef` receives `style.width` (100% → 0%) and `style.backgroundColor` (tier colors).
- When `reducedMotion` is true, updates happen at 500ms intervals (10 discrete steps).
- `reset()` sets display to `"5.0s"` and bar to `width: 100%`, `backgroundColor: green`.

---

## Removed Components

### RoundFeedback (removed)

**Location**: `frontend/src/components/GamePlay/RoundFeedback/` — entire directory deleted.

Replaced by `InlineFeedback`. All test references updated.

---

## MainPage Orchestration Changes

```typescript
// Formula area — fixed-height container for layout stability
<div className={styles.formulaArea}>
  {gameState.currentPhase === 'feedback' && currentRound?.isCorrect !== null ? (
    <InlineFeedback isCorrect={currentRound.isCorrect} correctAnswer={correctAnswer} />
  ) : (
    <FormulaDisplay formula={currentRound.formula} />
  )}
</div>

// Answer input — always mounted during playing/replay (existing behavior)
<AnswerInput onSubmit={handleSubmit} disabled={gameState.currentPhase !== 'input'} />

// RoundFeedback section REMOVED — no longer rendered separately
```
