# Tasks: Round UX Rework

**Input**: Design documents from `/specs/008-round-ux-rework/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**Tests**: Included — constitution Principle V (Test-First) requires tests before implementation. axe-core accessibility tests for new/modified components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend source**: `frontend/src/`
- **Frontend tests**: `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add constants and types shared by all user stories

- [x] T001 Add `COUNTDOWN_DURATION_MS`, `COUNTDOWN_COLORS`, and `CountdownColor` type to `frontend/src/constants/scoring.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the `useRoundTimer` hook — all user stories depend on this

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update useRoundTimer tests for countdown display (`"5.0s"` → `"0.0s"`), `barRef` width/color updates, freeze-on-stop, and reduced-motion throttling in `frontend/tests/hooks/useRoundTimer.test.ts`
- [x] T003 Extend `useRoundTimer` hook: add `barRef` return, switch `displayRef` to countdown (`5.0s` → `0.0s`), compute bar width (100% → 0%) and `backgroundColor` from `COUNTDOWN_COLORS` per scoring tier, add `reducedMotion` parameter for 500ms discrete steps, update `reset()` to `"5.0s"` + full-width green, update ARIA attributes (`aria-valuenow`, `aria-valuetext`) on `barRef` in `frontend/src/hooks/useRoundTimer.ts`

**Checkpoint**: Hook ready — component implementation can now begin

---

## Phase 3: User Story 1 — Animated Countdown Timer Bar (Priority: P1) 🎯 MVP

**Goal**: Display a horizontal countdown bar in the game status area that shrinks from right to left over 5 seconds, changing color through four scoring-tier stages (green → light green → orange → red), alongside a numeric countdown from 5.0s to 0.0s.

**Independent Test**: Start a game round. Verify the bar starts full-width in green, shrinks smoothly, transitions through light green → orange → red at 2s/3s/4s elapsed, and the numeric display counts down from 5.0 to 0.0. Submit an answer and confirm the bar freezes.

### Tests for User Story 1

> **Write these tests FIRST — ensure they FAIL before implementation**

- [x] T004 [P] [US1] Write CountdownBar component tests: renders container with `role="progressbar"`, attaches `barRef`, has `aria-valuemin`/`aria-valuemax`, correct initial styling, `prefers-reduced-motion` CSS behavior in `frontend/tests/components/CountdownBar.test.tsx`
- [x] T005 [P] [US1] Update GameStatus tests: add `barRef` prop to all test renders, verify CountdownBar is rendered, verify timer initial text is `"5.0s"`, verify existing round/score/replay rendering still works in `frontend/tests/components/GameStatus.test.tsx`

### Implementation for User Story 1

- [x] T006 [P] [US1] Create CountdownBar component (`CountdownBar.tsx` + `CountdownBar.module.css`): container div with `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="5"`, child fill div with `ref={barRef}`, track background, rounded corners, fixed height, `transition: background-color 200ms ease` (disabled under `prefers-reduced-motion: reduce`) in `frontend/src/components/GamePlay/CountdownBar/`
- [x] T007 [US1] Modify GameStatus to accept `barRef` prop, render CountdownBar below the status row, change timer initial text from `"0.0s"` to `"5.0s"` in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx` and `frontend/src/components/GamePlay/GameStatus/GameStatus.module.css`
- [x] T008 [US1] Update MainPage to destructure `barRef` from `useRoundTimer()` and pass it to `GameStatus` as a prop in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: Countdown bar is visible and animating during gameplay. Numeric countdown shows 5.0s → 0.0s. Bar freezes on answer submission. US1 is independently testable.

---

## Phase 4: User Story 2 — Inline Feedback Banner (Priority: P1)

**Goal**: After the player submits an answer, replace the formula display with a compact inline banner showing correct/incorrect result in the same vertical space, preventing layout shift and preserving virtual keyboard focus on touch devices.

**Independent Test**: Play a round on a touch device (or emulator). Submit an answer. Verify: (a) the formula is replaced by a colored banner with checkmark/cross and text, (b) the input field stays visible and is not unmounted, (c) the virtual keyboard remains visible, (d) after 1.2s the next round's formula appears with the input focused.

### Tests for User Story 2

> **Write these tests FIRST — ensure they FAIL before implementation**

- [x] T009 [P] [US2] Write InlineFeedback component tests: correct answer renders green background + checkmark + "Correct!", incorrect answer renders red background + cross + "Not quite!" + correct answer text, has `role="status"` and `aria-live="assertive"`, respects `prefers-reduced-motion` in `frontend/tests/components/InlineFeedback.test.tsx`
- [x] T010 [P] [US2] Write or update MainPage integration tests: verify InlineFeedback appears in formula area during feedback phase, verify FormulaDisplay appears during input phase, verify RoundFeedback is no longer rendered, verify no layout shift (container has fixed height) in `frontend/tests/pages/MainPage.test.tsx`

### Implementation for User Story 2

- [x] T011 [P] [US2] Create InlineFeedback component (`InlineFeedback.tsx` + `InlineFeedback.module.css`): accepts `isCorrect` and `correctAnswer` props, correct → green background + `✓` + "Correct!", incorrect → red background + `✗` + "Not quite!" + "The answer was {correctAnswer}", `role="status"`, `aria-live="assertive"`, subtle fadeIn animation (disabled under `prefers-reduced-motion: reduce`), fixed height matching formula area in `frontend/src/components/GamePlay/InlineFeedback/`
- [x] T012 [US2] Modify MainPage: wrap FormulaDisplay/InlineFeedback in a fixed-height `formulaArea` container (`min-height: 88px` desktop / `68px` mobile), conditionally render InlineFeedback during feedback phase and FormulaDisplay during input phase, remove RoundFeedback rendering and import, move `aria-live` region to InlineFeedback in `frontend/src/pages/MainPage.tsx`

**Checkpoint**: Inline feedback banner replaces formula area on answer submission. No layout shift. Virtual keyboard persists on touch devices. US2 is independently testable.

---

## Phase 5: User Story 3 — Consistent Countdown on Replay Rounds (Priority: P2)

**Goal**: Replay rounds behave identically to primary rounds — countdown bar resets to full/green, inline feedback banner appears after each answer, same timing and colors.

**Independent Test**: Deliberately answer some questions incorrectly during a game. When replay rounds begin, verify the countdown bar starts fresh at 5.0s/full-width/green the inline banner appears after each replay answer.

### Tests for User Story 3

- [x] T013 [US3] Add replay-specific assertions to MainPage integration tests: verify countdown bar resets at replay round start, verify inline feedback appears after replay answer, verify replay badge still shows in `frontend/tests/pages/MainPage.test.tsx`

### Implementation for User Story 3

- [x] T014 [US3] Verify replay rounds correctly reset countdown bar and inline feedback in `frontend/src/pages/MainPage.tsx` — the existing `reset()` + `start()` calls in `handleSubmit` timeout should already handle this; add any missing reset logic if needed

**Checkpoint**: All three user stories work independently. Replay rounds are visually consistent with primary rounds.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup removed components, update accessibility tests, final validation

- [x] T015 [P] Update accessibility tests: remove RoundFeedback axe-core tests, add tests for CountdownBar (`role="progressbar"`, ARIA attributes, color contrast) and InlineFeedback (`aria-live`, `role="status"`, color contrast) in `frontend/tests/a11y/accessibility.test.tsx`
- [x] T016 [P] Delete RoundFeedback component directory `frontend/src/components/GamePlay/RoundFeedback/`
- [x] T017 [P] Delete RoundFeedback test file `frontend/tests/components/RoundFeedback.test.tsx`
- [x] T018 Run full test suite (`npm test`) and production build (`npm run build`) — all tests must pass, zero type errors
- [x] T019 Run quickstart.md validation: follow setup and verification steps in `specs/008-round-ux-rework/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T002, T003)
- **User Story 2 (Phase 4)**: Depends on Foundational (T002, T003) — can run in parallel with US1 (different components) except T012 which modifies MainPage (after T008)
- **User Story 3 (Phase 5)**: Depends on US1 + US2 completion (verifies their combined behavior)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational — T012 should execute after T008 (both modify MainPage.tsx)
- **User Story 3 (P2)**: Depends on US1 + US2 — verification-focused, minimal new code

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Component creation before integration (parent modifications)
- CSS modules co-located with components
- Story complete and testable before moving to next priority

### Parallel Opportunities

- **Phase 1**: Single task, no parallelism needed
- **Phase 2**: T002 (tests) before T003 (implementation) — sequential
- **Phase 3**: T004 + T005 (tests) in parallel → T006 (CountdownBar, parallel with tests) → T007 → T008
- **Phase 4**: T009 + T010 (tests) in parallel → T011 (InlineFeedback, parallel with tests) → T012 (after T008)
- **Phase 5**: T013 → T014 — sequential
- **Phase 6**: T015 + T016 + T017 in parallel → T018 → T019

---

## Parallel Example: User Story 1

```bash
# Launch tests in parallel (both write to different files):
Task T004: "Write CountdownBar tests in frontend/tests/components/CountdownBar.test.tsx"
Task T005: "Update GameStatus tests in frontend/tests/components/GameStatus.test.tsx"

# CountdownBar component can be created in parallel with tests (different files):
Task T006: "Create CountdownBar component in frontend/src/components/GamePlay/CountdownBar/"

# Sequential — modifies files touched by prior tasks:
Task T007: "Modify GameStatus in frontend/src/components/GamePlay/GameStatus/GameStatus.tsx"
Task T008: "Update MainPage in frontend/src/pages/MainPage.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch tests in parallel (different files):
Task T009: "Write InlineFeedback tests in frontend/tests/components/InlineFeedback.test.tsx"
Task T010: "Write MainPage integration tests in frontend/tests/pages/MainPage.test.tsx"

# InlineFeedback component can be created in parallel with tests:
Task T011: "Create InlineFeedback component in frontend/src/components/GamePlay/InlineFeedback/"

# Sequential — modifies MainPage (after T008 from US1):
Task T012: "Replace RoundFeedback with InlineFeedback in frontend/src/pages/MainPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T003)
3. Complete Phase 3: User Story 1 (T004–T008)
4. **STOP and VALIDATE**: Countdown bar animates, colors transition, freezes on submit
5. Playable game with animated countdown — ship if ready

### Incremental Delivery

1. Setup + Foundational → Hook ready
2. Add User Story 1 → Animated countdown bar visible → Validate independently
3. Add User Story 2 → Inline feedback replaces result panel → Validate independently
4. Add User Story 3 → Replay rounds consistent → Validate independently
5. Polish → Remove old components, update a11y tests → Full validation
6. Each story adds value without breaking previous stories

### Single Developer Strategy

1. Complete Phases 1–2 sequentially (T001–T003)
2. Complete Phase 3 (T004–T008) — MVP deliverable
3. Complete Phase 4 (T009–T012) — full feature
4. Complete Phase 5 (T013–T014) — verification
5. Complete Phase 6 (T015–T019) — cleanup and validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in this phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Constitution Principle V: Write tests first, verify they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The `useRoundTimer` hook change (Phase 2) is the single blocking dependency — all visual components depend on it
- `prefers-reduced-motion` support is built into each component's CSS and the hook's JS logic — not a separate task
