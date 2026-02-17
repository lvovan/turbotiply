# Tasks: Practice Score Separation

**Input**: Design documents from `/specs/021-practice-score-separation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests ARE included — existing test files need to be updated to reflect the new algorithm and display cap.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup

**Purpose**: No setup tasks needed — existing project structure, dependencies, and types are all sufficient. No new files, types, or data model changes required.

*(No tasks in this phase — all infrastructure is already in place.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify existing filtering is correct before making changes. These are validation-only tasks — no code changes.

- [x] T001 Verify `getRecentHighScores()` filters play-only in `frontend/src/services/playerStorage.ts` (read-only audit, confirm `(r.gameMode ?? 'play') === 'play'` at L348–349)
- [x] T002 [P] Verify `getGameHistory()` filters play-only in `frontend/src/services/playerStorage.ts` (read-only audit, confirm play-mode filter at L365–366)
- [x] T003 [P] Verify `getChallengingPairsForPlayer()` uses both modes in `frontend/src/services/challengeAnalyzer.ts` (read-only audit, confirm NO mode filter at L111)

**Checkpoint**: All three existing filtering behaviors confirmed correct — no code changes needed. Story implementation can proceed.

---

## Phase 3: User Story 1+2+3 — Score Filtering & Tricky Number Analysis (Priority: P1) 🎯 MVP

**Goal**: High scores and sparkline show play-only data (already implemented); tricky number analysis uses both modes (already implemented). This phase verifies the existing behavior with tests as needed.

**Independent Test**: Complete 3 Play games and 2 Improve games. Verify high scores show 3 Play scores only, sparkline shows 3 Play data points only, and tricky number analysis reflects mistakes from both Play and Improve games.

**Note**: User Stories 1, 2, and 3 require NO code changes — the existing implementation already satisfies FR-001 through FR-007. These stories are grouped together because they share the same validation: the existing filtering is already correct. The only actionable work is adding regression tests to lock in the expected behavior.

### Tests for User Stories 1, 2, 3

- [x] T004 [P] [US1] Add regression test in `frontend/tests/services/challengeAnalyzer.test.ts` verifying `getChallengingPairsForPlayer()` analyzes both Play and Improve games (create player with interleaved Play/Improve games, confirm both modes' rounds are included in challenging pair analysis)
- [x] T005 [P] [US2] Add regression test in `frontend/tests/services/challengeAnalyzer.test.ts` verifying `getChallengingPairsForPlayer()` includes Improve-only game history in tricky number analysis (player with only Improve games still produces tricky pairs)

**Checkpoint**: User Stories 1, 2, and 3 are confirmed working via existing code + new regression tests. No code changes needed.

---

## Phase 4: User Story 4 — Improve Button Shows Top 3 Tricky Numbers (Priority: P2)

**Goal**: Change the tricky number display from up to 8 numbers (all unique factors) to at most 3 numbers (ranked by per-factor aggregate mistake count).

**Independent Test**: Create a player whose tricky pairs produce 6+ unique factor numbers. Verify the Improve button descriptor shows only the 3 factors with the highest aggregate mistake counts, sorted ascending.

### Tests for User Story 4

> **NOTE: Update these existing tests FIRST, ensure they FAIL before implementation changes**

- [x] T006 [US4] Update `extractTrickyNumbers` tests in `frontend/tests/services/challengeAnalyzer.test.ts`: change "caps at 8 numbers" test to expect cap at 3; update "collects unique factors" test to expect per-factor ranking behavior; add test for aggregate mistake count ranking (e.g., pairs 7×8=5 mistakes + 4×7=2 mistakes → factor 7 has 7 aggregate → appears in top 3); add test for tie-breaking by avgMs (slowest first); add test for fewer than 3 factors (returns all available)
- [x] T007 [P] [US4] Update `ModeSelector` tests in `frontend/tests/components/ModeSelector.test.tsx`: change "renders ellipsis when more than 8 numbers" to expect cap at 3; change "renders exactly 8 numbers without ellipsis" to test with 3 numbers; ensure existing rendering tests still pass with ≤3 numbers

### Implementation for User Story 4

- [x] T008 [US4] Rewrite `extractTrickyNumbers()` in `frontend/src/services/challengeAnalyzer.ts`: change `MAX_TRICKY_NUMBERS` from 8 to 3; replace algorithm body — for each factor (2–12) sum `mistakeCount` across all pairs containing it, compute weighted `avgMs`, sort by aggregate mistakes desc then avgMs desc, take top 3, sort ascending for display
- [x] T009 [P] [US4] Update `MAX_DISPLAY` from 8 to 3 in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx` (defense-in-depth cap matching the algorithm cap)

**Checkpoint**: User Story 4 complete — `extractTrickyNumbers()` returns at most 3 factors ranked by aggregate mistake count, ModeSelector displays at most 3 numbers. All tests pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [x] T010 Run full test suite (`npm test`) to verify no regressions in `frontend/`
- [x] T011 Run quickstart.md verification checklist against a local dev instance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No tasks — already complete
- **Phase 2 (Foundational)**: Read-only audit — can start immediately, takes minutes
- **Phase 3 (US1+2+3)**: Depends on Phase 2 confirmation; adds regression tests only
- **Phase 4 (US4)**: Can start after Phase 2 confirmation; this is where all code changes happen
- **Phase 5 (Polish)**: Depends on Phase 4 completion

### User Story Dependencies

- **US1 (High Scores)**: No code changes needed — existing implementation is correct
- **US2 (Sparkline)**: No code changes needed — existing implementation is correct
- **US3 (Tricky Analysis Both Modes)**: No code changes needed — existing implementation is correct
- **US4 (Top 3 Display)**: Depends on US3 analysis being correct (confirmed in Phase 2). Changes `extractTrickyNumbers()` and `ModeSelector` display cap.

### Within Phase 4 (User Story 4)

1. Update tests FIRST (T006, T007 in parallel) — verify they FAIL
2. Implement algorithm change (T008) and display cap change (T009 in parallel)
3. Verify all tests PASS

### Parallel Opportunities

- T002 + T003 can run in parallel (both are read-only audits of different files)
- T004 + T005 can run in parallel (both add tests to the same file but different `describe` blocks)
- T006 + T007 can run in parallel (different test files)
- T008 + T009 can run in parallel (different source files, both changing a cap value)

---

## Parallel Example: Phase 4 (User Story 4)

```bash
# Launch test updates in parallel:
Task T006: "Update extractTrickyNumbers tests in frontend/tests/services/challengeAnalyzer.test.ts"
Task T007: "Update ModeSelector tests in frontend/tests/components/ModeSelector.test.tsx"

# Launch implementation changes in parallel:
Task T008: "Rewrite extractTrickyNumbers() in frontend/src/services/challengeAnalyzer.ts"
Task T009: "Update MAX_DISPLAY in frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1–3)

1. Complete Phase 2: Audit existing filtering (minutes)
2. Complete Phase 3: Regression tests confirm US1–3 already work
3. **STOP and VALIDATE**: All three P1 stories are done with zero code changes

### Full Delivery (Add User Story 4)

4. Complete Phase 4: Algorithm + display cap changes
5. Complete Phase 5: Full regression + quickstart validation
6. **DONE**: All 4 user stories complete

### Notes

- This is an unusually small feature: only 2 source files change, 2 test files are updated
- US1, US2, US3 are already implemented — this feature primarily documents and tests existing behavior
- The only new logic is the per-factor ranking algorithm in `extractTrickyNumbers()`
- Total estimated tasks: 11 (3 audits, 2 regression tests, 2 test updates, 2 implementation changes, 2 validation)
