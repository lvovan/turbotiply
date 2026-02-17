# Feature Specification: Player Name Limit

**Feature Branch**: `022-player-name-limit`  
**Created**: 2025-07-15  
**Status**: Draft  
**Input**: User description: "Limit player name to 10 letters"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Name Length Enforcement During Entry (Priority: P1)

A player creating a new profile types their name into the name field. The system prevents them from entering more than 10 characters, giving clear visual feedback about the remaining character allowance so the player knows the limit without guessing.

**Why this priority**: This is the core feature — without it, no limit is enforced and the rest of the stories are irrelevant.

**Independent Test**: Can be fully tested by opening the welcome screen, typing a name longer than 10 characters, and verifying that the input stops accepting characters at 10. Delivers immediate value by keeping names short and consistent.

**Acceptance Scenarios**:

1. **Given** a player is on the new-player form, **When** they type a name that is exactly 10 characters, **Then** all 10 characters appear in the input field and the form can be submitted.
2. **Given** a player is on the new-player form, **When** they type an 11th character, **Then** the input does not accept it and the displayed value remains 10 characters.
3. **Given** a player is on the new-player form, **When** the input field is empty or contains only whitespace, **Then** the submit button remains disabled.
4. **Given** a player is on the new-player form, **When** they type between 1 and 10 characters, **Then** a character counter shows the current count and maximum (e.g. "3 / 10").

---

### User Story 2 - Paste Handling (Priority: P2)

A player pastes a long name from the clipboard into the name field. The system silently truncates the pasted text to 10 characters so the player sees only the first 10 characters in the field.

**Why this priority**: Pasting bypasses keystroke-level enforcement, so a separate guard is essential for the limit to be reliable.

**Independent Test**: Can be tested by pasting a 25-character string into the name field and verifying the displayed value is exactly the first 10 characters.

**Acceptance Scenarios**:

1. **Given** a player is on the new-player form, **When** they paste a 25-character string into the name field, **Then** the input value contains only the first 10 characters of the pasted text.
2. **Given** a player has 7 characters already in the field, **When** they paste a 10-character string at the end, **Then** only the first 3 characters of the pasted text are appended, giving a total of 10.

---

### User Story 3 - Backward Compatibility with Existing Players (Priority: P3)

A returning player whose name was saved under the previous 20-character limit logs in. Their existing name continues to display correctly everywhere (welcome screen player list, header greeting, score displays). The system does not force them to rename.

**Why this priority**: Existing data must not break, but this is a passive concern — the system simply continues to display stored data as-is.

**Independent Test**: Can be tested by pre-seeding localStorage with a player whose name is 15 characters, then opening the app and verifying the name displays in full on the welcome screen and in-game header.

**Acceptance Scenarios**:

1. **Given** a player with a 15-character name exists in storage, **When** the app loads, **Then** their name displays in full on the player card and in the header greeting.
2. **Given** a player with a 15-character name exists in storage, **When** they start a play session, **Then** the game functions normally with no errors.

---

### Edge Cases

- What happens when a player pastes text containing leading/trailing whitespace that, once trimmed, falls within 10 characters? The trimmed result should be accepted.
- What happens when a player enters emoji or multi-byte Unicode characters? Each Unicode grapheme cluster counts as one character toward the 10-character limit.
- What happens when a player types exactly 10 whitespace characters? The submit button remains disabled because the trimmed length is 0.
- What happens when a player with an existing 15-character name is displayed in the overwrite confirmation dialog? The full 15-character name should appear in the dialog text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The name input field MUST accept a maximum of 10 characters.
- **FR-002**: The system MUST silently truncate any typed or pasted input that would exceed 10 characters to exactly 10 characters.
- **FR-003**: The system MUST display a character counter near the name input showing the current count and maximum (e.g. "3 / 10").
- **FR-004**: The submit button MUST remain disabled when the trimmed name is empty (0 characters).
- **FR-005**: The submit button MUST be enabled when the trimmed name is between 1 and 10 characters inclusive.
- **FR-006**: Existing player names longer than 10 characters MUST continue to display in full across all screens (player cards, header greeting, confirmation dialogs).
- **FR-007**: The system MUST NOT retroactively truncate or modify existing player names stored in local storage.
- **FR-008**: The character counter MUST be accessible to screen readers (announced as the character count changes).

### Key Entities

- **Player**: A named profile stored locally. Key attribute affected: `name` — maximum length reduced from 20 to 10 characters for new entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No player can create a profile with a name longer than 10 characters.
- **SC-002**: Users see a character counter that accurately reflects the current character count, updated in real-time as they type.
- **SC-003**: Existing players with names longer than 10 characters experience no data loss or display issues.
- **SC-004**: All name input interactions (type, paste, delete) complete without perceptible delay.
- **SC-005**: The character counter is perceivable by assistive technologies, meeting accessibility standards.

## Assumptions

- The 10-character limit applies to visible characters (Unicode grapheme clusters), not bytes.
- The limit applies only to the new-player creation form; existing stored names are not modified.
- No migration or data cleanup of existing player names is needed.
- The character counter is a new UI element not currently present in the form.
- Performance impact is negligible since validation is client-side only.
