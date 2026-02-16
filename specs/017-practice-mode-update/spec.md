# Feature Specification: Practice Mode Update

**Feature Branch**: `017-practice-mode-update`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "Update to Practice mode. Apply the following changes to Practice mode only: (1) The rule for tricky numbers are the numbers for which there were the most mistakes in up to the last 10 games, if there were no errors, then the numbers for which, on average, have the slowest response times from the player (2) Do not show the animated countdown bar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Smarter Tricky-Number Identification (Priority: P1)

A player has been playing TurboTiply for a while and has accumulated several completed games. When they look at the Practice button on the home screen, they see tricky numbers that reflect their real weaknesses across their recent history — not just the last single game. The numbers listed are the ones they got wrong most often in their last 10 games. This gives the player meaningful, data-driven practice that targets persistent trouble spots rather than one-off mistakes.

**Why this priority**: This is the core value of the feature. Without smarter tricky-number selection, Practice mode cannot fulfil its purpose of helping players improve on their actual weaknesses.

**Independent Test**: Can be verified by playing several games with deliberate mistakes on specific numbers, then checking that the Practice button lists those numbers and that the generated practice rounds focus on them.

**Acceptance Scenarios**:

1. **Given** a player has completed 5 games and got 7 × 8 wrong in 4 of them, **When** the system identifies tricky numbers, **Then** the factors 7 and 8 appear in the tricky-number list and the practice rounds are biased toward pairs involving those factors.
2. **Given** a player has completed 10 games with no incorrect answers, **When** the system identifies tricky numbers, **Then** it selects the multiplication pairs for which the player has the slowest average response times across those 10 games.
3. **Given** a player has completed 3 games (fewer than 10), **When** the system identifies tricky numbers, **Then** it analyzes all 3 available games (not just the most recent one).
4. **Given** a player has completed 12 games, **When** the system identifies tricky numbers, **Then** only the 10 most recent games are considered.
5. **Given** a player has some pairs with mistakes and some pairs with no mistakes but slow times, **When** the system identifies tricky numbers, **Then** only the mistake-based pairs are used (slow-time fallback only applies when there are zero mistakes across all analyzed games).

---

### User Story 2 — No Countdown Bar in Practice Mode (Priority: P2)

A player starts a Practice session. During each round, they see the multiplication question and the answer input, but the animated countdown timer bar is not visible. This removes time pressure during practice, letting the player focus on accuracy and learning rather than speed.

**Why this priority**: This change is important for the learning experience but is simpler in scope and independent of the tricky-number logic.

**Independent Test**: Can be verified by starting a Practice game and confirming the countdown bar is absent, then starting a Play game and confirming the countdown bar is still present.

**Acceptance Scenarios**:

1. **Given** a player is in a Practice (Improve) mode round, **When** the round is active, **Then** the animated countdown bar is not displayed.
2. **Given** a player is in a Play mode round, **When** the round is active, **Then** the animated countdown bar is displayed as usual — this change does not affect Play mode.
3. **Given** a player is in Practice mode and the countdown bar is hidden, **When** the player submits an answer, **Then** the answer is still accepted and the round proceeds normally (response time is still recorded internally for analytics).
4. **Given** a player is in Practice mode, **When** they answer after more than 5 seconds, **Then** the system still accepts the answer — there is no time limit enforced.

---

### Edge Cases

- **No game history**: When a player has no completed games, Practice mode remains hidden as it does today — no change in behavior.
- **All games lack per-round data**: If the player's recent games were completed before per-round tracking was added (legacy records), the system falls back to the current behavior (analyzing only the most recent game that has per-round data, or showing no tricky numbers if none do).
- **Tied mistake counts**: When multiple pairs have the same number of mistakes, ties are broken by slowest average response time for those pairs. If still tied, any consistent ordering is acceptable.
- **Only one game with per-round data**: The system uses that single game, behaving identically to the current single-game analysis.
- **Mix of Play and Improve games**: Both Play and Improve game records from within the last 10 games are analyzed for tricky-number identification.
- **Countdown bar vs. internal timing**: Although the countdown bar is hidden in Practice mode, the system continues to measure `elapsedMs` per round so that response-time data is available for future tricky-number analysis.
- **Score display in Practice mode**: Score is already replaced with a "Practice" badge — this remains unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In Practice mode, the system MUST identify tricky numbers by analyzing up to the player's 10 most recent completed games that contain per-round data.
- **FR-002**: The system MUST rank multiplication pairs by the total number of incorrect answers across the analyzed games (highest mistake count = most tricky).
- **FR-003**: When the player has zero incorrect answers across all analyzed games, the system MUST fall back to ranking pairs by average response time (slowest average = most tricky).
- **FR-004**: When multiple pairs share the same mistake count, the system MUST use average response time as a tiebreaker (slowest first).
- **FR-005**: The system MUST consider both Play and Improve game records when identifying tricky numbers.
- **FR-006**: The tricky-number display on the home screen MUST continue to show up to 8 unique factor numbers, sorted ascending.
- **FR-007**: In Practice mode, the animated countdown timer bar MUST NOT be displayed.
- **FR-008**: In Play mode, the animated countdown timer bar MUST continue to be displayed — Play mode is unaffected by this change.
- **FR-009**: In Practice mode, the system MUST still record the player's response time (`elapsedMs`) for each round, even though the visual countdown bar is hidden.
- **FR-010**: Practice round generation MUST continue to bias toward the identified tricky pairs, filling remaining slots randomly from the full set of multiplication pairs (2–12).
- **FR-011**: When a player has fewer than 10 games with per-round data, the system MUST analyze all available games that have per-round data.
- **FR-012**: When no games with per-round data exist, Practice mode MUST remain hidden (existing behavior preserved).

### Key Entities

- **Analyzed Game Set**: The up-to-10 most recent completed games (Play or Improve) containing per-round data, used as the input for tricky-number analysis.
- **Pair Mistake Count**: The total number of times a specific multiplication pair (e.g., 7 × 8) was answered incorrectly across the analyzed game set.
- **Pair Average Response Time**: The mean elapsed time (in milliseconds) for a specific multiplication pair across all occurrences in the analyzed game set, used as a fallback ranking signal when no mistakes exist, and as a tiebreaker when mistake counts are equal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tricky numbers shown to the player reflect their actual weaknesses from up to 10 recent games rather than only the most recent game.
- **SC-002**: Players who repeatedly struggle with specific multiplication pairs see those pairs prioritized in Practice mode within their next Practice session.
- **SC-003**: The countdown bar is not visible during any Practice mode round.
- **SC-004**: Play mode behavior is completely unchanged — the countdown bar, scoring, and tricky-number identification for Play mode remain as they were before this update.
- **SC-005**: Practice mode response times continue to be captured accurately (within the same precision as before) so that future analysis is not degraded.
- **SC-006**: The practice round set still contains 10 questions, with the identified tricky pairs appearing more frequently than non-tricky pairs.

## Assumptions

- The existing cap of 100 games in `gameHistory` is sufficient; the most recent 10 games will always be available within this window for active players.
- Per-round data (`rounds` field on `GameRecord`) is present for all games played since the feature was introduced in a prior release. Legacy records without per-round data are simply excluded from the analysis window.
- The existing Practice badge, score exclusion, and replay mechanics remain unchanged and are not in scope for this feature.
- "Games" in this context means completed games only — abandoned or in-progress games are not included in the analysis.
- Hiding the countdown bar means hiding both the animated shrinking bar and the remaining-seconds text display. The entire countdown visual component is suppressed in Practice mode.
