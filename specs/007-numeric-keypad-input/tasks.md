# Tasks: Numeric Keypad Input on Touch Devices

**Input**: Design documents from `/specs/007-numeric-keypad-input/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Existing tests updated to remain passing after the ARIA role change.

**Organization**: Single user story — tasks are sequential within one phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: User Story 1 – Numeric Keypad for Answer Input (Priority: P1) 🎯 MVP

**Goal**: Change the answer input's HTML attributes so touch devices present a pure 0–9 digit keypad instead of a phone-dialler or full alphabetic keyboard.

**Independent Test**: Open the app on iOS Safari and Android Chrome, start a game round, tap the answer field, and verify a 0–9 digit keypad appears with no phone symbols.

### Implementation for User Story 1

- [x] T001 [P] [US1] Change input `type` from `"number"` to `"text"` and add `pattern="[0-9]*"` and `enterKeyHint="go"` attributes, remove `min={0}` in frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx
- [x] T002 [P] [US1] Update all test role queries from `getByRole('spinbutton')` to `getByRole('textbox')` in frontend/tests/components/AnswerInput.test.tsx
- [x] T003 [US1] Run full test suite and verify all AnswerInput tests pass with updated role queries

**Checkpoint**: Answer input shows pure 0–9 digit keypad on iOS Safari and Android Chrome. All tests green.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Verification across platforms and cleanup

- [x] T004 Run quickstart.md validation — verify on iOS Safari, Android Chrome, and desktop browsers per specs/007-numeric-keypad-input/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 1)**: No dependencies — no setup or foundational work needed. Existing project structure and dependencies are sufficient.
- **Polish (Phase 2)**: Depends on Phase 1 completion.

### User Story Dependencies

- **User Story 1 (P1)**: Only user story. No cross-story dependencies.

### Within User Story 1

- T001 and T002 can run in parallel (different files, no dependencies)
- T003 depends on T001 and T002 both being complete
- T004 depends on T003 passing

### Parallel Opportunities

```
# T001 and T002 can run simultaneously:
Task T001: "Change input attributes in frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx"
Task T002: "Update test role queries in frontend/tests/components/AnswerInput.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1 (T001 + T002 in parallel, then T003)
2. **STOP and VALIDATE**: Run tests, verify on real devices
3. Complete Phase 2: Quickstart validation (T004)
4. Ready to merge

### Notes

- T001 and T002 are the only implementation tasks — they modify different files and can be done in parallel
- T003 is a verification gate — ensures the role change doesn't break any tests
- T004 is manual cross-platform verification per quickstart.md
- No new files created in source
- No new dependencies required
- Commit after T001+T002 as a single logical change
