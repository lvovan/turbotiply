# Tasks: Player Name Limit

**Input**: Design documents from `specs/022-player-name-limit/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n keys and type documentation needed by all stories

- [x] T001 [P] Add `player.charCount` i18n key to all 5 locale files in frontend/src/i18n/locales/{en,fr,de,ja,pt}.ts
- [x] T002 [P] Update Player type JSDoc from "1–20 chars" to "1–10 chars" in frontend/src/types/player.ts

---

## Phase 2: User Story 1 — Name Length Enforcement During Entry (Priority: P1) 🎯 MVP

**Goal**: Reduce max name length from 20 to 10 and show a live character counter with accessible announcement.

**Independent Test**: Type >10 characters in the name field → input caps at 10. Character counter shows `X/10` below the input, turning orange at capacity.

### Implementation for User Story 1

- [x] T003 [US1] Change `MAX_NAME_LENGTH` from 20 to 10 in frontend/src/components/WelcomeScreen/NewPlayerForm.tsx
- [x] T004 [US1] Add character counter `<span>` with `aria-live="polite"` below the name input in frontend/src/components/WelcomeScreen/NewPlayerForm.tsx
- [x] T005 [P] [US1] Add `.charCounter` and `.charCounterWarning` CSS classes in frontend/src/components/WelcomeScreen/NewPlayerForm.module.css
- [x] T006 [US1] Update existing 20-char limit test to assert 10-char limit in frontend/tests/components/NewPlayerForm.test.tsx
- [x] T007 [US1] Add test: character counter renders with correct `X/10` text in frontend/tests/components/NewPlayerForm.test.tsx
- [x] T008 [US1] Add test: character counter has `aria-live="polite"` attribute in frontend/tests/components/NewPlayerForm.test.tsx

**Checkpoint**: Name input caps at 10 chars, counter visible and accessible. All tests pass.

---

## Phase 3: User Story 2 — Paste Handling (Priority: P2)

**Goal**: Pasting a long string into the name field truncates to 10 characters.

**Independent Test**: Paste a 25-char string → field shows first 10 chars only.

### Implementation for User Story 2

- [x] T009 [US2] Add test: pasting a 25-character string truncates to 10 in frontend/tests/components/NewPlayerForm.test.tsx

**Checkpoint**: Paste truncation verified by test. No implementation change needed — the existing `.slice(0, MAX_NAME_LENGTH)` in `onChange` already handles paste since `MAX_NAME_LENGTH` was changed in T003.

---

## Phase 4: User Story 3 — Backward Compatibility (Priority: P3)

**Goal**: Existing players with names >10 characters continue to display and function normally.

**Independent Test**: Pre-seed localStorage with a 15-char player name → name displays in full on player card and header.

### Implementation for User Story 3

- [x] T010 [US3] Verify no storage-layer truncation exists by auditing frontend/src/services/playerStorage.ts (read-only check, no code change expected)

**Checkpoint**: Confirmed that `playerStorage.ts` does not enforce a max length — existing long names are preserved. No code changes needed.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [x] T011 Run full test suite (`npm test` in frontend/) and validate all tests pass
- [x] T012 Run quickstart.md verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — i18n keys and type JSDoc can be added immediately
- **US1 (Phase 2)**: Depends on T001 (i18n key for counter text). T003–T005 can start after T001.
- **US2 (Phase 3)**: Depends on T003 (MAX_NAME_LENGTH change). Test-only phase.
- **US3 (Phase 4)**: No code dependencies — read-only audit.
- **Polish (Phase 5)**: Depends on all previous phases.

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T005 can run in parallel with T003/T004 (CSS vs TSX)
- T006, T007, T008 can be written together (same test file, sequential in file but logically independent)

---

## Parallel Example: Phase 1

```bash
# Both setup tasks in parallel (different files):
Task T001: "Add player.charCount i18n key to all 5 locale files"
Task T002: "Update Player type JSDoc in player.ts"
```

## Parallel Example: User Story 1

```bash
# CSS and component work in parallel (different files):
Task T005: "Add .charCounter CSS classes in NewPlayerForm.module.css"
Task T003+T004: "Update MAX_NAME_LENGTH and add counter span in NewPlayerForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: User Story 1 (T003–T008)
3. **STOP and VALIDATE**: Counter visible, limit enforced, tests pass
4. Deploy/demo if ready — this delivers full user value

### Incremental Delivery

1. Setup → i18n keys + type docs ready
2. Add US1 → 10-char limit + counter → Test → Deploy (MVP!)
3. Add US2 → Paste test → Confirms existing behavior → Deploy
4. Add US3 → Audit confirms backward compat → Deploy
5. Polish → Full validation

---

## Notes

- This is a small, focused feature: 5 files modified, 0 new files created
- US2 requires no implementation — existing `.slice()` handles paste after `MAX_NAME_LENGTH` changes
- US3 requires no implementation — storage layer has no length enforcement to modify
- Total: 12 tasks (2 setup, 6 US1, 1 US2, 1 US3, 2 polish)
