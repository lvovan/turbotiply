# Feature Specification: First-Try Result Indicator

**Feature Branch**: `027-first-try-result`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "On the post-game results screen, the table with the Result column should show a checkmark if the player responded with the correct answer on the first try of the round, or a red cross otherwise. There should not be a checkmark if the player responded correctly on a replayed round. Just like the current implementation, use emojis if possible."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Try Correct Shows Checkmark Emoji (Priority: P1)

A player completes a game and views the post-game results screen. For each round where the player answered correctly on the first attempt (not during a replay), the Result column displays a green checkmark emoji (✅). This gives the player clear, positive feedback about which rounds they nailed immediately.

**Why this priority**: This is the core visual change — distinguishing first-try success from all other outcomes. It delivers the primary value of the feature.

**Independent Test**: Play a game, answer some rounds correctly on the first try. On the results screen, verify that only those rounds display ✅ in the Result column.

**Acceptance Scenarios**:

1. **Given** a completed game with rounds answered correctly on the first try, **When** the player views the results table, **Then** each first-try correct round shows a ✅ emoji in the Result column.
2. **Given** a completed game with rounds answered correctly on the first try, **When** the player views the results table, **Then** the ✅ is accompanied by an accessible label indicating "Correct on first try".

---

### User Story 2 - Incorrect or Replayed Rounds Show Red Cross Emoji (Priority: P1)

A player completes a game where some rounds were answered incorrectly or required a replay. For any round where the player did not answer correctly on the first attempt — including rounds that were eventually corrected during replay — the Result column displays a red cross emoji (❌). This makes it visually obvious which rounds need more practice.

**Why this priority**: Equally critical to the checkmark — the cross is the counterpart that completes the binary distinction. Without it the checkmark has no contrast.

**Independent Test**: Play a game, answer some rounds incorrectly (triggering replay). On the results screen, verify those rounds show ❌ regardless of the replay outcome.

**Acceptance Scenarios**:

1. **Given** a completed game where a round was answered incorrectly on the first try and not replayed, **When** the player views the results table, **Then** that round shows ❌ in the Result column.
2. **Given** a completed game where a round was answered incorrectly on the first try but answered correctly during replay, **When** the player views the results table, **Then** that round still shows ❌ in the Result column (not ✅).
3. **Given** a completed game where a round required multiple replay attempts before being answered correctly, **When** the player views the results table, **Then** that round shows ❌ in the Result column.

---

### User Story 3 - Consistent Emoji Style (Priority: P2)

The result indicators use emoji characters (✅ and ❌) to match the visual style already used elsewhere in the application. The emojis render natively on all supported platforms without requiring custom icon assets.

**Why this priority**: Important for visual consistency, but the feature functions correctly even with alternative symbol styles.

**Independent Test**: Complete a game on different devices/browsers and confirm the Result column uses recognizable emoji glyphs that render consistently.

**Acceptance Scenarios**:

1. **Given** a completed game viewed on any supported device, **When** the player views the results table, **Then** the Result column uses emoji characters (✅ / ❌) rather than plain text symbols or custom images.

---

### Edge Cases

- What happens when a round is answered incorrectly on the first try but the game ends before it is replayed (e.g., the game mode doesn't include replay)? The round shows ❌.
- What happens when every round is answered correctly on the first try (no replays triggered)? All rows show ✅.
- What happens when every round is answered incorrectly on the first try? All rows show ❌, even after successful replays.
- What happens in practice mode or other game modes that may not use replay? The result indicator still reflects first-try correctness — ✅ if correct on first attempt, ❌ otherwise.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a ✅ emoji in the Result column for any round where the player's first answer was correct.
- **FR-002**: The system MUST display a ❌ emoji in the Result column for any round where the player's first answer was incorrect, regardless of whether the round was later answered correctly during replay.
- **FR-003**: The system MUST track whether each round was answered correctly on the first attempt, preserving this information through the replay phase so it is available at game completion.
- **FR-004**: The system MUST provide an accessible text label for each result emoji so that screen readers can convey the meaning (e.g., "Correct on first try" for ✅ and "Incorrect on first try" for ❌).
- **FR-005**: The result indicator MUST apply consistently across all game modes (normal and practice).

### Key Entities

- **Round**: Represents a single multiplication question in a game. Key attributes: the formula, the player's answer, whether the first attempt was correct, elapsed time, and points earned. A round may be replayed if the first attempt was incorrect; the first-try result must be preserved separately from the replay outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-try correct rounds display ✅ in the results table; 0% of replayed-then-correct rounds display ✅.
- **SC-002**: 100% of rounds where the first answer was incorrect display ❌, including those subsequently corrected during replay.
- **SC-003**: All result emojis have accessible labels that convey meaning to screen reader users.
- **SC-004**: The result indicators render correctly on all supported platforms (desktop and mobile browsers) using native emoji rendering.

## Assumptions

- The current results table structure (columns: #, Formula, Answer, Result, Time, Points) is unchanged; only the Result column content is modified.
- Emoji rendering is available on all target platforms. No custom graphics or icon libraries are needed.
- Row coloring behavior (green/orange/red based on points) is not affected by this change.
- The points column continues to show the points earned during the first attempt (null/zero for replayed rounds), which is independent of the Result column indicator.
- Practice mode does not include replay mechanics; result is simply based on whether the answer was correct.
