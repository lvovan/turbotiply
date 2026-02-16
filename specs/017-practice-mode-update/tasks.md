# Tasks: Practice Mode Update

**Input**: Design documents from `/specs/017-practice-mode-update/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/challenge-analyzer-api.md, quickstart.md

**Tests**: Included — Constitution V (Test-First) requires acceptance tests before implementation.

**Organization**: Tasks grouped by user story. US1 (multi-game tricky numbers) and US2 (hide countdown bar) are independent and can be implemented in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in every task description

---

## Phase 1: Setup (Shared Type Change)

**Purpose**: Update the shared `ChallengingPair` type that both user stories depend on

- [X] T001 Update `ChallengingPair` interface in `frontend/src/types/game.ts`: replace `difficultyRatio: number` with `mistakeCount: number` and `avgMs: number`

**Checkpoint**: Type change compiles. Downstream files will have type errors until updated — this is expected.

---

## Phase 2: User Story 1 — Smarter Tricky-Number Identification (Priority: P1) 🎯 MVP

**Goal**: Analyze up to 10 most recent games to identify tricky multiplication pairs by mistake count, falling back to average response time when no mistakes exist.

**Independent Test**: Play several games with deliberate mistakes on specific numbers, then verify the Practice button lists those numbers and practice rounds are biased toward those pairs.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation (red-green-refactor)**

- [X] T002 [US1] Rewrite `identifyChallengingPairs` unit tests in `frontend/tests/services/challengeAnalyzer.test.ts`: replace single-game `difficultyRatio` tests with multi-game aggregation scenarios — groups rounds by unordered pair, computes `mistakeCount` and `avgMs`, sorts by mistake count desc with avgMs tiebreaker, falls back to avgMs-only ranking when all correct
- [X] T003 [US1] Rewrite `getChallengingPairsForPlayer` unit tests in `frontend/tests/services/challengeAnalyzer.test.ts`: add scenarios for player with 5 games (analyzes all), player with 12 games (uses last 10 only), player with 0 mistakes (fallback to avgMs ranking), mix of Play and Improve records (both analyzed), legacy records without rounds (skipped), single game (1-game window works)
- [X] T004 [US1] Add multi-game integration test in `frontend/tests/integration/improveMode.test.tsx`: save multiple game records with deliberate mistakes on specific pairs, start Improve mode, verify the generated formulas include the tricky pairs

### Implementation for User Story 1

- [X] T005 [US1] Rewrite `identifyChallengingPairs` in `frontend/src/services/challengeAnalyzer.ts`: group rounds by unordered pair key `(min,max)`, aggregate `mistakeCount` and `totalMs`/`occurrences` per pair, compute `avgMs = totalMs / occurrences`, when mistakes exist filter to `mistakeCount > 0` pairs and sort by `mistakeCount` desc then `avgMs` desc, when all correct sort all pairs by `avgMs` desc, return `ChallengingPair[]` with new fields
- [X] T006 [US1] Rewrite `getChallengingPairsForPlayer` in `frontend/src/services/challengeAnalyzer.ts`: filter `gameHistory` to records with `rounds?.length > 0`, take last 10 (`.slice(-10)`), flatMap all `RoundResult[]`, pass combined rounds to `identifyChallengingPairs`
- [X] T007 [US1] Update `extractTrickyNumbers` tests in `frontend/tests/services/challengeAnalyzer.test.ts`: replace `difficultyRatio` field in test fixtures with `mistakeCount` and `avgMs` fields (function logic unchanged, only test data needs field name update)

**Checkpoint**: `npm test` passes for all challengeAnalyzer tests. Practice button shows tricky numbers aggregated across recent games.

---

## Phase 3: User Story 2 — No Countdown Bar in Practice Mode (Priority: P2)

**Goal**: Hide the animated countdown bar and remaining-seconds text during Practice rounds while keeping internal timing active.

**Independent Test**: Start a Practice game and confirm the countdown bar is absent; start a Play game and confirm the countdown bar is present.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation (red-green-refactor)**

- [X] T008 [P] [US2] Add countdown-hiding tests in `frontend/tests/components/GameStatus.test.tsx`: add tests in "Practice indicator" describe block — timer text (`data-testid="timer"`) not rendered when `gameMode='improve'`, `CountdownBar` (`role="progressbar"`) not rendered when `gameMode='improve'`, timer text rendered when `gameMode='play'`, `CountdownBar` rendered when `gameMode='play'`
- [X] T009 [P] [US2] Add integration test in `frontend/tests/integration/improveMode.test.tsx`: start Improve mode game, verify no `role="progressbar"` element in DOM during gameplay, verify answer submission still works and `elapsedMs` is recorded

### Implementation for User Story 2

- [X] T010 [US2] Conditionally render timer and countdown bar in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`: wrap the timer `<div>` (containing `<span ref={timerRef}>`) and `<CountdownBar barRef={barRef}/>` in `{gameMode !== 'improve' && (...)}` so they are not mounted during Practice mode input phase

**Checkpoint**: `npm test` passes for all GameStatus and improveMode tests. Countdown bar hidden in Practice, visible in Play.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both user stories

- [X] T011 [P] Run full test suite and fix any regressions: `cd frontend && npm test`
- [X] T012 [P] Run linter and type checker: `cd frontend && npm run lint && npx tsc --noEmit`
- [X] T013 Run quickstart.md manual validation: `cd frontend && npm run dev` — play multiple games with mistakes, verify Practice button shows multi-game tricky numbers, start Practice and confirm no countdown bar, start Play and confirm countdown bar present

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on T001 (type change) — implements the core algorithm
- **Phase 3 (US2)**: Depends on T001 (type change) only for type consistency; **independent of Phase 2**
- **Phase 4 (Polish)**: Depends on Phase 2 and Phase 3 both completing

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001. No dependency on US2.
- **User Story 2 (P2)**: Depends on T001. No dependency on US1. Can be implemented in parallel with US1.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution V)
- T002, T003 → T005, T006 → T007 (US1: tests → algorithm → fixture update)
- T008, T009 → T010 (US2: tests → component change)

### Parallel Opportunities

- **After T001 completes**: US1 and US2 can proceed in parallel (different files)
- **Within US2**: T008 and T009 can run in parallel (different test files)
- **Phase 4**: T011 and T012 can run in parallel

---

## Parallel Example: After Phase 1

```
# After T001 (type change) completes, launch both stories in parallel:

# Developer A — User Story 1:
T002: Rewrite identifyChallengingPairs tests
T003: Rewrite getChallengingPairsForPlayer tests
T004: Add multi-game integration test
T005: Implement identifyChallengingPairs algorithm
T006: Implement getChallengingPairsForPlayer multi-game logic
T007: Update extractTrickyNumbers test fixtures

# Developer B — User Story 2 (simultaneously):
T008: Add countdown-hiding component tests
T009: Add countdown-hiding integration test
T010: Implement conditional rendering in GameStatus
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Type change
2. Complete T002–T007: Tests + algorithm for multi-game tricky numbers
3. **STOP and VALIDATE**: Practice button shows aggregated tricky numbers
4. This alone delivers the primary value of the feature

### Incremental Delivery

1. T001 → Type foundation ready
2. T002–T007 → US1 complete: multi-game tricky numbers functional
3. T008–T010 → US2 complete: countdown bar hidden in Practice
4. T011–T013 → Polish: full regression check + manual validation
5. Each story adds value without breaking the other

---

## Notes

- 3 source files modified, 3 test files updated, 0 new files
- No new dependencies
- `useRoundTimer` hook unchanged — continues to measure `elapsedMs` even when countdown bar is hidden (refs will be null, which is safe)
- `formulaGenerator.ts` unchanged — only reads `factorA`/`factorB` from `ChallengingPair`
- `extractTrickyNumbers` logic unchanged — only test fixtures need `difficultyRatio` → `mistakeCount`/`avgMs` field update
