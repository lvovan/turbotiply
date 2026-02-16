# Feature Specification: Home Screen Rework

**Feature Branch**: `003-home-screen-rework`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: User description: "Rework of the home (login) screen: A. Add a 'Clear all profiles' button, which will (1) ask for confirmation (2) reset the game by removing everything from local browser storage and (3) reload the page. B. Make sure everything fits on a standard (2020+) smartphone screen without needing vertical scrolling. The choice of emojis and colors can be reduced to enable this without sacrificing legibility."

## User Scenarios & Testing

### User Story 1 – Clear All Profiles (Priority: P1)

A returning user who has accumulated multiple saved player profiles wants to start fresh. They tap a "Clear all profiles" button visible on the home screen, confirm the action in a dialog, and the app wipes all stored data and reloads to a clean first-visit state.

**Why this priority**: Gives users full control over their data and an easy way to reset the app. This is a discrete, self-contained feature that delivers immediate value.

**Independent Test**: Can be tested by creating one or more profiles, tapping "Clear all profiles", confirming, and verifying the page reloads with an empty first-visit screen and no data in browser storage.

**Acceptance Scenarios**:

1. **Given** a returning user is on the home screen with one or more saved profiles, **When** they tap "Clear all profiles", **Then** a confirmation dialog appears asking the user to confirm the destructive action.
2. **Given** the confirmation dialog is displayed, **When** the user confirms, **Then** all app data is removed from local browser storage, and the page reloads to the first-visit (new player) state.
3. **Given** the confirmation dialog is displayed, **When** the user cancels, **Then** the dialog closes and the profile list remains unchanged.
4. **Given** no saved profiles exist (first-visit new-player form is shown), **Then** the "Clear all profiles" button is not displayed.

---

### User Story 2 – Scroll-Free Home Screen on Smartphones (Priority: P1)

A user opens the app on a standard 2020+ smartphone (minimum viewport ~360×640 CSS pixels). The entire home screen — whether it shows the new player form or the returning player list — is fully visible without vertical scrolling. Text, icons, and interactive elements remain legible and easy to tap.

**Why this priority**: Mobile-first usability is essential for a children's multiplication game. If the home screen requires scrolling, young users may not discover all options. Equal priority with Story 1 because both are required for a good mobile experience.

**Independent Test**: Open the home screen on a 360×640 viewport (or a mainstream 2020+ smartphone). Verify the entire screen content is visible without scrolling, all tap targets are at least 44×44 CSS pixels, and text is readable.

**Acceptance Scenarios**:

1. **Given** a first-time user on a 360×640 viewport, **When** the new player form is displayed (name input, avatar picker, color picker, submit button), **Then** all form elements are fully visible without vertical scrolling.
2. **Given** a returning user with up to 5 saved profiles on a 360×640 viewport, **When** the player list is displayed, **Then** the list (single-line cards ordered alphabetically), "New player" button, and "Clear all profiles" button are fully visible without vertical scrolling.
3. **Given** the avatar picker is displayed, **When** the user views the grid, **Then** no more than 8 avatar options are shown, arranged in a compact grid that fits within the available space while maintaining tap targets of at least 44×44 CSS pixels.
4. **Given** the color picker is displayed, **When** the user views the swatches, **Then** no more than 6 color options are shown, arranged in a single row or compact grid that fits within the available space while maintaining tap targets of at least 44×44 CSS pixels.

---

### User Story 3 – Accessible Confirmation Dialog (Priority: P2)

When the user triggers the "Clear all profiles" action, the confirmation dialog is accessible: it traps focus, can be dismissed with the Escape key, and clearly communicates the consequences of the action.

**Why this priority**: Accessibility is important but secondary to core functionality. Builds on the existing pattern used for the single-player delete confirmation.

**Independent Test**: Trigger the dialog using keyboard-only navigation, verify focus is trapped within the dialog, press Escape to dismiss, and verify screen reader announces the dialog purpose and consequences.

**Acceptance Scenarios**:

1. **Given** the confirmation dialog is open, **When** the user presses Escape, **Then** the dialog closes without clearing data.
2. **Given** the confirmation dialog is open, **When** the user uses Tab, **Then** focus cycles only between the dialog's interactive elements (confirm and cancel buttons).
3. **Given** a screen reader is active, **When** the dialog opens, **Then** the dialog purpose and warning text are announced.

---

### Edge Cases

- What happens when the user taps "Clear all profiles" but browser storage is already empty? The confirmation should still work and reload the page to a clean state.
- What happens if clearing storage fails (e.g., browser restrictions)? The app should display a brief error message and not reload.
- What happens on a very small viewport (<360px width)? The layout should degrade gracefully — minor scrolling is acceptable on non-standard devices, but content must remain usable.
- What happens when a returning user has more than 5 profiles? The player list may require scrolling on smaller viewports; this is acceptable since the scroll-free guarantee applies to up to 5 profiles. A visual cue (e.g., fade or scroll indicator) should hint that more content exists below.
- What happens when a returning user's profile references an avatar or color that was removed? The system silently remaps it to the nearest visual equivalent and persists the change, so the user sees a valid avatar/color without any prompt or disruption.

## Requirements

### Functional Requirements

- **FR-001**: The home screen MUST display a "Clear all profiles" button when one or more saved player profiles exist. The button MUST be positioned at the bottom of the screen, below the "New player" button, and MUST be visually de-emphasized (e.g., smaller text, muted color) to reduce accidental activation.
- **FR-002**: The "Clear all profiles" button MUST NOT be displayed when no saved profiles exist (first-visit / new-player form state).
- **FR-003**: Tapping "Clear all profiles" MUST display a confirmation dialog before any data is deleted.
- **FR-004**: The confirmation dialog MUST clearly warn the user that this action will permanently delete all saved player profiles and cannot be undone. The tone MUST be friendly but clear, appropriate for a children's audience (e.g., "This will delete all players and scores. Are you sure? This can't be undone!").
- **FR-005**: Confirming the action MUST remove all app data from local browser storage (not just player profiles — a full reset).
- **FR-006**: After clearing storage, the app MUST reload the page so the user sees a clean first-visit state.
- **FR-007**: Cancelling the confirmation dialog MUST close it without modifying any data.
- **FR-008**: The avatar picker MUST display no more than 8 avatar options (reduced from the current 12) to save vertical space on mobile viewports.
- **FR-009**: The color picker MUST display no more than 6 color options (reduced from the current 8) to save vertical space on mobile viewports.
- **FR-010**: The entire new player form (title, subtitle, name input, avatar picker, color picker, submit button) MUST be fully visible without vertical scrolling on a 360×640 CSS pixel viewport.
- **FR-011**: The returning-player list (title, subtitle, up to 5 player cards, "New player" button, and the de-emphasized "Clear all profiles" button at the bottom) MUST be fully visible without vertical scrolling on a 360×640 CSS pixel viewport.
- **FR-012**: All interactive elements (buttons, avatar options, color swatches) MUST maintain a minimum tap target of 44×44 CSS pixels per WCAG 2.1 guidelines.
- **FR-013**: The confirmation dialog MUST support keyboard dismissal via the Escape key.
- **FR-014**: The confirmation dialog MUST trap focus within itself while open.
- **FR-015**: When more than 5 profiles exist, the player list view MAY scroll, but MUST provide a visual cue that more content is available below the fold.
- **FR-016**: When a saved profile references an avatar or color that has been removed, the system MUST silently remap it to the nearest visual equivalent and persist the updated selection on load.
- **FR-017**: The player list MUST display player cards in alphabetical order by player name (case-insensitive).
- **FR-018**: Each player card MUST display the player's average score alongside their avatar, name, color indicator, and delete action.
- **FR-019**: Each player card in the returning-player list MUST use a single-line horizontal layout containing (left to right): avatar emoji, player name, average score, color dot, and delete icon.

### Key Entities

- **Player Profile**: A saved user identity consisting of name, avatar selection, color selection, and gameplay statistics (including average score). Stored in local browser storage.
- **Browser Storage**: The localStorage area used by the app to persist player profiles and any other app state. The "clear all" action targets the entirety of this storage.
- **Confirmation Dialog**: A modal overlay that requires explicit user action (confirm or cancel) before a destructive operation proceeds.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can clear all profiles and reach a fresh first-visit state in under 5 seconds (2 taps: button + confirm).
- **SC-002**: 100% of new-player form content is visible without scrolling on a 360×640 CSS pixel viewport.
- **SC-003**: 100% of returning-player content (up to 5 profiles) is visible without scrolling on a 360×640 CSS pixel viewport.
- **SC-004**: All tap targets measure at least 44×44 CSS pixels on mobile viewports.
- **SC-005**: The confirmation dialog is fully operable via keyboard only (Tab, Enter, Escape).
- **SC-006**: After clearing all profiles, zero items remain in the app's local browser storage.

## Clarifications

### Session 2026-02-15

- Q: When avatars are reduced from 12→8 and colors from 8→6, what happens to existing profiles referencing a removed option? → A: Silently remap removed options to the nearest visual equivalent at load time and persist the update.
- Q: Where should the "Clear all profiles" button be placed on the returning-player view? → A: At the bottom of the screen, below the "New player" button, visually de-emphasized (smaller text, muted color).
- Q: What tone should the confirmation dialog warning use? → A: Friendly but clear, appropriate for a children's audience (e.g., "This will delete all players and scores. Are you sure? This can't be undone!").
- Q: Should player cards be simplified to fit 5 on a 360×640 viewport? → A: Yes — single-line horizontal layout per card (avatar emoji, name, average score, color dot, delete icon in one row). Cards ordered alphabetically. Average score displayed in each card.

## Assumptions

- **Viewport baseline**: A "standard 2020+ smartphone" is defined as having a minimum CSS viewport of 360×640 pixels (portrait). This covers the vast majority of devices sold since 2020 (e.g., iPhone SE 2nd gen: 375×667, Samsung Galaxy A series: 360×800).
- **Avatar reduction**: Reducing from 12 to 8 avatars is acceptable. The 8 most distinct/popular avatars will be retained. The specific selection will be determined during planning.
- **Color reduction**: Reducing from 8 to 6 colors is acceptable. The 6 most visually distinct and CVD-safe colors will be retained. The specific selection will be determined during planning.
- **Profile cap for scroll-free**: The scroll-free guarantee on the player list view applies to up to 5 profiles. Beyond 5, scrolling is acceptable with a visual indicator.
- **Full storage clear**: "Clear all profiles" performs a complete storage clear for the app's domain, not a selective deletion. This is the simplest and most reliable reset mechanism.
- **Existing delete-player pattern**: The confirmation dialog will follow the same visual and interaction pattern already established by the existing single-player delete confirmation.
