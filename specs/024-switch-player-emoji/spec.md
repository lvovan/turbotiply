# Feature Specification: Switch Player Emoji Button

**Feature Branch**: `024-switch-player-emoji`  
**Created**: 2026-02-18  
**Status**: Draft  
**Input**: User description: "Change the content of the switch player button with the 👥 (people/group emoji). This will save space on screen and declutter while making the layout more stable across languages"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Emoji replaces text on switch player button (Priority: P1)

An authenticated player sees a "👥" emoji on the switch player button instead of a translated text label. The button is compact, visually recognisable, and behaves identically to the previous text button (ending the session and navigating back to the welcome screen). The emoji renders consistently regardless of the currently selected language.

**Why this priority**: This is the entire scope of the feature — replacing the button label. Without it, the feature delivers no value.

**Independent Test**: Can be fully tested by logging in as a player, observing the header, and verifying the button displays the 👥 emoji with no visible text label. Clicking it must still end the session and return to the welcome page.

**Acceptance Scenarios**:

1. **Given** the player is authenticated, **When** they view the header, **Then** the switch-player button displays the 👥 emoji with no accompanying text.
2. **Given** the player is authenticated and viewing the header, **When** they click the 👥 button, **Then** their session ends and they are returned to the welcome screen.
3. **Given** the player switches the app language to any supported language (EN, FR, DE, ES, JA, PT), **When** they view the header, **Then** the switch-player button displays the same 👥 emoji and the header layout does not shift.

---

### User Story 2 - Button remains accessible (Priority: P1)

Screen-reader and keyboard users can still identify and activate the switch-player button. The button must have an accessible label conveying its purpose (e.g., "Switch player") even though the visible content is now only an emoji.

**Why this priority**: Accessibility is a non-negotiable quality requirement — it must ship together with the visual change.

**Independent Test**: Can be tested by navigating to the button via keyboard (Tab) and verifying screen-reader output announces a meaningful label such as "Switch player". The button must also be activatable with Enter/Space.

**Acceptance Scenarios**:

1. **Given** a screen-reader user navigates the header, **When** focus reaches the switch-player button, **Then** the screen reader announces a meaningful label (e.g., "Switch player") rather than just "👥".
2. **Given** a keyboard user tabs to the switch-player button, **When** they press Enter or Space, **Then** the button activates and they are returned to the welcome screen.
3. **Given** the focus-visible outline is triggered, **When** the user tabs to the button, **Then** a clearly visible focus indicator appears around the button.

---

### Edge Cases

- What happens when the user's device or operating system does not support the 👥 emoji? The button should still render a recognisable glyph; the accessible label ensures functionality is never lost.
- What happens on very narrow screens (≤ 320 px)? The emoji button should remain at least 44 × 44 px (touch target) and not cause the header to overflow or wrap.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The switch-player button MUST display the 👥 emoji as its sole visible content, replacing the previously translated text label.
- **FR-002**: The switch-player button MUST include a non-visible accessible label (e.g., `aria-label`) so assistive technologies announce the button's purpose in the user's current language.
- **FR-003**: Clicking/tapping the switch-player button MUST end the current session and navigate the user to the welcome screen, preserving existing behaviour.
- **FR-004**: The switch-player button MUST only appear when a player session is active, preserving existing behaviour.
- **FR-005**: The switch-player button MUST maintain a minimum touch-target size of 44 × 44 px on all screen sizes.
- **FR-006**: The header layout MUST NOT shift or change width when the user switches between any supported language.

## Assumptions

- The 👥 emoji is universally supported on modern browsers and operating systems (iOS, Android, Windows, macOS). No text-based fallback is required.
- The existing translated string key (`header.switchPlayer`) will be repurposed for the accessible label rather than removed, preserving existing localisation coverage.
- No tooltip on hover is required; the accessible label is sufficient.
- The visual style of the button (border, padding, hover/focus states) may be adjusted to suit the emoji content but its interactive behaviour remains unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The switch-player button displays the 👥 emoji with no visible text in 100% of supported languages.
- **SC-002**: The header layout width remains identical across all supported languages when a player is logged in.
- **SC-003**: Screen readers announce a meaningful label (e.g., "Switch player") when the button receives focus.
- **SC-004**: The switch-player button meets a minimum 44 × 44 px touch target on viewports as narrow as 320 px.
- **SC-005**: 100% of existing switch-player functionality (session end + navigation to welcome screen) is preserved.
