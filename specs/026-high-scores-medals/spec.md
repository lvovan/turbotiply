# Feature Specification: High Scores Medals — Best of Last 10 Games

**Feature Branch**: `026-high-scores-medals`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "The high scores table (medals) in the Results screen should show the best 3 scores of the last 10 games. If there are fewer than 10 games, it should display the best 3 scores available so far."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Best 3 Scores from Last 10 Games (Priority: P1)

A player finishes a game and returns to the pre-game screen. The high scores table (medals section) shows the best 3 scores selected from the player's last 10 completed play-mode games, ranked from highest to lowest. Each score is displayed with its corresponding medal emoji (🥇, 🥈, 🥉).

**Why this priority**: This is the core of the feature — changing the scoring window from which high scores are derived. It directly impacts what the player sees and the motivational feedback loop.

**Independent Test**: Can be fully tested by completing several play-mode games and verifying that the medals section reflects the top 3 scores drawn from the most recent 10-game window.

**Acceptance Scenarios**:

1. **Given** a player with 10 or more play-mode games in history, **When** they view the high scores medals section, **Then** the display shows the 3 highest scores from the 10 most recent play-mode games, ranked highest first.
2. **Given** a player with exactly 10 play-mode games with scores [12, 30, 25, 40, 18, 35, 22, 45, 10, 28], **When** they view the medals section, **Then** the medals show 🥇 45, 🥈 40, 🥉 35.
3. **Given** a player with 15 play-mode games, **When** they view the medals section, **Then** only the 10 most recent games are considered (older games are excluded from the ranking window).

---

### User Story 2 — Graceful Display with Fewer Than 10 Games (Priority: P2)

A new or infrequent player who has fewer than 10 play-mode games still sees a meaningful medals display. The system uses all available play-mode games to determine the best 3 scores, or fewer medals if fewer than 3 games exist.

**Why this priority**: New players need immediate feedback and motivation. Without graceful handling of sparse history, the feature would feel broken for newcomers.

**Independent Test**: Can be tested by creating a fresh player, completing 1–9 games, and validating the medals section at each step.

**Acceptance Scenarios**:

1. **Given** a player with 0 play-mode games, **When** they view the medals section, **Then** an empty/encouragement state is shown (no medals displayed).
2. **Given** a player with 1 play-mode game (score 30), **When** they view the medals section, **Then** only 🥇 30 is displayed.
3. **Given** a player with 2 play-mode games (scores 20, 35), **When** they view the medals section, **Then** 🥇 35 and 🥈 20 are displayed.
4. **Given** a player with 5 play-mode games, **When** they view the medals section, **Then** the best 3 of those 5 games are displayed with medals.

---

### User Story 3 — Tie-Breaking in Medal Rankings (Priority: P3)

When two or more games within the 10-game window have the same score, the more recent game ranks higher. This ensures consistent, predictable ordering.

**Why this priority**: Ties will occur naturally and the display must remain deterministic and intuitive.

**Independent Test**: Can be tested by completing multiple games with the same score and verifying the more recent result takes the higher medal.

**Acceptance Scenarios**:

1. **Given** a player whose last 10 games include two games with a score of 40 (one completed yesterday, one today), **When** they view the medals section, **Then** today's game of 40 is ranked above yesterday's game of 40.
2. **Given** a player whose last 10 games all have identical scores, **When** they view the medals section, **Then** the 3 most recent games hold the medal positions.

---

### Edge Cases

- **Zero games played**: Empty/encouragement state shown; no medals or scores rendered.
- **Exactly 3 games played**: All 3 games receive medals (since 3 ≤ 10 and we want the best 3).
- **All scores are zero**: Three medals are still shown with score 0 for each.
- **Practice/improve-mode games in history**: Only play-mode games count toward the 10-game window; improve-mode games are excluded entirely.
- **Scores with negative values**: Negative scores (from penalties) are valid and rank below zero; medals still display them accurately.
- **New game just completed**: The newly saved game is included in the 10-game window immediately, and medals update accordingly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The medals section MUST select high scores from a sliding window of the player's most recent 10 play-mode games.
- **FR-002**: The medals section MUST display up to 3 scores from that window, ranked from highest to lowest.
- **FR-003**: When fewer than 10 play-mode games exist, the system MUST use all available play-mode games as the window.
- **FR-004**: When fewer than 3 play-mode games exist, the system MUST display only as many medals as there are games (1 medal for 1 game, 2 medals for 2 games).
- **FR-005**: When 0 play-mode games exist, the system MUST display an empty/encouragement state with no medals.
- **FR-006**: Tie-breaking MUST favor the more recently completed game (most recent ranks higher).
- **FR-007**: Only play-mode games MUST be included in the window; improve/practice-mode games MUST be excluded.
- **FR-008**: The medals display MUST update immediately after a new game is completed and saved, reflecting the updated 10-game window.
- **FR-009**: Medal emojis (🥇, 🥈, 🥉) MUST correspond to 1st, 2nd, and 3rd place respectively.

### Key Entities

- **Game Record**: A completed play-mode game with a final score and completion timestamp. The 10 most recent records form the scoring window.
- **Scoring Window**: The sliding set of the last 10 play-mode game records for a given player. If fewer than 10 exist, includes all available records.
- **Medal Ranking**: An ordered list of up to 3 scores derived from the scoring window, sorted by score descending with recency as tiebreaker.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The medals section correctly displays the top 3 scores from the last 10 play-mode games in 100% of tested scenarios.
- **SC-002**: Players with fewer than 10 games see the correct number of medals (matching available game count, up to 3) without errors or empty gaps.
- **SC-003**: After completing a new game, the medals section reflects the updated window within the same screen navigation (no refresh or restart required).
- **SC-004**: Improve/practice-mode games never appear in the medals ranking.
- **SC-005**: Tied scores are consistently ordered by recency, with no random or unstable ordering.

## Assumptions

- The existing 100-game history cap per player is sufficient; no changes to the storage cap are required.
- The medals section already exists on the pre-game screen with medal emojis; this feature changes only the data selection logic (window size and ranking), not the visual design.
- The "last 10 games" window is based on chronological order of completion (most recent 10), not calendar time.
- Performance is not a concern given the small data set (max 100 records, window of 10).
