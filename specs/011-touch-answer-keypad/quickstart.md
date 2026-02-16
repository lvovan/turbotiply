# Quickstart: Touch Answer Keypad

**Feature**: 011-touch-answer-keypad  
**Branch**: `011-touch-answer-keypad`

## What this feature does

Adds a custom in-page numpad for answer input on touch-capable devices. When a touchscreen is detected, the standard text input + Submit button is replaced with a calculator-style grid of digit buttons (0-9), a backspace button (⌫), and a prominent "Go" submit button. Players compose their answer by tapping digits, then tap "Go" to submit. The OS on-screen keyboard never appears. On non-touch devices (desktop with mouse/keyboard only), the existing text input is displayed unchanged. Physical keyboard input (typing digits + Enter) works alongside the numpad on hybrid devices.

## Files changed

| File | Action | What changes |
|------|--------|-------------|
| `AnswerInput.tsx` | Modify | Add `useTouchDetection()` call; conditionally render `TouchNumpad` vs existing text input |
| `AnswerInput.module.css` | No change | Existing styles reused by both modes |
| `TouchNumpad.tsx` | New | Numpad grid component with digit buttons, backspace, Go, answer display |
| `TouchNumpad.module.css` | New | Numpad grid layout, button styles, active/disabled states, responsive sizing |
| `useTouchDetection.ts` | New | Hook returning `boolean` based on `navigator.maxTouchPoints > 0` |
| `MainPage.tsx` | No change | `AnswerInput` props unchanged; touch detection encapsulated internally |
| `AnswerInput.test.tsx` | Modify | Add tests for conditional rendering based on touch detection |
| `TouchNumpad.test.tsx` | New | Numpad interaction tests (digits, backspace, Go, disabled state) + axe-core a11y |
| `useTouchDetection.test.ts` | New | Detection logic tests with mocked `navigator.maxTouchPoints` |

## How to verify

1. **Touch device (phone/tablet)**: Open the app, start a game. The custom numpad should appear below the formula with buttons 1-9, 0, ⌫, and Go. Tap digits to compose your answer, tap Go to submit.
2. **Desktop (no touchscreen)**: Open the app, start a game. The standard text input + Submit button should appear (no numpad visible). Type your answer and press Enter to submit.
3. **Hybrid device (Surface Pro with keyboard)**: The numpad should appear (touchscreen detected). Both tapping numpad buttons and typing on the physical keyboard should work.
4. **Leading zeros**: Tap "0" on an empty answer field — nothing should happen.
5. **Max 3 digits**: Enter "123" then tap another digit — the 4th digit should be ignored.
6. **Backspace**: Enter "72", tap ⌫ — should show "7". Tap ⌫ again — should be empty.
7. **Empty Go**: With no digits entered, tap Go — nothing should happen.
8. **Feedback phase**: After submitting an answer, all numpad buttons should be disabled during the ~1.2s feedback phase.
9. **Screen reader**: Navigate the numpad with VoiceOver/TalkBack — each button should announce its label ("digit 7", "submit answer", "delete last digit").

## Key design decisions

- **Detection via `navigator.maxTouchPoints`**: One-time check, no reactive listeners. Shows numpad on all touch-capable devices including hybrids.
- **`<div>` as answer display**: Non-focusable — impossible to trigger OS keyboard. Styled identically to existing `<input>` for visual consistency.
- **Document-level `keydown` listener**: Enables physical keyboard alongside numpad without a focusable input element.
- **Uniform 3-column CSS Grid**: All buttons equal width for consistent touch targets. "Go" distinguished by accent color, not size.
- **Synchronous `useRef` guard**: Prevents double-tap race condition on "Go" button.
- **AnswerInput props unchanged**: Feature fully encapsulated — MainPage.tsx requires no modifications.
