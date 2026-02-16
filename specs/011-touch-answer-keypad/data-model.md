# Data Model: Touch Answer Keypad

**Feature**: 011-touch-answer-keypad  
**Date**: 2026-02-16

## Overview

This feature makes no changes to persisted data or the game state reducer. All changes are to the view layer: a new component (`TouchNumpad`), a new hook (`useTouchDetection`), and conditional rendering within the existing `AnswerInput` component. The existing `GameState`, `Round`, and `Formula` types remain unchanged.

## Existing Entities (unchanged)

### GameState

| Field | Type | Description |
|-------|------|-------------|
| `status` | `'not-started' \| 'playing' \| 'replay' \| 'completed'` | Top-level game phase |
| `currentPhase` | `'input' \| 'feedback'` | Sub-phase within a round |
| `currentRoundIndex` | `number` | 0-based index into rounds or replayQueue |
| `rounds` | `Round[]` | All 10 primary rounds |
| `replayQueue` | `number[]` | Indices of failed rounds to replay |
| `score` | `number` | Running total score |

### Round

| Field | Type | Description |
|-------|------|-------------|
| `formula` | `Formula` | The multiplication formula for this round |
| `playerAnswer` | `number \| null` | Player's submitted answer (null until answered) |
| `isCorrect` | `boolean \| null` | Whether answer was correct (null until answered) |
| `elapsedMs` | `number \| null` | Time taken to answer |
| `points` | `number \| null` | Points awarded/deducted |

## New Component State (internal, not persisted)

### TouchNumpad Internal State

| State | Type | Description |
|-------|------|-------------|
| `answer` | `string` | Composed digit string (e.g., `""`, `"7"`, `"72"`, `"144"`) |
| `submittedRef` | `React.MutableRefObject<boolean>` | Synchronous double-tap guard |

**Validation Rules**:
- `answer.length` MUST NOT exceed 3 characters (max valid answer is 144)
- `answer` MUST NOT start with `"0"` (no leading zeros)
- `answer` MUST contain only digit characters `[0-9]`

**State Transitions**:

```text
Start of round (acceptingInput → true):
  answer = ""
  submittedRef.current = false

Digit tap (0-9) or physical key (0-9):
  if answer.length < 3 AND (answer !== "" OR digit !== "0"):
    answer = answer + digit

Backspace tap or physical Backspace key:
  answer = answer.slice(0, -1)

"Go" tap or physical Enter key:
  if answer.length > 0 AND !submittedRef.current:
    submittedRef.current = true
    onSubmit(parseInt(answer, 10))
    answer = ""

Feedback phase (acceptingInput → false):
  All input ignored (buttons disabled, keyboard listener removed)
```

### useTouchDetection Hook State

| State | Type | Description |
|-------|------|-------------|
| `isTouchDevice` | `boolean` | `true` if `navigator.maxTouchPoints > 0` |

This is a one-time check computed on mount. It does not change during the component lifecycle.

## Existing Props Interfaces (unchanged)

### AnswerInputProps

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `onSubmit` | `(answer: number) => void` | Yes | Callback when answer is submitted |
| `acceptingInput` | `boolean` | Yes | Whether the round is in the input phase |

The `AnswerInput` component's external props interface is **unchanged**. The conditional rendering (text input vs. numpad) happens internally based on `useTouchDetection()`. This means `MainPage.tsx` requires **no changes**.

## New Props Interface

### TouchNumpadProps

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `onSubmit` | `(answer: number) => void` | Yes | Callback when answer is submitted via "Go" |
| `acceptingInput` | `boolean` | Yes | Whether the round is in the input phase |
