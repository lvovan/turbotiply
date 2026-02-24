# Tasks: First-Try Result Indicator

**Input**: Design documents from `/specs/027-first-try-result/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per Constitution Principle V (Test-First).

**Organization**: Tasks grouped by user story. US1 and US2 are both P1 and share the same data model change, so they are combined into a single phase (the `firstTryCorrect` field serves both stories simultaneously). US3 (emoji style) is inherent to the implementation approach and doesn't require separate tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Add the `firstTryCorrect` field to the data model — required before any story work

- [X] T001 Add `firstTryCorrect: boolean | null` field to the `Round` interface in `frontend/src/types/game.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire `firstTryCorrect` through the game engine so it is set during primary play and preserved during replay

**⚠️ CRITICAL**: ScoreSummary rendering (Phase 3) depends on the engine correctly populating `firstTryCorrect`

- [X] T002 Initialize `firstTryCorrect: null` for each round in `handleStartGame` in `frontend/src/services/gameEngine.ts`
- [X] T003 Set `firstTryCorrect: isCorrect` when `status === 'playing'` in `handleSubmitAnswer` in `frontend/src/services/gameEngine.ts`
- [X] T004 Preserve `firstTryCorrect` (do not overwrite) when `status === 'replay'` in `handleSubmitAnswer` in `frontend/src/services/gameEngine.ts`

**Checkpoint**: After T004, the game engine correctly tracks first-try correctness through the full game lifecycle including replay. All existing tests should still pass (`npx vitest run`).

---

## Phase 3: User Stories 1 & 2 — First-Try ✅ / Incorrect ❌ Display (Priority: P1) 🎯 MVP

**Goal**: The Result column in the post-game results table shows ✅ for rounds answered correctly on the first try, and ❌ for rounds that were incorrect on the first try (regardless of replay outcome).

**Independent Test**: Play a game with a mix of correct and incorrect answers. After replay, verify ✅ only appears for first-try correct rounds and ❌ appears for all others.

### Tests for User Stories 1 & 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T005 [P] [US1] Add test: `firstTryCorrect` is set to `true` when a correct answer is submitted during primary play, in `frontend/tests/services/gameEngine.test.ts`
- [X] T006 [P] [US2] Add test: `firstTryCorrect` is set to `false` when an incorrect answer is submitted during primary play, in `frontend/tests/services/gameEngine.test.ts`
- [X] T007 [P] [US2] Add test: `firstTryCorrect` remains `false` after a correct replay answer overwrites `isCorrect` to `true`, in `frontend/tests/services/gameEngine.test.ts`
- [X] T008 [P] [US1] Add test: ScoreSummary renders ✅ emoji with `aria-label="Correct on first try"` for rounds where `firstTryCorrect` is `true`, in `frontend/tests/components/ScoreSummary.test.tsx`
- [X] T009 [P] [US2] Add test: ScoreSummary renders ❌ emoji with `aria-label="Incorrect on first try"` for rounds where `firstTryCorrect` is `false`, in `frontend/tests/components/ScoreSummary.test.tsx`
- [X] T010 [P] [US2] Add test: ScoreSummary renders ❌ for a round with `firstTryCorrect: false` even when `isCorrect: true` (replayed-then-correct), in `frontend/tests/components/ScoreSummary.test.tsx`

### Implementation for User Stories 1 & 2

- [X] T011 [US1] Update Result column rendering in ScoreSummary to use `r.firstTryCorrect` instead of `r.isCorrect`, render ✅/❌ emojis with `role="img"` and appropriate `aria-label` attributes, in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`
- [X] T012 [P] [US1] Remove `color` property from `.correctBadge` and `.incorrectBadge` CSS classes (emoji has built-in colors) in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.module.css`
- [X] T013 [US1] Update existing ScoreSummary test fixtures to include `firstTryCorrect` field on round objects so existing tests continue to pass, in `frontend/tests/components/ScoreSummary.test.tsx`
- [X] T014 [US1] Update existing accessibility tests to work with new emoji markup (verify axe-core passes), in `frontend/tests/a11y/ScoreSummary.a11y.test.tsx`

**Checkpoint**: All US1/US2 acceptance scenarios pass. Run `npx vitest run` — all tests green. ✅ shows for first-try correct, ❌ shows for first-try incorrect (including replayed-then-correct).

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across modes and edge cases

- [X] T015 Verify Result column works in improve (practice) mode — `firstTryCorrect` reflects answer correctness with no replay, in `frontend/tests/components/ScoreSummary.test.tsx`
- [X] T016 Run quickstart.md manual verification steps (play a mixed game, perfect game, all-wrong game) and confirm expected behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (T001) — T002/T003/T004 must be sequential (same file, same function)
- **Phase 3 (US1 & US2)**: Depends on Phase 2 — engine must populate `firstTryCorrect` before UI can read it
  - Tests (T005–T010) can run in parallel with each other
  - Implementation (T011–T014): T011 first, then T012/T013/T014 can be parallel
- **Phase 4 (Polish)**: Depends on Phase 3 completion

### Within Phase 3

- T005, T006, T07, T008, T009, T010: All [P] — write all failing tests in parallel
- T011: Core rendering change — must precede T013, T014
- T012: [P] — CSS change, independent of T011
- T013, T014: Update existing tests to match new rendering — after T011

### Parallel Opportunities

```text
Phase 1: T001
         ↓
Phase 2: T002 → T003 → T004  (sequential — same file/function)
         ↓
Phase 3: ┌── T005 ──┐
         ├── T006 ──┤
         ├── T007 ──┤  (all tests in parallel)
         ├── T008 ──┤
         ├── T009 ──┤
         └── T010 ──┘
              ↓
         T011 ─┬─ T012  (CSS, parallel)
               ├─ T013  (fix existing tests)
               └─ T014  (fix a11y tests)
              ↓
Phase 4: T015 → T016
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3)

1. Complete Phase 1: Add field to type (T001)
2. Complete Phase 2: Wire through engine (T002–T004)
3. Complete Phase 3: Tests + rendering (T005–T014)
4. **STOP and VALIDATE**: Run full test suite, manually test per quickstart.md

### Incremental Delivery

1. T001–T004: Data model + engine — no UI change yet, existing behavior unchanged
2. T005–T010: Failing tests document expected behavior
3. T011–T014: UI change + tests pass — feature complete
4. T015–T016: Polish and cross-mode validation

---

## Notes

- Total tasks: 16
- US1 tasks: 7 (T005, T008, T011, T012, T013, T014, T015)
- US2 tasks: 5 (T006, T007, T009, T010, T015)
- Shared/setup tasks: 5 (T001, T002, T003, T004, T016)
- US3 (emoji style): No separate tasks — inherent in T011 implementation (uses emoji ✅/❌)
- Parallel opportunities: 6 tests (T005–T010) in parallel; T012/T013/T014 in parallel after T011
- Every user story is tested independently through dedicated test cases
- `firstTryCorrect` is NOT persisted — no storage migration needed
