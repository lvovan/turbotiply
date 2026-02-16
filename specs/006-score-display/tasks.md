# Tasks: Score Display Rework

**Input**: Design documents from `/specs/006-score-display/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included per Constitution Principle V (Test-First). Tests are written before implementation and must fail before the corresponding implementation task.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the Player data model with per-game history types

- [x] T001 Add `GameRecord` interface and optional `gameHistory?: GameRecord[]` field to `Player` in `src/types/player.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer changes that ALL user stories depend on — schema migration, score recording, and new-player initialization

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (write first, verify they fail)

- [x] T002 Write tests for v3→v4 migration in `readStore()` — synthetic record for players with `gamesPlayed > 0`, empty array for players with 0 games, version bumped to 4 — in `tests/services/playerStorage.test.ts`
- [x] T003 Write tests for `updatePlayerScore()` GameRecord append — verify `GameRecord` appended with score and timestamp, verify 100-record cap enforcement (oldest discarded), verify `totalScore` and `gamesPlayed` still updated — in `tests/services/playerStorage.test.ts`
- [x] T004 Write test for `savePlayer()` initializing `gameHistory: []` for new players in `tests/services/playerStorage.test.ts`

### Implementation

- [x] T005 Implement v3→v4 migration in `readStore()` — after existing v2→v3 block, check `version === 3`, create synthetic `GameRecord` per player using `Math.round(totalScore / gamesPlayed)` and `lastActive` as timestamp, set `gameHistory: []` for 0-game players, bump version to 4, write store — in `src/services/playerStorage.ts`
- [x] T006 Refactor `updatePlayerScore()` to append `GameRecord { score: gameScore, completedAt: Date.now() }` to `player.gameHistory` (initializing to `[]` if absent), enforce 100-cap via `player.gameHistory.slice(-100)`, retaining existing `totalScore += gameScore` and `gamesPlayed += 1` — in `src/services/playerStorage.ts`
- [x] T007 Initialize `gameHistory: []` in `savePlayer()` when constructing new player object, alongside existing `totalScore: 0` and `gamesPlayed: 0` defaults — in `src/services/playerStorage.ts`

**Checkpoint**: Foundation ready — v3→v4 migration works, game scores are recorded as `GameRecord` entries, new players start with empty history. All Phase 2 tests pass.

---

## Phase 3: User Story 1 – Recent Average in Player Profile (Priority: P1) 🎯 MVP

**Goal**: Change the profile average displayed on player cards from all-time cumulative to a moving average of the last 10 games

**Independent Test**: Create a player, complete 12 games with known scores. Verify the displayed average uses only the last 10 game scores. Create a new player with 3 games and verify the average uses all 3.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 [P] [US1] Write tests for `getRecentAverage()` — returns `Math.round(mean)` of last 10 scores when ≥10 games, uses all scores when <10 games, returns `null` when 0 games or `gameHistory` absent, respects custom `count` parameter — in `tests/services/playerStorage.test.ts`
- [x] T009 [P] [US1] Write test for `PlayerCard` displaying recent average via `getRecentAverage(player, 10)` — verify "Avg: N" for players with history, verify "–" for 0-game players — in `tests/components/PlayerCard.test.tsx`

### Implementation for User Story 1

- [x] T010 [US1] Implement `getRecentAverage(player: Player, count?: number): number | null` — `history = player.gameHistory ?? []`, return `null` if empty, take `history.slice(-count)` (default 10), compute `Math.round(sum / slice.length)`, export from `playerStorage.ts` — in `src/services/playerStorage.ts`
- [x] T011 [US1] Update `PlayerCard` to import `getRecentAverage` from `playerStorage` and replace inline `Math.round(player.totalScore / player.gamesPlayed)` with `getRecentAverage(player, 10)`, display "–" when result is `null` — in `src/components/PlayerCard/PlayerCard.tsx`

**Checkpoint**: Player cards on the home screen show the last-10-games average. US1 tests pass. All prior tests still pass.

---

## Phase 4: User Story 2 – Recent High Scores on Main Menu (Priority: P1)

**Goal**: Display the last 5 game scores in ranked "high score" style on the pre-game screen

**Independent Test**: Log in as a player with 6+ games. Verify the main menu shows a "Recent High Scores" section with 5 scores sorted highest to lowest, with medals for ranks 1–3. Log in as a new player and verify a friendly empty-state message.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T012 [P] [US2] Write tests for `getRecentHighScores()` — returns last 5 records sorted by score descending, ties broken by most recent `completedAt` first, returns fewer when <5 games, returns empty array when 0 games — in `tests/services/playerStorage.test.ts`
- [x] T013 [P] [US2] Write tests for `RecentHighScores` component — renders ranked `<ol>` with medals (🥇🥈🥉) for ranks 1–3 and ordinal text for 4–5, renders "N points" per row, top score has emphasized styling, renders encouraging empty-state message when `isEmpty` is `true`, `.sr-only` spans announce "1st place: N points" etc. — in `tests/components/RecentHighScores.test.tsx`
- [x] T014 [P] [US2] Add axe-core accessibility test for `RecentHighScores` component (with scores and in empty state) in `tests/a11y/accessibility.test.tsx`

### Implementation for User Story 2

- [x] T015 [US2] Implement `getRecentHighScores(player: Player, count?: number): GameRecord[]` — take `history.slice(-count)` (default 5), sort by `score` descending then `completedAt` descending for ties, return sorted array — export from `src/services/playerStorage.ts`
- [x] T016 [P] [US2] Create `RecentHighScores` component (`RecentHighScores.tsx` + `RecentHighScores.module.css`) — `<section aria-labelledby>` + `<h2>` + `<ol aria-label>`, medal emojis with `aria-hidden="true"`, `.sr-only` rank text per `<li>`, top-score emphasis (`font-size: 1.25rem`, `background: #FFF8E1`, `border-left: #FFB300`), `font-variant-numeric: tabular-nums`, `max-width: 360px`, `@media (max-width: 320px)` breakpoint — in `src/components/GamePlay/RecentHighScores/`
- [x] T017 [US2] Add player lookup and `RecentHighScores` to `MainPage` — import `getPlayers`, `getRecentHighScores` from `playerStorage`, look up current player by `session.playerName` (case-insensitive), compute `recentScores` and `hasNoGames`, render `<RecentHighScores>` in the `not-started` block between the description `<p>` and the Start button — in `src/pages/MainPage.tsx`

**Checkpoint**: Pre-game screen shows ranked recent scores with medals. Empty-state message appears for new players. Axe-core tests pass. All prior tests still pass.

---

## Phase 5: User Story 3 – Score Progression Graph (Priority: P2)

**Goal**: Display a small sparkline graph of the player's full score history on the pre-game screen

**Independent Test**: Log in as a player with 15+ games. Verify a graph is visible showing scores over time. Log in with 1 game — no graph. Log in with 0 games — no graph.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T018 [P] [US3] Write tests for `getGameHistory()` — returns defensive copy of full `gameHistory` in chronological order, returns empty array when absent — in `tests/services/playerStorage.test.ts`
- [x] T019 [P] [US3] Write tests for `ProgressionGraph` component — renders `<svg>` with `<polyline>` for 2+ data points, returns `null` for <2 points, SVG has `role="img"` and `aria-label` with summary text ("Score progression: N games, from X to Y"), contains `<title>` element — in `tests/components/ProgressionGraph.test.tsx`
- [x] T020 [P] [US3] Add axe-core accessibility test for `ProgressionGraph` component (with 3+ data points) in `tests/a11y/accessibility.test.tsx`

### Implementation for User Story 3

- [x] T021 [US3] Implement `getGameHistory(player: Player): GameRecord[]` — return `[...(player.gameHistory ?? [])]` (defensive copy, chronological order) — export from `src/services/playerStorage.ts`
- [x] T022 [P] [US3] Create `ProgressionGraph` component (`ProgressionGraph.tsx` + `ProgressionGraph.module.css`) — return `null` if `history.length < 2`, render `<svg viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label="...">` with `<title>`, `<polyline>` mapping scores to points (x: even spacing, y: inverted), `stroke="currentColor"`, `strokeWidth={2}`, `fill="none"`, `max-height: 100px`, `width: 100%`, `@media (max-width: 320px)` reduces to `80px` — in `src/components/GamePlay/ProgressionGraph/`
- [x] T023 [US3] Add `ProgressionGraph` to `MainPage` — import `getGameHistory` from `playerStorage` and `ProgressionGraph` component, compute `gameHistory`, render `{gameHistory.length >= 2 && <ProgressionGraph history={gameHistory} />}` in `not-started` block after `<RecentHighScores>` and before the Start button — in `src/pages/MainPage.tsx`

**Checkpoint**: Pre-game screen shows sparkline graph for players with 2+ games. Graph scales to fit via `viewBox`. Axe-core tests pass. All prior tests still pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and full verification

- [x] T024 [P] Write integration test for full score display flow — complete a game, verify `GameRecord` persisted, navigate to main menu, verify `RecentHighScores` and `ProgressionGraph` render with updated data, verify `PlayerCard` average reflects recent scores — in `tests/integration/scoreDisplayFlow.test.tsx`
- [x] T025 Run quickstart.md validation: `npm test` (all pass), `npm run lint` (no errors), `npm run build` (clean production build)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2
- **User Story 2 (Phase 4)**: Depends on Phase 2 (independent of Phase 3)
- **User Story 3 (Phase 5)**: Depends on Phase 2 and Phase 4 (MainPage.tsx modified in Phase 4, Phase 5 builds on it)
- **Polish (Phase 6)**: Depends on Phases 3, 4, and 5

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — independent of US2 and US3
- **US2 (P1)**: Can start after Foundational — independent of US1. Can run in parallel with US1 (different files)
- **US3 (P2)**: Depends on US2 completing first because both modify `MainPage.tsx`

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (Constitution V)
2. Service helpers before component integration
3. Components before page-level integration
4. Verify story independently before moving to next

### Parallel Opportunities

- **Phase 3**: T008 ∥ T009 (different test files: `playerStorage.test.ts` vs `PlayerCard.test.tsx`)
- **Phase 4**: T012 ∥ T013 ∥ T014 (three different test files); T015 ∥ T016 (service vs component — component receives props, no import dependency)
- **Phase 5**: T018 ∥ T019 ∥ T020 (three different test files); T021 ∥ T022 (service vs component — no import dependency)
- **Phase 6**: T024 is independent (new file)

---

## Parallel Example: User Story 2

```text
# Launch all tests for US2 together (different files):
T012: tests/services/playerStorage.test.ts        (getRecentHighScores tests)
T013: tests/components/RecentHighScores.test.tsx   (component tests)
T014: tests/a11y/accessibility.test.tsx            (axe test)

# After tests written, launch independent implementation tasks:
T015: src/services/playerStorage.ts                (getRecentHighScores helper)
T016: src/components/GamePlay/RecentHighScores/    (component + CSS — receives props, no service import)

# After both complete, integrate:
T017: src/pages/MainPage.tsx                       (wires service + component together)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T007)
3. Complete Phase 3: User Story 1 (T008–T011)
4. **STOP and VALIDATE**: Player cards show last-10 average — core feature delivered
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3: US1 → Player cards show recent average → Deploy/Demo (MVP!)
3. Phase 4: US2 → Pre-game screen shows ranked recent scores → Deploy/Demo
4. Phase 5: US3 → Pre-game screen shows progression graph → Deploy/Demo
5. Phase 6: Polish → Full integration verified → Final deploy

### Parallel Strategy

With capacity for parallel work after Phase 2:

- **Stream A**: US1 (Phase 3: PlayerCard + getRecentAverage)
- **Stream B**: US2 (Phase 4: RecentHighScores + getRecentHighScores + MainPage)
- Then US3 (Phase 5) after Stream B completes (shared MainPage.tsx)

**Note**: `tests/services/playerStorage.test.ts` is modified by both US1 (T008) and US2 (T012). When running streams in parallel, coordinate test additions to avoid merge conflicts (e.g., append to separate `describe` blocks).

---

## Notes

- All paths are relative to `frontend/` (e.g., `src/types/player.ts` = `frontend/src/types/player.ts`)
- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Tests MUST fail before implementation (Constitution V: Test-First)
- axe-core a11y tests required for all new components (Constitution I: Accessibility First)
- Viewport minimum is 320px per Constitution III (not 360px as stated in spec SC-005)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
