# Quickstart: Numeric Keypad Input on Touch Devices

**Feature**: `007-numeric-keypad-input`  
**Date**: 2026-02-16

## Overview

Change the `AnswerInput` component's `<input>` element from `type="number"` to `type="text"` with `inputMode="numeric"`, `pattern="[0-9]*"`, and `enterKeyHint="go"`. This ensures touch devices show a pure 0–9 digit keypad instead of a phone-dialler-style keyboard.

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` | Change input `type`, add `pattern`, add `enterKeyHint`, remove `min` |
| `frontend/tests/components/AnswerInput.test.tsx` | Update `getByRole('spinbutton')` → `getByRole('textbox')` |

## Key Changes

### AnswerInput.tsx — Before

```tsx
<input
  type="number"
  inputMode="numeric"
  min={0}
  // ...
/>
```

### AnswerInput.tsx — After

```tsx
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  enterKeyHint="go"
  // ...
/>
```

### AnswerInput.test.tsx — Role queries

```tsx
// Before
screen.getByRole('spinbutton')

// After
screen.getByRole('textbox')
```

## Verification

1. **Unit tests**: Run `npm test` — all `AnswerInput` tests must pass with the updated role queries.
2. **iOS Safari**: Open on iPhone/iPad, start a game, tap the answer field — verify 0–9 digit keypad appears.
3. **Android Chrome**: Open on Android phone/tablet, start a game, tap the answer field — verify 0–9 digit keypad appears.
4. **Desktop**: Open in Chrome/Firefox/Safari/Edge, verify no spinner controls and digit entry works normally.

## Prerequisites

- Node.js and npm installed
- `cd frontend && npm install`
- `npm run dev` to start dev server
- `npm test` to run tests
