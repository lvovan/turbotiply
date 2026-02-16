# Tasks: Touch Answer Keypad

**Input**: Design documents from `/specs/011-touch-answer-keypad/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Included — project constitution mandates Test-First (Principle V).

**Organization**: Tasks grouped by user story. US4 (Input Correction) implementation is included in US1 phase since the backspace button is an integral part of the numpad grid; US4 phase adds focused verification tests.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization

No setup tasks needed — existing React 19 / TypeScript ~5.9 / Vite 7 project with all dependencies installed. Feature adds new files within the existing `frontend/src/components/GamePlay/AnswerInput/` component structure. No new npm dependencies required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Touch detection hook shared by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Write useTouchDetection hook tests covering touch device (maxTouchPoints > 0 → true), non-touch device (maxTouchPoints === 0 → false), and value stability across re-renders in frontend/tests/hooks/useTouchDetection.test.ts
- [X] T002 Implement useTouchDetection hook returning navigator.maxTouchPoints > 0 via lazy useState initializer in frontend/src/hooks/useTouchDetection.ts

**Checkpoint**: Touch detection available — user story implementation can begin

---

## Phase 3: User Story 1 — Answer via Custom Numpad on Mobile (Priority: P1) 🎯 MVP

**Goal**: Players on touch devices see a custom in-page numpad with digits 0–9, backspace (⌫), and Go button arranged in a 4×3 calculator-style grid. Tapping digits composes the answer in a read-only display div, Go submits, ⌫ deletes the last digit. Physical keyboard input (0–9, Enter, Backspace) works alongside the numpad on hybrid devices. The OS on-screen keyboard never appears.

**Independent Test**: Open app on a touch device (or emulate touch via DevTools), start a game, answer all 10 rounds using only the numpad. Verify correct submission, max 3 digits, no leading zeros, backspace works, empty Go is ignored, and feedback phase disables all buttons.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T003 [P] [US1] Write TouchNumpad tests covering: digit entry appends to display, multi-digit composition (e.g., "7" then "2" → "72"), Go submits parsed number via onSubmit, empty Go no-op, all buttons disabled when acceptingInput is false, answer clears after submit, answer clears on new round (acceptingInput false→true), max 3 digits enforced, leading zero prevented, backspace removes last digit, backspace on empty no-op, double-tap Go guard (onSubmit called once), physical keyboard digit/Enter/Backspace input via document keydown, axe-core accessibility (no violations), ARIA labels on all buttons ("digit 0"–"digit 9", "submit answer", "delete last digit"), answer display div has role="status" and aria-live="polite" in frontend/tests/components/TouchNumpad.test.tsx

### Implementation for User Story 1

- [X] T004 [P] [US1] Create TouchNumpad CSS module with grid-template-columns repeat(3, 1fr), gap 8px, button min-height 48px, padding 12px 0, font-size 1.5rem for digits and 1.25rem for Go/⌫, touch-action manipulation on container, :active feedback (background darken + transform scale 0.95), Go accent color #6c63ff with white text and font-weight 700, disabled state reduced opacity, -webkit-tap-highlight-color transparent, :hover scoped to @media (hover: hover) and (pointer: fine), and answer display styled with existing .input class dimensions in frontend/src/components/GamePlay/AnswerInput/TouchNumpad.module.css
- [X] T005 [US1] Implement TouchNumpad component with: answer display div (role="status", aria-live="polite", aria-label="Current answer", "?" placeholder when empty, styled as existing input), 12-button grid (1-2-3 / 4-5-6 / 7-8-9 / 0-⌫-Go), digit buttons with aria-label="digit N", backspace button with aria-label="delete last digit", Go button with aria-label="submit answer" and synchronous useRef double-tap guard, useState for answer string, max 3 digits and no leading zeros validation, document-level keydown listener (digits/Enter/Backspace) managed by useEffect with acceptingInput dependency, state reset on acceptingInput false→true transition in frontend/src/components/GamePlay/AnswerInput/TouchNumpad.tsx
- [X] T006 [US1] Modify AnswerInput to import useTouchDetection and TouchNumpad, call useTouchDetection(), and conditionally render TouchNumpad (when touch detected) vs existing text input + Submit button (when no touch), passing onSubmit and acceptingInput props to TouchNumpad in frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx

**Checkpoint**: Core numpad fully functional on touch devices. Players can compose and submit answers for all round types (factor-hidden and product-hidden, answers 2–144). This is the MVP.

---

## Phase 4: User Story 2 — Standard Input Preserved on Desktop (Priority: P2)

**Goal**: Players on desktop devices (no touchscreen) see the existing text input + Submit button with no trace of the custom numpad. All existing keyboard interactions are unchanged.

**Independent Test**: Open app on a desktop with no touchscreen, start a game. Verify standard text input renders, no numpad visible. Type answers and press Enter — existing submission flow works identically.

- [X] T007 [US2] Add conditional rendering tests verifying: (1) when maxTouchPoints === 0, renders text input and Submit button with no TouchNumpad present; (2) when maxTouchPoints > 0, renders TouchNumpad with no text input present; (3) existing keyboard submit flow (type digits + Enter) works unchanged on non-touch devices in frontend/tests/components/AnswerInput.test.tsx

**Checkpoint**: Desktop experience verified unchanged — no regressions.

---

## Phase 5: User Story 4 — Correcting Input Before Submission (Priority: P2)

**Goal**: Players can delete digits before submitting using the ⌫ button or physical Backspace key, enabling error correction during answer composition.

**Independent Test**: Tap digits to compose an answer, tap ⌫ to delete the last digit, verify the display updates correctly. Verify delete on empty has no effect.

> **Note**: Backspace implementation is included in Phase 3 (US1) since the ⌫ button is part of the 4×3 numpad grid. This phase adds focused verification tests for correction edge cases.

- [X] T008 [US4] Add focused backspace behavior tests covering: sequential multi-delete (compose "123", delete three times to empty), delete-then-reenter (compose "12", delete once, enter "3" → "13"), physical Backspace key mirrors ⌫ button behavior identically, backspace ignored during feedback phase (acceptingInput false) in frontend/tests/components/TouchNumpad.test.tsx

**Checkpoint**: Input correction fully verified for all edge cases.

---

## Phase 6: User Story 3 — Numpad Layout Adapts to Screen Size (Priority: P3)

**Goal**: Numpad renders comfortably on smartphones (320px+) and tablets without overflow, excessive stretching, or requiring scrolling. Formula and numpad are simultaneously visible on screens ≥568px tall.

**Independent Test**: Open app at viewport widths 320px, 375px, 768px, 1024px and verify buttons remain usable, grid doesn't over-stretch, and formula + numpad are both visible without scrolling.

- [X] T009 [US3] Add responsive refinements: max-width 360px with margin 0 auto for tablet centering, ensure buttons maintain min-height 48px and effective touch target ≥56px across viewports, verify formula + numpad fit within 568px viewport height without scrolling via appropriate spacing in frontend/src/components/GamePlay/AnswerInput/TouchNumpad.module.css

**Checkpoint**: Numpad layout verified across phone and tablet screen sizes and orientations.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [X] T010 Run full test suite (npx vitest run) and verify all existing and new tests pass with zero failures
- [X] T011 Run quickstart.md 9-step verification procedure to confirm end-to-end feature behavior on touch, desktop, and hybrid devices

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A — no setup needed
- **Foundational (Phase 2)**: No dependencies — start immediately. BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2 completion (useTouchDetection hook)
- **US2 (Phase 4)**: Depends on Phase 3 completion (conditional rendering implemented there)
- **US4 (Phase 5)**: Depends on Phase 3 completion (backspace implemented there)
- **US3 (Phase 6)**: Depends on Phase 3 completion (CSS file created there)
- **Polish (Phase 7)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only. No cross-story dependencies. Delivers the MVP.
- **US2 (P2)**: Test-only phase verifying conditional rendering from US1. Starts after Phase 3.
- **US4 (P2)**: Test-only phase verifying backspace edge cases from US1. Starts after Phase 3.
- **US3 (P3)**: CSS refinement to US1's stylesheet. Starts after Phase 3.
- **Phases 4, 5, and 6 are independent of each other** — can run in parallel after Phase 3.

### Within Each User Story

- Tests written FIRST, verified to FAIL before implementation (Constitution Principle V)
- CSS module before component (import dependency)
- Component before AnswerInput modification (import dependency)
- Story fully verified before proceeding to next priority

### Parallel Opportunities

- T003 (tests) and T004 (CSS) in Phase 3 can run in parallel — different files, no mutual dependency
- Phases 4, 5, and 6 can all run in parallel after Phase 3 — different files, no cross-dependencies
- T010 and T011 in Phase 7 are sequential — fix any test failures before end-to-end verification

---

## Parallel Example: User Story 1

```text
Phase 2 (sequential — test first):
  T001: useTouchDetection test ──→ T002: Implement hook

Phase 3 parallel batch 1:
  T003: TouchNumpad tests ──────────┐
  T004: TouchNumpad CSS ────────────┤ (parallel — different files)

Phase 3 sequential:
  T005: Implement TouchNumpad ──────┤ (after T004 — imports CSS module)
  T006: Modify AnswerInput ─────────┘ (after T005 — imports TouchNumpad)

Phases 4, 5, 6 parallel batch:
  T007: [US2] AnswerInput tests ────┐
  T008: [US4] Backspace tests ──────┤ (all parallel — different files)
  T009: [US3] Responsive CSS ───────┘

Phase 7 sequential:
  T010: Full test suite ──→ T011: Quickstart verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (useTouchDetection hook)
2. Complete Phase 3: User Story 1 (TouchNumpad + AnswerInput conditional rendering)
3. **STOP and VALIDATE**: Test numpad on a touch device or emulator
4. Deploy/demo if ready — core value delivered with just 6 tasks

### Incremental Delivery

1. Phase 2 → Hook ready
2. Phase 3 (US1) → Numpad works on touch, text input on desktop → **MVP!**
3. Phase 4 (US2) → Desktop behavior verified via tests
4. Phase 5 (US4) → Backspace edge cases verified
5. Phase 6 (US3) → Responsive refinements for tablets
6. Phase 7 → Full validation
7. Each phase adds confidence without breaking previous work

---

## Notes

- [P] tasks = different files, no unmet dependencies — can run simultaneously
- [US?] label maps task to user story from spec.md
- US4 (backspace) implementation is in US1's phase since ⌫ is part of the numpad grid; US4's phase is verification-only
- MainPage.tsx requires NO changes — AnswerInput props interface is unchanged
- No new npm dependencies required
- All paths relative to repository root
- Commit after each phase or logical task group
