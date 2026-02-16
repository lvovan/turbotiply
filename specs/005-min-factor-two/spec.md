# Feature Specification: Minimum Factor of Two

**Feature Branch**: `005-min-factor-two`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Instead of having numbers from 1 to 12, make the interval 2 to 12 because multiplying by 1 is too easy and does not test the player's ability."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Harder Multiplication Challenges (Priority: P1)

As a player, I want all multiplication questions to use factors between 2 and 12 so that every question genuinely tests my multiplication skills rather than presenting trivial ×1 problems.

**Why this priority**: This is the core and only change — the entire feature revolves around raising the minimum factor from 1 to 2. Without this, the feature has no value.

**Independent Test**: Start a new game with any player and play through all 10 rounds. Verify that every formula presented uses factors no lower than 2.

**Acceptance Scenarios**:

1. **Given** a player starts a new game, **When** the formulas are generated, **Then** every factor (both factorA and factorB) is between 2 and 12 inclusive
2. **Given** a player is in a game round, **When** a factor is hidden, **Then** the correct answer is never 1
3. **Given** a player is in a game round, **When** the product is hidden, **Then** the correct answer is never equal to the other visible factor (which would imply a hidden ×1)
4. **Given** a player starts multiple games, **When** formulas are generated each time, **Then** all formulas across all games consistently use factors from 2 to 12 only

---

### User Story 2 - Sufficient Question Variety (Priority: P2)

As a player, I want a large enough pool of unique multiplication pairs so that each game session still feels varied and unpredictable.

**Why this priority**: After removing ×1 pairs, we need to confirm the remaining pool (66 unique unordered pairs from 2–12) is still large enough to support 10 unique questions per game with good variety across sessions.

**Independent Test**: Play 5 consecutive games and verify that each game presents 10 distinct multiplication pairs and that there is noticeable variation between games.

**Acceptance Scenarios**:

1. **Given** a game is started, **When** formulas are generated, **Then** all 10 formulas have unique unordered factor pairs (no duplicates within a single game)
2. **Given** the available pool of factor pairs, **When** counted, **Then** there are at least 66 unique unordered pairs available (pairs {a, b} where 2 ≤ a ≤ b ≤ 12)
3. **Given** a player plays multiple games in a row, **When** comparing the sets of questions, **Then** the order and selection differ between games

---

### Edge Cases

- What happens when the hidden position is "A" or "B"? The hidden value must still be within range 2–12, never 1.
- What happens when the hidden position is "C" (the product)? The product is computed from two factors both ≥ 2, so the minimum product is 4 (2 × 2) and maximum is 144 (12 × 12).
- What happens to replay rounds? Replay rounds reuse the same formula from the original round, which will already have factors ≥ 2, so no additional change is needed for replays.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate multiplication formulas using only factors in the range 2 to 12 inclusive
- **FR-002**: The system MUST NOT present any formula where either factor equals 1
- **FR-003**: The system MUST continue to generate exactly 10 unique unordered factor pairs per game
- **FR-004**: The system MUST draw factor pairs from a pool of 66 unique unordered pairs ({a, b} where 2 ≤ a ≤ b ≤ 12)
- **FR-005**: The system MUST maintain randomized selection and ordering of factor pairs within each game
- **FR-006**: The system MUST continue to randomly assign hidden positions (A, B, or C) with equal probability
- **FR-007**: The system MUST continue to randomly determine display order of factors within each formula
- **FR-008**: All existing game mechanics (scoring, timing, replay of incorrect answers) MUST remain unchanged

### Key Entities

- **Formula**: A multiplication question with two factors (now both constrained to 2–12) and a product. One value is hidden for the player to guess. Key attributes: factorA (2–12), factorB (2–12), product (4–144), hiddenPosition (A, B, or C).
- **Factor Pair Pool**: The set of all unique unordered pairs {a, b} where 2 ≤ a ≤ b ≤ 12, totaling 66 pairs. 10 pairs are randomly selected per game.

## Assumptions

- The number of rounds per game (10) remains unchanged. With 66 available pairs, there is no risk of exhausting the pool.
- No user-facing setting or configuration is needed to toggle between 1–12 and 2–12. The range is fixed at 2–12.
- The change applies universally to all players — there is no per-player difficulty setting.
- Factor descriptions in any user-visible text (e.g., help text, tooltips) will be updated if they reference the "1–12" range.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of generated formulas across all games use factors between 2 and 12 inclusive — no formula ever contains a factor of 1
- **SC-002**: Each game session presents exactly 10 questions with unique factor pairs, drawn from a pool of 66 possible pairs
- **SC-003**: Question variety remains high — over 10 consecutive games, no two games present the identical set of 10 pairs
- **SC-004**: All existing game functionality (scoring tiers, replay rounds, feedback timing) continues to work identically after the change
