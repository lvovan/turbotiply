# Tasks: Portuguese Language Support

**Input**: Design documents from `/specs/015-portuguese-language/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. TypeScript compile-time validation enforces dictionary completeness. Existing 476 tests cover i18n infrastructure.

**Organization**: Tasks are grouped by user story. Due to the small scope (1 new file, 4 modifications), some phases are combined.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Type Extension)

**Purpose**: Extend the Language type to accept `'pt'` — prerequisite for all other changes

- [x] T001 Add `'pt'` to the Language union type in `frontend/src/types/i18n.ts`

**Checkpoint**: TypeScript now recognises `'pt'` as a valid Language code

---

## Phase 2: Foundational (Registration)

**Purpose**: Register Portuguese in all infrastructure files so the system recognises it as a supported language

**⚠️ CRITICAL**: Must complete before the dictionary can be used

- [x] T002 [P] Add Portuguese entry `{ code: 'pt', nativeName: 'Português', flag: '🇧🇷' }` to `SUPPORTED_LANGUAGES` in `frontend/src/i18n/index.ts`
- [x] T003 [P] Add `'pt'` to the `SUPPORTED_CODES` set in `frontend/src/i18n/detectLanguage.ts`

**Checkpoint**: Portuguese is registered in the supported languages list and browser auto-detection set

---

## Phase 3: User Story 1 — Portuguese dictionary with complete translations (Priority: P1) 🎯 MVP

**Goal**: Create the Portuguese (Brazilian) dictionary file with all ~100 translation keys, and wire it into the LanguageContext so the app can render Portuguese text.

**Independent Test**: Set Portuguese as the active language and navigate through welcome → player creation → mode selection → gameplay → score summary. All text should appear in Portuguese.

### Implementation for User Story 1

- [x] T004 [US1] Create Portuguese dictionary file `frontend/src/i18n/locales/pt.ts` with all translation keys typed as `Dictionary` (copy key structure from `en.ts`, translate all values to Brazilian Portuguese using child-friendly informal register)
- [x] T005 [US1] Import `pt` dictionary in `frontend/src/i18n/LanguageContext.tsx` and add to the `dictionaries` map
- [x] T006 [US1] Run `npm run build` in `frontend/` to verify TypeScript compilation succeeds with no missing or extra keys

**Checkpoint**: Portuguese dictionary is complete and integrated. Setting language to `'pt'` programmatically renders all text in Portuguese.

---

## Phase 4: User Story 2 — Portuguese appears in the language switcher (Priority: P1)

**Goal**: Portuguese is visible and selectable in the LanguageSwitcher dropdown on both the welcome screen and the header.

**Independent Test**: Click the language switcher, verify Portuguese (🇧🇷 Português) appears in the dropdown, select it, and confirm all text updates immediately.

### Implementation for User Story 2

> No implementation tasks needed — the LanguageSwitcher component dynamically renders from the `SUPPORTED_LANGUAGES` array (already updated in T002). Portuguese automatically appears in the dropdown after Phase 2 is complete.

**Checkpoint**: Verify visually that Portuguese appears in the LanguageSwitcher dropdown with the 🇧🇷 flag and "Português" label.

---

## Phase 5: User Story 3 — Browser auto-detection recognises Portuguese (Priority: P1)

**Goal**: Browser language detection correctly matches `pt`, `pt-BR`, `pt-PT`, and other `pt-*` variants to Portuguese.

**Independent Test**: Set browser language to `pt-BR`, clear stored preference, reload app — all text should appear in Portuguese.

### Implementation for User Story 3

> No implementation tasks needed — the `detectLanguage()` function iterates `navigator.languages`, strips region codes (`pt-BR` → `pt`), and checks against `SUPPORTED_CODES` (already updated in T003). Portuguese auto-detection works after Phase 2 is complete.

**Checkpoint**: Verify by temporarily setting browser language to `pt-BR` and confirming auto-detection selects Portuguese.

---

## Phase 6: User Stories 4 & 5 — Persistence and HTML lang attribute (Priority: P2)

**Goal**: Portuguese preference persists in localStorage; HTML `lang` attribute updates to `"pt"` when Portuguese is active.

**Independent Test**: Select Portuguese, close and reopen the browser — Portuguese should still be active. Inspect `<html lang="pt">` in dev tools.

### Implementation for User Stories 4 & 5

> No implementation tasks needed — the existing `LanguageContext` stores the selected language in `localStorage` under `turbotiply_lang` and sets `document.documentElement.lang` to the active language code. Since `'pt'` is now a valid `Language` value (T001), both mechanisms work automatically.

**Checkpoint**: Verified by existing infrastructure — no code changes required.

---

## Phase 7: Polish & Verification

**Purpose**: Final verification that all changes integrate correctly and nothing is broken

- [x] T007 Run full test suite (`npx vitest run` in `frontend/`) — all 476+ tests must pass
- [x] T008 Run quickstart.md verification steps 1–8 (manual visual validation in dev server)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Registration)**: Depends on Phase 1 (T001) — type must exist before it's used
- **Phase 3 (US1 Dictionary)**: Depends on Phase 1 (T001) — dictionary file must reference the Language type
- **Phase 4 (US2 Switcher)**: Automatic after Phase 2 (T002) — no tasks
- **Phase 5 (US3 Detection)**: Automatic after Phase 2 (T003) — no tasks
- **Phase 6 (US4+5)**: Automatic after Phase 1 (T001) — no tasks
- **Phase 7 (Polish)**: Depends on all previous phases

### Within Implementation

- T001 must complete first (type extension is prerequisite for all)
- T002 and T003 can run in parallel (different files)
- T004 can run in parallel with T002/T003 (different file, only depends on T001)
- T005 depends on T004 (must import the dictionary that was just created)
- T006 depends on T001–T005 (build verifies everything compiles together)
- T007 depends on T006 (tests run after build succeeds)
- T008 depends on T007 (manual validation after tests pass)

### Parallel Opportunities

```
After T001 completes:
├── T002 (index.ts — SUPPORTED_LANGUAGES)     ┐
├── T003 (detectLanguage.ts — SUPPORTED_CODES) ├── All in parallel
└── T004 (pt.ts — dictionary creation)         ┘

Then sequentially:
T005 (LanguageContext.tsx — wire dictionary)
T006 (build verification)
T007 (test suite)
T008 (manual quickstart validation)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Type extension
2. Complete T002 + T003 + T004 in parallel: Registration + Dictionary
3. Complete T005: Wire dictionary into context
4. Complete T006: Build verification
5. **STOP and VALIDATE**: Portuguese is fully functional as a language option

### Incremental Delivery

User Stories 2–5 require zero additional implementation — they are automatically satisfied by the infrastructure changes in Phases 1–3. The entire feature is deliverable as a single increment.

---

## Notes

- This is a small, well-scoped feature: 5 files touched (1 new, 4 modified), 8 tasks total
- User Stories 2–5 have no implementation tasks because the existing i18n infrastructure handles them automatically once Portuguese is registered
- TypeScript compile-time validation (`const pt: Dictionary = { ... }`) replaces the need for dictionary completeness tests
- The dictionary file (T004) is the largest task — ~100 translation key-value pairs to write
- All Portuguese text should use informal Brazilian Portuguese, child-friendly vocabulary (ages 6–12)
