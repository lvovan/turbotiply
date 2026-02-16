# Tasks: Improve Game Mode

**Input**: Design documents from `/specs/012-improve-game-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/service-contracts.md, quickstart.md

**Tests**: Included per Constitution Principle V (Test-First). Tests are written first and must fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Type definitions and data model extension — shared foundation for all user stories

- [x] T001 Add `RoundResult` interface and `GameMode` type alias to `frontend/src/types/player.ts`
- [x] T002 [P] Extend `GameRecord` with optional `rounds?: RoundResult[]` and `gameMode?: GameMode` fields in `frontend/src/types/player.ts`
- [x] T003 [P] Add `gameMode: GameMode` field to `GameState` interface and update `initialGameState` in `frontend/src/types/game.ts`
- [x] T004 [P] Add `ChallengingPair` interface to `frontend/src/types/game.ts` with `factorA`, `factorB`, `difficultyRatio` fields

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Storage migration, persistence changes, and game engine extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add v4→v5 migration block in `readStore()` in `frontend/src/services/playerStorage.ts` — bump version only, no data transformation
- [x] T006 Create `saveGameRecord(playerName, score, rounds, gameMode)` function in `frontend/src/services/playerStorage.ts` that persists `GameRecord` with `rounds` and `gameMode`, conditionally updates `totalScore`/`gamesPlayed` only for `'play'` mode
- [x] T007 Modify `getRecentHighScores()`, `getGameHistory()`, and `getRecentAverage()` in `frontend/src/services/playerStorage.ts` to exclude records where `gameMode === 'improve'`
- [x] T008 Extend `START_GAME` action to accept optional `mode` field and set `gameState.gameMode` in `frontend/src/services/gameEngine.ts`
- [x] T009 Update `useGame` hook in `frontend/src/hooks/useGame.ts` — change `startGame` to accept `(mode?: GameMode)`, expose `gameMode` in return type, generate formulas conditionally based on mode

**Checkpoint**: Foundation ready — type system, storage, engine, and hook all support dual-mode. User story implementation can begin.

---

## Phase 3: User Story 1 — Per-Round History Recording (Priority: P1) 🎯 MVP

**Goal**: Every completed game persists per-round data (factors, correctness, response time) alongside the game score.

**Independent Test**: Play a game to completion, verify round data is saved in localStorage and old records without round data are handled gracefully.

### Tests for User Story 1

- [x] T010 [P] [US1] Write unit tests for `saveGameRecord()` in `frontend/tests/services/playerStorage.test.ts` — verify round data persistence, 100-record cap enforcement, conditional score update for play vs. improve
- [x] T011 [P] [US1] Write unit tests for v4→v5 migration in `frontend/tests/services/playerStorage.test.ts` — verify old records without `rounds`/`gameMode` are loaded without errors

### Implementation for User Story 1

- [x] T012 [US1] Update `MainPage.tsx` game-completion `useEffect` to call `saveGameRecord()` with extracted `RoundResult[]` from `gameState.rounds` and current `gameMode`, replacing the existing `updatePlayerScore()` call in `frontend/src/pages/MainPage.tsx`
- [x] T013 [US1] Add helper function to extract `RoundResult[]` from `gameState.rounds[]` (snapshot initial-attempt data: factorA, factorB, isCorrect, elapsedMs from primary rounds 0–9) in `frontend/src/services/gameEngine.ts`

**Checkpoint**: Play a standard game → verify `GameRecord` in localStorage contains `rounds[]` with 10 entries and `gameMode: 'play'`. Verify old records without `rounds` load without errors.

---

## Phase 4: User Story 2 — Challenging Number Identification (Priority: P1)

**Goal**: Pure analysis function that takes a game's round results and produces a ranked list of challenging multiplication pairs using the dual-signal threshold.

**Independent Test**: Call `identifyChallengingPairs()` with crafted round data, verify only pairs meeting both signals (incorrect AND ≥ 1.5× average response time) appear, ranked by difficulty.

### Tests for User Story 2

- [x] T014 [P] [US2] Write unit tests for `identifyChallengingPairs()` in `frontend/tests/services/challengeAnalyzer.test.ts`
- [x] T015 [P] [US2] Write unit tests for `extractTrickyNumbers()` in `frontend/tests/services/challengeAnalyzer.test.ts`
- [x] T016 [P] [US2] Write unit tests for `getChallengingPairsForPlayer()` in `frontend/tests/services/challengeAnalyzer.test.ts`

### Implementation for User Story 2

- [x] T017 [US2] Implement `identifyChallengingPairs(rounds)` in `frontend/src/services/challengeAnalyzer.ts`
- [x] T018 [US2] Implement `extractTrickyNumbers(pairs)` in `frontend/src/services/challengeAnalyzer.ts`
- [x] T019 [US2] Implement `getChallengingPairsForPlayer(playerName)` in `frontend/src/services/challengeAnalyzer.ts`

**Checkpoint**: All analyzer tests pass. Given crafted round data with a mix of fast-correct, slow-correct, fast-incorrect, and slow-incorrect rounds, only the slow-incorrect pairs are returned, ranked by difficulty.

---

## Phase 5: User Story 3 — Main Menu with Play and Improve Modes (Priority: P1)

**Goal**: The game screen presents "Play" and "Improve" buttons with descriptors. Improve button is conditionally shown based on challenge analysis.

**Independent Test**: Select a player with game history containing challenging pairs → both buttons visible with correct descriptors. Select a new player → only Play button visible.

### Tests for User Story 3

- [x] T020 [P] [US3] Write component tests for `ModeSelector` in `frontend/tests/components/ModeSelector.test.tsx` — test Play button always visible with "Go for a high score!" descriptor, Improve button shown/hidden based on `showImprove` prop, tricky numbers rendered correctly, encouraging message shown when `showEncouragement` is true, keyboard accessibility, ARIA labels
- [x] T021 [P] [US3] Write accessibility test for `ModeSelector` in `frontend/tests/a11y/ModeSelector.a11y.test.tsx` — axe-core audit of both states (with and without Improve button)

### Implementation for User Story 3

- [x] T022 [US3] Create `ModeSelector` component in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx` with Play button (always visible, "Go for a high score!"), conditional Improve button ("Level up your tricky numbers: {numbers}"), and encouraging message
- [x] T023 [US3] Create `ModeSelector.module.css` in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.module.css` — responsive layout, 44×44 px touch targets, descriptor text styling, mobile text wrapping
- [x] T024 [US3] Integrate `ModeSelector` into `MainPage.tsx` `not-started` state in `frontend/src/pages/MainPage.tsx` — replace single "Start Game" button with `ModeSelector`, pass `onStartPlay`/`onStartImprove` callbacks, compute `showImprove`/`trickyNumbers`/`showEncouragement` from `getChallengingPairsForPlayer()`

**Checkpoint**: Game screen shows both buttons for player with challenging pairs. New player sees only Play. Player with no challenging pairs sees Play + encouraging message.

---

## Phase 6: User Story 4 — Improve Game with Targeted Rounds (Priority: P2)

**Goal**: Starting an Improve game generates formulas biased toward challenging pairs. The game flow is identical to Play but with a "Practice" indicator instead of score.

**Independent Test**: Start Improve game for player with known challenging pairs → verify rounds contain those pairs, "Practice" indicator shown instead of score, replay mechanics work.

### Tests for User Story 4

- [x] T025 [P] [US4] Write unit tests for `generateImproveFormulas()` in `frontend/tests/services/formulaGenerator.test.ts` — test challenging pairs included first, remaining slots filled randomly, 10 formulas returned, hidden positions assigned, no duplicate pairs
- [x] T026 [P] [US4] Write component tests for `GameStatus` "Practice" indicator in `frontend/tests/components/GameStatus.test.tsx` — verify score hidden and "Practice" text shown when `gameMode === 'improve'`

### Implementation for User Story 4

- [x] T027 [US4] Implement `generateImproveFormulas(challengingPairs)` in `frontend/src/services/formulaGenerator.ts` — take top min(pairs.length, 10) pairs, fill remaining with random non-duplicate pairs, assign hiddenPosition and shuffle
- [x] T028 [US4] Update `useGame` hook `startGame` in `frontend/src/hooks/useGame.ts` to call `generateImproveFormulas()` when `mode === 'improve'`, passing challenging pairs from `getChallengingPairsForPlayer()`
- [x] T029 [US4] Modify `GameStatus` component in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx` to accept `gameMode` prop and replace score display with "Practice" text when `gameMode === 'improve'`
- [x] T030 [US4] Pass `gameMode` from `MainPage.tsx` through to `GameStatus` component in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: Improve game starts with targeted formulas, shows "Practice" instead of score, replay mechanics work identically to Play mode.

---

## Phase 7: User Story 5 — Improve Games Excluded from Scores (Priority: P2)

**Goal**: Improve game results do not affect player score metrics. The Improve completion screen shows "You got X/10 right!" and lists incorrect pairs.

**Independent Test**: Complete an Improve game, verify totalScore/gamesPlayed/highScores/progressionGraph unchanged. Verify practice-oriented completion screen.

### Tests for User Story 5

- [x] T031 [P] [US5] Write integration test for score isolation in `frontend/tests/integration/improveMode.test.tsx` — play Improve game, verify player's totalScore, gamesPlayed, getRecentHighScores(), getGameHistory() (for progression) are unchanged; verify round data IS saved with `gameMode: 'improve'`
- [x] T032 [P] [US5] Write component tests for `ScoreSummary` Improve variant in `frontend/tests/components/ScoreSummary.test.tsx` — verify "You got X/10 right!" message, incorrect pairs listed, no score number shown, no high scores or progression graph, Play Again and Back to Menu buttons present

### Implementation for User Story 5

- [x] T033 [US5] Modify `ScoreSummary` component in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` to accept `gameMode` prop; when `'improve'`: show "You got X/10 right!" heading, list incorrect pairs as "Keep practising: A × B, C × D", hide score and high-score sections
- [x] T034 [US5] Update `MainPage.tsx` game-completion `useEffect` to skip `totalScore`/`gamesPlayed` updates for Improve games (already handled by `saveGameRecord` from T006) and pass `gameMode` to `ScoreSummary` in `frontend/src/pages/MainPage.tsx`
- [x] T035 [US5] Update `MainPage.tsx` completed state to pass `gameMode` to `ScoreSummary` and conditionally hide `RecentHighScores` and `ProgressionGraph` for Improve games in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: Complete an Improve game → score metrics unchanged, completion screen shows "You got X/10 right!" with incorrect pairs listed. Complete a Play game → score persists normally with round data.

---

## Phase 8: User Story 6 — Tricky Numbers Preview (Priority: P3)

**Goal**: The Improve button's descriptor shows specific tricky factor numbers (deduplicated, sorted ascending, capped at 8 with ellipsis).

**Independent Test**: Player with challenging pairs 7×8 and 6×9 sees "Level up your tricky numbers: 6, 7, 8, 9" under Improve button.

### Tests for User Story 6

- [x] T036 [P] [US6] Write additional ModeSelector tests in `frontend/tests/components/ModeSelector.test.tsx` — verify numbers formatted as comma-separated ascending list, verify ellipsis when >8 numbers, verify mobile text wrapping

### Implementation for User Story 6

- [x] T037 [US6] Verify and refine `extractTrickyNumbers()` formatting in `ModeSelector` component — ensure comma-separated display, ascending order, "…" appended when >8 unique numbers, responsive text wrapping in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`

**Checkpoint**: Tricky numbers display correctly in all scenarios — few numbers, exactly 8, more than 8 (with ellipsis), mobile viewport wrapping.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, integration testing, and final validation

- [x] T038 [P] Write accessibility test for Improve game completion screen in `frontend/tests/a11y/ScoreSummary.a11y.test.tsx`
- [x] T039 [P] Write accessibility test for GameStatus "Practice" indicator in `frontend/tests/a11y/GameStatus.a11y.test.tsx`
- [x] T040 Write end-to-end integration test for full Improve flow in `frontend/tests/integration/improveMode.test.tsx` — select player → see Improve button → start Improve game → play through → see practice completion screen → verify score unchanged → return to menu → verify tricky numbers updated
- [x] T041 Run quickstart.md validation: `npm run build` (zero TS errors), `npm test` (all tests pass), manual verification of responsive layout on 320px and 1280px viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start after Foundational
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (different files)
- **US3 (Phase 5)**: Depends on Phase 2 + US2 (needs `getChallengingPairsForPlayer()`)
- **US4 (Phase 6)**: Depends on US2 (needs `generateImproveFormulas()`) + US3 (needs ModeSelector integration)
- **US5 (Phase 7)**: Depends on US4 (needs Improve game to complete), can partially overlap with US4
- **US6 (Phase 8)**: Depends on US2 (needs `extractTrickyNumbers()`) + US3 (needs ModeSelector)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational — modifies only MainPage persistence and gameEngine helper
- **US2 (P1)**: Independent after Foundational — new file `challengeAnalyzer.ts`, no overlap with US1
- **US3 (P1)**: Needs US2's `getChallengingPairsForPlayer()` — modifies MainPage not-started state
- **US4 (P2)**: Needs US2's `generateImproveFormulas()` + US3's ModeSelector — modifies GameStatus, useGame
- **US5 (P2)**: Needs US4's Improve game flow — modifies ScoreSummary, MainPage completed state
- **US6 (P3)**: Needs US2's `extractTrickyNumbers()` + US3's ModeSelector — polish only

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Service functions before component integration
- Component creation before MainPage wiring
- Story complete before moving to next priority

### Parallel Opportunities

- T001/T003/T004 (Phase 1 type changes) can run in parallel
- T010/T011 (US1 tests) can run in parallel
- T014/T015/T016 (US2 tests) can run in parallel
- T020/T021 (US3 tests) can run in parallel
- T025/T026 (US4 tests) can run in parallel
- T031/T032 (US5 tests) can run in parallel
- US1 and US2 can proceed in parallel after Phase 2

---

## Parallel Example: User Story 2

```bash
# Launch all tests for US2 together (should FAIL before implementation):
T014: "Unit tests for identifyChallengingPairs() in frontend/tests/services/challengeAnalyzer.test.ts"
T015: "Unit tests for extractTrickyNumbers() in frontend/tests/services/challengeAnalyzer.test.ts"
T016: "Unit tests for getChallengingPairsForPlayer() in frontend/tests/services/challengeAnalyzer.test.ts"

# Then implement sequentially:
T017: identifyChallengingPairs() — tests T014 should now pass
T018: extractTrickyNumbers() — tests T015 should now pass
T019: getChallengingPairsForPlayer() — tests T016 should now pass
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (storage, engine, hook)
3. Complete Phase 3: US1 (round data persistence)
4. Complete Phase 4: US2 (challenge analysis)
5. Complete Phase 5: US3 (mode selector UI)
6. **STOP and VALIDATE**: Player can see Play/Improve buttons with correct descriptors. Round data persists. Analysis identifies challenging pairs.

### Incremental Delivery

1. Setup + Foundational → Type system and storage ready
2. US1 → Round data persists with every game (invisible to user, but data layer is live)
3. US2 → Challenge analysis works (testable via unit tests, not yet surfaced in UI)
4. US3 → Improve button appears in UI → **First visible value to user** (MVP!)
5. US4 → Improve game plays with targeted rounds → **Core feature complete**
6. US5 → Score isolation and practice completion screen → **Feature integrity complete**
7. US6 → Tricky numbers preview polished → **Feature polished**

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after its dependencies
- Constitution Principle V: Tests MUST fail before implementation begins
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 41
