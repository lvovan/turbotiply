# Feature Specification: Scores Summary Page

**Feature Branch**: `003-scores-summary-page`  
**Created**: February 20, 2026  
**Status**: Draft  
**Input**: User description: "Scores Summary page definition: Display in vertical order: - 'Score' label with the player's final score number - Play again button - Back to menu button - The spark line centered (if in Normal/play mode, with ≥2 game history entries) - The game's summary table with columns: #, Formula, Answer, Result (✓/✗), Time, Points — rows colour-coded by round score (green for +5, orange for +2/+3, red for 0 or negative) with legible text in both light and dark mode"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Final Score (Priority: P1)

As a player, I want to see my final score clearly displayed after finishing a game, so I can understand my performance.

**Why this priority**: This is the core value of the summary page; players need immediate feedback on their results.

**Independent Test**: Can be fully tested by completing a game and verifying the score is shown.

**Acceptance Scenarios**:

1. **Given** a completed game in play mode, **When** the summary page loads, **Then** the "Score" label and the player's numeric score are displayed prominently (no "Game Over" heading).
2. **Given** a completed game in improve mode, **When** the summary page loads, **Then** a "You got X/N right!" message is displayed instead of the numeric score.

---

### User Story 2 - Play Again or Return to Menu (Priority: P2)

As a player, I want to quickly start a new game or return to the main menu from the summary page, so I can continue playing or exit easily.

**Why this priority**: Enables smooth navigation and keeps players engaged.

**Independent Test**: Can be fully tested by clicking "Play Again" or "Back to Menu" and verifying correct navigation.

**Acceptance Scenarios**:

1. **Given** the summary page, **When** "Play Again" is clicked, **Then** a new game session starts.
2. **Given** the summary page, **When** "Back to Menu" is clicked, **Then** the player is returned to the main menu.

---

### User Story 3 - Visualize Game Performance (Priority: P3)

As a player, I want to see a centered sparkline and a detailed summary table so I can visually understand my performance trends and review each round.

**Why this priority**: Visual feedback helps players quickly interpret their results and motivates improvement.

**Independent Test**: Can be fully tested by completing a game in play mode and verifying the sparkline and summary table display with appropriate data and colors.

**Acceptance Scenarios**:

1. **Given** a completed game in play mode with ≥2 game history entries, **When** the summary page loads, **Then** a centered sparkline (ProgressionGraph) is shown.
2. **Given** a completed game in improve mode, **When** the summary page loads, **Then** no sparkline is shown.
3. **Given** a completed game, **When** the summary table is displayed, **Then** it contains columns: # (round number), Formula, Answer (player's typed value), Result (✓ green checkmark or ✗ red cross), Time (response time to the tenth of a second, e.g. "1.5s"), and Points (e.g. "+5", "-2").
4. **Given** a completed game, **When** the summary table is displayed, **Then** each row has a background colour based on the round's points: green for +5, orange for +2 or +3, red for 0 or negative.
5. **Given** a device in dark mode or light mode, **When** the summary table is displayed, **Then** all row text remains legible against its coloured background.

---

### Edge Cases

- What happens if the player finishes with a negative score? → Score is displayed as a negative number.
- How does the system handle games with only one round? → Table shows a single row; sparkline requires ≥2 history entries to appear.
- What if the summary page is accessed in improve mode? → Shows "You got X/N right!" and incorrect-pair hints instead of numeric score; no sparkline.
- What if playerAnswer is null? → Display "—" in the Answer column.
- What if points is null? → Display "—" in the Points column.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the "Score" label (uppercase, larger font at 1.3rem with 600 weight) with the player's numeric final score in play mode, with minimal vertical gap above to optimize space.
- **FR-002**: System MUST provide a "Play Again" button that starts a new game session.
- **FR-003**: System MUST provide a "Back to Menu" button that returns the player to the main menu.
- **FR-004**: System MUST display a centered sparkline (ProgressionGraph) only in play mode when ≥2 game history entries exist. The sparkline MUST always render at full 10-game width (fixed viewBox) regardless of the number of data points, to maintain a constant layout.
- **FR-005**: System MUST show a summary table with columns: # (round number), Formula, Answer (the value the player typed), Result (✓ or ✗), Time (to the tenth of a second, e.g. "1.5s"), Points (+N or -N).
- **FR-006**: System MUST colour each table row's background based on round points: green (#e6f7e6) for +5, orange (#fff4e0) for +2/+3, red (#ffe5e5) for 0 or negative.
- **FR-007**: System MUST provide dark-mode row colours that maintain text legibility: green (#1b3d1b / #a5d6a7), orange (#3e2700 / #ffd180), red (#3e1010 / #ef9a9a).
- **FR-008**: System MUST handle edge cases (negative score, null answer/points, single-round game) gracefully.
- **FR-009**: System MUST meet accessibility standards, including sufficient color contrast, keyboard navigation, and ARIA labels for all interactive elements.
- **FR-010**: In improve mode, System MUST display "You got X/N right!" and list incorrect pairs instead of the numeric score.

### Key Entities *(include if feature involves data)*

- **Round** (from game.ts): `formula`, `playerAnswer`, `isCorrect`, `elapsedMs`, `points` — used to populate table rows.
- **GameRecord** (from player.ts): `score`, `completedAt`, `rounds?`, `gameMode?` — used for sparkline history.
- **ScoreSummaryProps**: `rounds: Round[]`, `score: number`, `onPlayAgain`, `onBackToMenu`, `gameMode?`, `history?: GameRecord[]`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of players can see their final score within 2 seconds of game completion.
- **SC-002**: 90% of players successfully use "Play Again" or "Back to Menu" without confusion.
- **SC-003**: Summary table accurately displays all six columns (#, Formula, Answer, Result, Time, Points) with correct data for every round.
- **SC-004**: Row background colours match the scoring tier (green/orange/red) in both light and dark mode with legible text.
- **SC-005**: All summary page elements pass WCAG AA color contrast and keyboard accessibility checks.

## Assumptions

- Row colour tiers: green = +5 points, orange = +2 or +3 points, red = 0 or negative points.
- Sparkline is only shown in play mode with ≥2 history entries, centered horizontally.
- "Play Again" and "Back to Menu" buttons are always available on the summary page.
- The summary page is accessed only after a game session completes.
- No "Game Over" heading is shown — the score label alone provides sufficient context.

## Clarifications
### Session 2026-02-20
- Q: Should accessibility requirements (color contrast, keyboard navigation, ARIA labels) be explicitly included for the Scores Summary page? → A: Add accessibility requirements (color contrast, keyboard navigation, ARIA labels)
- Removed "Game Over!" heading as it does not add valuable information.
- Renamed "Total Score" label to "Score".
- Added "Answer" column to the summary table showing the player's typed value.
- Row colours now based on round points (green/orange/red) with dark-mode variants for legibility.
- Sparkline centered when displayed.
- Sparkline always renders at full 10-game width (fixed viewBox of 324 SVG units) for consistent layout, even with fewer than 10 games.
- "Score" label font enlarged to 1.3rem with 600 font-weight and increased letter-spacing (1.5px) for better visibility.
- Reduced vertical padding above the score section (summary padding from 24px to 12px, totalScore margin-bottom from 24px to 16px, gap from 4px to 2px) to optimise vertical space.
