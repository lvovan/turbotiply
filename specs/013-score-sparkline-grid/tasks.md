# Tasks: Score Sparkline Grid

**Input**: Design documents from `/specs/013-score-sparkline-grid/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/progression-graph.md

**Tests**: Included per Constitution Principle V (Test-First). Tests are written first and must fail before implementation.

**Organization**: Tasks are grouped by user story. US1 and US2 (both P1) are combined into a single phase because they modify the same component and are inseparable — the dynamic viewBox, axis lines, and proportional width are one cohesive change.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Path Conventions

- **Project type**: Single frontend directory (`frontend/`)
- **Source**: `frontend/src/components/GamePlay/ProgressionGraph/`
- **Tests**: `frontend/tests/components/`, `frontend/tests/a11y/`

---

## Phase 1: Setup

**Purpose**: No new project setup needed — this feature modifies an existing component. This phase ensures the existing codebase builds and tests pass before any modifications.

- [x] T001 Verify existing tests pass by running `npm test` in `frontend/`
- [x] T002 Verify build succeeds by running `npm run build` in `frontend/`

---

## Phase 2: Foundational (CSS Classes + Constants)

**Purpose**: Add CSS module classes and chart layout constants that ALL user stories depend on. These are prerequisites shared across US1, US2, and US3.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Add CSS classes for `.axis`, `.tickMark`, `.dataLine`, `.guideLine`, and `.axisLabel` with dark mode overrides in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.module.css`
- [x] T004 [P] Add chart layout constants (`MAX_GAMES`, `MIN_GAMES`, `Y_MIN`, `Y_MAX`, `GUIDE_INTERVAL`, `GUIDE_VALUES`, `UNIT_WIDTH`, `Y_LABEL_GUTTER`, `CHART_HEIGHT`, `PAD`) and coordinate mapping helper functions (`scoreToY`, `gameToX`) at the top of `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`

**Checkpoint**: CSS classes defined, constants and helpers ready for use by all stories.

---

## Phase 3: User Story 1 + User Story 2 — Grid Axes & Proportional Width (Priority: P1) 🎯 MVP

**Goal**: Replace the bare sparkline with a gridded chart that has clear X/Y axis lines, X-axis tick marks, dynamic viewBox width proportional to game count (2–10), fixed Y-axis range (0–50), and updated accessibility attributes.

**Independent Test**: Create a player with 10+ games → chart shows 10 data points on a grid with axis lines. Create a player with 3 games → chart is proportionally narrower with 3 data points.

### Tests for US1 + US2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [US1] Add test: SVG has dynamic viewBox width based on data count (`Y_LABEL_GUTTER + count * UNIT_WIDTH`) in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T006 [US1] Add test: SVG uses `preserveAspectRatio="xMinYMid meet"` in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T007 [US1] Add test: X-axis line is rendered as a `<line>` element with the `.axis` CSS class in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T008 [US1] Add test: Y-axis line is rendered as a `<line>` element with the `.axis` CSS class in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T009 [US1] Add test: X-axis tick marks are rendered — one per data point with the `.tickMark` CSS class in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T010 [US1] Add test: polyline uses the `.dataLine` CSS class in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T011 [US1] Add test: only the last 10 records are plotted when history has more than 10 entries in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T012 [US2] Add test: chart renders with 2 data points (minimum viable) and viewBox width is proportionally narrow in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T013 [US2] Add test: chart renders with 5 data points and viewBox width equals `Y_LABEL_GUTTER + 5 * UNIT_WIDTH` in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T014 [US1] Add test: `aria-label` includes game count, score range, and "scale 0 to 50" in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T015 [US1] Update existing tests that assert `viewBox="0 0 300 100"` to expect the new dynamic viewBox in `frontend/tests/components/ProgressionGraph.test.tsx`

### Implementation for US1 + US2

- [x] T016 [US1] Refactor `ProgressionGraph` component: replace fixed viewBox with dynamic width (`Y_LABEL_GUTTER + count * UNIT_WIDTH`), switch `preserveAspectRatio` to `"xMinYMid meet"`, slice history to last 10 records, use fixed Y range (0–50), update coordinate mapping to use `scoreToY`/`gameToX` helpers in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`
- [x] T017 [US1] Add X-axis line and Y-axis line as `<line>` elements inside an `aria-hidden` `<g>` group with the `.axis` CSS class in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`
- [x] T018 [US1] Add X-axis tick marks — one `<line>` per data point with the `.tickMark` CSS class in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`
- [x] T019 [US1] Update `aria-label` to format `"Score progression: {count} games, from {first} to {last}, scale 0 to 50"` and apply `.dataLine` CSS class to the polyline in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`
- [x] T020 [US1] Verify all US1+US2 tests pass by running `npm test` in `frontend/`

**Checkpoint**: Chart displays axis lines, tick marks, and proportional width. US1 and US2 are fully functional and testable. The sparkline is a proper gridded chart (minus guide lines).

---

## Phase 4: User Story 3 — Faded Horizontal Guide Lines (Priority: P2)

**Goal**: Add faded horizontal guide lines at score intervals of 10 (0, 10, 20, 30, 40, 50) with small numeric Y-axis labels. Guide lines must be visually lighter than axis lines.

**Independent Test**: View the sparkline and confirm guide lines are visible at 0/10/20/30/40/50, have numeric labels, and are visually more faded than axis lines.

### Tests for US3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T021 [US3] Add test: 6 horizontal guide lines are rendered with the `.guideLine` CSS class (one for each value in `GUIDE_VALUES`) in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T022 [US3] Add test: 6 Y-axis labels are rendered with the `.axisLabel` CSS class showing values "0", "10", "20", "30", "40", "50" in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T023 [US3] Add test: guide lines and labels are inside an `aria-hidden="true"` group in `frontend/tests/components/ProgressionGraph.test.tsx`

### Implementation for US3

- [x] T024 [US3] Add horizontal guide lines — one `<line>` per `GUIDE_VALUES` entry with the `.guideLine` CSS class inside the `aria-hidden` grid `<g>` group in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`
- [x] T025 [US3] Add Y-axis labels — one `<text>` per `GUIDE_VALUES` entry with `textAnchor="end"`, `dominantBaseline="central"`, and the `.axisLabel` CSS class in `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`
- [x] T026 [US3] Verify all US3 tests pass by running `npm test` in `frontend/`

**Checkpoint**: All 3 user stories are complete. Guide lines and labels are visible, properly faded, and accessible.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility validation, edge case verification, and final cleanup.

- [x] T027 Verify existing axe-core accessibility test still passes for ProgressionGraph in `frontend/tests/a11y/accessibility.test.tsx`
- [x] T028 Add edge case test: scores below 0 are clamped to 0 on the chart (plotted at Y-axis floor) in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T029 Add edge case test: all identical scores render a flat horizontal line with guide lines still visible in `frontend/tests/components/ProgressionGraph.test.tsx`
- [x] T030 Verify the full test suite passes and build succeeds by running `npm test && npm run build` in `frontend/`
- [x] T031 Run quickstart.md manual validation steps (visual check on 320px and 667px viewports)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 (constants + CSS classes)
- **US3 (Phase 4)**: Depends on Phase 2 (CSS classes). Can run in parallel with Phase 3 but works best sequentially since both modify the same TSX file.
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4

### User Story Dependencies

- **US1 + US2 (P1)**: Combined because they modify the same component logic (viewBox, coordinate mapping, data slicing). After Phase 2 completion — no dependencies on US3.
- **US3 (P2)**: After Phase 2 completion — no strict dependency on US1+US2, but practical dependency exists because all modify the same TSX file.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- CSS classes (Phase 2) before SVG element implementation
- Constants/helpers (Phase 2) before coordinate math
- Core grid structure (US1+US2) before guide line overlay (US3)

### Parallel Opportunities

- T003 and T004 (Phase 2) can run in parallel — different files
- T005–T015 (Phase 3 tests) can all be written in one batch — same test file, no code dependencies
- T021–T023 (Phase 4 tests) can all be written in one batch
- T027–T029 (Phase 5) can run in parallel — different test aspects

---

## Parallel Example: Phase 2

```text
# These two tasks modify different files and can run in parallel:
T003: CSS classes in ProgressionGraph.module.css
T004: Constants and helpers in ProgressionGraph.tsx
```

## Parallel Example: Phase 3 Tests

```text
# All test tasks write to the same file but are independent test cases:
T005–T015: Write all failing tests for US1+US2 in one batch
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 2: Foundational (CSS + constants)
3. Complete Phase 3: US1 + US2 (axes, tick marks, proportional width)
4. **STOP and VALIDATE**: Chart has grid axes and proportional width — usable MVP
5. Continue to Phase 4 for guide lines

### Incremental Delivery

1. Setup + Foundational → Ready for implementation
2. US1 + US2 → Grid with axes, ticks, proportional width → **MVP deployed**
3. US3 → Guide lines + labels added → **Full feature deployed**
4. Polish → Edge cases verified, a11y validated → **Production-ready**

---

## Notes

- All tasks modify at most 2 source files (`ProgressionGraph.tsx` + `.module.css`) and 1 test file
- No new files or directories are created
- No changes to `MainPage.tsx`, `playerStorage.ts`, or any other file outside the component
- The existing `<polyline>` rendering logic is preserved — only the coordinate mapping and surrounding SVG structure change
- [P] tasks = different files, no dependencies
- [Story] labels map tasks to spec.md user stories for traceability
- Commit after each completed phase
