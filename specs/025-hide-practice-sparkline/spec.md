# Feature Specification: Hide Sparkline in Practice/Improve Mode

**Feature Branch**: `025-hide-practice-sparkline`  
**Created**: 2026-02-18  
**Status**: Draft  
**Input**: User description: "Do not display the sparkline on the result screen of Practice/Improve mode. The sparkline should only appear in the context of Normal games."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sparkline hidden on Improve mode result screen (Priority: P1)

A player completes a Practice/Improve mode game. On the result screen, the score progression sparkline is not displayed. The player sees their round results and score summary without any sparkline chart, keeping the focus on the practice feedback (correct/incorrect pairs).

**Why this priority**: This is the core behavior change requested. The sparkline tracks play-mode performance trends and is misleading or irrelevant when shown after an improve-mode session.

**Independent Test**: Complete a game in Improve mode and verify the result screen does not contain a sparkline chart.

**Acceptance Scenarios**:

1. **Given** a player has just completed an Improve mode game, **When** the result screen is displayed, **Then** no sparkline chart appears on the screen.
2. **Given** a player has played multiple Improve mode games, **When** the result screen is displayed after an Improve mode game, **Then** no sparkline chart appears regardless of how many previous games have been played.

---

### User Story 2 - Sparkline still shown on Normal mode result screen (Priority: P1)

A player completes a Normal (play) mode game. On the result screen, the score progression sparkline is displayed as before, showing the trend of their last games. This ensures no regression in the existing Normal mode experience.

**Why this priority**: Equally critical — the sparkline must continue to work correctly for Normal games. A regression here would lose existing functionality.

**Independent Test**: Complete a game in Normal mode with at least 2 prior play-mode games in history and verify the sparkline appears on the result screen.

**Acceptance Scenarios**:

1. **Given** a player has completed at least 2 Normal mode games previously, **When** the player completes another Normal mode game, **Then** the sparkline is displayed on the result screen showing score progression.
2. **Given** a player has fewer than 2 Normal mode games in history, **When** the player completes a Normal mode game, **Then** the sparkline is not displayed (existing minimum data threshold behavior is preserved).

---

### User Story 3 - Sparkline on pre-game screen unaffected (Priority: P2)

The sparkline displayed on the pre-game/home screen continues to work exactly as before. This change only affects the result screen.

**Why this priority**: Important for ensuring no side effects, but lower priority since this screen already only shows play-mode data.

**Independent Test**: Navigate to the pre-game screen for a player with at least 2 Normal mode games and verify the sparkline is visible.

**Acceptance Scenarios**:

1. **Given** a player has at least 2 Normal mode games in history, **When** the pre-game screen is displayed, **Then** the sparkline appears showing their play-mode score progression.

---

### Edge Cases

- What happens when a player switches between Normal and Improve mode across games? The sparkline should appear on the result screen only after Normal mode games, regardless of what mode was played previously.
- What happens when a player has no Normal mode game history and completes an Improve mode game? No sparkline should appear (both because the mode is Improve and because there is insufficient play-mode data).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST NOT display the score progression sparkline on the result screen when the completed game was in Improve mode.
- **FR-002**: The system MUST continue to display the score progression sparkline on the result screen when the completed game was in Normal (play) mode, provided sufficient game history exists (minimum 2 play-mode games).
- **FR-003**: The system MUST NOT alter sparkline behavior on the pre-game/home screen — it should continue to display based on play-mode history regardless of this change.
- **FR-004**: The system MUST preserve all other result screen content for Improve mode (round results, score, incorrect pairs, navigation buttons).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Improve mode result screens display zero sparkline charts.
- **SC-002**: 100% of Normal mode result screens with sufficient history (≥2 play-mode games) continue to display the sparkline chart.
- **SC-003**: The pre-game screen sparkline behavior is unchanged — no visual or behavioral difference before and after this change.
- **SC-004**: Users completing Improve mode games see a cleaner result screen focused on practice feedback without unrelated performance trends.

## Assumptions

- "Practice mode" and "Improve mode" refer to the same game mode (internally called `improve`).
- "Normal games" refers to the standard play mode (internally called `play`).
- The sparkline's existing minimum-data-point threshold (2 games) remains unchanged.
- No new UI elements replace the sparkline in Improve mode — the space is simply not occupied.
