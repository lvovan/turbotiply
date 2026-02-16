# Feature Specification: Improve Game Mode

**Feature Branch**: `012-improve-game-mode`  
**Created**: 2025-07-22  
**Status**: Draft  
**Input**: User description: "Add a new game mode, accessible from the main menu, called 'Improve' (the original mode is now called 'Play'). The 'Improve' game mode looks at the up to 10 last games, identifies which numbers the player has found the most challenging (mistakes/replayed, longer response times) and creates a game composed of rounds containing mostly these challenging numbers. The 'Improve' games *do not* count towards the player's high scores and the profile average. The 'Improve' button has a small descriptor text underneath saying 'Level up your tricky numbers: {numbers to practice}'. The 'Play' button has a small descriptor text underneath saying 'Go for a high score!'."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Per-Round History Recording (Priority: P1)

Every time a player completes a game, the system records detailed per-round data — which multiplication pair was asked, whether the answer was correct, and how long the player took to respond. This data is stored as part of the player's game history so that future analysis can identify challenging numbers.

**Why this priority**: Without per-round data, the Improve mode cannot determine which numbers are challenging. This is the foundational data layer that all other stories depend on.

**Independent Test**: Play a game to completion, then verify the per-round data (factors, correctness, response time) is persisted alongside the existing game record.

**Acceptance Scenarios**:

1. **Given** a player completes a game, **When** the game results are saved, **Then** each round's multiplication pair (both factors), correctness, and response time in milliseconds are persisted alongside the game score.
2. **Given** a player has game history from before this feature, **When** the system loads that history, **Then** old records without per-round data are treated as having no round detail (graceful degradation — they are simply excluded from Improve analysis).
3. **Given** a player has played more than 100 games, **When** a new game completes, **Then** the oldest game record (including its round data) is removed to stay within the 100-game history cap.

---

### User Story 2 — Challenging Number Identification (Priority: P1)

The system analyzes a player's most recent completed game to identify which multiplication pairs the player finds most challenging. A pair is considered challenging if the player answered it incorrectly, needed to replay it, or took a notably long time to answer. The result is a ranked list of difficult factor pairs used to populate Improve mode rounds and to display the "tricky numbers" preview. The analysis uses only the single most recent game, regardless of whether it was a Play or Improve game.

**Why this priority**: This analysis algorithm is the core logic of the Improve feature. Without it, there is nothing to base the Improve game on.

**Independent Test**: Given a player with completed games containing a mix of fast-correct, slow-correct, and incorrect rounds, the system produces a ranked list of challenging multiplication pairs ordered by difficulty.

**Acceptance Scenarios**:

1. **Given** a player with at least one completed game containing per-round data, **When** the system analyzes their history, **Then** it considers the single most recent completed game (Play or Improve) and produces a list of challenging multiplication pairs.
2. **Given** a player answered 7 × 8 incorrectly AND took ≥ 1.5× the game's average response time on that pair, **When** the system ranks challenging pairs, **Then** 7 × 8 appears on the tricky list because it meets both signals.
3. **Given** a player answered 6 × 9 correctly but took ≥ 1.5× the game's average response time, **When** the system evaluates that pair, **Then** 6 × 9 does NOT appear on the tricky list because it only meets 1 signal (slow but correct).
4. **Given** a player answered 4 × 7 incorrectly but responded quickly (below 1.5× average), **When** the system evaluates that pair, **Then** 4 × 7 does NOT appear on the tricky list because it only meets 1 signal (incorrect but fast).
5. **Given** a player answered all questions correctly and quickly across the most recent game, **When** the system analyzes their history, **Then** the challenging pairs list is empty (no numbers to practice).

---

### User Story 3 — Main Menu with Play and Improve Modes (Priority: P1)

After selecting their profile, the player sees the game screen with two distinct action choices: "Play" and "Improve". The "Play" button has a descriptor saying "Go for a high score!" and starts a standard game. The "Improve" button has a descriptor showing "Level up your tricky numbers: 3, 7, 8" (listing the specific numbers the player should practice) and starts a targeted practice game.

**Why this priority**: The dual-mode menu is the primary user-facing entry point for the feature. Without it, players cannot access Improve mode.

**Independent Test**: Select a player who has game history, verify both buttons appear with correct descriptors, and confirm each button starts the correct game mode.

**Acceptance Scenarios**:

1. **Given** a player with game history containing challenging numbers, **When** they reach the game screen, **Then** they see a "Play" button with descriptor "Go for a high score!" and an "Improve" button with descriptor "Level up your tricky numbers: 3, 7, 8" (showing the actual tricky factor numbers from their history).
2. **Given** a player with no game history (new player), **When** they reach the game screen, **Then** the "Improve" button is not shown because there is no data to analyze, and only the "Play" button is visible.
3. **Given** a player whose recent games show no challenging numbers (everything answered correctly and quickly), **When** they reach the game screen, **Then** the "Improve" button is not shown and an encouraging message is displayed, e.g., "You're nailing it! Keep playing to stay sharp."
4. **Given** a player has game history but none of the records contain per-round data (all pre-feature games), **When** they reach the game screen, **Then** the "Improve" button is not shown because there is insufficient data for analysis.

---

### User Story 4 — Improve Game with Targeted Rounds (Priority: P2)

When a player starts an Improve game, the system generates 10 rounds composed primarily of the player's challenging multiplication pairs. The game plays identically to a standard game (same round flow, timing, scoring display, feedback, and replay mechanics) but uses a formula set biased toward weak areas rather than random selection.

**Why this priority**: This is the core gameplay experience for Improve mode but depends on the analysis algorithm (Story 2) and menu integration (Story 3).

**Independent Test**: Start an Improve game for a player whose analysis shows 7 × 8, 6 × 9, and 4 × 7 as challenging. Verify most rounds feature these pairs, and the game flow (input, feedback, replay) works identically to a standard game.

**Acceptance Scenarios**:

1. **Given** a player's analysis identifies 5 challenging pairs, **When** an Improve game is started, **Then** the 10 rounds contain all 5 challenging pairs plus 5 additional pairs selected randomly from the remaining pool.
2. **Given** a player's analysis identifies 12 challenging pairs, **When** an Improve game is started, **Then** the 10 rounds contain the top 10 most challenging pairs (by difficulty rank).
3. **Given** a player's analysis identifies only 2 challenging pairs, **When** an Improve game is started, **Then** the 10 rounds contain those 2 challenging pairs plus 8 additional pairs selected randomly from the remaining pool.
4. **Given** an Improve game is in progress, **When** the player answers a round incorrectly, **Then** the round enters the replay queue just as in a standard game.
5. **Given** an Improve game is in progress, **When** the player views the game status, **Then** the score display is replaced with a "Practice" indicator and no score number is shown, making it clear they are in practice mode.

---

### User Story 5 — Improve Games Excluded from Scores (Priority: P2)

Improve games do not affect the player's high scores, profile average, total score, games played count, or progression graph. The game completion screen for Improve mode does not display scoring metrics in the same way as a standard game — instead it focuses on practice feedback.

**Why this priority**: Ensuring score isolation is essential for data integrity but is lower priority than the core gameplay loop.

**Independent Test**: Complete an Improve game, verify the player's total score, games played count, high scores, and profile average remain unchanged.

**Acceptance Scenarios**:

1. **Given** a player has a total score of 200 and 10 games played, **When** they complete an Improve game scoring 35 points, **Then** their total score remains 200 and games played remains 10.
2. **Given** a player completes an Improve game, **When** they view their recent high scores on the game screen, **Then** the Improve game does not appear in the list.
3. **Given** a player completes an Improve game, **When** they view their progression graph, **Then** the Improve game does not appear as a data point.
4. **Given** a player completes an Improve game, **When** the game completion screen is shown, **Then** it displays "You got X/10 right!" and lists the specific pairs that were still answered incorrectly.

---

### User Story 6 — Tricky Numbers Preview (Priority: P3)

The descriptor text beneath the "Improve" button shows the specific individual factor numbers that appear across the player's challenging pairs. These numbers are displayed in ascending numerical order, deduplicated, and limited to a reasonable count so the text doesn't overflow.

**Why this priority**: The preview descriptor is a polish feature that helps players understand what Improve mode will focus on. It depends on the analysis algorithm already working.

**Independent Test**: A player whose challenging pairs are 7 × 8, 6 × 9, and 4 × 7 should see the descriptor "Level up your tricky numbers: 4, 6, 7, 8, 9".

**Acceptance Scenarios**:

1. **Given** a player's challenging pairs are 7 × 8 and 6 × 9, **When** the Improve button descriptor is rendered, **Then** it shows "Level up your tricky numbers: 6, 7, 8, 9" (unique factors, sorted ascending).
2. **Given** a player's challenging pairs produce more than 8 unique factor numbers, **When** the descriptor is rendered, **Then** it shows the first 8 numbers followed by an ellipsis (e.g., "Level up your tricky numbers: 2, 3, 4, 5, 6, 7, 8, 9, …") to avoid text overflow.
3. **Given** the screen is narrow (mobile), **When** the descriptor is rendered, **Then** the text wraps gracefully without overflowing or being cut off.

---

### Edge Cases

- **First game ever**: A brand-new player with zero game history sees only the "Play" button. The Improve button appears only after they have completed at least one game with per-round data recorded.
- **All games pre-feature**: A returning player whose entire history predates the per-round data extension has no analyzable data. They see only "Play" until they complete a new game.
- **Perfect player**: A player who answers every question correctly and quickly in all recent games has no challenging pairs. The Improve button is hidden and an encouraging message is shown.
- **Only one challenging pair**: If analysis finds just one weak pair, Improve mode still generates 10 rounds — 1 targeted pair plus 9 random pairs.
- **Improve game data for future analysis**: Per-round data from Improve games IS recorded. Since the analysis uses only the single most recent game (regardless of mode), a successful Improve game immediately updates the tricky numbers list. Improve game records are clearly marked so they are excluded from score computations.
- **Player switches between modes**: A player can alternate freely between Play and Improve games. Each mode starts fresh and does not interfere with the other.
- **Very slow responses**: The target audience is children aged 6–12, some of whom may consistently take 4–5 seconds or more. The ≥ 1.5× threshold is relative to the player's own game average, so a consistently slow child is not penalised — only pairs where they are disproportionately slow AND incorrect are flagged.
- **Few qualifying pairs**: Because the 2-signal threshold is strict, it is possible that a game produces zero challenging pairs even if the player got some wrong (but answered quickly). In that case the Improve button is hidden, which is the intended behaviour — the player's mistakes were not indicative of deep difficulty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record per-round data for each completed game: the two multiplication factors, the player's answer correctness, and the response time in milliseconds.
- **FR-002**: The system MUST gracefully handle game history records that lack per-round data (pre-feature records), excluding them from Improve analysis without errors.
- **FR-003**: The system MUST analyze the player's single most recent completed game (that contains per-round data, regardless of Play or Improve mode) to produce a ranked list of challenging multiplication pairs.
- **FR-004**: A multiplication pair MUST be flagged as challenging only when it meets at least 2 distinct signals: (1) the pair was answered incorrectly / required replay, AND (2) the response time was ≥ 1.5× the player's average response time for that game. A single signal alone (only incorrect, or only slow) does NOT qualify a pair.
- **FR-005**: When ranking qualifying challenging pairs (those meeting the 2-signal threshold), pairs with longer response times relative to the game average MUST be ranked higher (i.e., more difficult).
- **FR-006**: The game screen MUST present two game mode options when the player has analyzable challenging numbers: "Play" (standard game) and "Improve" (targeted practice).
- **FR-007**: The "Play" button MUST display a descriptor text: "Go for a high score!"
- **FR-008**: The "Improve" button MUST display a descriptor text: "Level up your tricky numbers: {numbers}" where {numbers} is a comma-separated, ascending-sorted list of unique factor numbers from the player's challenging pairs.
- **FR-009**: The "Improve" button MUST NOT be shown when the player has no game history, no per-round data, or no challenging pairs identified.
- **FR-010**: When Improve is unavailable due to no challenging pairs (player is performing well), the system MUST display an encouraging message in place of the Improve button.
- **FR-011**: An Improve game MUST generate 10 rounds using the player's challenging pairs as the primary source, filling remaining slots with random pairs from the full pool.
- **FR-012**: An Improve game MUST use the same round flow, timing, feedback, and replay mechanics as a standard game.
- **FR-013**: During an Improve game, the score display area MUST be replaced with a "Practice" indicator. No score number is shown during Improve gameplay.
- **FR-014**: Improve game results MUST NOT be added to the player's total score, games played count, high score list, profile average, or progression graph.
- **FR-015**: Improve game per-round data MUST still be recorded, and the game record MUST be marked as an Improve game so it can be excluded from scoring aggregations. The most recent completed game (Play or Improve) feeds the challenging-pair analysis.
- **FR-016**: The Improve game completion screen MUST show "You got X/10 right!" (where X is the count of correctly answered primary rounds) and list the specific multiplication pairs that were still answered incorrectly, so the player knows what to keep practising.
- **FR-017**: The tricky numbers preview MUST display at most 8 unique factor numbers, followed by an ellipsis if there are more.
- **FR-018**: The entire feature MUST be accessible via keyboard and screen reader, following the application's accessibility-first constitution.
- **FR-019**: All new UI elements MUST be responsive and function correctly on both mobile and desktop screen sizes.

### Key Entities

- **Round Result**: A record of a single round within a game — captures the two multiplication factors, whether the answer was correct, and the response time. Stored as part of a game record.
- **Game Record (extended)**: An existing entity that stores a player's completed game. Extended to include an array of round results and a flag indicating whether the game was an Improve game or a standard Play game.
- **Challenging Pair**: A derived concept (not persisted) representing a multiplication pair that the player finds difficult, along with a difficulty score used for ranking. Produced by analysis of recent game records.
- **Tricky Numbers List**: A derived concept (not persisted) — the unique individual factor numbers extracted from the top challenging pairs, used for the Improve button's descriptor text.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players with game history can start an Improve game within 2 taps/clicks from the game screen (select Improve → game begins).
- **SC-002**: The Improve game correctly prioritizes challenging multiplication pairs — at least 50% of the 10 rounds feature pairs identified as challenging by the analysis.
- **SC-003**: Improve game results do not alter any player score metrics — total score, games played, high scores, and profile average remain unchanged after an Improve game.
- **SC-004**: The tricky numbers descriptor accurately reflects the player's weak areas as determined by their most recent games, updating after each new game is completed.
- **SC-005**: Players who repeatedly use Improve mode see their challenging pairs evolve over time as they master previously difficult numbers, demonstrating the feature's value in skill building.
- **SC-006**: All new UI elements meet accessibility standards (keyboard navigable, screen-reader compatible, sufficient color contrast).
- **SC-007**: The feature functions correctly for players with varying amounts of game history: 0 games (Improve hidden), 1+ games with per-round data (analysis based on most recent game).

## Clarifications

### Session 2026-02-16

- Q: How should "notably above average response time" be defined for flagging a pair as slow? → A: ≥ 1.5× the player's overall average response time across analyzed rounds.
- Q: Should Improve game rounds be included in the challenging-pair analysis that determines future Improve game content? → A: Only the most recent completed game feeds the analysis, regardless of whether it was a Play or Improve game.
- Q: How should an Improve game be visually distinguished from a standard Play game during gameplay? → A: Replace the score display with a "Practice" indicator — no score is shown during Improve games.
- Q: What is the minimum condition for a pair from the most recent game to appear on the tricky list? → A: Must meet at least 2 signals: incorrect/replayed AND slow (≥ 1.5× game average). A single signal alone does not qualify.
- Q: What should the Improve game completion screen show? → A: "You got X/10 right!" plus a list of pairs still answered incorrectly.

## Assumptions

- The analysis window of the single most recent completed game (regardless of Play or Improve mode) keeps the challenging-pair list highly responsive to the player's latest performance. This means the tricky numbers update after every game, reflecting immediate progress or newly discovered weaknesses.
- For the target audience (ages 6–12), "slow" response time is defined as ≥ 1.5× the player's own overall average response time across analyzed rounds. This is relative rather than absolute: a child who consistently takes 4 seconds is not struggling — a child who normally takes 2 seconds but takes 5 seconds on a specific pair is struggling.
- A pair is treated as unordered for analysis purposes: 7 × 8 and 8 × 7 are the same pair and their difficulty scores are combined.
- The maximum of 8 tricky numbers in the descriptor provides a good balance between informativeness and visual cleanliness. This can be adjusted based on user testing.
- The most recent completed game — whether Play or Improve — feeds the challenging-pair analysis. This means a player who nails all pairs in an Improve game will see the tricky list update immediately, rewarding practice with visible progress.
- The game completion screen for Improve mode shows "You got X/10 right!" and a list of pairs still answered incorrectly (e.g., "Keep practising: 7 × 8, 6 × 9"). No score number or high-score framing is shown.
