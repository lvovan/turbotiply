# Tasks: Stable Status Panel Height

**Input**: Design documents from `/specs/028-stable-panel-height/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/css-contract.md, quickstart.md
**Tests**: Included — constitution V (Test-First) requires tests for all new features.
**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2)
- Exact file paths included in every task

---

## Phase 1: User Story 1 – No Layout Shift During Phase Transitions (Priority: P1) 🎯 MVP

**Goal**: The status panel maintains a fixed height when transitioning between input phase (round/score/timer) and feedback phase (result message), eliminating vertical layout shifts for elements below it.

**Independent Test**: Start a game, submit an answer, and verify the formula display and answer input do not shift vertically when the panel transitions between input and feedback modes. Repeat for correct and incorrect answers.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T001 [US1] Add height stability tests for input↔feedback phase transitions in frontend/tests/components/GameStatus.test.tsx

**Details for T001**: Add a new `describe('panel height stability')` block in the existing GameStatus.test.tsx. Add the following test cases, each rendering the component and checking `getComputedStyle(root).height`:
1. "root element has fixed height style (not min-height)" — render in input phase, verify the root element's `.status` class applies a fixed `height` (via CSS module) and `overflow: hidden`.
2. "panel height is identical for input phase and correct-answer feedback phase" — render once with `currentPhase: 'input'`, render again with `currentPhase: 'feedback', isCorrect: true`, verify both root elements have the same `className` containing `status` (same container = same fixed height).
3. "panel height is identical for input phase and incorrect-answer feedback phase" — render with `currentPhase: 'feedback', isCorrect: false, correctAnswer: 144`, verify root has the same `status` class.
4. "all existing content renders without errors in feedback phase" — render with `currentPhase: 'feedback', isCorrect: false, correctAnswer: 144`, verify feedback icon, text, answer text, and completion count are all present (regression guard for FR-007).

These tests should fail initially because the CSS still uses `min-height` instead of `height`.

**Checkpoint**: Tests written and failing (red). Proceed to implementation.

### Implementation for User Story 1

- [X] T002 [US1] Replace `min-height` with `height` and add `overflow: hidden` in desktop styles in frontend/src/components/GamePlay/GameStatus/GameStatus.module.css

**Details for T002**: In the `.status` rule block, change `min-height: 5rem` to `height: 5rem` and add `overflow: hidden`. No other properties change. Per research.md decision #1 and css-contract.md: this locks the container to exactly 5rem (80px), matching the current rendered height. The `overflow: hidden` clips content in extreme edge cases (FR-006).

- [X] T003 [US1] Replace `min-height` with `height` in mobile responsive styles in frontend/src/components/GamePlay/GameStatus/GameStatus.module.css

**Details for T003**: In the `@media (max-width: 480px)` `.status` override, change `min-height: 4rem` to `height: 4rem`. Per research.md decision #3: mobile content fits within 64px across all phases. The `overflow: hidden` from the base rule already applies.

**Checkpoint**: T001 tests now pass (green). Status panel has fixed height on desktop and mobile. Layout shifts eliminated for input↔feedback transitions.

---

## Phase 2: User Story 2 – Consistent Panel Height Across Game Modes (Priority: P2)

**Goal**: The panel height is identical in normal play mode, practice/improve mode, and replay mode — no layout differences when different content is displayed based on game mode.

**Independent Test**: Start a normal game and note the panel height. Return to menu and start a practice game. Verify the panel height is identical. Trigger replay and verify the panel height is identical.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T004 [US2] Add cross-mode height consistency tests in frontend/tests/components/GameStatus.test.tsx

**Details for T004**: Inside the existing `describe('panel height stability')` block (created in T001), add:
1. "panel uses same root container class in play mode and improve mode" — render with `gameMode: 'play'`, render with `gameMode: 'improve'`, verify both root elements have `className` containing `status` (same fixed height CSS applies).
2. "panel uses same root container class in normal and replay modes" — render with `isReplay: false`, render with `isReplay: true`, verify both root elements have `className` containing `status`.
3. "panel uses same root container class in improve mode feedback phase" — render with `gameMode: 'improve', currentPhase: 'feedback', isCorrect: true`, verify root has `status` class.

### Implementation for User Story 2

No additional implementation needed — the CSS change from Phase 1 (T002/T003) already applies the fixed `height` to the `.status` class regardless of game mode or content. The `height: 5rem` / `height: 4rem` constrains the container in all states. T004 tests should pass immediately after T002/T003 are complete.

**Checkpoint**: All T004 tests pass. Panel height is provably identical across all modes and phases.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Validate everything works end-to-end and no regressions exist.

- [X] T005 Run full test suite to verify no regressions in frontend/tests/
- [X] T006 Run quickstart.md manual verification per specs/028-stable-panel-height/quickstart.md

**Details for T005**: Run `npm test` from `frontend/`. All existing GameStatus tests (input rendering, feedback rendering, replay mode, practice mode, accessibility) must continue passing. The CSS change should not affect any existing test behavior since JSDOM does not compute real CSS heights — but all functional tests must remain green.

**Details for T006**: Follow the 7-step verification guide in quickstart.md: start normal game, submit correct answer (no shift), submit incorrect answer (no shift), start practice game (same height), test on mobile viewport (≤480px, same behavior).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: No prerequisites — can start immediately. This is the MVP.
- **Phase 2 (US2)**: Tests depend on T001's `describe` block existing. Implementation is already done by Phase 1.
- **Phase 3 (Polish)**: Depends on Phase 1 + Phase 2 completion.

### Within Phase 1

```text
T001 (tests - RED) → T002 + T003 (CSS implementation - GREEN) → verify T001 passes
```

T002 and T003 edit the same file but different rule blocks (desktop `.status` vs mobile `@media`). They can be done sequentially in one edit session.

### Within Phase 2

```text
T004 (tests) → already passes from Phase 1 implementation
```

### Within Phase 3

```text
T005 (full suite) → T006 (manual verification)
```

### Parallel Opportunities

- T002 and T003 modify different rule blocks in the same file — sequential within one edit, but logically independent.
- T001 and T004 both add to the same test file — sequential, but T004 extends T001's describe block.
- This feature is intentionally minimal (CSS-only). Parallelization is limited by the small scope.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Write height stability tests (RED)
2. Complete T002 + T003: Apply CSS fix (GREEN)
3. **STOP and VALIDATE**: Run T001 tests — they should pass
4. This alone delivers the core value: no layout shift during phase transitions

### Incremental Delivery

1. Phase 1 → US1 complete → Phase transitions are stable (MVP!)
2. Phase 2 → US2 tests confirm cross-mode consistency → Already works from Phase 1
3. Phase 3 → Full validation → Ready for merge

---

## Notes

- This is a CSS-only feature. No TypeScript changes, no new components, no state changes.
- JSDOM (used by Vitest) does not compute real CSS layout. Height stability tests verify structural invariants (same container class, overflow property) rather than pixel measurements. True pixel verification happens in T006 (manual quickstart validation).
- The `overflow: hidden` property is the only genuinely new CSS behavior. The `height` values are identical to what the panel already renders at — the change simply prevents growth.
