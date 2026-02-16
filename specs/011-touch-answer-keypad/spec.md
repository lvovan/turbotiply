# Feature Specification: Touch Answer Keypad

**Feature Branch**: `011-touch-answer-keypad`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "I want to experiment a new way of inputting the numbers on mobile devices with touch interfaces/no physical keyboard. Only when such a keyboardless device is detected, display a custom keyboard-like UI component (part of the web page) that contains touch-optimized buttons with digits 0–9 and a 'Go' submit button, in a numpad-style layout. Ensure the layout of the keyboard-like component is well suited to smartphones and tablets, layout its child buttons elegantly to maximize input comfort and legibility."

## Clarifications

### Session 2026-02-16

- Q: How should the system handle input mode detection — heuristic for touch-only, or show numpad on all touch-capable devices? → A: Show numpad on all touch-capable devices (touchscreen detected), regardless of keyboard presence. Physical keyboard input still works alongside the numpad.
- Q: How should the composed answer be displayed above the numpad — reuse existing answer field or create a new touch-optimized display? → A: Reuse the existing answer field position and styling as a read-only display element (not focusable, no OS keyboard triggered).
- Q: Should the numpad include accessibility support for screen readers? → A: Yes — all numpad buttons must have ARIA labels and be focusable for screen reader compatibility.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Answer via Custom Numpad on Mobile (Priority: P1)

A player opens TurboTiply on their smartphone or tablet — a device with a touchscreen and no physical keyboard. During gameplay, instead of the standard text input that would summon the operating system's on-screen keyboard, a custom in-page numpad appears directly below the formula. This numpad displays large, touch-friendly buttons for digits 0 through 9, arranged in a familiar calculator/phone numpad grid, plus a prominent wide "Go" button. The player taps digit buttons to compose their answer (displayed in the answer field above the numpad), then taps "Go" to submit. After submission, the answer field is cleared and the numpad resets for the next round.

**Why this priority**: This is the core value of the feature — providing a faster, more comfortable touch-based answer input that eliminates the OS keyboard overlay, keeps the game formula visible at all times, and reduces input friction on mobile devices.

**Independent Test**: Can be fully tested by opening the app on a touch device, starting a game, and answering all rounds (both factor and product questions) using only the custom numpad buttons. Delivers immediate value by keeping the game UI fully visible while entering answers.

**Acceptance Scenarios**:

1. **Given** a player is on a touch device without a physical keyboard and a game round is active, **When** the gameplay screen is displayed, **Then** the custom numpad is visible with buttons for digits 0 through 9 and a "Go" button.
2. **Given** the numpad is displayed and the answer field is empty, **When** the player taps digit "7", **Then** "7" appears in the answer field.
3. **Given** the answer field shows "7", **When** the player taps digit "2", **Then** the answer field updates to show "72".
4. **Given** the answer field shows a number, **When** the player taps the "Go" button, **Then** the composed number is submitted as the answer, the answer field is cleared, and the numpad resets for the next round.
5. **Given** the answer field is empty, **When** the player taps "Go", **Then** nothing happens — the submission is ignored.
6. **Given** the round is in the feedback phase (answer already submitted), **When** the player taps any numpad button, **Then** the tap is ignored and no interaction is registered.

---

### User Story 2 - Standard Input Preserved on Desktop (Priority: P2)

A player opens TurboTiply on a desktop computer or laptop with a physical keyboard. The gameplay experience remains unchanged — the standard text input field with the OS numeric keyboard behavior is displayed. The custom numpad is not shown.

**Why this priority**: Ensuring the existing desktop experience is unaffected is critical to avoid regressions for non-touch users. This story validates that the touch detection correctly gates the new component.

**Independent Test**: Can be tested by opening the app on a device with a physical keyboard and verifying the standard text input appears with no trace of the custom numpad.

**Acceptance Scenarios**:

1. **Given** a player is on a device without a touchscreen (desktop with mouse/keyboard only), **When** a game round is active, **Then** the standard text input field is displayed and the custom numpad is not rendered.
2. **Given** a player is on a desktop device without a touchscreen, **When** they type their answer and press Enter, **Then** the answer is submitted normally using the existing flow.

---

### User Story 3 - Numpad Layout Adapts to Screen Size (Priority: P3)

The numpad renders comfortably on both small smartphone screens and larger tablet screens. On a smartphone held in portrait orientation, the buttons are sized large enough to tap accurately without accidental mis-taps. On a tablet, the numpad takes advantage of the wider screen to present buttons in a spacious, balanced grid. The numpad never overflows the screen or requires scrolling.

**Why this priority**: Usability across different device sizes is essential for adoption, but the core numpad functionality (P1) must work first.

**Independent Test**: Can be tested by opening the app on devices of varying screen widths (or using browser responsive mode) and verifying the numpad layout remains usable and visually balanced.

**Acceptance Scenarios**:

1. **Given** a player is on a smartphone in portrait orientation, **When** the numpad is displayed, **Then** all buttons are fully visible without scrolling and each button has a minimum touch target comfortable for finger taps.
2. **Given** a player is on a tablet in landscape orientation, **When** the numpad is displayed, **Then** the buttons are laid out in a spacious grid that fills the available width proportionally without becoming excessively large.
3. **Given** any supported touch device, **When** the numpad is displayed alongside the formula, **Then** both the formula and the numpad are simultaneously visible without scrolling.

---

### User Story 4 - Correcting Input Before Submission (Priority: P2)

A player has typed one or more digits into the answer field using the numpad and realizes they made a mistake. They need a way to delete the last digit(s) before submitting. A backspace/delete button on the numpad allows them to correct their input without clearing the entire answer.

**Why this priority**: Error correction during input is essential for a usable numpad experience. Without it, players would have no way to fix mistakes, making the numpad frustrating to use.

**Independent Test**: Can be tested by tapping digits, then tapping the delete button and verifying the last digit is removed from the answer field.

**Acceptance Scenarios**:

1. **Given** the answer field shows "72", **When** the player taps the delete/backspace button, **Then** the answer field updates to show "7".
2. **Given** the answer field shows "7", **When** the player taps the delete/backspace button, **Then** the answer field is cleared (empty).
3. **Given** the answer field is empty, **When** the player taps the delete/backspace button, **Then** nothing happens.

---

### Edge Cases

- What happens when a player rotates their device mid-round? The numpad layout should adapt to the new orientation without losing the current answer input.
- What happens if a player has typed digits but the round times out before they tap "Go"? The input is discarded and the round proceeds to feedback as normal.
- What if the device has both a touchscreen and a physical keyboard (e.g., a Surface Pro with keyboard attached)? The numpad is shown (touchscreen detected). The player can use either the numpad or the physical keyboard — both work simultaneously.
- What if the player rapidly taps multiple digit buttons? Each digit should be appended in order — no digits should be dropped or duplicated.
- What if the player types a very long number (e.g., more than 3 digits)? The answer field should cap input at 3 digits, since the maximum possible answer is 144 (3 digits). Additional digit taps beyond 3 characters should be ignored.
- What if the player taps "0" as the first digit? Leading zeros should be prevented — tapping "0" on an empty field should have no effect.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect whether the current device has a touchscreen. If a touchscreen is detected, the custom numpad is displayed. Physical keyboard input (typing digits, pressing Enter to submit) MUST continue to work alongside the numpad on devices that have both.
- **FR-002**: On touch-only devices, the system MUST display a custom in-page numpad component with buttons for digits 0 through 9, a "Go" submit button, and a delete/backspace button.
- **FR-003**: The digit buttons MUST be arranged in a standard numpad/calculator grid layout (rows of 3 digits: 1-2-3, 4-5-6, 7-8-9, with 0 on the bottom row).
- **FR-004**: The "Go" button MUST be visually prominent and wider than the digit buttons, filling remaining space in the bottom row of the grid alongside the "0" button and the delete button.
- **FR-005**: Tapping a digit button MUST append that digit to the current answer value displayed in the answer field.
- **FR-006**: The answer field MUST display the digits composed so far, updating in real time as buttons are tapped.
- **FR-007**: Tapping "Go" with one or more digits entered MUST submit the composed number as the player's answer, following the same submission flow as the existing text input.
- **FR-008**: Tapping "Go" with an empty answer field MUST have no effect.
- **FR-009**: After a successful submission, the numpad MUST clear the answer field and be ready for the next round.
- **FR-010**: During the feedback phase (after answer submission, before next round), all numpad buttons MUST be non-interactive.
- **FR-011**: On devices without a touchscreen (desktop with mouse/keyboard only), the system MUST display the existing standard text input and MUST NOT display the custom numpad.
- **FR-012**: The numpad button layout MUST be arranged in a grid that is comfortable to use on smartphone screens (minimum ~320px wide) and scales gracefully to tablet-sized screens.
- **FR-013**: Each numpad button MUST meet a minimum touch target size suitable for finger-based interaction (at least 44×44 points, per mobile accessibility guidelines).
- **FR-014**: The numpad and the formula display MUST both be visible simultaneously without requiring the user to scroll.
- **FR-015**: The numpad layout MUST adapt when the device orientation changes, without losing the player's current answer input.
- **FR-016**: The answer field MUST accept a maximum of 3 digits (the largest valid answer is 144).
- **FR-017**: The numpad MUST prevent leading zeros — tapping "0" when the answer field is empty MUST have no effect.
- **FR-018**: The delete/backspace button MUST remove the last digit from the answer field. If the field is empty, the button MUST have no effect.
- **FR-019**: The numpad MUST NOT summon the operating system's on-screen keyboard at any point. The standard text input field (which triggers the OS keyboard) MUST be hidden when the numpad is displayed.
- **FR-020**: All numpad buttons MUST have appropriate ARIA labels (e.g., "digit 7", "submit answer", "delete last digit") and MUST be focusable, so that screen reader users on touch devices can navigate and operate the numpad.

### Assumptions

- Touch detection relies on standard browser capabilities for detecting whether the device has a touchscreen (e.g., pointer: coarse media query, touch event support). No keyboard-presence heuristic is needed — the numpad is shown whenever touch capability is detected.
- On touch-capable devices, the custom numpad replaces the standard text input — they are not shown simultaneously. However, if a physical keyboard is also present, keyboard input (typing digits + Enter) continues to function alongside the numpad.
- The minimum touch target size of 44×44 points follows Apple's Human Interface Guidelines and Google's Material Design recommendations.
- The numpad layout follows familiar calculator/phone conventions (1-2-3 top row, descending to 7-8-9, with 0 on the bottom) to leverage existing user muscle memory.
- The answer field that displays composed digits reuses the existing answer field's position and styling, rendered as a read-only display element (not a focusable text input) to prevent the OS keyboard from appearing. This keeps the visual layout consistent between touch and non-touch modes.
- All game question types (factor-hidden and product-hidden) are fully supported since the numpad allows composing any number from 2 to 144.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players on touch devices can compose and submit a single-digit answer (2–9) with exactly 2 taps (one digit tap + one "Go" tap) and a multi-digit answer with N+1 taps (N digit taps + one "Go" tap).
- **SC-002**: All 10 digit buttons, the "Go" button, and the delete button are visible and tappable without scrolling on devices with screens 320px wide or larger.
- **SC-003**: 95% of tap interactions register the intended button (no accidental mis-taps due to buttons being too small or too close together), as validated through usability observation.
- **SC-004**: The numpad appears within 1 second of the gameplay screen loading on a touch device.
- **SC-005**: Players on desktop devices see no change in their gameplay experience — the standard text input is displayed identically to the current behavior.
- **SC-006**: The numpad layout adjusts within 1 second of a device orientation change, preserving any in-progress answer input.
- **SC-007**: The game formula, answer field, and full numpad are simultaneously visible without scrolling on screens 568px tall or larger (iPhone SE size and above).
