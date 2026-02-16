# Component Contracts: Touch Answer Keypad

**Feature**: 011-touch-answer-keypad  
**Date**: 2026-02-16

## Overview

This feature has no REST/GraphQL API surface — it is a pure client-side React component change. The "contracts" are the component props interfaces and rendering behaviors that define boundaries between components.

## useTouchDetection Hook Contract

### Signature

```typescript
function useTouchDetection(): boolean
```

### Behavior

- Returns `true` if `navigator.maxTouchPoints > 0` (device has a touchscreen)
- Returns `false` if `navigator.maxTouchPoints === 0` (no touchscreen)
- Evaluated once on mount via lazy `useState` initializer
- Value never changes during component lifecycle

### Test Contract

| Scenario | maxTouchPoints | Expected return |
|----------|---------------|-----------------|
| Phone/tablet (touch only) | > 0 | `true` |
| Desktop (mouse/keyboard only) | 0 | `false` |
| Hybrid (Surface Pro, touch Chromebook) | > 0 | `true` |

## AnswerInput Component Contract (modified)

### Props Interface (UNCHANGED)

```typescript
interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  acceptingInput: boolean;
}
```

### Rendering Contract (MODIFIED)

The component internally calls `useTouchDetection()` and conditionally renders:

**When `isTouchDevice === false` (no touchscreen):**
- Renders: existing `<input>` + `<button>Submit</button>` (current behavior, unchanged)
- All existing keyboard interactions preserved

**When `isTouchDevice === true` (touchscreen detected):**
- Renders: `<TouchNumpad onSubmit={onSubmit} acceptingInput={acceptingInput} />`
- The standard `<input>` is NOT rendered
- Physical keyboard input (digits, Enter, Backspace) still works via document-level keydown listener inside TouchNumpad

### Key Invariant

The `AnswerInputProps` interface is unchanged. `MainPage.tsx` requires no modifications. The touch detection and component switching are entirely encapsulated within `AnswerInput`.

## TouchNumpad Component Contract

### Props Interface

```typescript
interface TouchNumpadProps {
  onSubmit: (answer: number) => void;
  acceptingInput: boolean;
}
```

### Rendering Contract

The component renders two sections:

**1. Answer Display Area**
- Element: `<div>` (non-focusable, no `tabIndex`)
- Styled identically to existing `.input` class (width, padding, font-size, border, border-radius)
- Content: composed digit string, or `"?"` placeholder when empty
- ARIA: `role="status"`, `aria-live="polite"`, `aria-label="Current answer"`

**2. Numpad Grid**
- Element: `<div>` with CSS Grid layout
- Grid: `grid-template-columns: repeat(3, 1fr)`, `gap: 8px`
- Contains 12 buttons arranged in 4 rows:

| Row | Col 1 | Col 2 | Col 3 |
|-----|-------|-------|-------|
| 1   | 1     | 2     | 3     |
| 2   | 4     | 5     | 6     |
| 3   | 7     | 8     | 9     |
| 4   | 0     | ⌫     | Go    |

### Button Contracts

**Digit buttons (0-9):**
- Element: `<button type="button">`
- `aria-label`: `"digit {N}"` (e.g., `"digit 7"`)
- `disabled`: `true` when `acceptingInput === false`
- On tap: appends digit to answer string (subject to max 3 digits, no leading zeros)

**Backspace button (⌫):**
- Element: `<button type="button">`
- `aria-label`: `"delete last digit"`
- `disabled`: `true` when `acceptingInput === false`
- On tap: removes last character from answer string; no-op when empty

**Go button:**
- Element: `<button type="button">`
- `aria-label`: `"submit answer"`
- `disabled`: `true` when `acceptingInput === false` OR answer is empty
- Visual styling: accent background (`#6c63ff`), white text, `font-weight: 700`
- On tap: submits `parseInt(answer, 10)` via `onSubmit`, clears answer. Protected by synchronous `useRef` guard against double-tap.

### Physical Keyboard Interaction Contract

When `acceptingInput === true`, a document-level `keydown` listener is active:

| Key | Action | Same as button |
|-----|--------|----------------|
| `0`-`9` | Append digit to answer | Digit button tap |
| `Backspace` | Remove last digit | ⌫ button tap |
| `Enter` | Submit answer | Go button tap |

The listener is removed when `acceptingInput === false` (feedback phase) and re-added when it becomes `true` again (new round).

### State Reset Contract

When `acceptingInput` transitions from `false` → `true` (new round begins):
- Answer string is cleared to `""`
- `submittedRef` is reset to `false`
- Keyboard listener is re-attached

## MainPage Orchestration Contract (UNCHANGED)

```text
GameStatus
  props: { roundNumber, totalRounds, score, timerRef, barRef, isReplay, currentPhase, isCorrect, correctAnswer, completedRound }

formula-area (div, minHeight: 88px)
  FormulaDisplay
    props: { formula, playerAnswer? }

AnswerInput                                    ← NO CHANGE to this line
  props: { onSubmit, acceptingInput }          ← SAME props as before
  internal: conditionally renders TouchNumpad or text input
```

No changes to `MainPage.tsx`. The feature is fully encapsulated within the `AnswerInput` component tree.
