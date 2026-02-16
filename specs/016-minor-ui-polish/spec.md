# Feature Specification: Minor UI Polish

**Feature Branch**: `016-minor-ui-polish`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Minor UI changes: (1) On the start (login) screen, add a small copyright text at the bottom: '© 2025, Luc Vo Van - Built with AI' (2) Reduce the size and height of the element that contains the 'game.readyToPlay' text to reduce the risk of the user having to scroll on smaller screen (3) Only show the top 3 scores on the main menu (4) Show the sparkline on the result screen before the detailed analysis of the game."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Copyright Notice on Welcome Screen (Priority: P1)

A user opens the app and lands on the welcome (login) screen. At the very bottom of the screen, they see a small copyright notice reading "© 2025, Luc Vo Van - Built with AI". The notice is always visible regardless of screen content and does not interfere with the login flow.

**Why this priority**: Copyright attribution is a legal and branding requirement. It is the simplest change and delivers immediate compliance value.

**Independent Test**: Can be fully tested by opening the app's welcome screen on any device and verifying the copyright text is visible at the bottom. Delivers branding/legal attribution value.

**Acceptance Scenarios**:

1. **Given** the user is on the welcome screen, **When** the page loads, **Then** the text "© 2025, Luc Vo Van - Built with AI" is displayed at the bottom of the screen.
2. **Given** the user is on the welcome screen on a small mobile device, **When** the page loads, **Then** the copyright text is visible without overlapping or obscuring any interactive elements (player list, new player form, buttons).
3. **Given** the user is on the welcome screen, **When** they look at the copyright text, **Then** it appears in a muted, small style that does not draw attention away from the primary content.

---

### User Story 2 - Compact Ready-to-Play Header on Main Menu (Priority: P2)

A user on a small-screen device navigates to the main menu (pre-game screen). The "Ready to play?" heading and instructions text take up less vertical space than before, so the user can see the score list and start button without needing to scroll.

**Why this priority**: Directly impacts usability on small screens. Users who have to scroll to reach game controls may miss key content or have a frustrating experience.

**Independent Test**: Can be tested by viewing the main menu on a small viewport (e.g., 320×568). The heading, instructions, scores, and start button should all be visible without scrolling.

**Acceptance Scenarios**:

1. **Given** the user is on the main menu on a device with a small screen (320px wide, 568px tall), **When** the page loads, **Then** the "Ready to play?" heading and instruction text, along with the score list and mode selector, are visible without vertical scrolling.
2. **Given** the user is on the main menu on a standard desktop screen, **When** the page loads, **Then** the heading and instruction text still look well-proportioned and readable (not too small).

---

### User Story 3 - Show Only Top 3 Scores on Main Menu (Priority: P2)

A user on the main menu sees their best 3 recent scores instead of 5. This reduces vertical space usage and keeps the focus on the podium (gold, silver, bronze), aligning with the existing medal display (🥇🥈🥉).

**Why this priority**: Complements the compact header change (Story 2) by further reducing vertical space. Also simplifies visual focus to the top 3, which aligns with the medal system already in place.

**Independent Test**: Can be tested by playing at least 4 games and then checking the main menu. Only 3 scores should appear, even if more game history exists.

**Acceptance Scenarios**:

1. **Given** a player has played 5 or more games, **When** they view the main menu, **Then** only the top 3 scores are shown in the best scores list.
2. **Given** a player has played exactly 2 games, **When** they view the main menu, **Then** only those 2 scores are shown (no empty rows or placeholders for the third).
3. **Given** a player has played 0 games, **When** they view the main menu, **Then** the empty state message ("No games yet") is displayed as before.
4. **Given** a player has played 3 or more games, **When** they view the best scores list, **Then** each score displays with the appropriate medal emoji (🥇, 🥈, 🥉) — no plain ordinal ranks are shown.

---

### User Story 4 - Sparkline on Result Screen (Priority: P3)

After completing a game, the user sees the score progression sparkline (graph of recent scores) displayed above the round-by-round breakdown table. This gives the user immediate visual feedback on their performance trend before diving into detailed results.

**Why this priority**: Enhances the post-game experience by showing trends, but is lower priority because the result screen already provides sufficient information. This is an improvement, not a gap filler.

**Independent Test**: Can be tested by completing 2 or more games and checking the result screen. The sparkline should appear between the score summary and the detailed round table.

**Acceptance Scenarios**:

1. **Given** a player completes a game and has at least 2 games in their history (including the just-completed game), **When** the result screen is displayed, **Then** the score progression sparkline is shown before (above) the round-by-round breakdown table, and it includes the just-completed game as the latest data point.
2. **Given** a player completes their very first game (only 1 game in history), **When** the result screen is displayed, **Then** no sparkline is shown (the graph requires at least 2 data points, including the just-completed game).
3. **Given** a player completes a game and has 10+ games in history, **When** the result screen is displayed, **Then** the sparkline shows the most recent scores (up to the standard display limit) and the just-completed game is included as the latest data point.

---

### Edge Cases

- What happens when the copyright text is viewed in a language with a right-to-left layout? The copyright text is in English and should remain left-to-right regardless of UI language.
- What happens when the main menu scores list has fewer than 3 entries? Only the available scores are shown; no empty slots or placeholder rows appear.
- What happens when the sparkline is shown on the result screen but the player's history only has exactly 2 games? The sparkline renders with just 2 data points connected by a line — this is the minimum viable graph.
- What happens on the result screen in "improve" mode? The sparkline displays if the player has at least 2 game records of any mode, because the existing progression graph already aggregates across modes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The welcome screen MUST display the copyright text "© 2025, Luc Vo Van - Built with AI" at the bottom of the page.
- **FR-002**: The copyright text MUST be styled as small, muted text so it does not compete with primary content for attention.
- **FR-003**: The copyright text MUST remain visible and not overlap with interactive elements on screens as small as 320px wide.
- **FR-004**: The "Ready to play?" heading and the instruction text on the main menu MUST be rendered in a more compact size to reduce vertical space consumption.
- **FR-005**: The main menu MUST display only the top 3 best scores (reduced from 5).
- **FR-006**: When fewer than 3 scores exist, only the available scores MUST be shown — no placeholder rows.
- **FR-007**: The result screen MUST display the score progression sparkline before (above) the round-by-round breakdown table when the player has at least 2 games in their history.
- **FR-008**: The result screen MUST NOT display the sparkline when the player has fewer than 2 games in their history.
- **FR-009**: The sparkline on the result screen MUST include the just-completed game as the latest data point.

## Assumptions

- The copyright year is fixed at "2025" as specified, not dynamically generated.
- The sparkline component already exists and can be reused on the result screen with the same visual appearance as on the main menu.
- The sparkline on the main menu (pre-game screen) continues to display as before — this change only adds it to the result screen.
- "Top 3 scores" uses the same scoring/sorting logic as the existing "top 5" — highest scores from recent play-mode games.
- The compact heading change affects only visual sizing; the text content ("Ready to play?" and instructions) remains unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users see the copyright text on the welcome screen across all supported viewport sizes.
- **SC-002**: On a 320×568 viewport, the main menu content (heading, instructions, top 3 scores, mode selector, and start button) is fully visible without vertical scrolling.
- **SC-003**: The main menu score list consistently shows at most 3 entries.
- **SC-004**: After completing a game, users with 2+ prior games see their score trend sparkline on the result screen before the detailed breakdown.
