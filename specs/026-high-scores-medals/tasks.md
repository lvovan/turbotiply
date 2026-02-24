# Tasks: High Scores Medals — Best of Last 10 Games

**Input**: Design documents from `/specs/026-high-scores-medals/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/getRecentHighScores.md, quickstart.md

**Tests**: Required per constitution principle V (Test-First). Tests written before implementation.

**Organization**: Tasks grouped by user story. All 3 stories share the same function (`getRecentHighScores`) but each story validates distinct behavior.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Single `frontend/` directory (static SPA, no backend)
- Source: `frontend/src/`
- Tests: `frontend/tests/`

---

## Phase 1: Setup

**Purpose**: No new project structure or dependencies required. This feature modifies existing files only.

- [X] T001 Verify current tests pass by running `cd frontend && npx vitest run`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update the JSDoc for the changed function signature. This is shared across all stories and must be done before implementation.

**⚠️ CRITICAL**: The function signature change is the foundation for all 3 user stories.

- [X] T002 Update JSDoc comment for `getRecentHighScores` to document new `windowSize` and `topN` parameters in `frontend/src/services/playerStorage.ts`

**Checkpoint**: Foundational complete — user story implementation can begin.

---

## Phase 3: User Story 1 — Best 3 from Last 10 Games (Priority: P1) 🎯 MVP

**Goal**: The medals section shows the best 3 scores from the last 10 play-mode games instead of the last 3 games.

**Independent Test**: Complete 10+ play-mode games. Verify the medals section shows top 3 from the most recent 10.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T003 [US1] Update test "returns last 5 sorted by score desc" → "returns top 3 from last 10 by default" with 10 play-mode games verifying top 3 are returned in `frontend/tests/services/playerStorage.test.ts`
- [X] T004 [US1] Add test: given 15 play-mode games, only last 10 are considered and top 3 returned in `frontend/tests/services/playerStorage.test.ts`
- [X] T005 [US1] Add test: given 10 play-mode games with scores [12,30,25,40,18,35,22,45,10,28], returns [{score:45},{score:40},{score:35}] in `frontend/tests/services/playerStorage.test.ts`
- [X] T006 [US1] Update test for custom count → test custom `windowSize` and `topN` params (e.g., windowSize=5, topN=2) in `frontend/tests/services/playerStorage.test.ts`

### Implementation for User Story 1

- [X] T007 [US1] Update `getRecentHighScores` function signature from `(player, count=5)` to `(player, windowSize=10, topN=3)` and add `.slice(0, topN)` after sorting in `frontend/src/services/playerStorage.ts`
- [X] T008 [US1] Update call site from `getRecentHighScores(currentPlayer, 3)` to `getRecentHighScores(currentPlayer)` in `frontend/src/pages/MainPage.tsx`
- [X] T009 [US1] Run tests to verify all US1 tests pass: `cd frontend && npx vitest run tests/services/playerStorage.test.ts`

**Checkpoint**: User Story 1 complete — medals show top 3 from last 10 games. MVP is functional.

---

## Phase 4: User Story 2 — Graceful Display with Fewer Than 10 Games (Priority: P2)

**Goal**: Players with fewer than 10 play-mode games see correct medals (best 3 from all available, or fewer medals if <3 games).

**Independent Test**: Create a fresh player, complete 1–5 games, verify medals match available game count.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [US2] Add test: given 0 play-mode games (undefined gameHistory), returns empty array in `frontend/tests/services/playerStorage.test.ts`
- [X] T011 [US2] Add test: given 2 play-mode games, returns both sorted by score desc (topN=3 but only 2 available) in `frontend/tests/services/playerStorage.test.ts`
- [X] T012 [US2] Add test: given 5 play-mode games, returns top 3 from all 5 (window covers all available) in `frontend/tests/services/playerStorage.test.ts`

### Implementation for User Story 2

- [X] T013 [US2] Verify existing implementation from T007 handles <10 games correctly (`.slice(-windowSize)` on shorter arrays returns full array) — no code change expected, confirm tests pass in `frontend/tests/services/playerStorage.test.ts`

**Checkpoint**: User Story 2 complete — sparse histories display correctly.

---

## Phase 5: User Story 3 — Tie-Breaking in Medal Rankings (Priority: P3)

**Goal**: Games with identical scores are ranked by recency (most recent first).

**Independent Test**: Complete 2+ games with the same score, verify most recent takes higher medal.

### Tests for User Story 3

> **Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [US3] Verify existing tie-breaking test still passes with updated function signature (two games with same score, more recent ranks first) in `frontend/tests/services/playerStorage.test.ts`
- [X] T015 [US3] Add test: given 10 games all with identical scores, the 3 most recent hold medal positions in `frontend/tests/services/playerStorage.test.ts`
- [X] T016 [US3] Add test: improve-mode games are excluded from the window even when mixed with play-mode games in `frontend/tests/services/playerStorage.test.ts`

### Implementation for User Story 3

- [X] T017 [US3] Verify existing sort logic `(b.completedAt - a.completedAt)` handles tie-breaking correctly — no code change expected, confirm tests pass in `frontend/tests/services/playerStorage.test.ts`

**Checkpoint**: All user stories complete — tie-breaking and mode filtering verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories and code quality.

- [X] T018 Run full test suite to verify no regressions: `cd frontend && npx vitest run`
- [X] T019 Run TypeScript type-check: `cd frontend && npx tsc --noEmit`
- [X] T020 Run ESLint: `cd frontend && npx eslint src/`
- [X] T021 Run quickstart.md verification checklist from `specs/026-high-scores-medals/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verifies baseline
- **Foundational (Phase 2)**: Depends on Setup — updates JSDoc before code changes
- **US1 (Phase 3)**: Depends on Foundational — core function change
- **US2 (Phase 4)**: Depends on US1 implementation (T007) — validates edge behavior
- **US3 (Phase 5)**: Depends on US1 implementation (T007) — validates tie-breaking
- **Polish (Phase 6)**: Depends on all stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core change — all other stories validate behavior from this change
- **User Story 2 (P2)**: Tests validate edge cases of the US1 implementation; no new code expected
- **User Story 3 (P3)**: Tests validate tie-breaking of the US1 implementation; no new code expected

### Within Each User Story

- Tests MUST be written and FAIL before implementation (constitution V)
- Implementation makes tests pass
- Run targeted test suite to verify

---

## Parallel Example: User Story 1

```text
# Write all US1 tests together (they target the same test file, but are independent test cases):
T003: Update default-behavior test
T004: Add 15-game windowing test
T005: Add specific-scores verification test
T006: Update custom-params test

# Then implement sequentially:
T007: Update function signature (makes tests pass)
T008: Update call site
T009: Run verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: User Story 1 (T003–T009)
4. **STOP and VALIDATE**: Medals show top 3 from last 10 games
5. This is a fully functional MVP

### Incremental Delivery

1. Complete Setup + Foundational → Baseline verified
2. Add User Story 1 → Core behavior changed → MVP ready
3. Add User Story 2 → Edge cases verified with tests → No new code
4. Add User Story 3 → Tie-breaking verified with tests → No new code
5. Polish → Full regression + lint + typecheck

### Key Insight

This feature is unusual in that **all 3 user stories share the same implementation** (T007: the function signature change). US2 and US3 are inherent behaviors of the same algorithm. Their phases exist to verify correctness through dedicated test cases, not to add new code.

---

## Notes

- Total tasks: 21
- Tasks per story: US1 = 7 (4 tests + 3 implementation), US2 = 4 (3 tests + 1 verification), US3 = 4 (3 tests + 1 verification)
- Parallel opportunities: T003–T006 (US1 tests), T010–T012 (US2 tests), T014–T016 (US3 tests)
- All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- No new files created; no UI changes; no i18n changes; no schema migration
- Suggested MVP scope: User Story 1 (Phase 3)
