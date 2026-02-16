# Tasks: Minor UI Polish

**Input**: Design documents from `/specs/016-minor-ui-polish/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in the spec. Test updates are included only where existing tests would break due to implementation changes or where new behavior requires coverage for regression safety.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: No shared infrastructure setup needed — this feature modifies existing files only.

- [x] T001 Create CSS module file `frontend/src/pages/MainPage.module.css` with empty initial content (needed by US2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational/blocking tasks. All four user stories are independent of each other and can proceed directly after T001.

**Checkpoint**: Setup ready — all user story work can begin in parallel.

---

## Phase 3: User Story 1 — Copyright Notice on Welcome Screen (Priority: P1) 🎯 MVP

**Goal**: Display "© 2025, Luc Vo Van - Built with AI" at the bottom of the welcome screen.

**Independent Test**: Open the app at `/` and verify copyright text is visible at the bottom on any viewport.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add `min-height: 100dvh` to `.welcomePage` and add `.copyright` class (small, muted, `margin-top: auto`) in `frontend/src/pages/WelcomePage.module.css`
- [x] T003 [P] [US1] Add `<p className={styles.copyright}>© 2025, Luc Vo Van - Built with AI</p>` as last child of the `.welcomePage` div in `frontend/src/pages/WelcomePage.tsx` (both the storage-unavailable and normal render paths)
- [x] T004 [US1] Update WelcomePage tests to verify copyright text is rendered in `frontend/tests/pages/WelcomePage.test.tsx`

**Checkpoint**: Welcome screen shows copyright footer on all viewports.

---

## Phase 4: User Story 2 — Compact Ready-to-Play Header (Priority: P2)

**Goal**: Reduce the "Ready to play?" heading and instructions text size so the main menu fits on 320×568 without scrolling.

**Independent Test**: View `/play` on a 320×568 viewport — heading, instructions, scores, mode selector all visible without scrolling.

### Implementation for User Story 2

- [x] T005 [US2] Add `.readyHeading` class (`font-size: 1.25rem`, reduced margins) and `.instructions` class (`font-size: 1rem`, compact margins) to `frontend/src/pages/MainPage.module.css`
- [x] T006 [US2] Import the CSS module in `frontend/src/pages/MainPage.tsx` and apply `styles.readyHeading` to the `<h1>` and `styles.instructions` to the `<p>` in the `not-started` block

**Checkpoint**: Heading and instructions text are compact on small screens but still readable on desktop.

---

## Phase 5: User Story 3 — Show Only Top 3 Scores (Priority: P2)

**Goal**: Limit the main menu best scores list from 5 to 3 entries, showing only medals (🥇🥈🥉).

**Independent Test**: Play 4+ games, return to main menu — only 3 scores shown.

### Implementation for User Story 3

- [x] T007 [P] [US3] Change `getRecentHighScores(currentPlayer, 5)` to `getRecentHighScores(currentPlayer, 3)` in `frontend/src/pages/MainPage.tsx`
- [x] T008 [P] [US3] Update any MainPage tests that assert on 5 scores to expect 3 in `frontend/tests/pages/MainPage.test.tsx`

**Checkpoint**: Main menu shows at most 3 scores with medal emojis only.

---

## Phase 6: User Story 4 — Sparkline on Result Screen (Priority: P3)

**Goal**: Show the score progression sparkline above the round-by-round table on the result screen, including the just-completed game.

**Independent Test**: Complete 2+ games, verify sparkline appears on result screen before the detailed table, with the current game as the last data point.

### Implementation for User Story 4

- [x] T009 [US4] Add optional `history?: GameRecord[]` prop to `ScoreSummaryProps` interface and import + render `<ProgressionGraph history={history} />` between the score display and the table wrapper in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`
- [x] T010 [US4] In `frontend/src/pages/MainPage.tsx`, construct `historyWithCurrent` array by appending the just-completed game record to `gameHistory`, and pass it as the `history` prop to `<ScoreSummary>`
- [x] T011 [US4] Add ScoreSummary tests: verify sparkline renders when history has ≥ 2 entries, verify sparkline does not render when history has < 2 entries, in `frontend/tests/components/ScoreSummary.test.tsx`

**Checkpoint**: Result screen shows sparkline with current game included when history has ≥ 2 games.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all changes.

- [x] T012 Run `npm test` in `frontend/` and verify all tests pass
- [x] T013 Run quickstart.md validation: manually verify all 4 changes per `specs/016-minor-ui-polish/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Stories (Phases 3–6)**: US2 depends on T001 (MainPage.module.css). US1, US3, US4 can start immediately.
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — touches only WelcomePage files
- **US2 (P2)**: Depends on T001 (new CSS module file) — touches only MainPage files
- **US3 (P2)**: Independent — single line change in MainPage + test update
- **US4 (P3)**: Independent — touches MainPage and ScoreSummary

### Within Each User Story

- CSS changes before JSX changes (within US1, US2)
- Implementation before test updates
- Each story is complete and testable before moving on

### Parallel Opportunities

- **T002 + T003**: US1 CSS and JSX can run in parallel (different files)
- **T007 + T008**: US3 implementation and test update can run in parallel (different files)
- **US1 + US3 + US4**: All three stories can start simultaneously (no shared files except MainPage for US3/US4, but their changes are in different code blocks)
- **US2**: Can run in parallel with US1 once T001 is done

---

## Parallel Example: All Stories

```text
# After T001 (setup), launch all stories in parallel:

# US1 (WelcomePage — independent files):
T002: Add copyright styles to WelcomePage.module.css
T003: Add copyright element to WelcomePage.tsx
T004: Update WelcomePage tests

# US2 (MainPage heading — depends on T001):
T005: Add heading styles to MainPage.module.css
T006: Apply heading styles in MainPage.tsx

# US3 (MainPage scores — single param change):
T007: Change score count 5 → 3 in MainPage.tsx
T008: Update MainPage tests for 3 scores

# US4 (ScoreSummary sparkline):
T009: Add history prop + ProgressionGraph to ScoreSummary.tsx
T010: Construct historyWithCurrent and pass to ScoreSummary in MainPage.tsx
T011: Add ScoreSummary sparkline tests
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Create MainPage.module.css
2. Complete T002–T004: Copyright footer on WelcomePage
3. **STOP and VALIDATE**: Verify copyright text appears at bottom of welcome screen
4. Ship if ready — delivers branding compliance

### Incremental Delivery

1. T001 → Setup ready
2. T002–T004 → US1 complete (copyright) → Validate
3. T005–T006 → US2 complete (compact heading) → Validate
4. T007–T008 → US3 complete (top 3 scores) → Validate
5. T009–T011 → US4 complete (sparkline on result) → Validate
6. T012–T013 → Polish: full test suite + manual quickstart validation
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total: 13 tasks (1 setup, 3 US1, 2 US2, 2 US3, 3 US4, 2 polish)
- No new components created — all changes reuse existing code
- ProgressionGraph component used as-is with no modifications
- The `historyWithCurrent` construction in T010 addresses the useEffect timing issue (Research #4)
