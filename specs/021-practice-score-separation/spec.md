# Feature Specification: Practice Score Separation

**Feature Branch**: `021-practice-score-separation`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "Scores in Practice (Improve) mode should not be counted in the High Scores and the sparkline. High Scores and sparkline should only take into account Normal play. Tricky numbers stats are determined in both Normal and Practice modes. On the main menu, the Improve button sub text should only list the 3 most challenging tricky numbers."

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

### User Story 1 — High Scores Exclude Practice Games (Priority: P1)

A returning player has been playing both Play and Improve (Practice) mode games. When they view the main menu screen, the "Recent High Scores" section displays only scores from Play mode games. Any games completed in Improve mode are not listed in the high scores, ensuring the leaderboard reflects competitive Normal play performance only.

**Why this priority**: This is the most visible change — the high scores list is front and center on the main menu. If Practice scores pollute the high score list, it undermines the competitive integrity of the scores and confuses the player about their true performance in Normal mode.

**Independent Test**: Complete 3 Play games and 2 Improve games. Verify the Recent High Scores section lists only the 3 Play game scores. Complete 2 more Play games and verify the list shows the 5 most recent Play scores, still excluding Improve games.

**Acceptance Scenarios**:

1. **Given** a player has completed 5 Play games and 3 Improve games, **When** the main menu screen is displayed, **Then** the "Recent High Scores" section shows scores from only the 5 Play games (sorted highest to lowest), with no Improve game scores present.
2. **Given** a player has completed 7 Play games and 4 Improve games, **When** the main menu screen is displayed, **Then** the "Recent High Scores" section shows the scores from the 5 most recent Play games only, sorted highest to lowest.
3. **Given** a player has completed 0 Play games but 3 Improve games, **When** the main menu screen is displayed, **Then** the "Recent High Scores" section is not shown (or shows the friendly empty-state message), because there are no qualifying Play game scores.
4. **Given** a player completes a new Play game, **When** they return to the main menu, **Then** the high scores list updates to include the new Play game score and continues to exclude all Improve game scores.

---

### User Story 2 — Sparkline Excludes Practice Games (Priority: P1)

A player views the score progression sparkline on the main menu. The sparkline chart shows data points only from Play mode games. Improve mode games are not plotted on the chart, so the progression trend reflects Normal play skill development over time.

**Why this priority**: Equal to Story 1 because the sparkline is the key visual indicator of player improvement. Including Practice scores would distort the trend line and give a misleading picture of progress.

**Independent Test**: Complete 4 Play games and 3 Improve games. Verify the sparkline shows exactly 4 data points. Complete 6 more Play games and verify the sparkline shows the 10 most recent Play games (not interleaved with Improve games).

**Acceptance Scenarios**:

1. **Given** a player has completed 6 Play games and 4 Improve games, **When** the sparkline is displayed, **Then** it shows exactly 6 data points corresponding to the 6 Play games in chronological order.
2. **Given** a player has completed 12 Play games and 5 Improve games, **When** the sparkline is displayed, **Then** it shows the 10 most recent Play game scores only (no Improve games), in chronological order.
3. **Given** a player has completed 1 Play game and 5 Improve games, **When** the main menu is displayed, **Then** the sparkline is not shown because there are fewer than 2 Play mode data points.
4. **Given** a player has completed 0 Play games but 10 Improve games, **When** the main menu is displayed, **Then** the sparkline is not shown.

---

### User Story 3 — Tricky Numbers Derived from Both Modes (Priority: P1)

The system continues to analyze both Play and Improve game records when identifying which multiplication pairs the player finds challenging. A mistake made during an Improve game still counts toward the tricky number analysis, and similarly, a mistake during a Play game counts as well. This ensures that the Improve mode targets the player's actual weaknesses regardless of which mode revealed them.

**Why this priority**: The tricky number analysis is the foundation of Improve mode's value. If Improve games were excluded from the analysis, players would lose feedback on whether they are actually improving on their weak spots during practice.

**Independent Test**: Complete a Play game with mistakes on 7×8. Then complete an Improve game with mistakes on 6×9. Verify that the tricky numbers list reflects weaknesses from both games.

**Acceptance Scenarios**:

1. **Given** a player's last 10 games include 6 Play games and 4 Improve games with per-round data, **When** the system identifies tricky numbers, **Then** it analyzes all 10 games regardless of mode.
2. **Given** a player made mistakes on 7×8 in a Play game and on 6×9 in an Improve game, **When** the system ranks tricky pairs, **Then** both 7×8 and 6×9 appear in the tricky pair analysis with their respective mistake counts combined.
3. **Given** a player has only Improve game history (no Play games yet), **When** the system identifies tricky numbers, **Then** the Improve game records are still analyzed and tricky numbers are determined from those games.

---

### User Story 4 — Improve Button Shows Top 3 Tricky Numbers (Priority: P2)

On the main menu screen, the "Improve" button's descriptor text shows only the 3 most challenging tricky numbers (the 3 individual factor numbers from the pairs where the player has the most trouble). This provides a focused, glanceable summary rather than a potentially long list of numbers.

**Why this priority**: This is a UI refinement that improves clarity and readability. It depends on the tricky number analysis (Story 3) being correct, but is a simpler change in the display layer.

**Independent Test**: Create a player whose tricky pairs produce 6 unique factor numbers. Verify the Improve button descriptor shows only the 3 numbers corresponding to the most challenging pairs.

**Acceptance Scenarios**:

1. **Given** a player's tricky pairs are 7×8 (5 mistakes), 6×9 (3 mistakes), and 4×7 (2 mistakes), **When** the Improve button descriptor is rendered, **Then** it shows "Level up your tricky numbers: 7, 8, 9" — the 3 individual factors with the highest aggregate mistake counts (7→7, 8→5, 9→3), sorted ascending.
2. **Given** a player has only 2 unique tricky factor numbers, **When** the Improve button descriptor is rendered, **Then** it shows both numbers (e.g., "Level up your tricky numbers: 7, 8") without padding to 3.
3. **Given** a player has only 1 unique tricky factor number, **When** the Improve button descriptor is rendered, **Then** it shows that single number (e.g., "Level up your tricky numbers: 7").
4. **Given** a player has 10 unique tricky factor numbers, **When** the Improve button descriptor is rendered, **Then** it shows only the top 3 numbers derived from the highest-ranked tricky pairs, sorted ascending.
5. **Given** two tricky pairs share the same mistake count, **When** determining the top 3 numbers, **Then** the tie is broken by average response time (slowest first), and the resulting top factor numbers are displayed.

---

### Edge Cases

- **All history is Improve games**: If a player has only completed Improve games, the high scores section and sparkline are empty/hidden (no Play games to display), but tricky numbers are still computed from the Improve game history and the Improve button is still shown.
- **Interleaved game modes**: If a player alternates between Play and Improve games, the high scores and sparkline pick out only the Play games from the history (ignoring Improve entries), while tricky number analysis uses all games in chronological order.
- **Profile average**: The profile average displayed on the player card continues to use only Play mode games (last 10 Play games), consistent with the existing score exclusion established in feature 012.
- **Fewer than 3 tricky factor numbers**: If the tricky pair analysis produces fewer than 3 unique factor numbers, the descriptor shows only the available numbers without an ellipsis or filler.
- **Exactly 3 tricky factor numbers**: All 3 are displayed in ascending order.
- **Player improves completely**: If a player has no tricky pairs (zero mistakes, or all pairs answered quickly), the Improve button is hidden as before — no change in this behavior.
- **Legacy game records**: Game records without per-round data are excluded from tricky number analysis but their scores (if Play mode) still appear in high scores and sparkline.
- **Cap interactions**: The 100-game history cap applies to all games (Play and Improve). When filtering for high scores or sparkline, only Play games within the stored history are considered.

## Clarifications

### Session 2026-02-17

- Q: How are the "top 3 tricky factor numbers" selected — by iterating ranked pairs and collecting factors, or by ranking each individual factor independently? → A: Rank each individual factor (2–12) by its total mistake count across all tricky pairs containing it; take the top 3. Ties broken by average response time (slowest first).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Recent High Scores" section on the main menu MUST display scores from Play mode games only. Improve mode game scores MUST be excluded from the high score list.
- **FR-002**: The high scores list MUST show the scores from the player's last 5 completed Play mode games, sorted from highest to lowest. If the player has fewer than 5 Play mode games (but at least 1), all available Play mode scores MUST be shown.
- **FR-003**: When the player has 0 completed Play mode games, the "Recent High Scores" section MUST NOT be displayed, regardless of how many Improve games have been completed.
- **FR-004**: The score progression sparkline MUST display data points from Play mode games only. Improve mode games MUST NOT appear as data points on the sparkline.
- **FR-005**: The sparkline MUST show up to the 10 most recent Play mode game scores in chronological order. If the player has fewer than 10 Play mode games, the sparkline MUST display only the available Play mode games (and remain hidden if fewer than 2 Play mode games exist).
- **FR-006**: The tricky number analysis MUST consider both Play mode and Improve mode game records when identifying challenging multiplication pairs.
- **FR-007**: The tricky number analysis MUST analyze up to the player's 10 most recent completed games (regardless of mode) that contain per-round data, consistent with the analysis window defined in feature 017.
- **FR-008**: The "Improve" button descriptor MUST display at most 3 tricky factor numbers, derived from the highest-ranked tricky pairs.
- **FR-009**: The tricky factor numbers in the Improve button descriptor MUST be determined by ranking each individual factor (2–12) by its total mistake count across all tricky pairs that contain it. The top 3 factors by aggregate mistake count MUST be selected, with ties broken by average response time (slowest first), and displayed sorted in ascending order.
- **FR-010**: When fewer than 3 unique tricky factor numbers exist, the descriptor MUST show only the available numbers without padding or placeholder text.
- **FR-011**: The profile average score displayed on the player card MUST be computed from Play mode games only (last 10 Play mode games), consistent with the existing score exclusion behavior.
- **FR-012**: Play mode behavior MUST remain completely unchanged — this feature only modifies how Improve mode results are filtered in score displays and how the tricky number descriptor is rendered.
- **FR-013**: Game records MUST continue to store the mode flag (Play vs. Improve) to enable filtering across all score displays and analytics.

### Key Entities

- **Play Mode Game Record**: A completed game record marked as Play mode. These records contribute to high scores, sparkline, profile average, and tricky number analysis.
- **Improve Mode Game Record**: A completed game record marked as Improve mode. These records contribute only to tricky number analysis and are excluded from high scores, sparkline, and profile average.
- **Tricky Factor Numbers (Top 3)**: The individual factor numbers (2–12) ranked by aggregate mistake count across all tricky pairs containing them, limited to the top 3, displayed in the Improve button descriptor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Recent High Scores list contains zero Improve mode game scores — 100% of displayed scores are from Play mode games.
- **SC-002**: The sparkline contains zero Improve mode data points — 100% of plotted scores are from Play mode games.
- **SC-003**: Tricky number analysis reflects mistakes and response times from both Play and Improve mode games, meaning an Improve game that reveals a weakness immediately influences the tricky numbers list.
- **SC-004**: The Improve button descriptor shows at most 3 factor numbers, corresponding to the player's most challenging tricky pairs.
- **SC-005**: Players who have completed only Improve games see no high scores or sparkline, but still see the Improve button with accurate tricky numbers.
- **SC-006**: The profile average score is computed exclusively from Play mode games, matching the high scores and sparkline filtering behavior.
- **SC-007**: All score filtering changes take effect immediately — after completing a new game, the main menu reflects the correct filtered data within 1 second of navigation.

## Assumptions

- The existing game record mode flag (Play vs. Improve) is already stored and reliable. No data migration is needed — this feature changes how existing data is filtered for display, not how it is stored.
- The "last 5 Play games" for high scores means the 5 most recent Play mode games within the player's game history (up to 100 records), skipping over any Improve game records in chronological order.
- The "last 10 Play games" for the sparkline uses the same filtering approach — the 10 most recent Play mode games within the stored history.
- The tricky number analysis window (up to 10 most recent games with per-round data, regardless of mode) is unchanged from feature 017. Only the display of tricky numbers in the Improve button descriptor is changing (from up to 8 numbers to at most 3).
- "Most challenging" tricky numbers means the factor numbers from the tricky pairs ranked highest by mistake count (with average response time as tiebreaker), as defined in feature 017.
- The selection of the "top 3 factor numbers" works as follows: rank each individual factor (2–12) by its total mistake count summed across all tricky pairs containing that factor, then take the top 3 factors. Ties are broken by average response time (slowest first). For example, if tricky pairs are 7×8 (5 mistakes), 6×9 (3 mistakes), and 4×7 (2 mistakes), then factor 7 has 7 aggregate mistakes (5+2), factor 8 has 5, factor 9 has 3, factor 6 has 3, factor 4 has 2 — yielding top 3: {7, 8, 9} (with 9 vs 6 tie broken by response time).
- The profile average calculation (last 10 Play mode games) was already established as Play-only in feature 012. This feature formalizes and documents that behavior consistently alongside the high scores and sparkline filtering.
