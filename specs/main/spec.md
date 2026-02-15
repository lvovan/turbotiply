# Feature Specification: Player Sessions

**Feature Branch**: `main`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Sessions: when opening the page, ask for the user's name or let them choose from a list of players who have played previously. Sessions are closed when the tab or browser is closed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — New Player Creates Their Profile (Priority: P1)

A child opens Turbotiply for the first time on this device. The welcome screen greets them and guides them through a simple profile-creation flow: choose an avatar from a visual list, type a name, and pick a color. The child taps a button to start playing. The app remembers this profile for future visits.

**Why this priority**: Without a way to identify who is playing, no other feature (scores, progress, returning-player list) can function. This is the minimum viable entry point.

**Independent Test**: Open the app in a fresh browser (no prior data). Verify the welcome screen appears, select an avatar, type a name, pick a color, tap "Let's go!", and confirm the app transitions to the main experience with the player's name, avatar, and color visible.

**Acceptance Scenarios**:

1. **Given** no player data exists on this device, **When** the user opens the app, **Then** the welcome screen is displayed with a profile-creation flow showing an avatar picker, a name text field, and a color picker, plus a "Let's go!" button.
2. **Given** the profile-creation flow is displayed, **When** the user selects an avatar, types a name (e.g. "Mia"), picks a color, and taps "Let's go!", **Then** the app stores the profile (name, avatar, color) in browser storage and navigates to the main experience showing a greeting with the player's avatar and name.
3. **Given** the profile-creation flow is displayed, **When** the user taps "Let's go!" without entering a name, **Then** the button remains disabled or a friendly inline message appears ("Please type your name first!") and navigation does not occur.
4. **Given** the profile-creation flow is displayed, **When** the user does not select an avatar or color, **Then** a default avatar and color are pre-selected so the child can still proceed.

---

### User Story 2 — Returning Player Selects Their Name (Priority: P2)

A child opens Turbotiply on a device where one or more players have played before. The welcome screen shows a list of previously stored player names as large, tappable buttons alongside an option to add a new name. The child taps their name and is taken straight into the app.

**Why this priority**: Returning players are the core repeat-use case. Making re-entry effortless (one tap, no typing) is critical for engagement, especially for young children who may find typing tedious.

**Independent Test**: Pre-populate browser storage with two player names. Open the app and verify both names appear as selectable options. Tap one and confirm the app loads with that player's session.

**Acceptance Scenarios**:

1. **Given** player data for "Mia" and "Leo" exists on this device, **When** the user opens the app, **Then** the welcome screen displays "Mia" and "Leo" as distinct, tappable options — each showing their chosen avatar, name, and color — plus a "Someone else" (or "New player") option.
2. **Given** the returning-player list is displayed, **When** the user taps "Leo", **Then** the app starts a session for Leo and navigates to the main experience showing "Welcome back, Leo!" (or equivalent) with Leo's avatar and color.
3. **Given** the returning-player list is displayed, **When** the user taps "Someone else", **Then** the new-player profile-creation flow from User Story 1 is shown.
4. **Given** the returning-player list is displayed, **When** the user initiates deletion of "Leo" (e.g., long-press, swipe, or delete icon), **Then** a confirmation prompt appears: "Remove Leo? Their scores will be lost." with "Remove" and "Cancel" options.
5. **Given** the deletion confirmation for "Leo" is displayed, **When** the user taps "Remove", **Then** Leo's profile and all associated data are removed from browser storage and Leo no longer appears in the player list.

---

### User Story 3 — Session Ends When the Tab or Browser Closes (Priority: P3)

While a child is using Turbotiply, a session is considered active. When the browser tab or window is closed, the session ends automatically. The next time the app is opened, the welcome/player-selection screen appears again — the child is not automatically logged back in.

**Why this priority**: Session boundaries ensure each play period starts with an explicit player choice, which is important when devices are shared among siblings or classmates. It depends on P1/P2 being in place first.

**Independent Test**: Open the app, select a player, confirm the session is active (player name visible). Close the tab. Re-open the app and verify the welcome/player-selection screen appears instead of automatically resuming the previous session.

**Acceptance Scenarios**:

1. **Given** a session is active for "Mia", **When** the user closes the browser tab, **Then** the session is ended (session-specific state is cleared).
2. **Given** the user previously had a session for "Mia" and closed the tab, **When** the user opens the app again, **Then** the welcome/player-selection screen is displayed (not the main experience).
3. **Given** "Mia" had an active session and the browser crashes or is force-closed, **When** the app is reopened, **Then** the welcome/player-selection screen is displayed (the app does not assume "Mia" is still playing).
4. **Given** a session is active for "Mia", **When** the user taps the "Switch player" button, **Then** the session for Mia ends and the welcome/player-selection screen is displayed.

---

### Edge Cases

- **What happens when the entered name is extremely long?** The name input is limited to 20 characters. Names exceeding this limit are truncated visually in the input field and cannot be submitted beyond 20 characters.
- **What happens when the entered name contains only spaces or special characters?** The app trims whitespace from both ends. If the resulting name is empty, the same validation as an empty name applies ("Please type your name first!"). Special characters and emojis are allowed (kids may want to use them).
- **What happens when there are many previously stored players (e.g. 20+)?** The player list is scrollable. The most recently active players appear first. A reasonable upper limit of 50 stored players is maintained; the oldest inactive player is removed when the limit is reached.
- **What happens if browser storage is full or unavailable?** The app displays a friendly message ("Oops! We can't save your name on this device. You can still play, but we won't remember you next time.") and allows the child to continue with a temporary session.
- **What happens when two tabs are open simultaneously?** Each tab operates its own independent session. Closing one tab does not affect the other.
- **What happens when the child navigates away (back button, URL change) and returns without closing the tab?** The session remains active. The child returns to their current session state without being asked to re-select a player.
- **What happens when a child deletes the only player on the device?** The player list becomes empty and the app shows the new-player profile-creation flow (same as first-time visit).
- **What happens when a child accidentally taps delete?** Deletion always requires confirmation. Tapping "Cancel" returns to the player list with no changes.
- **What happens when a returning player's name is a duplicate of an existing name?** New player names are checked against existing stored names (case-insensitive). If a match is found, the app asks "A player called [Name] already exists. Do you want to replace them?" with clear "Replace" and "Go back" options. Replacing overwrites the existing player's avatar and color with the new selections.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a welcome/player-selection screen every time the app is opened and no active session exists.
- **FR-002**: The system MUST allow a new player to create a profile by choosing an avatar from a predefined visual list, entering a name via a text input field, and selecting a color from a predefined palette.
- **FR-003**: The system MUST validate that the entered name is non-empty (after trimming whitespace) and no longer than 20 characters.
- **FR-004**: The system MUST persist player names in browser storage so they survive page refreshes and browser restarts.
- **FR-005**: The system MUST display a list of previously stored player names as tappable/clickable options when at least one player exists in browser storage.
- **FR-006**: The system MUST provide a "New player" (or equivalent) option alongside the returning-player list.
- **FR-007**: The system MUST start a session for the selected or newly created player and navigate to the main experience.
- **FR-008**: The system MUST end the active session when the browser tab or window is closed (session state does not persist across tab closures).
- **FR-009**: The system MUST NOT automatically resume a previous session — the player-selection screen MUST appear on every fresh page load.
- **FR-010**: The system MUST order returning players by most recently active first.
- **FR-011**: The system MUST cap stored players at 50 and remove the least recently active player when the cap is exceeded.
- **FR-012**: The system MUST check new player names against existing stored names (case-insensitive). If a match is found, the app MUST ask the user to confirm whether they want to overwrite the existing player's profile (avatar, color) or go back and choose a different name.
- **FR-013**: The system MUST degrade gracefully when browser storage is unavailable, allowing temporary anonymous sessions with a user-friendly explanation.
- **FR-014**: The system MUST display the current player's name somewhere visible in the main experience so the child knows who is playing.
- **FR-015**: The system MUST provide a "Switch player" action (e.g., a button in the header) that ends the current session and navigates back to the welcome/player-selection screen without requiring a tab close.
- **FR-016**: The system MUST allow a player to be deleted from the returning-player list. Deletion MUST require a confirmation prompt (e.g., "Remove [Name]? Their scores will be lost.") before removing the player and all associated data from browser storage.

### Key Entities

- **Player**: Represents a person who has used the app on this device. Key attributes: name (string, 1–20 characters), avatar (identifier referencing a predefined avatar from the available list), color (identifier referencing a predefined color from the palette), last-active timestamp. Stored in browser storage. Multiple players can exist per device.
- **Session**: Represents a single play period for one player. Exists only while the browser tab is open — survives in-tab navigation (back button, URL re-entry) but ends when the tab is closed. Key attributes: associated player name, session start time. Not persisted — lives only in memory or sessionStorage (which is scoped to the tab's lifetime).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can enter their name and begin playing in under 30 seconds.
- **SC-002**: A returning player can select their name and begin playing in under 10 seconds (one tap plus page transition).
- **SC-003**: 95% of children aged 6–12 can complete the player-selection flow without adult assistance on first attempt (will require post-launch usability study).
- **SC-004**: After closing and reopening the browser, the player-selection screen appears within 2 seconds.
- **SC-005**: Previously created player names are still available after closing and reopening the browser (persistence verified).
- **SC-006**: The welcome screen and player list are fully usable on a 320px-wide phone screen, 1280px and a 1920px-wide desktop screen.

## Clarifications

### Session 2026-02-14

- Q: Should a child be able to switch to a different player mid-session without closing the tab? → A: Yes — provide a "Switch player" button (e.g., in a header) that ends the current session and returns to the welcome screen.
- Q: Should player names have visual distinction (avatar, color) in the player list? → A: Yes — when creating a new player, a simple interface lets the child choose an avatar from a list, enter their name, and pick a color. These are displayed alongside the name in the returning-player list. If a player with the same name already exists, the app asks for overwrite confirmation instead of silently merging.
- Q: Does in-session progress survive back-button navigation or URL re-entry within the same tab? → A: Yes — session state persists as long as the tab remains open, including back-button and URL re-entry. Only closing the tab ends the session.
- Q: Can children delete a player from the returning-player list? → A: Yes — allow deleting a player with a confirmation prompt ("Remove [Name]? Their scores will be lost."). This prevents stale names from accumulating on shared devices.

## Assumptions

- Player names are not private or sensitive — they are informal first names or nicknames chosen by the child, stored only on the local device. No authentication or password protection is needed.
- "Session" is a lightweight concept — it does not involve server-side state, tokens, or cookies. It is purely a front-end concern.
- The app does not need to sync player data across devices. Each device maintains its own independent player list (per constitution v2.0.0).
- The "main experience" that follows player selection is out of scope for this feature; this spec covers only the entry/selection flow and session lifecycle.
