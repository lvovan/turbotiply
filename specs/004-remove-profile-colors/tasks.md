# Tasks: Remove Profile Colors

**Input**: Design documents from `/specs/004-remove-profile-colors/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as cleanup tasks (updating existing tests to remove color references). No new test-first tasks — this is a removal feature where existing tests must be updated to reflect deleted functionality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Remove `colorId` from type definitions — ALL user stories depend on this

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Remove `colorId` field from `Player` interface in `frontend/src/types/player.ts`
- [x] T002 Remove `colorId` field from `Session` interface in `frontend/src/types/player.ts`

**Checkpoint**: Type definitions are updated — TypeScript compiler will now flag all remaining `colorId` references as errors, guiding subsequent cleanup.

---

## Phase 2: User Story 1 — Create New Player Without Color Selection (Priority: P1) 🎯 MVP

**Goal**: Profile creation form collects only name and avatar — no color picker, no color state, no color data stored.

**Independent Test**: Create a new player profile and verify the color picker is absent and the profile is saved with only name and avatar.

### Implementation for User Story 1

- [x] T003 [US1] Remove `COLOR_REMAP` export and color-remap migration logic from `frontend/src/services/playerStorage.ts`
- [x] T004 [US1] Update `savePlayer` to accept `Pick<Player, 'name' | 'avatarId'>` (remove `colorId`) and remove `colorId` from player object construction in `frontend/src/services/playerStorage.ts`
- [x] T005 [US1] Remove `colorId` from `savePlayer` signature in `usePlayers` hook return type in `frontend/src/hooks/usePlayers.ts`
- [x] T006 [US1] Remove `ColorPicker` import, `colorId` state, `DEFAULT_COLOR_ID` import, color picker rendering, and `colorId` from submit data in `frontend/src/components/WelcomeScreen/NewPlayerForm.tsx`
- [x] T007 [US1] Delete color constants file `frontend/src/constants/colors.ts`
- [x] T008 [US1] Delete `ColorPicker` component directory `frontend/src/components/ColorPicker/` (both `ColorPicker.tsx` and `ColorPicker.module.css`)
- [x] T009 [US1] Remove `colorId` from `handleNewPlayer`, `handleTemporaryPlay`, and `handleSelectPlayer` signatures in `frontend/src/pages/WelcomePage.tsx` (covers both creation and session-start call sites)
- [x] T010 [US1] Bump `CURRENT_VERSION` from 2 to 3 and add v2→v3 migration step in `readStore()` that deletes `colorId` from all players in `frontend/src/services/playerStorage.ts` (must follow T003–T004; replaces removed COLOR_REMAP behavior)

### Test Cleanup for User Story 1

- [x] T011 [P] [US1] Delete `frontend/tests/components/ColorPicker.test.tsx`
- [x] T012 [P] [US1] Remove color picker assertions and `colorId` from submit expectations in `frontend/tests/components/NewPlayerForm.test.tsx`
- [x] T013 [P] [US1] Remove `colorId` from `savePlayer` calls and test data in `frontend/tests/hooks/usePlayers.test.tsx`
- [x] T014 [P] [US1] Remove `colorId` from `savePlayer` calls in `frontend/tests/pages/WelcomePage.test.tsx`
- [x] T015 [P] [US1] Remove `colorId` from `savePlayer` calls in `frontend/tests/integration/clearAllFlow.test.tsx`
- [x] T016 [P] [US1] Remove `colorId` from player storage test data, `savePlayer` calls, `COLOR_REMAP` import/assertions, and add v2→v3 migration tests verifying `colorId` is stripped and all other fields preserved in `frontend/tests/services/playerStorage.test.ts`
- [x] T017 [P] [US1] Remove `ColorPicker` a11y test case and `colorId` from test data in `frontend/tests/a11y/accessibility.test.tsx`

**Checkpoint**: New player creation works without color. ColorPicker component and constants deleted. Storage migration v2→v3 in place. All related tests pass.

---

## Phase 3: User Story 3 — Player Card Display Without Color (Priority: P3)

**Goal**: Player card shows avatar emoji, name, and score — no color dot or color-based styling.

**Independent Test**: View the player list and verify no color dot appears on any player card.

### Implementation for User Story 3

- [x] T018 [US3] Remove `COLORS` import, `color` lookup variable, and `<span className={styles.colorDot}>` element from `frontend/src/components/PlayerCard/PlayerCard.tsx`
- [x] T019 [US3] Remove `.colorDot` CSS class from `frontend/src/components/PlayerCard/PlayerCard.module.css`

### Test Cleanup for User Story 3

- [x] T020 [P] [US3] Remove `colorId` from `mockPlayer` and delete color dot render test in `frontend/tests/components/PlayerCard.test.tsx`
- [x] T021 [P] [US3] Remove `colorId` from player test data in `frontend/tests/components/PlayerList.test.tsx`

**Checkpoint**: Player cards render without color dot. Avatar emoji is the sole visual identifier.

---

## Phase 4: User Story 4 — Active Session Without Color (Priority: P4)

**Goal**: Sessions carry only player name and avatar — no color data. Header uses default styling.

**Independent Test**: Start a session and verify no color data is passed or displayed in gameplay UI.

### Implementation for User Story 4

- [x] T022 [US4] Remove `colorId` from `startSession` signature and session object construction in `frontend/src/services/sessionManager.ts`
- [x] T023 [US4] Remove `colorId` from `startSession` signature in `useSession` hook return type in `frontend/src/hooks/useSession.tsx`
- [x] T024 [US4] Remove `COLORS` import, `color` lookup, `borderBottomColor` style, and greeting text `color` style from `frontend/src/components/Header/Header.tsx`

### Test Cleanup for User Story 4

- [x] T025 [P] [US4] Remove `colorId` from `startSession` calls and session assertions in `frontend/tests/services/sessionManager.test.ts`
- [x] T026 [P] [US4] Remove `colorId` from session test data and `startSession` call in `frontend/tests/hooks/useSession.test.tsx`
- [x] T027 [P] [US4] Remove `colorId` from mock session data in `frontend/tests/components/Header.test.tsx`
- [x] T028 [P] [US4] Remove `colorId` from mock session in `frontend/tests/pages/MainPage.test.tsx`
- [x] T029 [P] [US4] Remove `colorId` from session data in `frontend/tests/integration/sessionLifecycle.test.tsx`
- [x] T030 [P] [US4] Remove `colorId` from test data in `frontend/tests/integration/gameplayFlow.test.tsx`

**Checkpoint**: Sessions created and displayed without color data. Header uses default styling.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all user stories

- [x] T031 Run TypeScript type check (`npx tsc --noEmit`) — zero errors
- [x] T032 Run full test suite (`npx vitest run`) — all tests pass
- [x] T033 Run accessibility tests (`npx vitest run tests/a11y`) — all pass
- [x] T034 Run quickstart.md validation to confirm implementation matches specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **User Story 1 + 2 (Phase 2)**: Depends on Foundational (Phase 1) — primary MVP deliverable. Includes US2 migration (v2→v3) to avoid a gap where COLOR_REMAP is removed but no replacement migration exists.
- **User Story 3 (Phase 3)**: Depends on Foundational (Phase 1) only — can run in parallel with Phase 2
- **User Story 4 (Phase 4)**: Depends on Phase 2 completing T009 (WelcomePage edits) — avoids same-file conflict
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 1 (type changes). Core MVP — drives most file changes. Now includes US2 migration tasks to keep playerStorage.ts and its tests in a single phase.
- **User Story 3 (P3)**: Depends on Phase 1 only. Can run in parallel with Phase 2 (different files).
- **User Story 4 (P4)**: Depends on Phase 2 T009 completing (WelcomePage.tsx). Can run in parallel with US3.

### Within Each User Story

- Implementation tasks are ordered: services → hooks → components → pages
- Test cleanup tasks marked [P] can all run in parallel within their story
- Commit after each story completes

### Parallel Opportunities

- T001 and T002 can run together (same file, adjacent lines)
- US3 (Phase 3) can run in parallel with Phase 2 since they touch different files
- US4 (Phase 4) can start after Phase 2 T009 completes (WelcomePage dependency)
- All test cleanup tasks within each story are parallelizable
- T031–T034 run sequentially as final verification

---

## Parallel Example: After Phase 1 Completes

```text
# These can run in parallel (different files):

Developer/Stream A — User Story 1 + 2 (Phase 2):
  T003: playerStorage.ts — remove COLOR_REMAP
  T004: playerStorage.ts — update savePlayer
  T005: usePlayers.ts (hooks)
  T006: NewPlayerForm.tsx (components)
  T007: DELETE colors.ts
  T008: DELETE ColorPicker/
  T009: WelcomePage.tsx (all colorId removals)
  T010: playerStorage.ts — v2→v3 migration

Developer/Stream B — User Story 3 (Phase 3, parallel with Phase 2):
  T018: PlayerCard.tsx (components)
  T019: PlayerCard.module.css (styles)

# After Phase 2 T009 completes:
Developer/Stream C — User Story 4 (Phase 4):
  T022: sessionManager.ts (services)
  T023: useSession.tsx (hooks)
  T024: Header.tsx (components)
```

---

## Implementation Strategy

### MVP First (User Story 1 + Migration)

1. Complete Phase 1: Foundational (T001–T002)
2. Complete Phase 2: User Story 1 + 2 (T003–T017)
3. **STOP and VALIDATE**: `npx tsc --noEmit` + `npx vitest run`
4. New players are created without color, legacy data migrates — core value delivered

### Incremental Delivery

1. Foundational → Type definitions updated
2. User Story 1 + 2 → Color picker removed from creation flow + legacy migration (MVP!)
3. User Story 3 → Player cards display without color dot
4. User Story 4 → Sessions and header without color
5. Polish → Full verification pass

---

## Notes

- This is a **removal** feature — tasks primarily delete code and strip references
- No new files created (except version bump in existing migration)
- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- US2 (migration) is bundled into Phase 2 with US1 to avoid a gap where COLOR_REMAP is removed but no v3 migration exists
- All WelcomePage.tsx edits consolidated in T009 (Phase 2) to prevent same-file conflicts
- Commit after each completed phase
- Total: 34 tasks (2 foundational + 15 US1+US2 + 4 US3 + 9 US4 + 4 polish)
