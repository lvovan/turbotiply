# Tasks: Home Screen Rework

**Input**: Design documents from `specs/003-home-screen-rework/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included per constitution principle V (Test-First).

**Organization**: Tasks are grouped by user story. US1 (Clear All Profiles) and US2 (Scroll-Free Home Screen) are both P1 but touch different files, enabling parallel work after foundational tasks complete.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: No new dependencies required. Existing project structure is sufficient.

- [x] T001 Verify branch `003-home-screen-rework` is checked out and `npm install` succeeds in `frontend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constants reduction, type changes, and storage migration that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Reduce AVATARS array from 12 to 8 entries (remove dog, planet, flower, crown) in `frontend/src/constants/avatars.ts`
- [x] T003 [P] Reduce AVATAR_EMOJIS record from 12 to 8 entries (remove dog, planet, flower, crown keys) in `frontend/src/constants/avatarEmojis.ts`
- [x] T004 [P] Reduce COLORS array from 8 to 6 entries (remove orange, green) in `frontend/src/constants/colors.ts`
- [x] T005 Add totalScore (number, default 0) and gamesPlayed (number, default 0) fields to Player interface in `frontend/src/types/player.ts`
- [x] T006 Add AVATAR_REMAP and COLOR_REMAP mapping tables, v1→v2 migration logic in readStore(), and avatar/color remapping on load in `frontend/src/services/playerStorage.ts`
- [x] T007 [P] Update existing tests for reduced avatar count (8 avatars expected) and 4×2 grid layout in `frontend/tests/components/AvatarPicker.test.tsx`
- [x] T008 [P] Update existing tests for reduced color count (6 colors expected) and single-row layout in `frontend/tests/components/ColorPicker.test.tsx`
- [x] T009 Add tests for v1→v2 migration (totalScore/gamesPlayed default 0) and avatar/color remapping in `frontend/tests/services/playerStorage.test.ts`

**Checkpoint**: Constants reduced, types updated, migration tested. All existing tests pass with updated expectations.

---

## Phase 3: User Story 1 — Clear All Profiles (Priority: P1) + User Story 3 — Accessible Dialog (Priority: P2) 🎯 MVP

**Goal**: Add a "Clear all profiles" button to the returning-player view that, after confirmation, wipes all localStorage + sessionStorage and reloads the page. The confirmation dialog is fully accessible (focus trap, Escape key, screen reader support).

**Independent Test**: Create profiles, tap "Clear all profiles", confirm, verify page reloads with empty first-visit screen and zero items in browser storage.

### Tests for User Story 1

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [P] [US1] Write tests for ClearAllConfirmation component (renders dialog, confirm/cancel callbacks, Escape key dismissal, overlay click cancels) in `frontend/tests/components/ClearAllConfirmation.test.tsx`
- [x] T011 [P] [US1] Write tests for clearAllStorage() function (clears localStorage + sessionStorage, throws on failure) in `frontend/tests/services/playerStorage.test.ts`
- [x] T012 [P] [US1] Write tests for PlayerList clear-all button (visible when profiles exist, hidden when empty, triggers dialog) in `frontend/tests/components/PlayerList.test.tsx`
- [x] T013 [P] [US3] Write accessibility tests for ClearAllConfirmation (role="dialog", aria-modal, focus trap, axe-core scan) in `frontend/tests/a11y/accessibility.test.tsx`

### Implementation for User Story 1

- [x] T014 [US1] Implement clearAllStorage() function (localStorage.clear + sessionStorage.clear, try/catch with StorageUnavailableError) in `frontend/src/services/playerStorage.ts`
- [x] T015 [US1] Add clearAllPlayers method to usePlayers hook (calls clearAllStorage then window.location.reload) in `frontend/src/hooks/usePlayers.ts`
- [x] T016 [P] [US1] Create ClearAllConfirmation component with accessible dialog (role="dialog", aria-modal, Escape key, focus trap, friendly warning text) in `frontend/src/components/ClearAllConfirmation/ClearAllConfirmation.tsx`
- [x] T017 [P] [US1] Create ClearAllConfirmation styles (overlay, dialog, buttons matching DeleteConfirmation pattern) in `frontend/src/components/ClearAllConfirmation/ClearAllConfirmation.module.css`
- [x] T018 [US1] Add "Clear all profiles" button and ClearAllConfirmation dialog to PlayerList (de-emphasized button below "New player", state for showing dialog) in `frontend/src/components/WelcomeScreen/PlayerList.tsx`
- [x] T019 [US1] Wire onClearAll handler in WelcomePage (calls clearAllPlayers from usePlayers hook, try/catch with error state, render dismissible error banner on failure) in `frontend/src/pages/WelcomePage.tsx`
- [x] T020 [P] [US1] Add "Clear all profiles" button styles (smaller text 0.85rem, muted color #888, transparent background, min 44×44px tap target) in `frontend/src/components/WelcomeScreen/PlayerList.module.css`
- [x] T021 [US1] Write integration test for full clear-all flow (create profiles → tap clear → confirm → storage empty) in `frontend/tests/integration/clearAllFlow.test.tsx`

**Checkpoint**: "Clear all profiles" button visible on returning-player view, hidden on first-visit. Dialog is accessible. Confirming clears storage and reloads. Cancelling or pressing Escape dismisses without data loss.

---

## Phase 4: User Story 2 — Scroll-Free Home Screen (Priority: P1)

**Goal**: Make the entire home screen (both new-player form and returning-player list) fit on a 360×640 CSS pixel viewport without vertical scrolling. Player cards use single-line horizontal layout with average score, sorted alphabetically.

**Independent Test**: Open both views on a 360×640 viewport. All content visible without scrolling. All tap targets ≥ 44×44px.

### Tests for User Story 2

> **Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US2] Write tests for PlayerCard single-line layout (renders avatar, name, avg score, color dot, delete icon; shows "—" when no games played) in `frontend/tests/components/PlayerCard.test.tsx`
- [x] T023 [P] [US2] Write tests for alphabetical player sorting in usePlayers hook (case-insensitive name ordering) in `frontend/tests/hooks/usePlayers.test.tsx`

### Implementation for User Story 2

- [x] T026 [US2] Refactor PlayerCard to single-line horizontal layout (avatar emoji 1.5rem, name with ellipsis, avg score "Avg: N" or "—", color dot 12px, delete icon) in `frontend/src/components/PlayerCard/PlayerCard.tsx`
- [x] T027 [US2] Update PlayerCard styles for single-line layout (flex row, gap 8px, padding 8px 12px, min-height 44px) in `frontend/src/components/PlayerCard/PlayerCard.module.css`
- [x] T028 [US2] Add alphabetical sort (case-insensitive) to usePlayers hook's returned `players` array in `frontend/src/hooks/usePlayers.ts`
- [x] T029 [US2] Update AvatarPicker grid to 4 columns on all viewports, reduce gap to 8px, emoji size to 1.75rem in `frontend/src/components/AvatarPicker/AvatarPicker.module.css`
- [x] T030 [US2] Update ColorPicker grid to 6 columns single row, reduce gap to 10px in `frontend/src/components/ColorPicker/ColorPicker.module.css`
- [x] T031 [US2] Reduce form spacing in NewPlayerForm (gap 16px from 24px, padding 12px from 16px) in `frontend/src/components/WelcomeScreen/NewPlayerForm.module.css`
- [x] T032 [US2] Reduce WelcomePage spacing (top padding 16px from 24px, subtitle margin-bottom 16px from 32px) in `frontend/src/pages/WelcomePage.module.css`

**Checkpoint**: Both views fit on 360×640 viewport without scrolling. Player cards are single-line with average score. Avatar picker shows 8 in 4×2 grid. Color picker shows 6 in single row. Players sorted alphabetically.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, a11y sweep, and cleanup

- [x] T033 [P] Add updatePlayerScore(name, gameScore) function in `frontend/src/services/playerStorage.ts` and wire into game completion in `frontend/src/hooks/useGame.ts` (call updatePlayerScore when game status transitions to 'completed')
- [x] T034 [P] Run axe-core accessibility audit on all modified components (WelcomePage both views, ClearAllConfirmation, PlayerCard, AvatarPicker, ColorPicker) in `frontend/tests/a11y/accessibility.test.tsx`
- [x] T035 Verify scroll-free constraint on 360×640 viewport for both views AND responsive rendering at 320px and 1280px viewports per constitution Quality Gate (visual spot-check or automated viewport test)
- [x] T038 [P] [US2] Add bottom fade gradient (24px, semi-transparent) to PlayerList card container when >5 profiles rendered (FR-015) in `frontend/src/components/WelcomeScreen/PlayerList.tsx` and `frontend/src/components/WelcomeScreen/PlayerList.module.css`
- [x] T036 Run full test suite (`npm run test`), lint (`npm run lint`), and build (`npm run build`) with zero errors
- [x] T037 Run quickstart.md verification checklist to confirm all items pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Story 1 + 3 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion
- **Polish (Phase 5)**: Depends on Phase 3 AND Phase 4 completion

### User Story Dependencies

- **US1 (Clear All Profiles)**: Depends only on Phase 2. No dependency on US2.
- **US2 (Scroll-Free Layout)**: Depends only on Phase 2. No dependency on US1.
- **US3 (Accessible Dialog)**: Implemented within Phase 3 as part of the ClearAllConfirmation component.
- **US1 and US2 CAN run in parallel** after Phase 2, since they touch different files:
  - US1: ClearAllConfirmation (new), PlayerList (button + dialog), WelcomePage (handler)
  - US2: PlayerCard, AvatarPicker CSS, ColorPicker CSS, NewPlayerForm CSS, WelcomePage CSS

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Test-First)
- Service functions before hooks
- Hooks before components
- Components before pages
- Core implementation before integration tests

### Parallel Opportunities

Within Phase 2:
- T002, T003, T004 can all run in parallel (different constant files)
- T007, T008 can run in parallel (different test files)

Within Phase 3 (US1):
- T010, T011, T012, T013 can all run in parallel (different test files)
- T016, T017 can run in parallel (component + CSS)

Within Phase 4 (US2):
- T022, T023, T024, T025 can all run in parallel (different test files)
- T029, T030, T031, T032 can all run in parallel (different CSS files)

**Phases 3 and 4 can run in parallel** since they modify different files.

---

## Parallel Example: After Phase 2 Completes

```
# US1 and US2 tests can ALL be launched together:
T010: ClearAllConfirmation tests (US1)
T011: clearAllStorage tests (US1)
T012: PlayerList clear-all tests (US1)
T013: ClearAllConfirmation a11y tests (US3)
T022: PlayerCard single-line tests (US2)
T023: Alphabetical sort tests (US2, in usePlayers.test.tsx)

# Note: AvatarPicker grid + ColorPicker row tests are consolidated into T007/T008 (Phase 2)

# Then US1 and US2 implementation can proceed in parallel:
# Stream A (US1): T014 → T015 → T016+T017 → T018 → T019 → T020 → T021
# Stream B (US2): T026+T027 → T028 → T029+T030+T031+T032 → T038
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (constants, types, migration)
3. Complete Phase 3: User Story 1 + 3 (Clear All + Accessible Dialog)
4. **STOP and VALIDATE**: Test clear-all flow independently
5. Demo: "Clear all profiles" works end-to-end with accessible dialog

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (constants reduced, types updated, migration works)
2. Phase 3 → US1 done → "Clear all profiles" is functional and accessible
3. Phase 4 → US2 done → Everything fits on mobile without scrolling
4. Phase 5 → Polish → All tests pass, a11y audit clean, quickstart verified
5. Each phase adds value without breaking previous work

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [USn] label maps task to specific user story for traceability
- All paths are relative to repository root (prefix: `frontend/`)
- PlayerList.tsx is touched by both US1 (T018: clear-all button) and US2 (T038: scroll fade gradient) — these modify different sections of the same file, so they can still be done in parallel but require care
- T024 and T025 (originally separate US2 test tasks for AvatarPicker/ColorPicker grid layouts) were consolidated into T007 and T008 respectively (Phase 2) to avoid duplicate edits to the same test files
- T028 (alphabetical sort) moved from PlayerList.tsx to usePlayers.ts to match the service contract and avoid double-sorting
- Total tasks: 36 (net: +1 T038, -2 removed T024/T025)
