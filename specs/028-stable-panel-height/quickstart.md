# Quickstart: Stable Status Panel Height

**Feature**: 028-stable-panel-height  
**Branch**: `028-stable-panel-height`

## What this feature does

Prevents the GameStatus panel from changing height when transitioning between input phase (round/score/timer) and feedback phase (result message). The panel now has a fixed height instead of a minimum height, eliminating layout shifts for elements positioned below it (formula display, answer input, keypad).

## Files changed

| File | Action | What changes |
|------|--------|-------------|
| `GameStatus.module.css` | Modify | Replace `min-height` with `height`; add `overflow: hidden` |
| `GameStatus.test.tsx` | Modify | Add tests verifying panel height stability across phases and modes |

## How to verify

1. **Start a normal game**: Click "Start Game" on the main page.
2. **Observe the panel height**: Note the vertical position of the formula display below the status panel.
3. **Submit a correct answer**: The status panel transitions to green feedback mode. Verify the formula display **does not move** vertically.
4. **Wait for next round**: The panel transitions back to input mode. Verify the formula display **does not move** vertically.
5. **Submit an incorrect answer**: The status panel transitions to red feedback mode with "The answer was X" text. Verify the formula display **does not move** vertically.
6. **Start a practice game**: Return to menu, start an "Improve" game. Verify the panel height is the same as in normal mode (no timer or countdown bar, but same panel height).
7. **Test on mobile viewport**: Resize browser to ≤480px width and repeat steps 2–5. The panel uses a different (smaller) fixed height on mobile, but it should remain constant across all transitions.

## Key design decisions

- **`height` replaces `min-height`**: The current `min-height` values (5rem desktop, 4rem mobile) already match the natural rendered height. Switching to `height` locks the container and prevents growth.
- **`overflow: hidden` safety net**: Prevents content from visually overflowing the panel in extreme edge cases (high zoom, very long translations). Under normal conditions, all content fits within the fixed dimensions.
- **No component logic changes**: The fix is entirely in CSS. No TypeScript, no prop changes, no state changes. The GameStatus component renders identically.
- **No visual changes under normal conditions**: The panel already renders at 5rem/4rem — users will not perceive any difference. The only behavioral change is that the panel can no longer grow.
