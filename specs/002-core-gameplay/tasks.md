# Tasks: Core Gameplay

**Input**: Design documents from `/specs/002-core-gameplay/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — Constitution Principle V (Test-First) mandates acceptance tests before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing. Build order follows quickstart.md: types → constants → services → hooks → components → page integration.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Type definitions and constants that all user stories depend on. No runtime logic — compile-only types and static values.

- [x] T001 [P] Create game type definitions (Formula, HiddenPosition, Round, GameState, GameStatus, ScoringTier) in `frontend/src/types/game.ts` per data-model.md TypeScript section
- [x] T002 [P] Create scoring constants (SCORING_TIERS, DEFAULT_POINTS, INCORRECT_PENALTY, FEEDBACK_DURATION_MS, ROUNDS_PER_GAME) and `calculateScore()` pure function in `frontend/src/constants/scoring.ts` per data-model.md Scoring Constants table

**Checkpoint**: Types compile, `calculateScore()` is importable. No UI yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure-function services that power all gameplay. No React dependency — testable in isolation. MUST complete before any user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests (write first, must fail)

- [x] T003 [P] Write tests for `formulaGenerator` in `frontend/tests/services/formulaGenerator.test.ts` — covers: generates exactly 10 formulas, all factors in [1–12] range, product equals factorA × factorB, no duplicate unordered pairs, hiddenPosition is A/B/C, getAllUnorderedPairs returns 78 items, deterministic output with injected randomFn (per formula-generator.md Test Contract)
- [x] T004 [P] Write tests for `gameEngine` in `frontend/tests/services/gameEngine.test.ts` — covers: initialGameState shape, START_GAME creates 10 rounds and sets status to 'playing', SUBMIT_ANSWER evaluates correctness and transitions to feedback, SUBMIT_ANSWER calculates score via calculateScore during playing, NEXT_ROUND advances currentRoundIndex, NEXT_ROUND transitions to replay when failures exist after round 10, NEXT_ROUND transitions to completed when all correct, replay phase does not award/deduct points, incorrect replays re-queue the round, RESET_GAME returns to initialGameState, getCorrectAnswer returns correct value for each hiddenPosition, getCurrentRound returns correct round for playing and replay, invalid actions return state unchanged (per game-engine.md Test Contract)

### Implementation

- [x] T005 [P] Implement `generateFormulas()` and `getAllUnorderedPairs()` in `frontend/src/services/formulaGenerator.ts` per contracts/formula-generator.md — Fisher-Yates shuffle of 78 unordered pairs, take 10, random hiddenPosition assignment, optional randomFn parameter for testing
- [x] T006 [P] Implement `gameReducer()`, `initialGameState`, `getCorrectAnswer()`, `getCurrentRound()`, and `GameAction` type in `frontend/src/services/gameEngine.ts` per contracts/game-engine.md — pure reducer with START_GAME, SUBMIT_ANSWER, NEXT_ROUND, RESET_GAME actions; state machine transitions; delegates scoring to calculateScore

**Checkpoint**: `npm test -- tests/services/formulaGenerator.test.ts tests/services/gameEngine.test.ts` — all tests pass. Foundation ready.

---

## Phase 3: User Story 1 — Play a Complete Game (Priority: P1) 🎯 MVP

**Goal**: A child can start a game, play 10 rounds of A × B = C with one value hidden, see correct/incorrect feedback after each answer, and view a score summary at the end.

**Independent Test**: Start a game, answer all 10 questions correctly, verify the game ends with a score summary showing the total points earned.

### Tests (write first, must fail)

- [x] T007 [P] [US1] Write tests for `useGame` hook in `frontend/tests/hooks/useGame.test.tsx` — covers: initial status is 'not-started', startGame sets status to 'playing' with 10 rounds, submitAnswer transitions to feedback and records answer, nextRound advances to next round, resetGame returns to not-started, currentRound and correctAnswer derived values (per react-hooks.md useGame Test Contract)
- [x] T008 [P] [US1] Write tests for `useRoundTimer` hook in `frontend/tests/hooks/useRoundTimer.test.ts` — covers: start records performance.now, stop returns elapsed ms, reset clears timer, displayRef updates textContent with X.Xs format, cleanup cancels rAF on unmount (per react-hooks.md useRoundTimer Test Contract, mock performance.now)
- [x] T009 [P] [US1] Write tests for `FormulaDisplay` component in `frontend/tests/components/FormulaDisplay.test.tsx` — covers: renders factorA × factorB = product with one value replaced by '?', renders correctly for hiddenPosition A/B/C, accessible text labels
- [x] T010 [P] [US1] Write tests for `AnswerInput` component in `frontend/tests/components/AnswerInput.test.tsx` — covers: renders numeric input and submit button, accepts only digits (filters non-numeric), strips leading zeros, submit disabled when input empty, calls onSubmit with parsed number, input disabled when disabled prop is true (per FR-017)
- [x] T011 [P] [US1] Write tests for `RoundFeedback` component in `frontend/tests/components/RoundFeedback.test.tsx` — covers: correct → green + checkmark + "Correct!" text, incorrect → red + X icon + "Not quite!" text, aria-live="assertive" region present, feedback content accessible to screen readers (per FR-018)
- [x] T012 [P] [US1] Write tests for `GameStatus` component in `frontend/tests/components/GameStatus.test.tsx` — covers: renders "Round N of 10", renders running score, renders timer display element, shows replay indicator when isReplay is true (per FR-019)
- [x] T013 [P] [US1] Write tests for `ScoreSummary` component in `frontend/tests/components/ScoreSummary.test.tsx` — covers: renders round-by-round table with formula/answer/correct-incorrect/time/points, renders total score prominently, "Play again" button calls onPlayAgain, "Back to menu" button calls onBackToMenu, handles negative scores (per FR-016, FR-020)

### Implementation

- [x] T014 [US1] Implement `useRoundTimer` hook in `frontend/src/hooks/useRoundTimer.ts` per contracts/react-hooks.md — performance.now for measurement, requestAnimationFrame for display via ref, start/stop/reset methods, X.Xs format, cleanup on unmount
- [x] T015 [US1] Implement `useGame` hook in `frontend/src/hooks/useGame.ts` per contracts/react-hooks.md — wraps gameReducer via useReducer, exposes startGame/submitAnswer/nextRound/resetGame, derives currentRound and correctAnswer, stable references via useCallback
- [x] T016 [P] [US1] Implement `FormulaDisplay` component and styles in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx` and `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.module.css` — renders "A × ? = C" with placeholder for hidden value, accessible labeling
- [x] T017 [P] [US1] Implement `AnswerInput` component and styles in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` and `frontend/src/components/GamePlay/AnswerInput/AnswerInput.module.css` — digits-only input, leading-zero stripping, disabled when empty, submit button ≥ 44×44px touch target
- [x] T018 [P] [US1] Implement `RoundFeedback` component and styles in `frontend/src/components/GamePlay/RoundFeedback/RoundFeedback.tsx` and `frontend/src/components/GamePlay/RoundFeedback/RoundFeedback.module.css` — green/checkmark/"Correct!" or red/X/"Not quite!", persistent aria-live="assertive" region, color + icon + text triple indicator
- [x] T019 [P] [US1] Implement `GameStatus` component and styles in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx` and `frontend/src/components/GamePlay/GameStatus/GameStatus.module.css` — round counter "Round N of 10", running score display, timer display element via ref, replay indicator
- [x] T020 [P] [US1] Implement `ScoreSummary` component and styles in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` and `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.module.css` — round-by-round breakdown table, total score, "Play again" button, "Back to menu" link, semantic table HTML, responsive scrollable on narrow viewports
- [x] T021 [US1] Write tests for `MainPage` in `frontend/tests/pages/MainPage.test.tsx` — covers: renders start button initially, clicking start begins game with round 1 displayed, submitting answer shows feedback, after 10 correct rounds shows score summary, "Play again" resets game, "Back to menu" navigates to welcome
- [x] T022 [US1] Replace `MainPage` stub with full gameplay in `frontend/src/pages/MainPage.tsx` — orchestrates useGame + useRoundTimer, manages feedback timeout (1.2s setTimeout → nextRound), renders FormulaDisplay + AnswerInput + GameStatus during play, RoundFeedback during feedback phase, ScoreSummary when completed, start button when not-started

**Checkpoint**: `npm test` — all US1 tests pass. A child can play a full 10-round game (all correct) and see the score summary. MVP complete.

---

## Phase 4: User Story 2 — Replay Wrong Answers (Priority: P2)

**Goal**: After the 10 main rounds, any incorrectly answered rounds are replayed. The child sees the same formula again and must answer correctly. Replayed rounds do not earn or lose points.

**Independent Test**: Start a game, answer 2 rounds incorrectly, answer remaining 8 correctly. After round 10, verify 2 failed rounds reappear. Answer them correctly and verify game ends.

**Note**: The gameEngine reducer already handles replay logic (implemented in Phase 2). This phase verifies the UI correctly supports replay state.

### Tests (write first, must fail)

- [x] T023 [US2] Write tests for replay UI behavior in `frontend/tests/pages/MainPage.test.tsx` — covers: after round 10 with 2 incorrect answers, game enters replay and re-presents failed formulas, replay uses same formula and hidden position, answering correctly in replay advances or ends game, answering incorrectly in replay re-queues formula, no replay when all 10 correct (extend existing MainPage tests)
- [x] T024 [US2] Write test for GameStatus replay indicator in `frontend/tests/components/GameStatus.test.tsx` — covers: when isReplay=true, shows "Replay" label instead of "Round N of 10" (extend existing tests)

### Implementation

- [x] T025 [US2] Update `MainPage` to handle replay phase in `frontend/src/pages/MainPage.tsx` — detect gameState.status === 'replay', pass isReplay prop to GameStatus, display replay-specific round context, ensure timer starts/stops for replay rounds
- [x] T026 [US2] Update `GameStatus` component to show replay indicator in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx` — display "Replay" label when isReplay is true, show replay queue progress

**Checkpoint**: `npm test` — all US1 + US2 tests pass. Replay flow works end-to-end.

---

## Phase 5: User Story 3 — Time-Based Scoring (Priority: P3)

**Goal**: Each round is timed individually with a visible timer. Faster correct answers earn more points. Incorrect answers get a –2 penalty. Replayed rounds do not affect score.

**Independent Test**: Answer one question in <2s (expect +5), one in 2–3s (expect +3), one after 5s (expect 0), one incorrectly (expect –2). Verify score summary shows correct per-round points.

**Note**: `calculateScore()` and `gameReducer` scoring logic already exist from Phase 1–2. This phase ensures the timer and scoring are correctly wired in the UI.

### Tests (write first, must fail)

- [x] T027 [US3] Write tests for scoring display accuracy in `frontend/tests/pages/MainPage.test.tsx` — covers: score updates after each answer submission, per-round points visible in score summary, negative score displayed correctly, replay rounds show no points in summary (extend existing MainPage tests)
- [x] T028 [US3] Write tests for timer visibility in `frontend/tests/components/GameStatus.test.tsx` — covers: timer element present during rounds, timer displays elapsed seconds in X.Xs format (extend existing tests)

### Implementation

- [x] T029 [US3] Verify timer and scoring integration in `frontend/src/pages/MainPage.tsx` — ensure timer start/stop/reset lifecycle matches round transitions, elapsed time passed to submitAnswer, score displayed during gameplay, per-round points and response time shown in ScoreSummary (may require only verification, not code changes if already wired in T022)
- [x] T030 [US3] Update `ScoreSummary` to display per-round response times and points in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` — format elapsed time as seconds (e.g., "1.5s"), show points per row, distinguish replay rounds (no points) from primary rounds

**Checkpoint**: `npm test` — all US1 + US2 + US3 tests pass. Timer visible, scoring accurate, summary correct.

---

## Phase 6: User Story 4 — Formula Generation with Uniqueness (Priority: P4)

**Goal**: Each game generates 10 unique formulas from 1–12 tables. No duplicate unordered pairs. Hidden position varies randomly across A/B/C.

**Independent Test**: Generate 100 games and verify no two rounds share the same unordered pair within any game. Verify factors in 1–12 range and hidden position varies.

**Note**: `formulaGenerator.ts` was fully implemented and tested in Phase 2. This phase adds statistical validation and integration verification.

### Tests (write first, must fail)

- [x] T031 [US4] Write statistical uniqueness validation in `frontend/tests/services/formulaGenerator.test.ts` — covers: generate 100 games and verify no duplicate unordered pairs in any game, verify hidden position distribution is roughly uniform across many games, verify both display orders (A,B vs B,A) appear across games (extend existing tests)

### Implementation

- [x] T032 [US4] Verify formula generation integration in `frontend/src/pages/MainPage.tsx` — confirm startGame calls generateFormulas via useGame, formulas rendered correctly by FormulaDisplay, replay uses original formula (may require only verification, not code changes)

**Checkpoint**: `npm test` — all US1–US4 tests pass. Formula generation verified correct across many games.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audits, integration testing, responsive verification, and cleanup.

- [x] T033 [P] Write accessibility tests for gameplay screens in `frontend/tests/a11y/accessibility.test.tsx` — add axe-core tests for: game start screen, active round (formula + input), feedback state (correct and incorrect), score summary screen (extend existing a11y tests)
- [x] T034 Write end-to-end gameplay flow integration test in `frontend/tests/integration/gameplayFlow.test.tsx` — covers: full game from start → 10 rounds (mix of correct/incorrect) → replay phase → score summary → play again → new game; verifies scoring, timer, replay queue, and navigation
- [x] T035 Responsive CSS review for all GamePlay components — verify 320px–1920px viewport range, touch targets ≥ 44×44px on submit button and navigation buttons, no horizontal scrolling, mobile-first layout for formula + input + feedback
- [x] T036 Run full test suite, lint, and type-check — `npm test`, `npx eslint src/`, `npx tsc --noEmit` — fix any failures

**Checkpoint**: All tests green, no lint errors, no type errors, a11y audit passes. Feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and constants only
- **Phase 2 (Foundational)**: Depends on Phase 1 (imports types) — BLOCKS all user stories
- **Phase 3 (US1 - P1)**: Depends on Phase 2 — full MVP
- **Phase 4 (US2 - P2)**: Depends on Phase 3 (extends MainPage)
- **Phase 5 (US3 - P3)**: Depends on Phase 3 (extends MainPage, ScoreSummary)
- **Phase 6 (US4 - P4)**: Depends on Phase 2 (formulaGenerator only)
- **Phase 7 (Polish)**: Depends on Phases 3–6

### User Story Dependencies

- **US1 (P1)**: Core game loop — all other stories extend this
- **US2 (P2)**: Extends US1 MainPage with replay UI — depends on US1
- **US3 (P3)**: Extends US1 MainPage with timer/scoring display — depends on US1
- **US4 (P4)**: Formula logic only — can run after Phase 2, but integration check needs US1

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Hooks before components (hooks are dependencies)
3. Components before page integration (compose bottom-up)
4. Page integration last (wires everything together)

### Parallel Opportunities

**Phase 1** (2 tasks): T001 and T002 are fully parallel (different files, no dependencies).

**Phase 2** (4 tasks): T003 ∥ T004 (tests), then T005 ∥ T006 (implementation).

**Phase 3** (16 tasks): T007–T013 all parallel (7 test files, different components). Then T014 ∥ T015 (hooks), T016 ∥ T017 ∥ T018 ∥ T019 ∥ T020 (5 components, all parallel). Then T021 → T022 (sequential — test then implementation).

**Phase 4–5**: Can be parallelized if US1 is complete — US2 and US3 touch different concerns.

**Phase 6**: Can run concurrently with Phase 4–5 (formula tests only).

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Batch 1: All test files in parallel (7 tasks)
T007: tests/hooks/useGame.test.tsx
T008: tests/hooks/useRoundTimer.test.ts
T009: tests/components/FormulaDisplay.test.tsx
T010: tests/components/AnswerInput.test.tsx
T011: tests/components/RoundFeedback.test.tsx
T012: tests/components/GameStatus.test.tsx
T013: tests/components/ScoreSummary.test.tsx

# Batch 2: Both hooks in parallel (2 tasks)
T014: src/hooks/useRoundTimer.ts
T015: src/hooks/useGame.ts

# Batch 3: All 5 components in parallel (5 tasks)
T016: src/components/GamePlay/FormulaDisplay/
T017: src/components/GamePlay/AnswerInput/
T018: src/components/GamePlay/RoundFeedback/
T019: src/components/GamePlay/GameStatus/
T020: src/components/GamePlay/ScoreSummary/

# Batch 4: Page test then implementation (sequential)
T021: tests/pages/MainPage.test.tsx
T022: src/pages/MainPage.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + constants)
2. Complete Phase 2: Foundational (formulaGenerator + gameEngine + tests)
3. Complete Phase 3: User Story 1 (hooks → components → MainPage)
4. **STOP and VALIDATE**: Full game loop works — 10 rounds, feedback, score summary
5. This is a deployable MVP

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (logic passes all tests)
2. Phase 3 (US1) → Core game playable → **MVP!**
3. Phase 4 (US2) → Wrong-answer replay works
4. Phase 5 (US3) → Timer and scoring fully visible and accurate
5. Phase 6 (US4) → Formula generation statistically validated
6. Phase 7 → Polish, a11y, integration, responsive review
7. Each phase adds value without breaking previous phases

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps tasks to user stories for traceability
- Constitution V (Test-First): all tests written before implementation, must fail first
- Constitution I (Accessibility First): axe-core tests in Phase 7, triple-indicator feedback in US1
- Commit after each task or logical batch
- Stop at any checkpoint to validate independently
