# Feature Specification: Numeric Keypad Input on Touch Devices

**Feature Branch**: `007-numeric-keypad-input`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Ensure that the numeric keypad is used for input when using a touch device (smartphone, tablet)"

## User Scenarios & Testing

### User Story 1 – Numeric Keypad for Answer Input on Touch Devices (Priority: P1)

A child playing the multiplication game on a smartphone or tablet taps the answer input field during gameplay. The device's on-screen keyboard that appears is a simple numeric keypad (digits 0–9 only), not a full alphabetic keyboard or a phone-dialler-style keypad with symbols like `+`, `*`, and `#`. This lets the child quickly type their answer without hunting for number keys or accidentally entering letters.

**Why this priority**: This is the core and only feature in this specification. The answer input is the primary interaction point during gameplay, and showing the wrong keyboard on touch devices directly hinders usability — especially for young children who may not yet know where numbers are on a full keyboard.

**Independent Test**: Open the app on a 2020+ smartphone or tablet (iOS and Android), start a game round, tap the answer input field, and verify that a numeric-only keypad appears (digits 0–9, backspace, and submit/return — no letters, no phone symbols).

**Acceptance Scenarios**:

1. **Given** a user is playing a game round on a touch device (smartphone or tablet), **When** the answer input field receives focus, **Then** the on-screen keyboard that appears is a numeric keypad showing digits 0–9 only (no letters, no phone-dialler symbols).
2. **Given** the numeric keypad is displayed, **When** the user types digits and taps the submit/return key, **Then** the answer is submitted exactly as it would be with any other input method.
3. **Given** a user is on a desktop or laptop with a physical keyboard, **When** the answer input field receives focus, **Then** no on-screen keyboard appears and the user can type digit characters normally using their physical keyboard.
4. **Given** the numeric keypad is displayed, **When** the user attempts to enter non-numeric characters (e.g., via paste or voice input), **Then** the input rejects non-digit characters and only digits appear in the field.

---

### Edge Cases

- What happens on older devices that do not support modern input-mode hints? The input field should still accept numeric input; the keyboard shown may fall back to the device default, but digit entry and submission must still work correctly.
- What happens when using an external Bluetooth keyboard on a tablet? The external keyboard is used directly; the numeric keypad hint only affects the on-screen keyboard and has no impact on physical keyboard input.
- What happens if the user pastes text containing non-numeric characters? The input must strip all non-digit characters, keeping only valid digits.
- What happens on iPadOS in split-screen or floating keyboard mode? The numeric keypad hint must still apply; the compact keyboard should show a numeric layout.

## Requirements

### Functional Requirements

- **FR-001**: The answer input field MUST present a numeric-only on-screen keypad (digits 0–9) when focused on touch devices (smartphones and tablets), across both iOS and Android platforms.
- **FR-002**: The numeric keypad MUST NOT include phone-dialler symbols (`+`, `*`, `#`, phone icon) — it must be a pure digit keypad.
- **FR-003**: The answer input field MUST continue to accept only digit characters (0–9). Any non-digit characters MUST be silently stripped from the input value.
- **FR-004**: The answer input field MUST remain fully functional on desktop devices with physical keyboards — digit entry, submission via Enter/Return, and all existing keyboard interactions MUST be preserved.
- **FR-005**: The input field MUST NOT display browser-native increment/decrement spinner controls (up/down arrows) on any platform.
- **FR-006**: The submit/return key on the on-screen keypad MUST trigger answer submission, consistent with existing Enter-key behaviour.

## Success Criteria

### Measurable Outcomes

- **SC-001**: On a 2020+ iPhone (iOS Safari), tapping the answer input shows a 0–9 digit keypad without phone symbols.
- **SC-002**: On a 2020+ Android device (Chrome), tapping the answer input shows a 0–9 digit keypad without phone symbols.
- **SC-003**: On desktop browsers (Chrome, Firefox, Safari, Edge), the answer input accepts digit entry via physical keyboard with no change in behaviour.
- **SC-004**: No browser-native spinner controls (up/down arrows) are visible on the answer input on any platform.
- **SC-005**: Non-digit input (paste, voice) is rejected — only digits 0–9 appear in the field.

## Assumptions

- **Target devices**: "Touch device" refers to smartphones and tablets running iOS 14+ or Android 10+, using their default browsers (Safari on iOS, Chrome on Android).
- **Single input field in scope**: The only numeric input in the app is the answer input during gameplay. No other fields require numeric keypad treatment.
- **Existing input filtering**: The app already strips non-digit characters from the answer input. This feature focuses on ensuring the correct on-screen keyboard appears at the OS level.
- **No behavioural change on desktop**: This feature exclusively affects on-screen keyboard presentation on touch devices. Desktop keyboard interaction is unchanged.
