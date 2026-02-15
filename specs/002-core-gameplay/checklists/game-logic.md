# Game Logic & Scoring Checklist: Core Gameplay

**Purpose**: Validate requirement completeness, clarity, and consistency for formula generation, game state machine, replay mechanics, and time-based scoring
**Created**: 2026-02-15
**Feature**: [spec.md](../spec.md)
**Focus**: Game logic & scoring
**Depth**: Standard
**Audience**: Spec author (self-check before implementation handoff)

## Requirement Completeness

- [ ] CHK001 - Are all game state transitions (not-started → playing → replay → completed) explicitly defined with trigger conditions and guards? [Completeness, Spec §FR-001/FR-011/FR-015]
- [ ] CHK002 - Are requirements defined for what happens when `SUBMIT_ANSWER` is dispatched during an invalid phase (e.g., during feedback or when completed)? [Completeness, Gap]
- [ ] CHK003 - Is the initial game state fully specified — all fields, default values, and invariants documented? [Completeness, Spec §Game entity in data-model.md]
- [ ] CHK004 - Are requirements specified for how the replay queue is constructed (which rounds, what order, when populated)? [Completeness, Spec §FR-011]
- [ ] CHK005 - Is the `calculateScore(isCorrect, elapsedMs)` function's full signature and return behavior documented for all input combinations? [Completeness, Spec §FR-009/FR-010]
- [ ] CHK006 - Are requirements defined for the `currentPhase` sub-state (`input` ↔ `feedback`) and its role in controlling valid actions? [Completeness, Gap]

## Requirement Clarity

- [ ] CHK007 - Is the scoring tier boundary behavior unambiguous — are thresholds inclusive or exclusive at each boundary (e.g., exactly 2000ms: +5 or +3)? [Clarity, Spec §FR-009]
- [ ] CHK008 - Is "equal probability" for hidden position selection quantified — does it mean exactly ⅓ per round, or roughly ⅓ across the game? [Clarity, Spec §FR-003]
- [ ] CHK009 - Is "same formula and hidden position" for replay rounds explicitly defined as immutable references to the original Round object? [Clarity, Spec §FR-012]
- [ ] CHK010 - Is the replay queue ordering specified — are failed rounds replayed in original order, FIFO, or some other sequence? [Clarity, Spec §FR-011]
- [ ] CHK011 - Is "unordered factor pair" clearly defined with an example showing that {3,7} and {7,3} are the same pair? [Clarity, Spec §FR-006]
- [ ] CHK012 - Is "response time" precisely defined — does it start on formula render completion, DOM paint, or component mount? [Clarity, Spec §FR-007]

## Requirement Consistency

- [ ] CHK013 - Are the scoring rules in the spec (FR-009/FR-010) consistent with the scoring constants table in the data model (SCORING_TIERS, INCORRECT_PENALTY)? [Consistency, Spec §FR-009 vs data-model.md]
- [ ] CHK014 - Is the "10 primary rounds" count consistent across all documents — spec FR-001, data model (rounds array length 10), and formula generator (take 10)? [Consistency, Spec §FR-001]
- [ ] CHK015 - Are the replay scoring rules consistent — spec §FR-013 says no points, game engine says `points: null`, and score summary needs to display "no points" for replay rows? [Consistency, Spec §FR-013/FR-016]
- [ ] CHK016 - Does the state machine in the game engine contract align with the state transitions described in the data model and the behavioral requirements in the spec? [Consistency, Spec §FR-011/FR-014/FR-015]

## Scoring Requirements Quality

- [ ] CHK017 - Are all five scoring tiers explicitly enumerated with exact millisecond boundaries and point values? [Completeness, Spec §FR-009]
- [ ] CHK018 - Is the incorrect answer penalty (–2) specified as applying only during primary rounds, not replay? [Completeness, Spec §FR-010/FR-013]
- [ ] CHK019 - Is the minimum possible total score documented or derivable (e.g., all 10 incorrect = 10 × –2 = –20)? [Coverage, Gap]
- [ ] CHK020 - Is the maximum possible total score documented or derivable (e.g., all 10 correct under 2s = 10 × 5 = 50)? [Coverage, Gap]
- [ ] CHK021 - Are requirements clear that `elapsedMs` is passed to the scoring function as an integer or float, and how sub-millisecond values are handled? [Clarity, Gap]

## Formula Generation Requirements Quality

- [ ] CHK022 - Is the total number of possible unique unordered pairs (78) explicitly stated and the derivation (12 × 13 / 2) documented? [Completeness, Spec §Assumptions]
- [ ] CHK023 - Are requirements for the randomness source specified — is `Math.random` acceptable, or is a specific PRNG quality required? [Clarity, Gap]
- [ ] CHK024 - Is the shuffle algorithm specified (Fisher-Yates) and is it required or merely suggested? [Clarity, contracts/formula-generator.md]
- [ ] CHK025 - Are requirements defined for display order of factors (which is `factorA` vs `factorB`) independently of the underlying unordered pair? [Completeness, Spec §FR-002]
- [ ] CHK026 - Is the formula generator specified as a pure function with no side effects, and is the injectable `randomFn` parameter documented as optional? [Completeness, contracts/formula-generator.md]

## Replay Mechanics Requirements Quality

- [ ] CHK027 - Is the termination condition for the replay phase precisely defined — "all replayed rounds answered correctly" vs "replay queue is empty"? [Clarity, Spec §FR-015]
- [ ] CHK028 - Are requirements clear on what happens when a round is answered incorrectly during replay — is it re-appended to the end of the queue or inserted at a specific position? [Clarity, Spec §FR-014]
- [ ] CHK029 - Is it specified whether replay rounds show the player's previous incorrect answer or present the formula fresh with no prior-answer context? [Gap]
- [ ] CHK030 - Are requirements defined for maximum replay iterations — can a player theoretically replay indefinitely, and is this intentional? [Coverage, Edge Case]
- [ ] CHK031 - Is the replay phase round counter specified — does the UI show "Replay 1 of N" or a different indicator, and does N update when items are re-queued? [Clarity, Spec §FR-019]

## Edge Case & Scenario Coverage

- [ ] CHK032 - Are requirements defined for when all 10 rounds are answered incorrectly (all 10 enter replay queue)? [Coverage, Edge Case, Spec §Edge Cases]
- [ ] CHK033 - Is the behavior specified for a round answered correctly in exactly 0ms (or near-instantaneous submission)? [Coverage, Edge Case, Spec §Edge Cases]
- [ ] CHK034 - Are requirements clear on whether the score can go below zero and how negative scores are displayed? [Coverage, Edge Case, Spec §Edge Cases]
- [ ] CHK035 - Is the behavior defined when the player submits the same wrong answer repeatedly during replay of the same formula? [Coverage, Gap]

## Notes

- Existing [requirements.md](requirements.md) covers pre-planning spec quality (all items passed). This checklist focuses specifically on game logic and scoring requirement quality dimensions.
- References use `[Spec §FR-XXX]` for functional requirements and `[Gap]` for requirements that may be missing or underspecified.
- The spec is generally strong on game logic — most items here probe boundary precision and consistency rather than missing requirements.
