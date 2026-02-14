# Feature Specification: Core Gameplay

**Feature Branch**: `002-core-gameplay`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Timed multiplication quiz — 10 rounds of A × B = C with one value hidden. Time-based scoring. Wrong answers replayed at end."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Play a Complete Game (Priority: P1)

A child starts a new game from the main experience. The game presents 10 multiplication rounds one at a time. Each round shows a formula like "3 × [?] = 21" and the child types the missing number and submits. After answering all 10 rounds (assuming all correct), the game ends and the child sees their total score.

**Why this priority**: This is the entire core loop. Without it there is no product. Every other story (wrong-answer replay, scoring details) extends this one.

**Independent Test**: Start a game, answer all 10 questions correctly, and verify the game ends with a score summary showing the total points earned.

**Acceptance Scenarios**:

1. **Given** the player starts a new game, **When** the game begins, **Then** round 1 of 10 is displayed showing a multiplication formula with exactly one value replaced by a placeholder.
2. **Given** a round is displayed, **When** the player types a number and submits, **Then** the answer is evaluated as correct or incorrect and the next round is shown.
3. **Given** the player has completed all 10 rounds with all answers correct, **When** the last answer is submitted, **Then** the game ends and a score summary screen is displayed showing the total points.
4. **Given** a round is displayed, **When** the player submits a correct answer, **Then** a green-highlighted feedback with a checkmark icon and "Correct!" text is shown for 1.2 seconds before advancing.
5. **Given** a round is displayed, **When** the player submits an incorrect answer, **Then** a red-highlighted feedback with an X icon and "Not quite!" text is shown for 1.2 seconds and the round is marked for replay.
6. **Given** the score summary screen is displayed, **When** the player taps "Play again", **Then** a new game starts immediately for the same player.
7. **Given** the score summary screen is displayed, **When** the player taps "Back to menu", **Then** the player is returned to the main/welcome screen.
8. **Given** the score summary screen is displayed, **Then** it shows a round-by-round breakdown with each formula, the child's answer, correct/incorrect indicator, response time, and points earned, plus the total score.

---

### User Story 2 — Replay Wrong Answers (Priority: P2)

After the 10 main rounds, any rounds that the child answered incorrectly are replayed. The child sees the same formula again and must answer correctly to finish the game. Replayed rounds do not earn points but must all be answered correctly before the game can end.

**Why this priority**: The replay mechanic is what makes the game educational — it forces the child to practice the formulas they struggled with. Without it, the game would allow children to skip past mistakes.

**Independent Test**: Start a game, deliberately answer 2 rounds incorrectly, answer the remaining 8 correctly. After round 10, verify the 2 failed rounds reappear. Answer them correctly and verify the game ends.

**Acceptance Scenarios**:

1. **Given** the player answered rounds 3 and 7 incorrectly during the main 10 rounds, **When** round 10 is completed, **Then** the game enters a replay phase and re-presents the formula from round 3.
2. **Given** the player is in the replay phase, **When** the player answers the replayed formula correctly, **Then** the next failed formula is presented (or the game ends if no more remain).
3. **Given** the player is in the replay phase, **When** the player answers the replayed formula incorrectly again, **Then** the formula returns to the replay queue and must be attempted again.
4. **Given** all replayed rounds have been answered correctly, **When** the last replay is submitted, **Then** the game ends and the score summary is displayed.
5. **Given** the player answered all 10 main rounds correctly, **When** round 10 is completed, **Then** no replay phase occurs and the game ends immediately with the score summary.

---

### User Story 3 — Time-Based Scoring (Priority: P3)

Each round is timed individually. The faster the child answers correctly, the more points they earn. Incorrect answers result in a penalty of –2 points. The child can see a running timer during each round as motivation. Replayed rounds do not award or deduct additional points.

**Why this priority**: Scoring adds motivation and replayability. It depends on the core game loop (P1) and replay mechanic (P2) being in place first.

**Independent Test**: Start a game, answer one question in under 2 seconds (expect +5), one between 2–3 seconds (expect +3), one after 5 seconds (expect 0), and one incorrectly (expect –2). Verify the score summary reflects these individual scores correctly.

**Acceptance Scenarios**:

1. **Given** a round is displayed with a visible timer, **When** the player submits a correct answer within 2 seconds, **Then** +5 points are awarded for that round.
2. **Given** a round is displayed, **When** the player submits a correct answer between 2 and 3 seconds, **Then** +3 points are awarded.
3. **Given** a round is displayed, **When** the player submits a correct answer between 3 and 4 seconds, **Then** +2 points are awarded.
4. **Given** a round is displayed, **When** the player submits a correct answer between 4 and 5 seconds, **Then** +1 point is awarded.
5. **Given** a round is displayed, **When** the player submits a correct answer after more than 5 seconds, **Then** 0 points are awarded.
6. **Given** a round is displayed, **When** the player submits an incorrect answer, **Then** –2 points are applied to the total score.
7. **Given** the player is in the replay phase, **When** the player submits any answer (correct or incorrect), **Then** no points are awarded or deducted.

---

### User Story 4 — Formula Generation with Uniqueness (Priority: P4)

Each game generates 10 unique multiplication formulas from the 1–12 times table. A formula and all its permutations (e.g., 3 × 7 and 7 × 3) count as the same underlying formula and may only appear once in the 10 main rounds. For each formula, one of the three values (first factor, second factor, or product) is randomly hidden.

**Why this priority**: Correct generation ensures the game is fair, non-repetitive, and educationally sound. It is a backend/logic concern that underpins P1 but can be verified independently.

**Independent Test**: Generate 100 games and verify that within each game, no two rounds share the same underlying formula (accounting for commutativity). Verify that all factors are in the 1–12 range and that the hidden position varies.

**Acceptance Scenarios**:

1. **Given** a new game is started, **When** formulas are generated, **Then** all 10 formulas have factors A and B in the range 1–12 and C = A × B.
2. **Given** a new game is started, **When** formulas are generated, **Then** no two formulas share the same unordered factor pair (e.g., {3, 7} appears at most once).
3. **Given** a formula is generated, **When** the hidden value is determined, **Then** exactly one of A, B, or C is hidden, chosen with roughly equal probability across rounds.
4. **Given** a replayed round, **When** it is presented, **Then** it shows the same formula as the original failed round (same factors, same hidden position).

---

### Edge Cases

- **What happens if the player enters a non-numeric value?** The input field only accepts digits (0–9). Non-numeric characters are not enterable.
- **What happens if the player submits without entering anything?** The submit action is disabled when the input is empty.
- **What happens if the player enters a number with leading zeros (e.g., "07")?** Leading zeros are stripped; "07" is treated as 7.
- **What happens if the player gets the same round wrong multiple times in replay?** The formula re-enters the replay queue each time and must eventually be answered correctly. No additional point penalty beyond the initial –2.
- **What happens if the score goes negative?** Negative scores are valid. The score summary displays the negative total without any special messaging (the child sees the number and learns to improve).
- **What happens if the player leaves mid-game (switches player or closes tab)?** The game state is lost. There is no mid-game save. The child starts a new game next time. (Per constitution: session state is tab-scoped.)
- **What happens if the player answers very quickly by spamming?** The timer starts on formula display. The minimum measurable time is bounded by rendering. An answer in under ~100ms is still accepted and scored at +5.
- **What if all 10 rounds are answered incorrectly?** All 10 are queued for replay. The game continues in the replay phase until every formula has been answered correctly at least once.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a game consisting of exactly 10 primary rounds.
- **FR-002**: Each round MUST display a multiplication formula of the form A × B = C where A ∈ [1–12], B ∈ [1–12], and C = A × B.
- **FR-003**: Each round MUST hide exactly one of A, B, or C, chosen at random with equal probability across the three positions.
- **FR-004**: The player MUST enter the missing value via a numeric input field and submit their answer.
- **FR-005**: The system MUST evaluate the submitted answer as correct (matches the hidden value) or incorrect (does not match).
- **FR-006**: The system MUST enforce a uniqueness constraint: no two primary rounds in a single game may share the same unordered factor pair {A, B}.
- **FR-007**: The system MUST time each round individually, starting when the formula is displayed and stopping when the answer is submitted.
- **FR-008**: The system MUST display a visible timer to the player during each round.
- **FR-009**: The system MUST award points for correct answers based on response time: ≤2s → +5, >2–3s → +3, >3–4s → +2, >4–5s → +1, >5s → 0.
- **FR-010**: The system MUST deduct 2 points for each incorrect answer during the primary rounds.
- **FR-011**: The system MUST queue incorrectly answered rounds for replay after all 10 primary rounds are complete.
- **FR-012**: The system MUST replay failed rounds using the same formula and hidden position as the original attempt.
- **FR-013**: Replayed rounds MUST NOT award or deduct points, regardless of correctness or response time.
- **FR-014**: Replayed rounds that are answered incorrectly MUST be re-queued for further replay.
- **FR-015**: The game MUST NOT end until all 10 primary rounds are complete AND all replayed rounds have been answered correctly.
- **FR-016**: The system MUST display a score summary screen at the end of the game showing: (a) a round-by-round breakdown listing each formula, the child's answer, correct/incorrect status, response time, and points earned; and (b) the total score prominently.
- **FR-017**: The input field MUST accept only digits (0–9) and MUST NOT allow submission when empty.
- **FR-018**: The system MUST show visual feedback for 1.2 seconds after each answer. Correct answers MUST use a green background/highlight with a checkmark icon and a text label (e.g., "Correct!"). Incorrect answers MUST use a red background/highlight with an X icon and a text label (e.g., "Not quite!"). Color MUST NOT be the sole indicator — icons and text MUST always accompany the color change (per constitution: Accessibility First).
- **FR-019**: The system MUST display the current round number (e.g., "Round 3 of 10") and running score during gameplay.
- **FR-020**: The score summary screen MUST display a "Play again" button that starts a new game immediately for the same player, and a secondary "Back to menu" option that returns to the main/welcome screen.

### Key Entities

- **Game**: A single play session consisting of 10 primary rounds plus zero or more replay rounds. Key attributes: list of rounds, total score, game state (in-progress, replay-phase, completed). Not persisted — exists only in the active session.
- **Round**: A single question within a game. Key attributes: formula (factor A, factor B, product C), hidden position (A, B, or C), player's answer, correctness, response time in milliseconds, points awarded. Rounds that are replayed retain a reference to the original formula.
- **Formula**: A multiplication fact defined by an unordered pair of factors {A, B} and their product C. Used for uniqueness checking. Example: {3, 7} → 21.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child can complete a full game (10 rounds, all correct) in under 3 minutes.
- **SC-002**: 90% of children aged 6–12 can understand how to play without instructions by the end of their first game.
- **SC-003**: The score summary correctly reflects the sum of all point awards and penalties from the game.
- **SC-004**: No two primary rounds in any game share the same underlying formula (verified across 1,000 generated games).
- **SC-005**: Round timer accuracy is within 100ms of wall-clock time as perceived by the player.
- **SC-006**: The game flow (formula display → input → feedback → next round) completes each transition in under 500ms on a mobile device.
- **SC-007**: The gameplay screen is fully usable on a 320px-wide phone screen and a 1920px-wide desktop screen.

## Clarifications

### Session 2026-02-14

- Q: What happens after the player views the score summary? → A: Show a "Play again" button (starts new game immediately for the same player) plus a secondary "Back to menu" option to return to the welcome screen.
- Q: How long should correct/incorrect feedback be displayed, and how should it be conveyed? → A: 1.2 seconds. Use green for correct and red for incorrect, combined with additional accessible indicators (icon, text label, and optional sound/vibration) so feedback is never conveyed by color alone.
- Q: What information should the score summary screen display? → A: A round-by-round breakdown showing each formula, the child's answer, whether it was correct or incorrect, response time, and points earned per round, plus the total score.

## Assumptions

- The game runs entirely in the browser. No server-side logic is needed for formula generation, timing, or scoring — all computation is client-side.
- A "game" is ephemeral and lives within the current session. There is no mid-game save/resume. If the tab is closed or the player switches, the game is lost.
- The score is calculated and displayed at the end of the game. Persisting scores for leaderboards or history is out of scope for this feature (to be handled by a separate feature).
- The number of possible unique unordered pairs from 1–12 is 78 (12 × 13 / 2), so selecting 10 unique formulas per game is always possible.
- The predefined avatar, color, and player name from feature 001-player-sessions are used to identify who is playing, but gameplay does not depend on player identity beyond display.
