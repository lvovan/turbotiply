# Feature Specification: Game Modes & Performance Tracking

**Feature Branch**: `003-game-modes`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "For each player, keep track of average response time per number, have two ways of playing: (1) with fully random numbers for true competitiveness, and (2) Improvement mode which proposes numbers for which the player usually has slower response times and/or more incorrect answers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Choose Between Random and Improvement Mode (Priority: P1)

Before starting a game, the child is presented with two mode options: "Random" and "Improve". Random mode works exactly as described in feature 002 (fully random formula selection). Improve mode focuses on the numbers the child finds hardest. The child taps one of the two options and the game begins in that mode.

**Why this priority**: The mode selection is the entry point for all new functionality. Without it, neither mode can be accessed. It is the simplest slice — just a choice screen before the existing game flow.

**Independent Test**: Log in as a player, verify the mode selection screen appears before starting a game. Tap "Random" and confirm a game starts. Go back, tap "Improve" and confirm a game starts.

**Acceptance Scenarios**:

1. **Given** the player is on the main experience screen, **When** the player taps "Play", **Then** a mode selection screen is displayed with two clearly labelled options: "Random" and "Improve", each with a short child-friendly description.
2. **Given** the mode selection screen is displayed, **When** the player taps "Random", **Then** a game starts using fully random formula generation (as per feature 002).
3. **Given** the mode selection screen is displayed, **When** the player taps "Improve", **Then** a game starts using adaptive formula generation that prioritises the player's weakest numbers.
4. **Given** a new player with no game history, **When** the player taps "Improve", **Then** the game starts with random formulas (since there is no performance data yet) and a friendly message explains that the game will learn which numbers to practise as they play more.

---

### User Story 2 — Track Per-Number Performance After Each Game (Priority: P2)

After each completed game, the system records the player's performance for every number (1–12) that appeared in that game. Performance is tracked as the average response time and the error rate (proportion of incorrect answers) for each number. This data is stored per player in browser storage and accumulates over multiple games.

**Why this priority**: Tracking is the foundation for Improvement mode. Without stored performance data, the adaptive formula generator has nothing to work with. It must be in place before Improvement mode can be meaningful.

**Independent Test**: Play two games as the same player. After each game, inspect browser storage and verify that per-number performance data has been recorded and updated. Confirm that numbers that appeared in both games have averaged statistics.

**Acceptance Scenarios**:

1. **Given** a player completes a game where round 1 was "3 × 7 = ?" answered correctly in 2.5 seconds, **When** the game ends, **Then** the performance data for numbers 3 and 7 is updated with a 2.5-second response time and a correct-answer record.
2. **Given** a player has existing performance data for number 7 (average 3.0s, 80% correct from 5 previous appearances), **When** the player completes a new game where number 7 appeared and was answered correctly in 1.5s, **Then** the average response time for 7 is recalculated to include the new data point and the correct rate is updated.
3. **Given** a player answers a round incorrectly, **When** the game ends, **Then** the error is recorded against both numbers in the formula's factor pair (increasing their error rate).
4. **Given** a player has never played a game, **When** their performance data is queried, **Then** all 12 numbers show no data (no default assumptions).
5. **Given** a player completes a game, **When** the game ends, **Then** performance data is persisted to browser storage immediately and survives browser restarts.

---

### User Story 3 — Improvement Mode Prioritises Weak Numbers (Priority: P3)

In Improvement mode, the formula generator selects the 10 formulas for the game by prioritising factor pairs that include numbers the player struggles with most. "Struggle" is defined by a combination of slower average response time and higher error rate. The child experiences a game that feels like regular play but is tailored to practise their weakest areas.

**Why this priority**: This is the core educational differentiator of the feature. It depends on P1 (mode selection) and P2 (performance tracking) being in place.

**Independent Test**: Create a player with performance data showing numbers 8, 9, and 12 as significantly weaker than others. Start an Improvement mode game and verify that the majority of rounds (at least 7 of 10) involve at least one of those weak numbers.

**Acceptance Scenarios**:

1. **Given** a player whose performance data shows numbers 8, 9, and 12 as the three weakest numbers (by weakness score), **When** an Improvement mode game is generated, **Then** at least 7 of the 10 formulas include at least one of those top 3 weak numbers (8, 9, or 12) as a factor.
2. **Given** a player whose performance data shows all numbers with roughly equal performance, **When** an Improvement mode game is generated, **Then** the formulas are distributed across all numbers without strong bias (similar to Random mode).
3. **Given** a player has no performance data (first game), **When** an Improvement mode game is generated, **Then** formulas are selected randomly (fallback to Random behaviour) and the player sees a message: "Play a few games first and I'll learn what you need to practise!"
4. **Given** an Improvement mode game, **When** formulas are generated, **Then** the uniqueness constraint from feature 002 still applies — no duplicate unordered factor pairs within the same game.
5. **Given** a player whose weakest numbers are 11 and 12, **When** an Improvement mode game is generated, **Then** the remaining rounds (not targeting weak numbers) are still drawn from the full 1–12 range to provide variety.

---

### User Story 4 — View Personal Performance Overview (Priority: P4)

The player can view a simple overview of their per-number performance from the main experience screen. The overview shows each number (1–12) with a visual indicator of how well the player is doing — for example, a colour-coded grid or bar chart showing average response time and accuracy. This helps the child (and parents/teachers) see progress at a glance.

**Why this priority**: While not required for gameplay, this screen gives visibility into accumulated data and motivates continued practice. It depends on P2 (tracking) being operational.

**Independent Test**: Play several games as a player. Navigate to the performance overview and verify it displays data for all 12 numbers with visual indicators that match the player's actual performance.

**Acceptance Scenarios**:

1. **Given** the player is on the main experience screen, **When** the player taps a "My progress" (or equivalent) button, **Then** a performance overview screen is displayed showing numbers 1–12.
2. **Given** the performance overview is displayed and the player has data for numbers 1–12, **Then** each number shows a visual indicator of average response time and accuracy (e.g., green for strong, yellow for medium, red for weak — always paired with a text label or icon for accessibility).
3. **Given** the player has no performance data for a number (it has never appeared in a game), **Then** that number is shown in a neutral state with a label like "Not yet practised".
4. **Given** the performance overview is displayed, **When** the player taps "Back" or equivalent, **Then** they return to the main experience screen.

---

### Edge Cases

- **What happens when a number has very few data points (e.g., appeared in only 1 game)?** The system uses whatever data is available. With few data points, the averages may be volatile — this is acceptable. Improvement mode treats sparse data as mildly weak (conservative: practise more to be sure).
- **What happens when the player's weakest numbers are all within the same factor pair (e.g., both 11 and 12)?** Improvement mode can include {11, 12} as one of the prioritised formulas. The remaining weak-number slots target formulas pairing weak numbers with other factors (e.g., {11, 4}, {12, 6}).
- **What happens when performance data grows very large (hundreds of games)?** Per-number data is a rolling aggregate (cumulative count, sum of response times, sum of errors) — not a log of every individual answer. Storage size per player is constant (12 numbers × a few numeric fields).
- **What happens when a player deletes their profile (feature 001)?** All associated performance data is also deleted.
- **What happens during replay rounds — do they affect performance tracking?** No. Only primary-round results (the first attempt at each formula) are recorded in performance data. Replayed rounds do not update statistics.
- **What happens if the player switches mode between games?** Each game is independent. The player can freely switch between Random and Improve mode from game to game. Performance data accumulates regardless of which mode was played.
- **What if the score summary screen in feature 002 already shows per-round data — does this feature change it?** No. The score summary from feature 002 remains unchanged. The performance overview (US4) is a separate, career-spanning view.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a mode selection screen before starting a game, offering two options: "Random" and "Improve".
- **FR-002**: Each mode option MUST include a short, child-friendly description explaining what it does (e.g., "Random: mix of all numbers!" and "Improve: practise your tricky ones!").
- **FR-003**: In Random mode, formula generation MUST follow the existing rules from feature 002 (fully random selection from 1–12 with uniqueness constraint).
- **FR-004**: In Improvement mode, the system MUST prioritise formulas that include numbers where the player has slower average response times and/or higher error rates.
- **FR-005**: In Improvement mode, at least 7 of the 10 formulas MUST include at least one factor from the player's top 3 weakest numbers (ranked by weakness score), when sufficient performance data exists.
- **FR-006**: In Improvement mode, the remaining formulas (up to 3 of 10) MUST be drawn from the full 1–12 range to maintain variety.
- **FR-007**: The uniqueness constraint from feature 002 (no duplicate unordered factor pairs per game) MUST apply in both modes.
- **FR-008**: When a player has no performance data, Improvement mode MUST fall back to random formula generation and display a friendly explanatory message.
- **FR-009**: After each completed game, the system MUST update per-number performance data for the active player based on primary-round results only (not replayed rounds).
- **FR-010**: Performance data MUST track, for each number 1–12: total number of appearances as a factor, cumulative response time, and total number of incorrect answers.
- **FR-011**: Performance data MUST be stored per player in browser storage and MUST survive browser restarts.
- **FR-012**: Performance data MUST be deleted when the associated player profile is deleted (feature 001).
- **FR-013**: The system MUST provide a "My progress" (or equivalent) screen accessible from the main experience, showing per-number performance for the active player.
- **FR-014**: The performance overview MUST display each number (1–12) with a visual indicator of strength (e.g., colour coding) PLUS a text label or icon, so colour is never the sole indicator.
- **FR-015**: Numbers with no performance data MUST be shown in a neutral state with a label such as "Not yet practised".
- **FR-016**: A "weakness score" for each number MUST be computed from the combination of average response time and error rate, used to rank numbers for Improvement mode targeting.

### Key Entities

- **Player Performance**: Per-player aggregate of gameplay results, keyed by number (1–12). Key attributes per number: total appearances (count), cumulative response time (milliseconds), total incorrect answers (count). Derived attributes: average response time, error rate, weakness score. Stored in browser storage alongside the Player entity from feature 001.
- **Game Mode**: An enumeration with two values: Random and Improve. Selected before each game and determines the formula generation strategy. Not persisted — applies only to the current game.
- **Weakness Score**: A derived metric combining average response time and error rate for a given number. Used to rank numbers from weakest to strongest for Improvement mode targeting. Higher score = weaker performance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child can select a game mode and start playing in under 5 seconds from the main screen.
- **SC-002**: After 5 completed games, Improvement mode generates formulas where at least 70% of rounds include one of the player's 3 weakest numbers.
- **SC-003**: After 10 completed games, the performance overview shows data for at least 10 of the 12 numbers.
- **SC-004**: Per-number performance data accurately reflects the player's historical results (verified by replaying known sequences and checking stored data).
- **SC-005**: The mode selection screen is immediately understandable by a child aged 6–12 without explanation.
- **SC-006**: The performance overview screen loads in under 1 second and is fully usable on a 320px phone screen and a 1920px desktop screen.
- **SC-007**: Deleting a player profile removes all associated performance data with no residual entries in storage.

## Clarifications

### Session 2026-02-14

- Q: How many numbers count as "weakest" for Improvement mode targeting? → A: Top 3 weakest numbers by weakness score. This aligns with SC-002 and provides enough factor-pair combinations to fill 7 targeted slots.

## Assumptions

- Performance data is stored as lightweight aggregates (counts and sums per number), not a log of individual game results. This keeps storage constant per player (~12 entries) regardless of how many games are played.
- The "weakness score" formula (how to combine average response time and error rate into a single ranking) is a design/tuning decision to be finalised during planning. The spec requires only that both metrics contribute to the score.
- Improvement mode does not guarantee deterministic formula selection — there is inherent randomness within the prioritised pool. Two Improvement mode games for the same player may produce different formulas.
- This feature depends on feature 001 (player sessions) for player identity and feature 002 (core gameplay) for the game loop, scoring, and replay mechanics. Those features are prerequisites.
- The mode selection screen replaces the direct "Play" action from the main experience. After this feature, tapping "Play" leads to mode selection, then to the game.
