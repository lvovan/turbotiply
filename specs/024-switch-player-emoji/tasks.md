# Tasks: Switch Player Emoji Button

**Input**: Design documents from `/specs/024-switch-player-emoji/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: User Story 1+2 — Emoji Button with Accessibility (Priority: P1) 🎯 MVP

**Goal**: Replace the translated text label in the switch-player button with a 👥 emoji while preserving full accessibility via a localised `aria-label`.

**Independent Test**: Log in as any player → header shows 👥 button (no text) → clicking it ends the session and returns to the welcome screen → screen reader announces "Switch player" (or localised equivalent) → layout does not shift when switching language.

> Note: US1 (emoji replaces text) and US2 (button remains accessible) are implemented together because the `aria-label` and emoji content are a single atomic change in `Header.tsx`.

### Tests

- [x] T001 [US1] Update existing test to verify emoji content is rendered in the switch-player button in `frontend/tests/components/Header.test.tsx`
- [x] T002 [US2] Add accessibility test asserting `aria-label` is present and localised on the switch-player button in `frontend/tests/components/Header.test.tsx`

### Implementation

- [x] T003 [P] [US1] Replace `{t('header.switchPlayer')}` with `<span aria-hidden="true">👥</span>` and add `aria-label={t('header.switchPlayer')}` to the button element in `frontend/src/components/Header/Header.tsx`
- [x] T004 [P] [US2] Adjust `.switchButton` padding from `8px 16px` to `8px 12px` and set `font-size: 1.25rem` for emoji sizing in `frontend/src/components/Header/Header.module.css`
- [x] T005 [P] [US2] Adjust `.switchButton` responsive override at `@media (max-width: 320px)` — update padding from `6px 12px` to `6px 8px` and set `font-size: 1.125rem` in `frontend/src/components/Header/Header.module.css`

**Checkpoint**: All tests pass. The switch-player button displays 👥 with no text, fires `endSession` + `navigate('/')` on click, and announces "Switch player" to screen readers.

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against quickstart scenarios

- [x] T006 Run quickstart.md validation (dev server manual check across languages and viewports)
- [x] T007 Run full test suite to confirm no regressions (`npx vitest run` in `frontend/`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1+US2)**: No setup needed — all infrastructure exists. Can start immediately.
- **Phase 2 (Polish)**: Depends on Phase 1 completion.

### Within Phase 1

- T001, T002 (tests) SHOULD be written first to fail before implementation (constitution V: Test-First)
- T003, T004, T005 are marked [P] — they touch different files (`Header.tsx` vs `Header.module.css`) and can run in parallel
- T004, T005 both touch `Header.module.css` but different sections (base rule vs media query) — sequential within that file

### Parallel Opportunities

```text
Step 1 (tests):     T001, T002         (same file, sequential)
Step 2 (implement): T003 | T004, T005  (T003 in .tsx, T004+T005 in .css — parallel across files)
Step 3 (validate):  T006, T007         (sequential)
```

---

## Implementation Strategy

### MVP First (Phase 1 Only)

1. Write failing tests (T001, T002)
2. Implement button change (T003) and CSS adjustment (T004, T005) in parallel
3. Verify all tests pass
4. **STOP and VALIDATE**: Feature is complete and independently testable

### Notes

- [P] tasks = different files, no dependencies
- US1 and US2 are co-delivered as a single atomic change (emoji + aria-label in same JSX element)
- No locale file changes needed — `header.switchPlayer` key is reused as-is for `aria-label`
- Commit after each task or logical group
- Total: 7 tasks (2 test, 3 implementation, 2 validation)
