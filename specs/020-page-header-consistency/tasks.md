# Tasks: Page Header Consistency

**Input**: Design documents from `/specs/020-page-header-consistency/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in spec. Test updates are included to maintain existing test coverage for modified components.

**Organization**: Tasks grouped by user story. US1 (consistent header structure) is the MVP. US2 (utility element placement) is achieved as a side effect of US1's implementation. US3 (responsive consistency) builds on top.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All paths relative to repository root

---

## Phase 1: Setup

**Purpose**: No setup needed — this feature modifies existing files only. No new dependencies, no new project structure.

*(Phase intentionally empty — skip to Foundational)*

---

## Phase 2: Foundational (Header Component Refactoring)

**Purpose**: Refactor the shared `Header` component to support both authenticated and unauthenticated states. This MUST be complete before page-level changes.

**⚠️ CRITICAL**: WelcomePage and MainPage changes depend on this phase.

- [x] T001 Add `.title` class and rename `.playerInfo` to `.leftSection` in `frontend/src/components/Header/Header.module.css`
- [x] T002 Refactor `Header` component to render unauthenticated state (app title + language switcher) instead of returning null, and add app title to authenticated state, in `frontend/src/components/Header/Header.tsx`
- [x] T003 Update Header tests to cover unauthenticated rendering (app title visible, language switcher present, no greeting, no switch button) in `frontend/tests/components/Header.test.tsx`

**Checkpoint**: Header component renders correctly in both auth states. `npm test` passes for Header tests.

---

## Phase 3: User Story 1 — Consistent Header Across All Pages (Priority: P1) 🎯 MVP

**Goal**: Both pages use the shared `Header` component producing the same horizontal bar height and app title styling.

**Independent Test**: Open the app as a new user (WelcomePage) — see horizontal header bar with "Multis!" left, language switcher right. Start a session (MainPage) — see the same bar height with "Multis!" + avatar + greeting left, language switcher + switch button right. Navigate between pages — no vertical content shift.

### Implementation for User Story 1

- [x] T004 [P] [US1] Remove inline `<h1>` title, `<div className={styles.languageArea}>`, and `<LanguageSwitcher />` from WelcomePage; add `<Header />` component at the top; keep subtitle in content area below header; update both normal and degraded-mode (no localStorage) render paths in `frontend/src/pages/WelcomePage.tsx`
- [x] T005 [P] [US1] Remove `.title`, `.languageArea`, and their responsive media query from WelcomePage styles; remove `position: relative` from `.welcomePage`; keep `.subtitle` for content area in `frontend/src/pages/WelcomePage.module.css`
- [x] T006 [US1] Update WelcomePage tests to assert the Header component renders (app title visible, no inline h1 title), subtitle appears below header, and degraded-mode path also uses Header in `frontend/tests/pages/WelcomePage.test.tsx`
- [x] T007 [US1] Update MainPage tests to verify app title "Multis!" appears in the header bar in `frontend/tests/pages/MainPage.test.tsx`

**Checkpoint**: Both pages show a consistent horizontal header bar. `npm test` passes. Visual inspection confirms matched heights.

---

## Phase 4: User Story 2 — Consistent Utility Element Placement (Priority: P2)

**Goal**: Language switcher appears in the same header position on both pages.

**Independent Test**: Open WelcomePage, note language switcher position (right side of header bar). Navigate to MainPage, confirm language switcher is in the same right-side position.

### Implementation for User Story 2

*(No additional implementation tasks — US2 is fully satisfied by the Foundational phase (T002) which places the `LanguageSwitcher` in the `.actions` section of the Header on both pages. The tests in T003, T006, and T007 already validate this.)*

**Checkpoint**: Language switcher in same position on both pages — verified by existing tests and visual inspection.

---

## Phase 5: User Story 3 — Responsive Header Consistency (Priority: P3)

**Goal**: On narrow viewports (320px–600px), the header maintains visual parity between pages with no overflow or wrapping.

**Independent Test**: Resize browser to 320px. Compare header on WelcomePage and MainPage — same height, no overflow, no unexpected wrapping.

### Implementation for User Story 3

- [x] T008 [US3] Verify and adjust the 320px media query in Header.module.css to ensure the `.title` class does not overflow or wrap at narrow widths; confirm `flex-shrink: 0` on title works correctly alongside truncating greeting text in `frontend/src/components/Header/Header.module.css`
- [x] T009 [US3] Remove the `@media (min-width: 600px)` rule for `.title` in WelcomePage.module.css (if not already removed in T005) to eliminate responsive title sizing that no longer applies in `frontend/src/pages/WelcomePage.module.css`

**Checkpoint**: At 320px, both pages show consistent header with no overflow. `npm test` passes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and final validation.

- [x] T010 [P] Remove `.readyHeading` style from `frontend/src/pages/MainPage.module.css` if it is no longer referenced after Header now contains the app title (KEPT: still referenced for "Ready to play!" content heading)
- [x] T011 Run full test suite (`npm test`) and fix any remaining failures (542/542 pass)
- [x] T012 Run quickstart.md validation — verify all 5 manual verification steps from `specs/020-page-header-consistency/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — skip
- **Foundational (Phase 2)**: No prerequisites — start immediately. T001 → T002 → T003 (sequential, same files)
- **User Story 1 (Phase 3)**: Depends on T002 (Header component refactored). T004 and T005 are parallelizable (different files). T006 and T007 depend on T004/T005.
- **User Story 2 (Phase 4)**: Fully satisfied by Phase 2 — no additional work
- **User Story 3 (Phase 5)**: Depends on T005 (WelcomePage CSS cleanup). T008 and T009 are sequentially ordered.
- **Polish (Phase 6)**: Depends on all previous phases

### Within Each Phase

- CSS changes before component changes (T001 before T002)
- Component changes before test updates (T002 before T003, T004/T005 before T006/T007)
- T004 (WelcomePage.tsx) and T005 (WelcomePage.module.css) can run in parallel

### Parallel Opportunities

- T004 and T005 can run in parallel (different files: .tsx and .module.css)
- T006 and T007 can run in parallel (different test files)
- T010 can run in parallel with T008/T009 (different CSS files)

---

## Parallel Example: User Story 1

```
# After Phase 2 completes, launch US1 page changes in parallel:
Task T004: "Update WelcomePage.tsx to use Header component"
Task T005: "Clean up WelcomePage.module.css"

# Then launch test updates in parallel:
Task T006: "Update WelcomePage tests"
Task T007: "Update MainPage tests"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T003) — Header component supports both states
2. Complete Phase 3: User Story 1 (T004–T007) — Both pages use shared Header
3. **STOP and VALIDATE**: Both pages have consistent header bars. Run tests. Visual check.
4. This alone delivers the core value of the feature.

### Incremental Delivery

1. Phase 2 → Header component ready
2. Phase 3 → US1 complete (consistent header structure) → **MVP!**
3. Phase 4 → US2 verified (already done — language switcher placement)
4. Phase 5 → US3 complete (responsive tweaks)
5. Phase 6 → Polish and final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US2 requires no additional implementation — it's a natural byproduct of the Header refactoring in Phase 2
- No new files are created — all changes are modifications to existing files
- Total: 12 tasks (3 foundational, 4 US1, 0 US2, 2 US3, 3 polish)
- Commit after each task or logical group
