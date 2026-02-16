# Feature Specification: Remove Profile Colors

**Feature Branch**: `004-remove-profile-colors`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Entirely remove color choices from profiles: only use avatars (emojis)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Player Without Color Selection (Priority: P1)

A child opens TurboTiply and creates a new player profile. They enter their name and choose an avatar emoji. There is no color picker shown — the profile creation form only asks for a name and avatar. Once submitted, the new profile appears in the player list identified by the avatar emoji and name.

**Why this priority**: This is the core change — removing the color picker from profile creation simplifies the onboarding experience and is the primary user-facing modification.

**Independent Test**: Can be fully tested by creating a new player profile and verifying the color picker is absent and the profile is saved with only name and avatar.

**Acceptance Scenarios**:

1. **Given** a user is on the new player form, **When** the form loads, **Then** no color picker or color selection UI is displayed
2. **Given** a user has entered a valid name and selected an avatar, **When** they submit the form, **Then** the player profile is created with only name and avatar (no color stored)
3. **Given** a user has created a profile without color, **When** they view the player list, **Then** their profile shows the avatar emoji and name without any color indicator

---

### User Story 2 - Existing Profiles Migrate Gracefully (Priority: P2)

A returning user who previously created profiles with color selections opens TurboTiply. Their existing profiles still load correctly — the avatar and name display as expected. The previously stored color data is silently discarded during migration without any user action required.

**Why this priority**: Data migration is critical to ensure existing users are not disrupted. Without it, stored profiles could cause errors or display incorrectly.

**Independent Test**: Can be tested by loading a stored player list that contains color data and verifying profiles display correctly with avatars only, no errors occur, and color data is removed.

**Acceptance Scenarios**:

1. **Given** a user has existing profiles with color data stored, **When** the application loads, **Then** all profiles display correctly using only avatar and name
2. **Given** a user has existing profiles with color data, **When** the migration runs, **Then** the color data is removed from storage without user intervention
3. **Given** a user had a profile with a previously-removed color, **When** the application loads, **Then** the profile still loads correctly (migration handles all legacy color references)

---

### User Story 3 - Player Card Display Without Color (Priority: P3)

A user views the player list on the home screen. Each player card shows the avatar emoji, player name, and average score. There is no color dot or color-based styling on the card. The card remains visually distinct through the avatar emoji alone.

**Why this priority**: The player card is the main visual representation of a profile. It must be updated to remove color indicators and remain visually clear.

**Independent Test**: Can be tested by viewing the player list and verifying no color dot appears, and each player is visually identifiable by their avatar emoji.

**Acceptance Scenarios**:

1. **Given** a player list with multiple players, **When** the list is displayed, **Then** each card shows avatar emoji, name, and score — but no color dot or color-based styling
2. **Given** a player card is rendered, **When** a user looks at the card, **Then** the avatar emoji is the primary visual identifier for the player

---

### User Story 4 - Active Session Without Color (Priority: P4)

A user selects a player and starts a game session. The session carries only the player name and avatar — no color information. During gameplay, any UI elements that previously used the player's chosen color now rely on the system's default styling.

**Why this priority**: Sessions must also reflect the removal of color to maintain consistency, but this is lower priority as it follows from the data model change.

**Independent Test**: Can be tested by starting a session and verifying no color data is passed to or displayed in the gameplay UI.

**Acceptance Scenarios**:

1. **Given** a user selects a player and starts a session, **When** the session is created, **Then** no color data is included in the session
2. **Given** a game session is active, **When** the gameplay UI renders, **Then** no player-specific color styling is applied

---

### Edge Cases

- What happens when a stored profile has a `colorId` that references a color not in the current palette? The migration must handle this gracefully (remove the field entirely rather than remap it).
- What happens when a stored profile has no `colorId` at all (e.g., created by a future version)? The system must handle missing color fields without error.
- What happens when a session is in progress during an upgrade? The session should continue to work even if it contains legacy color data — color data is simply ignored.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The profile creation form MUST NOT display a color picker or any color selection UI
- **FR-002**: The profile creation form MUST only collect a player name and avatar selection
- **FR-003**: The player data model MUST NOT include a color identifier field
- **FR-004**: The session data model MUST NOT include a color identifier field
- **FR-005**: The player card MUST NOT display a color dot or any color-based visual indicator tied to a player's profile
- **FR-006**: The system MUST migrate existing stored profiles by removing any color data without data loss for other fields (name, avatar, scores, timestamps)
- **FR-007**: The system MUST remove the `ColorPicker` component and all related color constants/definitions from the codebase
- **FR-008**: The system MUST remove any color-remapping migration logic (previously used to handle removed colors)
- **FR-009**: The session creation flow MUST only carry player name and avatar — no color data
- **FR-010**: All references to color selection in hooks, services, and type definitions MUST be removed
- **FR-011**: The avatar emoji MUST remain the sole visual identifier for a player profile (alongside the player name)

### Key Entities

- **Player**: A stored profile representing a child user. After this change, key attributes are: name, avatar identifier, timestamps (created, last active), aggregate game stats (total score, games played). The color identifier is removed.
- **Session**: A tab-scoped play session. After this change, key attributes are: player name, avatar identifier, start timestamp. The color identifier is removed.

## Assumptions

- The removal of the color picker does not require a replacement visual customisation option — avatars (emojis) provide sufficient profile differentiation for children.
- Existing profiles that have color data will not be corrupted — the migration simply strips the color field while preserving all other data.
- No other feature currently depends on the player's color for logic beyond display (e.g., no game mechanics use color).
- The storage schema version will be incremented to track this migration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new player profiles are created without any color data
- **SC-002**: 100% of existing stored profiles with color data are successfully migrated (color removed, all other data intact)
- **SC-003**: The profile creation flow has one fewer step, reducing average creation time
- **SC-004**: No color picker, color dot, or color-related UI element appears anywhere in the application
- **SC-005**: All existing tests that reference color selection are updated or removed, and the full test suite passes
- **SC-006**: Users can still visually distinguish players in the player list via distinct avatar emojis and names
