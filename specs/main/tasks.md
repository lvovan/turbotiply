# Tasks: Player Sessions

**Input**: Design documents from `/specs/main/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included — Constitution Principle V (Test-First) requires tests before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Which user story this task belongs to
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the frontend project, install dependencies, configure tooling.

- [x] T001 Initialize frontend project with Vite + React + TypeScript in frontend/ (`npm create vite@latest . -- --template react-ts`)
- [x] T002 [P] Install runtime dependency react-router-dom in frontend/package.json
- [x] T003 [P] Install dev dependencies (vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, vitest-axe) in frontend/package.json
- [x] T004 [P] Configure Vitest with jsdom environment and test setup file in frontend/vite.config.ts
- [x] T005 [P] Configure ESLint with react-hooks and react-refresh plugins in frontend/eslint.config.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, constants, storage services, hooks, and routing that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Types & Constants

- [x] T006 [P] Define Player, Session, and PlayerStore TypeScript interfaces in frontend/src/types/player.ts
- [x] T007 [P] Define 12 avatar constants (id, label, description) and DEFAULT_AVATAR_ID in frontend/src/constants/avatars.ts
- [x] T008 [P] Define avatar emoji mapping and getAvatarEmoji helper in frontend/src/constants/avatarEmojis.ts
- [x] T009 [P] Define 8 color constants (id, label, hex, textColor) and DEFAULT_COLOR_ID in frontend/src/constants/colors.ts

### Storage Services (Test-First)

- [x] T010 Write tests for playerStorage service per contract (getPlayers, savePlayer, deletePlayer, playerExists, touchPlayer, isStorageAvailable, StorageUnavailableError, 50-player cap) in frontend/tests/services/playerStorage.test.ts
- [x] T011 Implement playerStorage service (localStorage CRUD with versioned schema, case-insensitive name matching, lastActive sorting, 50-player cap eviction) in frontend/src/services/playerStorage.ts
- [x] T012 [P] Write tests for sessionManager service per contract (startSession, endSession, getActiveSession, hasActiveSession) in frontend/tests/services/sessionManager.test.ts
- [x] T013 [P] Implement sessionManager service (sessionStorage lifecycle, touchPlayer on session start) in frontend/src/services/sessionManager.ts

### React Hooks (Test-First)

- [x] T014 Write tests for SessionProvider and useSession hook (mount reads sessionStorage, startSession/endSession state transitions, visibilitychange updates lastActive) in frontend/tests/hooks/useSession.test.tsx
- [x] T015 Implement SessionContext, SessionProvider, and useSession hook with visibilitychange listener in frontend/src/hooks/useSession.tsx
- [x] T016 [P] Write tests for usePlayers hook (reads localStorage on mount, savePlayer/deletePlayer mutations re-read state, playerExists check, storageAvailable flag) in frontend/tests/hooks/usePlayers.test.tsx
- [x] T017 [P] Implement usePlayers hook wrapping playerStorage service in frontend/src/hooks/usePlayers.ts

### Routing & Page Stubs

- [x] T018 Configure React Router with BrowserRouter, two routes (/ → WelcomePage, /play → MainPage), wrapped in SessionProvider in frontend/src/App.tsx
- [x] T019 [P] Create MainPage stub (redirects to / if no session active, shows placeholder content) in frontend/src/pages/MainPage.tsx

**Checkpoint**: Foundation ready — types, constants, storage services, hooks, and routing are in place. User story implementation can begin.

---

## Phase 3: User Story 1 — New Player Creates Their Profile (Priority: P1) 🎯 MVP

**Goal**: A child visiting for the first time can create a profile (avatar, name, color) and start playing.

**Independent Test**: Open the app in a fresh browser (no prior data). Verify the welcome screen appears with profile-creation flow. Select avatar, type name, pick color, tap "Let's go!" — app transitions to main experience showing player's name, avatar, and color.

### Tests for User Story 1

> **Write these tests FIRST — ensure they FAIL before implementation (Constitution Principle V)**

- [x] T020 [P] [US1] Write tests for AvatarPicker component (renders 12 avatars as role="radiogroup", roving tabindex, arrow-key navigation wraps, selection callback, aria-checked state) in frontend/tests/components/AvatarPicker.test.tsx
- [x] T021 [P] [US1] Write tests for ColorPicker component (renders 8 colors as role="radiogroup", roving tabindex, arrow-key navigation wraps, selection callback, checkmark on selected) in frontend/tests/components/ColorPicker.test.tsx
- [x] T022 [P] [US1] Write tests for NewPlayerForm component (name input with 20-char max, trimmed validation, empty name disables submit, default avatar/color pre-selected, duplicate name asks for overwrite confirmation, calls onSubmit with trimmed name+avatarId+colorId) in frontend/tests/components/NewPlayerForm.test.tsx
- [x] T023 [US1] Write tests for WelcomePage new-player flow (when no players exist: shows NewPlayerForm, completing form navigates to /play, storage-unavailable shows warning + allows temporary session) in frontend/tests/pages/WelcomePage.test.tsx

### Implementation for User Story 1

- [x] T024 [P] [US1] Implement AvatarPicker component with role="radiogroup", roving tabindex, arrow-key navigation, aria-labels, emoji display via getAvatarEmoji, 3×4 responsive grid in frontend/src/components/AvatarPicker/AvatarPicker.tsx and AvatarPicker.module.css
- [x] T025 [P] [US1] Implement ColorPicker component with role="radiogroup", roving tabindex, arrow-key navigation, aria-labels, checkmark on selected swatch, 2×4 responsive grid in frontend/src/components/ColorPicker/ColorPicker.tsx and ColorPicker.module.css
- [x] T026 [US1] Implement NewPlayerForm component (avatar picker + name input + color picker + "Let's go!" button; validation: trimmed non-empty ≤20 chars, disabled state, duplicate name detection, overwrite confirmation if name already exists) in frontend/src/components/WelcomeScreen/NewPlayerForm.tsx and NewPlayerForm.module.css
- [x] T027 [US1] Implement WelcomePage: when no players in storage, render NewPlayerForm; on submit save player and start session, navigate to /play; storage-unavailable graceful degradation with friendly message in frontend/src/pages/WelcomePage.tsx and WelcomePage.module.css

**Checkpoint**: User Story 1 complete — new player can create a profile and enter the main experience. Independently testable with a fresh browser.

---

## Phase 4: User Story 2 — Returning Player Selects Their Name (Priority: P2)

**Goal**: A child returning on a device with existing players can tap their name to start playing instantly, add a new player, or delete an existing one.

**Independent Test**: Pre-populate browser storage with two player names. Open the app — both appear as selectable options with avatar, name, and color. Tap one — app loads with that player's session. Test "New player" option. Test delete with confirmation.

### Tests for User Story 2

> **Write these tests FIRST — ensure they FAIL before implementation**

- [x] T028 [P] [US2] Write tests for PlayerCard component (displays avatar emoji, name, color accent; click triggers selection callback; delete button with aria-label triggers delete callback; accessible button role) in frontend/tests/components/PlayerCard.test.tsx
- [x] T029 [P] [US2] Write tests for DeleteConfirmation component (shows "Remove [Name]?" with message, Remove calls onConfirm, Cancel calls onCancel, Escape key dismisses, focus trapped in dialog, aria-modal="true") in frontend/tests/components/DeleteConfirmation.test.tsx
- [x] T030 [US2] Write tests for PlayerList component (renders PlayerCards ordered by lastActive desc, "New player" button calls onNewPlayer, delete icon triggers DeleteConfirmation dialog, confirming delete calls onDeletePlayer) in frontend/tests/components/PlayerList.test.tsx
- [x] T031 [US2] Write tests for WelcomePage returning-player flow (when players exist: shows PlayerList, tapping player starts session + navigates to /play, tapping "New player" shows NewPlayerForm, "Back to player list" returns to PlayerList, eviction message shown when 50-player cap exceeded) in frontend/tests/pages/WelcomePage.test.tsx

### Implementation for User Story 2

- [x] T032 [P] [US2] Implement PlayerCard component (avatar emoji + name + color accent border + delete ✕ button with stopPropagation, accessible "Play as [Name]" and "Remove [Name]" aria-labels) in frontend/src/components/PlayerCard/PlayerCard.tsx and PlayerCard.module.css
- [x] T033 [P] [US2] Implement DeleteConfirmation dialog (accessible modal with aria-modal="true", "Remove [Name]? Their scores will be lost.", Remove/Cancel buttons, overlay click dismisses, Escape key dismisses, focus on mount) in frontend/src/components/DeleteConfirmation/DeleteConfirmation.tsx and DeleteConfirmation.module.css
- [x] T034 [US2] Implement PlayerList component (maps players to PlayerCards, delete per card triggers DeleteConfirmation, "➕ New player" button, scrollable container) in frontend/src/components/WelcomeScreen/PlayerList.tsx and PlayerList.module.css
- [x] T035 [US2] Update WelcomePage: when players exist show PlayerList; tapping player starts session + navigates to /play; tapping "New player" shows NewPlayerForm with "← Back to player list" button; eviction message display in frontend/src/pages/WelcomePage.tsx

**Checkpoint**: User Stories 1 AND 2 complete — both new and returning players can enter the app. Delete flow works with confirmation. Each independently testable.

---

## Phase 5: User Story 3 — Session Ends When Tab/Browser Closes (Priority: P3)

**Goal**: Active session is tab-scoped — closes automatically when the tab closes. "Switch player" button returns to welcome screen. Session persists through in-tab navigation (back button, URL re-entry).

**Independent Test**: Open app, select player, confirm session active (name visible in header). Close tab. Reopen app — welcome screen appears. Also test "Switch player" button ends session and navigates to welcome.

### Tests for User Story 3

> **Write these tests FIRST — ensure they FAIL before implementation**

- [x] T036 [P] [US3] Write tests for Header component (displays avatar emoji + "Hi, [Name]!" greeting + player color accent; "Switch player" button calls endSession + navigates to /; renders nothing when no session active) in frontend/tests/components/Header.test.tsx
- [x] T037 [US3] Write integration tests for session lifecycle (session in sessionStorage clears on simulated tab close, app shows welcome screen on fresh load, visibilitychange updates lastActive, MainPage redirects to / when no session, back-button preserves session) in frontend/tests/integration/sessionLifecycle.test.tsx. Multi-tab isolation is inherently handled by sessionStorage.

### Implementation for User Story 3

- [x] T038 [US3] Implement Header component (avatar emoji + "Hi, [Name]!" greeting with player color, "Switch player" button calling endSession + navigate to /, renders null when no session) in frontend/src/components/Header/Header.tsx and Header.module.css
- [x] T039 [US3] Add Header to MainPage layout above main content, rendered only when session active in frontend/src/pages/MainPage.tsx

**Checkpoint**: All 3 user stories complete — new player creation, returning player selection, and session lifecycle all work independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, responsive validation, and final quality gates.

- [x] T040 [P] Write and run axe-core accessibility tests for all screens (WelcomePage with NewPlayerForm, WelcomePage with PlayerList, MainPage with Header) in frontend/tests/a11y/accessibility.test.tsx
- [x] T041 [P] Responsive spot-check on 320px, 1280px and 1920px viewports for all screens — verify no horizontal scroll, 44×44px touch targets, readable fonts, grid layouts adapt
- [x] T042 Run full test suite (vitest run) and fix any failures across all test files in frontend/tests/
- [x] T043 Run quickstart.md validation: follow quickstart.md from scratch in a clean environment, verify all steps work
- [x] T044 Code cleanup: remove unused imports, ensure consistent naming, verify JSDoc comments on all exported functions and components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP target
- **User Story 2 (Phase 4)**: Depends on Foundational + shares WelcomePage with US1
- **User Story 3 (Phase 5)**: Depends on Foundational — needs a session to test Header/lifecycle
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 — shares WelcomePage with US1 but adds PlayerList path. Independently testable by pre-populating storage.
- **US3 (P3)**: Can start after Phase 2 — adds Header component and session lifecycle. Independently testable by starting session via test setup.

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (Constitution Principle V)
2. Components marked [P] can be built in parallel (different files)
3. Container components/pages depend on their child components
4. CSS modules are created alongside their component

### Parallel Opportunities

**Within Phase 2** (Foundational):
- T006, T007, T008, T009 can all run in parallel (types + constants, different files)
- T010/T011 (playerStorage) and T012/T013 (sessionManager) are independent service pairs
- T014/T015 (useSession) and T016/T017 (usePlayers) are independent hook pairs

**Within Phase 3** (US1):
- T020, T021, T022 (component tests) can all run in parallel
- T024, T025 (AvatarPicker, ColorPicker implementations) can run in parallel

**Within Phase 4** (US2):
- T028, T029 (PlayerCard + DeleteConfirmation tests) can run in parallel
- T032, T033 (PlayerCard + DeleteConfirmation implementations) can run in parallel

**Within Phase 6** (Polish):
- T040, T041 are independent and can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```text
# Batch 1 — all [P], no dependencies:
T006: Define types in frontend/src/types/player.ts
T007: Define avatars in frontend/src/constants/avatars.ts
T008: Define avatarEmojis in frontend/src/constants/avatarEmojis.ts
T009: Define colors in frontend/src/constants/colors.ts

# Batch 2 — service tests (depend on types from Batch 1):
T010: Tests for playerStorage in frontend/tests/services/playerStorage.test.ts
T012: Tests for sessionManager in frontend/tests/services/sessionManager.test.ts

# Batch 3 — service implementations (make tests pass):
T011: Implement playerStorage in frontend/src/services/playerStorage.ts
T013: Implement sessionManager in frontend/src/services/sessionManager.ts

# Batch 4 — hook tests (depend on services):
T014: Tests for useSession in frontend/tests/hooks/useSession.test.tsx
T016: Tests for usePlayers in frontend/tests/hooks/usePlayers.test.tsx

# Batch 5 — hook implementations + routing:
T015: Implement useSession in frontend/src/hooks/useSession.tsx
T017: Implement usePlayers in frontend/src/hooks/usePlayers.ts
T018: Configure routing in frontend/src/App.tsx
T019: MainPage stub in frontend/src/pages/MainPage.tsx
```

## Parallel Example: Phase 3 (User Story 1)

```text
# Batch 1 — component tests, all [P]:
T020: AvatarPicker tests
T021: ColorPicker tests
T022: NewPlayerForm tests

# Batch 2 — page-level test:
T023: WelcomePage tests (new player flow)

# Batch 3 — component implementations, [P] where possible:
T024: AvatarPicker component + CSS
T025: ColorPicker component + CSS

# Batch 4 — form + page (depend on child components):
T026: NewPlayerForm component + CSS
T027: WelcomePage implementation + CSS
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T019)
3. Complete Phase 3: User Story 1 (T020–T027)
4. **STOP and VALIDATE**: Fresh browser → welcome screen → create profile → enter app
5. Deploy/demo if ready — a child can create a profile and start playing

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → **Deploy (MVP!)**
3. Add US2 → Test independently → Deploy (returning players)
4. Add US3 → Test independently → Deploy (session lifecycle)
5. Polish → Final quality gate
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Phase 2 is complete:
- Developer A: User Story 1 (Profile creation)
- Developer B: User Story 2 (Returning players — can pre-populate storage for testing)
- Developer C: User Story 3 (Session lifecycle — can create sessions programmatically for testing)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [US#] label maps each task to its user story for traceability
- Each user story is independently completable and testable
- Tests MUST fail before implementation begins (red → green → refactor)
- Commit after each task or logical group
- All components must meet WCAG 2.1 AA (ARIA labels, keyboard nav, contrast, 44×44px targets)
- All layouts must be responsive (320px–1920px, mobile-first)
- CSS modules used for all component styling (per Constitution: no heavy CSS-in-JS)
