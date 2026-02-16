# Feature Specification: Score Display Rework

**Feature Branch**: `006-score-display`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Update as to how scores are displayed: (1) The average displayed in the profile is only the average of the last 10 games, not the player's entire history (which should still be kept to show a small graph of the player's progression on the main menu screen) and (2) the main menu screen, shown after the player has logged in, should show the scores from the last 5 games (high score style)"

## User Scenarios & Testing

### User Story 1 – Recent Average in Player Profile (Priority: P1)

A returning player selects their profile on the home screen and sees their average score. This average reflects only their last 10 completed games, giving them a current measure of their skill rather than a lifetime average diluted by early, low-scoring games. If the player has fewer than 10 games, the average is computed from all games played so far.

**Why this priority**: The profile average is the most visible score metric — it appears on every player card on the home screen and informs the player's sense of progress. Changing it to reflect recent performance is the core of this feature and delivers the highest-impact improvement.

**Independent Test**: Create a player, complete 12 games with known scores. Verify the displayed average uses only the last 10 game scores. Delete the profile, create a new one, complete 3 games, and verify the average uses all 3.

**Acceptance Scenarios**:

1. **Given** a player has completed 10 or more games, **When** their profile is displayed on the home screen, **Then** the average score shown is the arithmetic mean of the last 10 completed game scores (most recent).
2. **Given** a player has completed fewer than 10 games (but at least 1), **When** their profile is displayed, **Then** the average score shown is the arithmetic mean of all completed game scores.
3. **Given** a player has completed 0 games, **When** their profile is displayed, **Then** no average score is shown (or a placeholder such as "–" is displayed).
4. **Given** a player completes a new game, **When** they return to the home screen, **Then** the average updates to include the new game and exclude the oldest game (if the player has more than 10 games).

---

### User Story 2 – Recent Scores on the Main Menu Screen (Priority: P1)

After a player logs in (selects their profile), they are taken to the main menu screen (pre-game screen). Before starting a new game, they see a list of their last 5 game scores displayed in a "high score" style — ordered from highest to lowest score. This motivates the player to beat their own recent best.

**Why this priority**: Equal to Story 1 because it is explicitly requested and delivers immediate gameplay motivation. It transforms the pre-game screen from a simple "Start" button into an engaging dashboard.

**Independent Test**: Log in as a player who has completed 6 games. Verify the main menu screen displays the 5 most recent game scores ordered from highest to lowest. Log in as a new player with 0 games and verify no score list is shown (or a friendly empty-state message).

**Acceptance Scenarios**:

1. **Given** a logged-in player has completed 5 or more games, **When** the main menu screen is displayed, **Then** a "Recent High Scores" section shows the scores from the last 5 completed games, sorted from highest to lowest.
2. **Given** a logged-in player has completed fewer than 5 games (but at least 1), **When** the main menu screen is displayed, **Then** the "Recent High Scores" section shows all available game scores, sorted from highest to lowest.
3. **Given** a logged-in player has completed 0 games, **When** the main menu screen is displayed, **Then** no score list is shown, and a friendly message encourages the player to play their first game (e.g., "Play your first game to see your scores here!").
4. **Given** a player completes a game and returns to the main menu, **When** the main menu screen is displayed, **Then** the "Recent High Scores" list is updated to include the new score and drop the oldest score (if there were already 5).

---

### User Story 3 – Score Progression Graph on the Main Menu Screen (Priority: P2)

On the main menu screen, in addition to the recent high scores, a small visual graph shows the player's score progression over their full game history. This helps children see their improvement over time, reinforcing a growth mindset.

**Why this priority**: The progression graph adds engagement and motivational value but is more complex than the score list. It depends on full game history being stored (which Story 1's data migration enables), so it builds on prior stories. It can be delivered as an enhancement after the core score changes.

**Independent Test**: Log in as a player with 15+ completed games. Verify a graph is displayed showing scores over time (chronological order). Verify it uses the full game history, not just the last 10. Log in as a new player with 0 games and verify no graph is shown.

**Acceptance Scenarios**:

1. **Given** a logged-in player has completed 2 or more games, **When** the main menu screen is displayed, **Then** a small progression graph is visible showing game scores over time in chronological order (oldest to newest).
2. **Given** a logged-in player has completed only 1 game, **When** the main menu screen is displayed, **Then** no progression graph is shown (a single point does not form a meaningful trend).
3. **Given** a logged-in player has completed 0 games, **When** the main menu screen is displayed, **Then** no progression graph is shown.
4. **Given** a player has a long game history (e.g., 50+ games), **When** the progression graph is displayed, **Then** it shows the full history without truncation, scaled to fit the available space.

---

### Edge Cases

- What happens when a player's game history is migrated from the old format (which only stored `totalScore` and `gamesPlayed`)? The system reconstructs a single synthetic historical game record using the existing `totalScore` and `gamesPlayed` to preserve a baseline, and all future games are stored individually.
- What happens when a player has exactly 10 games? The average includes all 10 — the same as the "last 10" calculation.
- What happens when a player has exactly 5 games? The "Recent High Scores" list shows all 5, which is the full list.
- What happens when multiple games share the same score in the recent high scores? All are displayed; ties are broken by most recent game first (top of the list among tied scores).
- What happens when a player clears all profiles? All game history is deleted along with the profiles, and the progression graph and recent scores sections are removed.
- What happens when game history storage grows very large (e.g., hundreds of games)? Per-player game history is capped at the most recent 100 games. Older records are discarded on save. This keeps storage size manageable while preserving enough history for a meaningful progression graph.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST store individual game scores for each player, recording the score and completion timestamp for every completed game.
- **FR-002**: Per-player game history MUST be capped at the most recent 100 game records. When a new game is completed and the cap is reached, the oldest record MUST be discarded.
- **FR-003**: The player profile average score (displayed on the home screen player card) MUST be computed as the arithmetic mean of the player's last 10 completed game scores. If the player has fewer than 10 games, the average MUST be computed from all available game scores.
- **FR-004**: The player profile card MUST display "–" (or equivalent placeholder) as the average when the player has completed 0 games.
- **FR-005**: When a player is migrated from the old data format (which stored only `totalScore` and `gamesPlayed` without individual game records), the system MUST create a single synthetic game record using the average score (`totalScore / gamesPlayed`) to preserve a historical baseline. The `totalScore` and `gamesPlayed` fields may be retained or removed at implementation discretion.
- **FR-006**: The main menu screen (pre-game screen shown after a player logs in) MUST display a "Recent High Scores" section showing the scores from the player's last 5 completed games, sorted from highest to lowest score.
- **FR-007**: When scores in the "Recent High Scores" list are tied, they MUST be ordered by most recent game first.
- **FR-008**: When a player has fewer than 5 completed games (but at least 1), the "Recent High Scores" section MUST show all available game scores, sorted highest to lowest.
- **FR-009**: When a player has 0 completed games, the main menu screen MUST NOT display the "Recent High Scores" section. Instead, a friendly message MUST encourage the player to play their first game.
- **FR-010**: The main menu screen MUST display a small score progression graph showing the player's scores over their full game history, in chronological order (oldest to newest).
- **FR-011**: The progression graph MUST only be shown when the player has completed 2 or more games.
- **FR-012**: The progression graph MUST scale to fit the available space regardless of the number of data points (up to the 100-game cap).
- **FR-013**: After a game is completed, the new game score MUST be appended to the player's game history before the player returns to the main menu or home screen, so that the recent scores, average, and graph reflect the latest result immediately.
- **FR-014**: The "Recent High Scores" section MUST be visually styled in a "high score" aesthetic — numbered ranks (1st, 2nd, 3rd, etc.), with the top score visually emphasized.

### Key Entities

- **Game Record**: An individual completed game result consisting of the score achieved and the timestamp of completion. Stored as part of the player's game history.
- **Game History**: An ordered list of Game Records for a player, capped at 100 entries, stored chronologically (newest last). Used to compute the recent average, the recent high scores list, and the progression graph.
- **Player Profile**: Extended from the existing player entity to include game history. The average score displayed on the profile card is now derived from game history rather than stored as a cumulative total.
- **Recent High Scores**: A derived view of the last 5 game records, sorted by score descending (ties broken by recency). Displayed on the main menu screen.
- **Progression Graph**: A visual representation of all game scores over time, rendered as a small chart on the main menu screen.

## Success Criteria

### Measurable Outcomes

- **SC-001**: The profile average score displayed on every player card reflects the last 10 games (or all games if fewer than 10), not the all-time cumulative average.
- **SC-002**: The main menu screen displays the last 5 game scores in ranked order within 1 second of page load.
- **SC-003**: The progression graph renders the full game history (up to 100 games) without truncation and is visible on the main menu screen.
- **SC-004**: Players with existing profiles (old data format) see a valid average and at least one synthetic historical record after migration — no data loss or blank profiles.
- **SC-005**: 100% of main menu screen content (recent high scores, progression graph, start button) is visible without vertical scrolling on a 320×640 CSS pixel viewport (per Constitution III; 360×640 market baseline) for players with up to 5 recent scores and up to 100 historical games.
- **SC-006**: Individual game scores are stored within 1 second of game completion, and the main menu updates immediately upon navigation.

## Assumptions

- **Main menu screen**: The "main menu screen" refers to the pre-game screen shown after a player selects their profile and before they start a new game (currently the `not-started` state on the gameplay page). This screen currently shows "Ready to play?" with a Start button, and will be enhanced with scores and a graph.
- **Score value**: A "game score" is the total points earned in a single 10-round game session, as calculated by the existing scoring system (time-based tiers, penalty for incorrect answers).
- **Progression graph scope**: The graph shows raw game scores over time (one point per game). It does not show rolling averages, percentiles, or other derived metrics. The visual style (line chart, bar chart, etc.) will be determined during planning.
- **History cap**: 100 games per player is sufficient for a meaningful progression graph while keeping browser storage usage reasonable. At ~50 bytes per record, 100 records ≈ 5KB per player.
- **High score styling**: "High score style" means a numbered, ranked list with visual emphasis on the top score. The exact visual treatment (colors, animations, typography) will be determined during planning.
- **No cross-device sync**: Game history is stored in local browser storage only. There is no server-side persistence or cross-device synchronization.
- **Existing average on home screen cards**: The average that appears on player cards on the home screen (from feature 003) will use the new "last 10" average calculation. This is a change in how the average is computed, not a change in where it is displayed.
