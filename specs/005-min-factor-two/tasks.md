# Tasks: Minimum Factor of Two

**Input**: Design documents from `/specs/005-min-factor-two/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/formula-generator.md

**Tests**: Included — constitution principle V (Test-First) requires tests before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `frontend/` at repository root (per constitution Principle IV)

---

## Phase 1: User Story 1 — Harder Multiplication Challenges (Priority: P1) 🎯 MVP

**Goal**: Change factor range from 1–12 to 2–12 so every question genuinely tests multiplication skills.

**Independent Test**: Start a new game and play through all 10 rounds. Every formula uses factors between 2 and 12 inclusive; no factor is ever 1.

### Tests for User Story 1 (red phase — write first, must fail)

- [X] T001 [P] [US1] Update pair count assertion from 78 to 66 in `getAllUnorderedPairs` tests in frontend/tests/services/formulaGenerator.test.ts
- [X] T002 [P] [US1] Update factor range lower bound assertions from `toBeGreaterThanOrEqual(1)` to `toBeGreaterThanOrEqual(2)` in all `getAllUnorderedPairs` and `generateFormulas` tests in frontend/tests/services/formulaGenerator.test.ts
- [X] T003 [P] [US1] Update test description strings from `[1, 12]` to `[2, 12]` in frontend/tests/services/formulaGenerator.test.ts

### Implementation for User Story 1

- [X] T004 [US1] Change loop start from `let a = 1` to `let a = 2` in `getAllUnorderedPairs()` in frontend/src/services/formulaGenerator.ts
- [X] T005 [P] [US1] Update JSDoc comments in `getAllUnorderedPairs()` and `generateFormulas()` — change pair count 78→66 and range 1→2 in frontend/src/services/formulaGenerator.ts
- [X] T006 [P] [US1] Update JSDoc comments on `factorA` and `factorB` fields from `(1–12)` to `(2–12)` in frontend/src/types/game.ts

**Checkpoint**: Run `npx vitest run tests/services/formulaGenerator.test.ts` — all tests pass (green phase). User Story 1 is complete and independently testable.

---

## Phase 2: User Story 2 — Sufficient Question Variety (Priority: P2)

**Goal**: Confirm 66 remaining pairs provide sufficient variety for 10-question games across multiple sessions.

**Independent Test**: Play 5 consecutive games; each game has 10 distinct pairs and game-to-game variation is evident.

> **Note**: US2 is inherently satisfied by US1's implementation. The pair pool of 66 already exceeds the 10 pairs per game requirement, and existing statistical tests in `formulaGenerator.test.ts` (multi-game uniqueness, distribution uniformity) continue to validate variety. No additional code changes are required beyond US1.

### Verification for User Story 2

- [X] T007 [US2] Verify existing statistical tests pass — no-duplicate-pairs-in-100-games, hidden-position-uniformity, and display-order-variety tests in frontend/tests/services/formulaGenerator.test.ts

**Checkpoint**: All statistical validation tests pass with the 66-pair pool. US2 is confirmed complete.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [X] T008 Run full test suite (`npx vitest run`) to confirm no regressions across all test files
- [X] T009 Run quickstart.md validation steps to confirm end-to-end correctness

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies — can start immediately. No setup or foundational work needed.
- **User Story 2 (Phase 2)**: Depends on US1 completion (same files). Verification only, no new code.
- **Polish (Phase 3)**: Depends on US1 and US2 completion.

### User Story Dependencies

- **User Story 1 (P1)**: Independent. Tests → Implementation → Green.
- **User Story 2 (P2)**: Depends on US1 (code changes are shared). Verification step only.

### Within User Story 1

- T001, T002, T003 (tests) MUST be written first and MUST FAIL before implementation
- T004 (code change) depends on T001–T003 being written
- T005, T006 (JSDoc updates) can run in parallel with each other, but after T004
- After T004–T006, run tests to confirm green

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (different sections of the same test file, independent changes)
- T005 and T006 can run in parallel (different source files)

---

## Parallel Example: User Story 1

```bash
# Step 1 — Write failing tests (parallel):
Task T001: Update pair count assertion (78→66)
Task T002: Update factor range assertions (≥1→≥2)
Task T003: Update test description strings ([1,12]→[2,12])

# Step 2 — Run tests, confirm RED

# Step 3 — Apply code change:
Task T004: Change loop start (1→2) in getAllUnorderedPairs()

# Step 4 — Update docs (parallel):
Task T005: Update JSDoc in formulaGenerator.ts
Task T006: Update JSDoc in types/game.ts

# Step 5 — Run tests, confirm GREEN
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Write tests T001–T003 (red phase)
2. Implement T004 (code change)
3. Update docs T005–T006
4. **STOP and VALIDATE**: Run tests — all green
5. US1 is complete and delivers full feature value

### Incremental Delivery

1. Complete US1 → All formulas use factors 2–12 (MVP!)
2. Verify US2 → Statistical variety confirmed
3. Polish → Full suite regression check

---

## Notes

- Total tasks: 9
- US1 tasks: 6 (3 test, 3 implementation)
- US2 tasks: 1 (verification only)
- Polish tasks: 2
- Parallel opportunities: T001/T002/T003 (tests), T005/T006 (JSDoc)
- MVP scope: User Story 1 only (tasks T001–T006)
- All tasks follow checklist format: checkbox, ID, labels, file paths
