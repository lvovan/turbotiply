# Feature Specification: Round UX Rework

**Feature Branch**: `008-round-ux-rework`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Change the round user experience: (1) Use an animated bar that shrinks from right to left, in addition to the numeric time counter, both having a countdown style. Color will change (from green, to light green, to orange, to red to signify points decrease as time runs down) (2) remove the result panel that is displayed after player input, use visually attractive and meaningful inline banner instead to ensure proper and automatic keyboard/visual keyboard focus at the beginning of each round."

## User Scenarios & Testing

### User Story 1 – Animated Countdown Timer Bar (Priority: P1)

During a game round, the player sees a horizontal progress bar above the answer input area that begins full-width and smoothly shrinks from right to left as time elapses. The bar's color transitions through four distinct stages — green, light green, orange, and red — corresponding to the scoring tiers (5 pts → 3 pts → 2 pts → 1 pt → 0 pts). A numeric countdown displayed alongside the bar shows the remaining time in seconds, counting down from 5 to 0. Together, these elements give the player an immediate, intuitive sense of urgency and how many points they can still earn.

**Why this priority**: The countdown bar is the most visible and impactful change — it transforms the round experience from a passive stopwatch into a dynamic, motivating visual. It directly communicates score opportunity, which is the core game mechanic. This can be developed and tested independently of the feedback banner change.

**Independent Test**: Start a game round and observe the timer area. Verify the bar starts full-width in green, shrinks smoothly left-to-right, transitions through light green → orange → red at the correct thresholds, and the numeric display counts down from 5.0 to 0.0. Submit an answer at different times and confirm the bar color matches the expected scoring tier.

**Acceptance Scenarios**:

1. **Given** a round begins, **When** the formula is displayed, **Then** a horizontal progress bar appears at full width in green, and a numeric countdown shows "5.0s".
2. **Given** the round timer is running, **When** time elapses, **Then** the bar shrinks smoothly from right to left and the numeric countdown decreases in real time toward 0.0.
3. **Given** 2 seconds have elapsed (3.0s remaining), **When** the player looks at the timer, **Then** the bar color has transitioned from green to light green, indicating the 3-point scoring tier.
4. **Given** 3 seconds have elapsed (2.0s remaining), **When** the player looks at the timer, **Then** the bar color has transitioned to orange, indicating the 2-point scoring tier.
5. **Given** 4 seconds have elapsed (1.0s remaining), **When** the player looks at the timer, **Then** the bar color has transitioned to red, indicating the 1-point scoring tier.
6. **Given** 5 seconds have fully elapsed (0.0s remaining), **When** the player has not yet answered, **Then** the bar is fully depleted (zero width), the countdown shows "0.0s", and the bar remains red. The player can still answer but will earn 0 points.
7. **Given** the player submits an answer before the timer runs out, **When** the answer is submitted, **Then** the countdown bar freezes at its current position and color until the next round begins.

---

### User Story 2 – Inline Feedback Banner (Priority: P1)

After the player submits an answer, instead of a separate overlay or panel appearing below the input, a compact inline banner replaces the formula display area. The banner shows whether the answer was correct or incorrect (with the correct answer if wrong), using color and iconography to communicate the result clearly. The banner appears briefly (1.2 seconds) and then automatically transitions to the next round. Critically, the answer input field remains in the DOM and receives focus immediately when the next round starts, ensuring the virtual keyboard stays visible on touch devices.

**Why this priority**: Equal priority with Story 1 because the current separate feedback panel disrupts keyboard focus on touch devices — the core usability problem described in the feature request. Replacing it with an inline banner solves the focus issue and creates a smoother round-to-round flow.

**Independent Test**: Play a round on a touch device (or emulator). Submit an answer and verify: (a) the formula is replaced by a compact banner showing the result, (b) the input field stays visible and is not unmounted, (c) when the next round starts 1.2s later, the input field is focused and the virtual keyboard is visible.

**Acceptance Scenarios**:

1. **Given** the player submits a correct answer, **When** the answer is processed, **Then** the formula display area is replaced by a green-toned inline banner showing a checkmark icon and "Correct!".
2. **Given** the player submits an incorrect answer, **When** the answer is processed, **Then** the formula display area is replaced by a red-toned inline banner showing an "✗" icon, "Not quite!", and the correct answer (e.g., "The answer was 42").
3. **Given** the feedback banner is displayed, **When** 1.2 seconds elapse, **Then** the banner is replaced by the next round's formula and the input field is cleared and focused.
4. **Given** the player is on a touch device, **When** a new round begins after feedback, **Then** the answer input field has focus and the virtual keyboard remains visible without the player needing to tap the field.
5. **Given** the feedback banner is displayed, **Then** the answer input field is visible but disabled (not removed from the DOM), preserving virtual keyboard state.
6. **Given** the player is in replay mode and submits an incorrect answer, **When** the feedback banner appears, **Then** it shows the same incorrect-answer banner with the correct answer displayed.

---

### User Story 3 – Consistent Countdown on Replay Rounds (Priority: P2)

During replay rounds (re-presenting previously failed formulas), the countdown timer bar and inline feedback banner behave identically to primary rounds. The only visual difference is the existing "Replay" badge in the game status area.

**Why this priority**: Replay rounds are a secondary flow. The same timer and feedback components are reused, so this is essentially verifying consistent behavior rather than new functionality.

**Independent Test**: Deliberately answer some questions incorrectly during a game. When replay rounds begin, verify the countdown bar starts fresh at 5.0s/full-width/green, and the inline banner appears after each answer.

**Acceptance Scenarios**:

1. **Given** a replay round begins, **When** the formula is displayed, **Then** the countdown bar starts at full width in green and the countdown shows "5.0s", identical to a primary round.
2. **Given** the player answers a replay round, **When** feedback is shown, **Then** the inline banner appears in the formula area with the same styling as primary round feedback.

---

### Edge Cases

- What happens when the player answers in under 0.1 seconds? The countdown bar should briefly appear full and green, then freeze. The feedback banner shows the result normally.
- What happens when the player takes much longer than 5 seconds (e.g., 30 seconds)? The bar remains at zero width with red color. The numeric countdown shows "0.0s" (does not go negative). The player can still submit and will earn 0 points.
- What happens if the browser tab loses focus mid-round? The timer continues to count based on elapsed wall-clock time. When the player returns, the bar and countdown reflect the actual elapsed time accurately.
- What happens on very narrow viewports (< 360px)? The countdown bar should scale down proportionally. The numeric countdown remains visible at a smaller font size.
- What happens when reduced-motion preferences are enabled? The bar position updates in discrete steps rather than using a smooth animation. Color transitions happen instantly rather than being interpolated. The experience remains fully functional but without animation.

## Requirements

### Functional Requirements

#### Countdown Timer Bar

- **FR-001**: The game status area MUST display a horizontal countdown progress bar that visually represents the remaining time within the 5-second scoring window.
- **FR-002**: The countdown bar MUST start at full width when each round begins and shrink smoothly from right to left as time elapses over a 5-second duration.
- **FR-003**: The countdown bar MUST use four distinct color stages tied to the scoring tiers:
  - Green (0–2 seconds elapsed, 5 points available)
  - Light green (2–3 seconds elapsed, 3 points available)
  - Orange (3–4 seconds elapsed, 2 points available)
  - Red (4–5 seconds elapsed, 1 point available, then 0 points)
- **FR-004**: Color transitions between stages MUST be visually smooth (gradient or brief cross-fade) rather than abrupt jumps, unless the user has enabled reduced-motion preferences.
- **FR-005**: The numeric timer MUST display as a countdown from 5.0 to 0.0 seconds (one decimal place), replacing the current count-up display.
- **FR-006**: The numeric countdown MUST NOT display negative values. Once it reaches 0.0, it MUST remain at 0.0 regardless of additional elapsed time.
- **FR-007**: When the player submits an answer, the countdown bar and numeric timer MUST freeze at their current position and color until the next round begins.
- **FR-008**: The countdown bar MUST reset to full width and green at the start of each new round (including replay rounds).
- **FR-009**: When reduced-motion preferences are enabled (`prefers-reduced-motion: reduce`), the bar MUST update its width and color in discrete steps rather than smooth animation.

#### Inline Feedback Banner

- **FR-010**: After the player submits an answer, the formula display area MUST be replaced by an inline feedback banner (not a separate panel or overlay below the input).
- **FR-011**: The feedback banner for a correct answer MUST display a checkmark icon and the text "Correct!" with a green-toned visual treatment.
- **FR-012**: The feedback banner for an incorrect answer MUST display an "✗" icon, the text "Not quite!", and the correct answer (e.g., "The answer was 42") with a red-toned visual treatment.
- **FR-013**: The feedback banner MUST occupy the same vertical space as the formula display to prevent layout shift that could disrupt the input field position.
- **FR-014**: The feedback banner MUST be announced to screen readers via an appropriate live region.
- **FR-015**: The feedback banner MUST be displayed for 1.2 seconds before automatically transitioning to the next round.

#### Input Focus & Keyboard Persistence

- **FR-016**: The answer input field MUST remain in the DOM (not unmounted) throughout the entire playing and replay phases, including during the feedback phase.
- **FR-017**: During the feedback phase, the answer input field MUST be visually disabled (non-interactive) but still present in the DOM to preserve virtual keyboard state on touch devices.
- **FR-018**: At the start of each new round (after the feedback display period ends), the answer input field MUST be cleared, re-enabled, and programmatically focused.
- **FR-019**: On touch devices, the virtual keyboard MUST remain visible across round transitions without requiring the player to tap the input field again.

#### Removed Elements

- **FR-020**: The existing standalone "RoundFeedback" result panel (the card/overlay displayed below the input after answering) MUST be removed and replaced entirely by the inline feedback banner described in FR-010 through FR-015.

### Key Entities

- **Countdown Timer Bar**: A horizontal progress indicator that shrinks over 5 seconds and changes color through four stages to represent the scoring window. Displayed alongside the numeric countdown in the game status area.
- **Inline Feedback Banner**: A compact result indicator that temporarily replaces the formula display after each answer, showing correctness and the right answer if needed. Occupies the same space as the formula to prevent layout disruption.
- **Scoring Tiers**: The time-based point thresholds (5 pts ≤ 2s, 3 pts ≤ 3s, 2 pts ≤ 4s, 1 pt ≤ 5s, 0 pts > 5s) that map directly to the countdown bar's color stages.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The countdown bar is visually full at round start and reaches zero width within ±100ms of 5 seconds elapsed.
- **SC-002**: The countdown bar shows the correct color for each scoring tier at the tier boundary times (2s, 3s, 4s, 5s).
- **SC-003**: The numeric countdown displays "5.0s" at round start and "0.0s" after 5+ seconds, never showing negative values.
- **SC-004**: The feedback banner appears in the formula area within 100ms of answer submission, with no visible layout shift of the input field.
- **SC-005**: On touch devices, the virtual keyboard remains visible across at least 10 consecutive round transitions without the player tapping the input field.
- **SC-006**: Players with `prefers-reduced-motion: reduce` enabled see a functional countdown bar with no smooth animations.
- **SC-007**: Screen reader users hear the feedback result announced after each answer submission.
- **SC-008**: The round-to-round transition (feedback → next formula) completes in 1.2 seconds ±100ms.

## Assumptions

- **Scoring tiers unchanged**: The existing point thresholds (5 pts ≤ 2s, 3 pts ≤ 3s, 2 pts ≤ 4s, 1 pt ≤ 5s, 0 pts > 5s) and incorrect penalty (−2 pts) remain the same. This feature only changes the visual presentation, not the scoring logic.
- **Feedback duration unchanged**: The 1.2-second feedback display duration remains the same as the current implementation.
- **5-second visual window**: The countdown bar represents exactly 5 seconds (the point at which the score drops to 0). After 5 seconds the bar stops but the player can still answer (earning 0 points for a correct answer or −2 for incorrect).
- **Color values**: The specific green, light green, orange, and red color hex values will be determined during planning to ensure sufficient contrast and CVD-friendliness. The spec defines the color stages conceptually.
- **Same layout footprint**: The inline feedback banner is designed to occupy the same vertical space as the formula display. If the formula display and banner have slightly different intrinsic heights, a fixed container height ensures no shift.
- **Focus management via existing mechanism**: The answer input already uses a ref-based focus approach (added in a prior change). This feature builds on that pattern to maintain keyboard persistence.
- **Replay rounds use the same timer**: Replay rounds share the exact same countdown bar and feedback behavior. No points are scored during replay (existing rule), but the visual timer still runs for consistency and urgency.
