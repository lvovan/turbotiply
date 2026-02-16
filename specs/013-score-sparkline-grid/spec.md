# Feature Specification: Score Sparkline Grid

**Feature Branch**: `013-score-sparkline-grid`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "The sparkline used to track improvement should always show a grid (X-axis: last 10 games, Y-axis: scores). If 10 games have not been played yet, the sparkline will just be shorter. Ensure there are some faded out horizontal lines to easily visualize and compare, while the axis lines must be clear. Do not make the chart too high as we still want the home page to fit on a standard smartphone screen without scrolling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Grid-backed sparkline with full history (Priority: P1)

A returning player who has completed 10 or more games navigates to the pre-game screen. They see their score progression chart displaying the last 10 game scores plotted on a clear grid. The X-axis marks each of the 10 games, the Y-axis shows score values, and faded horizontal guide lines make it easy to visually compare scores across games. The axis lines (X and Y) are clearly visible and distinct from the guide lines. The chart is compact enough that the entire pre-game screen still fits on a standard smartphone without scrolling.

**Why this priority**: This is the core use case — the grid enhances readability of the existing sparkline, enabling players to quickly gauge their improvement trend at a glance.

**Independent Test**: Can be tested by creating a player with 10+ completed games, navigating to the pre-game screen, and verifying that the chart shows exactly 10 data points on a visible grid with axis lines and faded horizontal guide lines.

**Acceptance Scenarios**:

1. **Given** a player with 15 completed play-mode games, **When** they view the pre-game screen, **Then** the sparkline displays exactly the 10 most recent game scores plotted on a grid.
2. **Given** a player with 10+ games, **When** they view the sparkline, **Then** the X-axis and Y-axis lines are clearly visible and visually distinct from the faded horizontal guide lines.
3. **Given** the pre-game screen is displayed on a standard smartphone (viewport height ~667px), **When** the sparkline is rendered, **Then** the entire pre-game screen content (high scores, sparkline, mode selector) is visible without vertical scrolling.

---

### User Story 2 — Shortened sparkline for fewer than 10 games (Priority: P1)

A newer player who has completed between 2 and 9 games navigates to the pre-game screen. They see the sparkline chart displaying only the games they have played, making the chart visually shorter (narrower) than the full 10-game version. The grid, axes, and guide lines are still present, proportionally sized to the number of games played.

**Why this priority**: New players are the most likely to check their progress; the chart must look correct and meaningful even with limited data rather than showing empty placeholders.

**Independent Test**: Can be tested by creating a player with 3 completed games, navigating to the pre-game screen, and verifying the sparkline shows exactly 3 data points on a proportionally shorter grid.

**Acceptance Scenarios**:

1. **Given** a player with 4 completed play-mode games, **When** they view the pre-game screen, **Then** the sparkline displays exactly 4 data points and the chart width is proportionally shorter than the 10-game version.
2. **Given** a player with 2 completed play-mode games, **When** they view the pre-game screen, **Then** the sparkline is displayed (minimum viable chart with 2 points) with grid and axes visible.
3. **Given** a player with 9 completed play-mode games, **When** they view the pre-game screen, **Then** the sparkline displays 9 data points and the chart is slightly narrower than the full 10-game version.

---

### User Story 3 — Faded horizontal guide lines for score comparison (Priority: P2)

A player views the sparkline and uses the faded horizontal guide lines to visually estimate and compare their scores across games. The guide lines are evenly spaced along the Y-axis and are visually subdued (faded/low-contrast) so they guide the eye without competing with the actual score line or axis lines.

**Why this priority**: The guide lines are the primary visual enhancement that makes score comparison intuitive — without them the grid is less useful, but the chart is still functional with just axes.

**Independent Test**: Can be tested by viewing the sparkline and confirming that horizontal guide lines are visible behind the score line, are evenly spaced, and are visually lighter/more subdued than the axis lines and the data line.

**Acceptance Scenarios**:

1. **Given** a player with game history, **When** they view the sparkline, **Then** horizontal guide lines are displayed at evenly spaced score intervals across the chart area.
2. **Given** the sparkline is rendered, **When** comparing the visual appearance, **Then** the guide lines are noticeably more faded (lower contrast/opacity) than the X-axis line, Y-axis line, and the data line.
3. **Given** the sparkline is rendered, **When** a user traces a score data point horizontally, **Then** the nearest guide line provides a visual reference for estimating the score value.

---

### Edge Cases

- What happens when a player has fewer than 2 games? The sparkline is not displayed at all (current behavior preserved — minimum 2 data points required).
- What happens when all scores in the last 10 games are identical? The chart displays a flat horizontal line with guide lines still visible above and below.
- What happens when scores span a very wide range (e.g., -20 to 50)? The Y-axis is fixed at 0–50; negative scores are plotted below the X-axis or clipped to the bottom of the chart area.
- What happens when the player has only improve-mode games? Only play-mode games are shown in the sparkline (consistent with existing filtering behavior).
- What happens on very narrow screens (< 320px width)? The chart scales down proportionally without losing axis or guide line visibility.

## Clarifications

### Session 2026-02-16

- Q: Should the Y-axis guide lines have numeric score labels? → A: Yes — small numeric labels at each guide line position on the Y-axis.
- Q: Should the Y-axis use a fixed or dynamic score range? → A: Fixed range (0–50) so charts are visually comparable across sessions.
- Q: Should the X-axis have tick marks or labels at each game position? → A: Small tick marks at each game position, no numeric labels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sparkline MUST display a grid consisting of a clear X-axis line (horizontal, at the bottom) and a clear Y-axis line (vertical, on the left).
- **FR-002**: The X-axis MUST represent the last 10 completed play-mode games, with each game occupying an equal interval along the axis.
- **FR-003**: If the player has completed fewer than 10 play-mode games (but at least 2), the sparkline MUST display only the available games, making the chart proportionally narrower.
- **FR-004**: The Y-axis MUST use a fixed range of 0–50, providing a consistent scale across all sessions so charts are always visually comparable.
- **FR-005**: The chart MUST display faded (low-opacity) horizontal guide lines at evenly spaced intervals along the Y-axis to aid visual score comparison. Each guide line MUST have a small numeric score label displayed on the Y-axis.
- **FR-006**: The guide lines MUST be visually distinct from the axis lines — they must appear lighter/more transparent than the axis lines.
- **FR-007**: The axis lines (X and Y) MUST be visually prominent and clearly distinguishable from guide lines and the data line.
- **FR-008**: The sparkline MUST NOT be displayed when the player has fewer than 2 completed play-mode games.
- **FR-009**: The chart height MUST be compact enough that the entire pre-game screen (including high scores, sparkline, and mode selector) fits on a standard smartphone screen (viewport ~667px height) without vertical scrolling.
- **FR-010**: The chart MUST continue to display the score progression as a connected line across the data points, as it does today.
- **FR-011**: The sparkline MUST only count play-mode games (exclude improve-mode games), consistent with existing behavior.
- **FR-012**: The X-axis MUST display small tick marks at each game data-point position. No numeric labels are needed on the X-axis.

### Key Entities

- **Game Score Data Point**: A single score from a completed play-mode game, positioned chronologically on the X-axis. Derived from the player's existing game history.
- **Grid**: The visual framework of the chart consisting of axis lines and guide lines. The grid adapts to the number of available data points (2–10) and the score range.

## Assumptions

- The existing minimum of 2 data points to show the sparkline is the correct threshold and should be preserved.
- "Standard smartphone screen" refers to a viewport height of approximately 667px (iPhone SE / iPhone 8 size), which is a common baseline for mobile-first design.
- Guide lines should be spaced at round score intervals (e.g., every 5 or 10 points) rather than arbitrary divisions, to make visual estimation easier. The exact interval may vary based on the score range.
- The chart replaces the existing bare sparkline — it is an enhancement, not an additional separate component.
- The Y-axis uses a fixed 0–50 range matching the game's theoretical max score, so no dynamic margin is needed. Negative scores (possible but rare) may be clipped to 0 on the chart.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sparkline renders for players with 10+ games display exactly 10 data points on a gridded chart with visible axis lines and guide lines.
- **SC-002**: 100% of sparkline renders for players with 2–9 games display the correct number of data points with a proportionally shorter chart width.
- **SC-003**: The pre-game screen content (high scores, sparkline, mode selector) fits within a 667px-tall viewport without vertical scrolling.
- **SC-004**: Users can visually distinguish axis lines from guide lines — axis lines appear at least twice as prominent as guide lines.
- **SC-005**: The sparkline is never displayed for players with fewer than 2 completed play-mode games.
