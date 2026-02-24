# Feature Specification: Stable Status Panel Height

**Feature Branch**: `028-stable-panel-height`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "The in-game status panel—which displays the current state while awaiting user input and shows the result of the round after the player responds—currently changes height depending on the content. This causes layout shifts for the elements positioned below it. The panel must maintain a fixed, constant height at all times to avoid disruptions in the UI layout."

## User Scenarios & Testing *(mandatory)*

### User Story 1 – No Layout Shift During Phase Transitions (Priority: P1)

While playing a game, the player submits an answer and the status panel transitions from showing round/score/timer (input phase) to showing the round result (feedback phase). The elements below the status panel — the formula display, the answer input, and the keypad — remain in exactly the same vertical position throughout this transition. The player experiences no visual "jump" or repositioning of any content below the panel.

**Why this priority**: This is the core problem. Layout shifts during phase transitions disrupt the player's focus and create a jarring experience, especially during rapid multi-round gameplay where the player's eyes and touch targets are fixed on the input area below the panel.

**Independent Test**: Start a game and note the vertical position of the formula display and answer input. Submit an answer and observe that the formula display and answer input do not move vertically when the panel transitions to feedback mode. Repeat for both correct and incorrect answers.

**Acceptance Scenarios**:

1. **Given** a round is in progress (input phase) and the status panel displays round number, score, and timer, **When** the player submits a correct answer and the panel transitions to feedback mode, **Then** the formula display and answer input below the panel remain at the same vertical position — no visible shift occurs.
2. **Given** the status panel is in feedback mode showing "Correct!" or "Not quite!", **When** the feedback period ends and the panel transitions back to input mode for the next round, **Then** the formula display and answer input below the panel remain at the same vertical position.
3. **Given** the player submits an incorrect answer, **When** the panel transitions to feedback mode showing the "Not quite!" message along with the correct answer text, **Then** the panel height does not increase to accommodate the additional text and no elements below the panel shift.

---

### User Story 2 – Consistent Panel Height Across Game Modes (Priority: P2)

The status panel maintains the same fixed height regardless of game mode (normal play vs. practice/improve mode). In practice mode, the score section is replaced with a "Practice" badge and the timer/countdown bar are hidden, but the panel height stays the same as in normal mode. This ensures that switching modes or observing different mode configurations does not cause any layout differences in the gameplay area.

**Why this priority**: While less frequently encountered than per-round transitions, inconsistent panel height between modes would cause the same class of layout disruption. Ensuring uniform height across modes provides a stable, predictable layout throughout the application.

**Independent Test**: Start a normal game and note the panel height. Return to menu and start a practice game. Verify the panel height is identical in both modes. The elements below the panel should be at the same vertical position in both modes.

**Acceptance Scenarios**:

1. **Given** a normal game is in progress (with score and timer visible), **When** the player observes the status panel, **Then** the panel height is the same fixed value as in any other game state.
2. **Given** a practice game is in progress (with "Practice" badge, no score or timer), **When** the player observes the status panel, **Then** the panel height matches the height used during normal play.
3. **Given** a replay round is in progress (with "Replay" badge), **When** the player observes the status panel, **Then** the panel height matches the height used during primary rounds.

---

### Edge Cases

- What happens on very narrow viewports (mobile, ≤480px)? The panel must still maintain a consistent fixed height at its responsive size. The fixed height may differ from desktop (since the responsive breakpoint already adjusts sizing), but it must remain constant across phase transitions at that viewport width.
- What happens when the incorrect-answer feedback includes a long correct answer (e.g., three-digit number)? The panel height must not grow to accommodate the text. Content should fit within the fixed dimensions, wrapping or truncating if necessary.
- What happens when the player uses a very large font size (browser zoom or accessibility settings)? The panel should maintain its fixed height as much as practical. If extreme zoom causes text overflow, the content should remain readable through overflow handling rather than expanding the panel height.
- What happens during the replay phase transition (from playing to replay)? The panel height stays constant; only the content changes (e.g., "Replay" badge appears).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The status panel MUST maintain the same rendered height during the input phase and the feedback phase — transitioning between phases MUST NOT change the panel's outer dimensions.
- **FR-002**: The status panel MUST maintain the same rendered height regardless of game mode (normal, practice/improve, replay) — switching content based on mode MUST NOT change the panel's outer dimensions.
- **FR-003**: The status panel MUST maintain the same rendered height when displaying incorrect-answer feedback (which includes the correct answer text) as when displaying correct-answer feedback (which does not include the correct answer text).
- **FR-004**: Elements positioned below the status panel (formula display, answer input, keypad) MUST NOT shift vertically at any point during gameplay due to panel height changes.
- **FR-005**: On responsive viewports (≤480px), the panel MUST maintain a consistent fixed height at its responsive size — the responsive height may differ from desktop, but it MUST remain constant across all phase and mode transitions at that viewport width.
- **FR-006**: The panel's fixed height MUST be sufficient to contain the tallest content variant (incorrect-answer feedback with correct answer text) without clipping or overflow under normal conditions.
- **FR-007**: The visual appearance and content of the panel MUST NOT be altered by this change — only the sizing behavior is affected. All existing feedback messages, icons, colors, badges, scores, timers, and countdown bars MUST continue to render as they do today.

### Key Entities

- **Status Panel**: The horizontal bar at the top of the gameplay area that alternates between showing game progress (round number, score, timer) during input and showing round results during feedback. This is the element whose height must be stabilized.
- **Gameplay Content Area**: The region below the status panel containing the formula display, answer input field, and numeric keypad. These elements are affected by panel height changes and must remain stable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero vertical position change of elements below the status panel when the panel transitions between input and feedback phases — measured across 10 consecutive rounds of gameplay.
- **SC-002**: The panel's rendered height is identical (within 1 pixel) in input phase and feedback phase, verified for both correct and incorrect answers.
- **SC-003**: The panel's rendered height is identical (within 1 pixel) in normal mode, practice mode, and replay mode.
- **SC-004**: On mobile viewports (≤480px), the panel's rendered height is identical (within 1 pixel) across all phase and mode transitions.
- **SC-005**: All existing visual content (feedback messages, icons, colors, round info, score, timer, countdown bar, badges) continues to display correctly with no clipping under normal conditions.

## Assumptions

- The current panel uses a minimum height but not a fixed height, and the actual rendered height varies based on content (input mode with countdown bar vs. feedback mode with result text).
- The fix involves establishing a fixed height (or equivalent sizing constraint) so that the tallest possible content variant defines the height for all states.
- The existing responsive breakpoint at 480px already adjusts panel sizing; the fixed height will respect this breakpoint with a separate fixed value for mobile.
