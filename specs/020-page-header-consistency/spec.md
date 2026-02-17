# Feature Specification: Page Header Consistency

**Feature Branch**: `020-page-header-consistency`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "The top of the different pages of the app have different layouts (heading size/height) which results in a low visual consistency. Fix the pages so that they share a common visual layout."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Header Across All Pages (Priority: P1)

A user navigates between the Welcome page and the Main (gameplay) page and perceives a unified, polished look. Both pages share the same top-section height, app title treatment, and overall visual rhythm so the experience feels like one cohesive app rather than two separate screens.

**Why this priority**: Visual consistency is the core ask. If only one thing ships, it must be the unified header structure across pages.

**Independent Test**: Open the app as a new user (Welcome page) and then start a session (Main page). The top section of both pages should have the same visual height, the same app title styling, and the same general layout pattern.

**Acceptance Scenarios**:

1. **Given** the user is on the Welcome page, **When** they look at the top of the screen, **Then** they see a horizontal header bar with the app title ("Multis!") on the left and actions on the right, matching the Main page header pattern.
2. **Given** the user has started a session and is on the Main page, **When** they look at the top of the screen, **Then** they see a horizontal header bar whose overall height and spacing matches the Welcome page header bar.
3. **Given** the user navigates from Welcome to Main (or vice versa), **When** the page transition occurs, **Then** there is no jarring vertical shift in content positioning caused by different header heights.

---

### User Story 2 - Consistent Utility Element Placement (Priority: P2)

Utility elements that appear on multiple pages (e.g., the language switcher) are placed in the same position within the header area on every page, so users always know where to find them.

**Why this priority**: Predictable placement of shared controls reinforces the feeling of consistency and reduces cognitive load. It depends on the header structure from P1.

**Independent Test**: Open the Welcome page and note the language switcher position; then navigate to the Main page and confirm the language switcher is in the same relative position.

**Acceptance Scenarios**:

1. **Given** the user is on the Welcome page, **When** they look for the language switcher, **Then** it appears in the same region of the header as on the Main page.
2. **Given** the user is on the Main page, **When** they look for the language switcher, **Then** it appears in the same region of the header as on the Welcome page.

---

### User Story 3 - Responsive Header Consistency (Priority: P3)

On narrow screens (mobile), the header adapts responsively but still maintains visual parity between the Welcome page and the Main page — identical height ratios, proportional title sizing, and no layout breakage.

**Why this priority**: Mobile is likely a primary device for this app (multiplication practice for kids). Responsive consistency matters, but the desktop layout is the baseline that must be solved first.

**Independent Test**: Resize the browser to 320px wide and compare the header area on both pages side by side (or by navigating). They should look proportionally similar.

**Acceptance Scenarios**:

1. **Given** the user is viewing the app on a 320px-wide screen, **When** they view either page, **Then** the header area scales proportionally and maintains the same visual height and title size on both pages.
2. **Given** the user is viewing the app on a screen between 320px and 600px, **When** they view either page, **Then** no header elements overflow or wrap unexpectedly, and the layout remains consistent between pages.

---

### Edge Cases

- What happens when the player name is very long and might affect header height on the Main page? The header must not grow taller than the Welcome page header.
- When localStorage is unavailable, the Welcome page shows a degraded-mode layout; the header area should still match the standard visual height and title treatment.
- On the Main page's "completed" state (score summary), the header should remain unchanged from the "playing" or "not-started" states.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Both pages MUST share a common header area height so that content below the header starts at the same vertical position.
- **FR-002**: The app title ("Multis!") MUST use the same font size, font weight, and color on both pages.
- **FR-002a**: On the WelcomePage (no active session), the header bar MUST show only the app title "Multis!" on the left side, with no avatar or greeting. On the MainPage (active session), the header bar shows the avatar, greeting, and app title.
- **FR-003**: The language switcher MUST appear in the same position relative to the header area on both pages.
- **FR-004**: The Main page header (which includes avatar, greeting, and "Switch player" button) MUST fit within the same height envelope as the Welcome page header without causing layout reflow.
- **FR-004a**: The Welcome page subtitles (e.g., "Practice your multiplication tables!", "Who's playing?") MUST be rendered below the header bar in the main content area, not inside the header bar itself.
- **FR-005**: The degraded-mode Welcome page (no localStorage) MUST maintain the same header height and title styling as the standard Welcome page.
- **FR-006**: The header layout MUST remain consistent across all game states on the Main page (not-started, playing, replay, completed).
- **FR-007**: The header area MUST be responsive and maintain proportional consistency between pages at all supported viewport widths (320px and above).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The header area on both pages occupies the same vertical height (within a 4px tolerance) at any given viewport width.
- **SC-002**: The app title on both pages uses identical font size, weight, and color — verifiable by visual comparison or snapshot testing.
- **SC-003**: The language switcher occupies the same screen region on both pages — verifiable by visual comparison.
- **SC-004**: No content layout shift occurs when navigating between pages, as observed by a user or measured by visual regression tooling.
- **SC-005**: On a 320px-wide viewport, both headers render without overflow, truncation of essential elements, or content wrapping that differs between pages.

## Clarifications

### Session 2026-02-17

- Q: Which page's header pattern should be the basis for unification — horizontal bar (MainPage) or centered/stacked (WelcomePage)? → A: WelcomePage adopts MainPage's horizontal bar layout (title left, actions right).
- Q: What should happen to the WelcomePage subtitles in the new horizontal bar layout? → A: Move subtitles below the header bar into the main content area of the page.
- Q: What should the WelcomePage header bar show on the left side (where MainPage shows avatar + greeting)? → A: Show only the app title "Multis!" on the left (no avatar/greeting since no session exists).

## Assumptions

- The app currently has exactly two pages: WelcomePage and MainPage.
- The WelcomePage will adopt the MainPage's horizontal bar layout pattern (title/branding on the left, utility actions on the right) as the unified header design direction.
- The app title "Multis!" should remain visible on both pages; on the MainPage the title will appear in the horizontal bar alongside the existing avatar, greeting, and actions.
- Existing functionality (player selection, game controls, language switching) must not be altered — only visual positioning and sizing are in scope.
