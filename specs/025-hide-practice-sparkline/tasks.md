# Tasks: Hide Sparkline in Practice/Improve Mode

**Input**: Design documents from `/specs/025-hide-practice-sparkline/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/

**Tests**: Included per Constitution Principle V (Test-First). Vitest + React Testing Library.

**Organization**: US1 (hide in improve) and US2 (keep in play) are two sides of the same conditional and affect the same files. They are grouped into a single phase since the implementation is a single line change. US3 (pre-game unaffected) requires no code changes — verified by existing tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: User Stories 1 & 2 — Sparkline Conditional by Game Mode (Priority: P1) 🎯 MVP

**Goal**: Hide the score progression sparkline on the result screen when `gameMode === 'improve'`; keep it visible when `gameMode === 'play'`.

**Independent Test**: Complete a game in Improve mode → no sparkline on result screen. Complete a game in Play mode with ≥2 play-mode history records → sparkline appears on result screen.

### Tests (write first, ensure they FAIL before implementation)

- [x] T001 [US1] Add test: sparkline is NOT rendered when gameMode is 'improve' with sufficient history in frontend/tests/components/ScoreSummary.test.tsx
- [x] T002 [US2] Add test: sparkline IS rendered when gameMode is 'play' with sufficient history in frontend/tests/components/ScoreSummary.test.tsx
- [x] T003 [US1] Add test: sparkline is NOT rendered when gameMode is 'improve' and history is undefined in frontend/tests/components/ScoreSummary.test.tsx

### Implementation

- [x] T004 Add `!isImprove` guard to sparkline rendering conditional in frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx

**Checkpoint**: Tests T001–T003 pass. Improve mode result screen shows no sparkline. Play mode result screen shows sparkline as before.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Verify no regressions and validate the feature end-to-end.

- [x] T005 Run full ScoreSummary test suite to confirm no regressions in frontend/tests/components/ScoreSummary.test.tsx
- [x] T006 Run full ProgressionGraph test suite to confirm no side effects in frontend/tests/components/ProgressionGraph.test.tsx
- [x] T007 Run quickstart.md manual validation (dev server spot-check for Improve and Play modes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies — project already exists, no new infrastructure needed
- **Phase 2**: Depends on Phase 1 completion

### Within Phase 1

- T001, T002, T003 are in the same file but can be written together in one editing pass
- T004 depends on T001–T003 being written (Test-First: tests must fail before implementation)
- T004 makes T001–T003 pass

### User Story 3 (Pre-game sparkline unaffected)

- US3 requires **no code changes** — the pre-game sparkline in `MainPage.tsx` already uses `getGameHistory()` which filters to play-mode only
- Verified by: existing ProgressionGraph tests (T006) and manual spot-check (T007)

---

## Parallel Example: Phase 1

```text
# No parallel opportunities within Phase 1 — all tasks touch the same two files.
# Sequential execution:
Step 1: T001 + T002 + T003 (write all three test cases in one pass — same file)
Step 2: T004 (implement the conditional — makes tests pass)
```

---

## Implementation Strategy

### MVP First (Phase 1 Only)

1. Write test cases T001–T003 (red — tests fail)
2. Implement T004 (green — tests pass)
3. **STOP and VALIDATE**: Run full test suite (T005–T006), manual spot-check (T007)
4. Feature complete

### Summary

| Metric | Value |
|--------|-------|
| Total tasks | 7 |
| Phase 1 (US1+US2) tasks | 4 |
| Phase 2 (Polish) tasks | 3 |
| Parallelizable tasks | 0 (all tasks touch ≤2 files) |
| Files modified | 2 (`ScoreSummary.tsx`, `ScoreSummary.test.tsx`) |
| Production LOC change | ~1 |
| Test LOC added | ~15 |

---

## Notes

- US1 and US2 are combined into one phase because they are the same conditional (`!isImprove`) — testing one necessarily tests the other
- US3 (pre-game sparkline) needs no code; existing tests and manual verification cover it
- No setup or foundational phase — the project is mature and no new infrastructure is needed
- The `isImprove` boolean already exists in `ScoreSummary.tsx` — the implementation reuses it
- Commit after T004 (tests + implementation) as a single logical change
