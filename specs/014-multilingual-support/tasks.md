# Tasks: Multilingual Support

**Input**: Design documents from `/specs/014-multilingual-support/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/i18n-module.md, contracts/language-switcher.md

**Tests**: Not included — not explicitly requested in the feature specification. Existing tests should continue to pass after each phase.

**Organization**: Tasks are grouped by user story. US3 (persistence) and US6 (dictionary files) are lightweight phases because their core implementation is covered by the foundational infrastructure in Phase 2. US1 (auto-detection) includes creating all non-English dictionaries since detection requires translation content. US5 (all text translated) covers replacing hardcoded strings across all components.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Path Conventions

- **Project type**: Single frontend directory (`frontend/`)
- **Source**: `frontend/src/`
- **i18n module**: `frontend/src/i18n/`
- **Components**: `frontend/src/components/`
- **Pages**: `frontend/src/pages/`

---

## Phase 1: Setup

**Purpose**: Create the i18n directory structure and type definitions.

- [x] T001 Create i18n type definitions (`Language`, `TranslationKey`, `Dictionary`, `LanguageInfo`) in `frontend/src/types/i18n.ts`
- [x] T002 [P] Remove hardcoded `lang="en"` attribute from `frontend/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure that ALL user stories depend on — language detection, persistence, context provider, translation hook, and the English dictionary (source of truth for all keys).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

**Covers**: US1 auto-detection logic, US3 localStorage persistence, US6 TypeScript-enforced dictionary structure.

- [x] T003 Create English dictionary with all translation keys (~80–100 entries across 10 namespaces: `welcome`, `player`, `header`, `game`, `mode`, `summary`, `scores`, `dialog`, `avatar`, `a11y`) in `frontend/src/i18n/locales/en.ts`
- [x] T004 [P] Implement `detectLanguage()` utility: iterate `navigator.languages`, strip region codes (e.g., `es-MX` → `es`), match against supported set, fallback to `'en'` in `frontend/src/i18n/detectLanguage.ts`
- [x] T005 [P] Create i18n public API: export `SUPPORTED_LANGUAGES` constant (with code, nativeName, flag for each language), `interpolate()` function for `{placeholder}` replacement, `DEFAULT_LANGUAGE`, and re-export types/hooks in `frontend/src/i18n/index.ts`
- [x] T006 Create `LanguageContext`, `LanguageProvider` (localStorage read/write with try/catch, `detectLanguage()` fallback, invalid-value validation, `document.documentElement.lang` sync via useEffect), and `useTranslation()` hook returning `{ language, t, setLanguage }` in `frontend/src/i18n/LanguageContext.tsx`
- [x] T007 Wrap app with `LanguageProvider` as outermost provider (outside `HashRouter` and `SessionProvider`) in `frontend/src/App.tsx`

**Checkpoint**: i18n infrastructure complete — `useTranslation()` hook works, English dictionary loaded, browser detection and localStorage persistence functional.

---

## Phase 3: User Story 1 — Automatic Language Detection (Priority: P1) 🎯 MVP

**Goal**: Players see the app in their browser's language on first visit. All five dictionaries must exist with complete translations so detection produces a fully translated UI.

**Independent Test**: Change browser language to French/Spanish/Japanese/German → reload app (clear `turbotiply_lang` from localStorage) → all visible text appears in that language. Set to Portuguese (unsupported) → defaults to English. Set to `es-MX` → matches Spanish.

- [x] T008 [P] [US1] Create French dictionary with all translation keys matching `en.ts` structure (child-friendly vocabulary, named placeholders preserved) in `frontend/src/i18n/locales/fr.ts`
- [x] T009 [P] [US1] Create Spanish dictionary with all translation keys matching `en.ts` structure in `frontend/src/i18n/locales/es.ts`
- [x] T010 [P] [US1] Create Japanese dictionary with all translation keys matching `en.ts` structure in `frontend/src/i18n/locales/ja.ts`
- [x] T011 [P] [US1] Create German dictionary with all translation keys matching `en.ts` structure in `frontend/src/i18n/locales/de.ts`

**Checkpoint**: All five dictionaries complete with identical key sets. TypeScript compilation confirms key parity. Auto-detection resolves to the correct dictionary based on browser language.

---

## Phase 4: User Story 5 — All Text Translated Across Full Gameplay (Priority: P1)

**Goal**: Every piece of user-facing text — from welcome screen through gameplay to score summary — uses `t()` calls instead of hardcoded English strings. Numeric values, mathematical formulas, and the brand name "Turbotiply!" remain untranslated.

**Independent Test**: Select any non-English language → play a complete game (both correct and incorrect answers) → verify every text element is in the selected language. No English text should leak through except "Turbotiply!", player names, and numbers.

- [x] T012 [P] [US5] Replace hardcoded greeting (`"Hi, {name}!"`) and "Switch player" button label with `t()` calls (keys: `header.greeting`, `header.switchPlayer`) in `frontend/src/components/Header/Header.tsx`
- [x] T013 [P] [US5] Replace hardcoded subtitles, error messages, eviction notice, storage warning, and back button with `t()` calls (keys: `welcome.*`) in `frontend/src/pages/WelcomePage.tsx`
- [x] T014 [P] [US5] Replace hardcoded pre-game heading and instructions with `t()` calls (keys: `game.*`) in `frontend/src/pages/MainPage.tsx`
- [x] T015 [P] [US5] Replace hardcoded form labels, name placeholder, and submit button text with `t()` calls (keys: `player.*`) in `frontend/src/components/WelcomeScreen/NewPlayerForm.tsx`
- [x] T016 [P] [US5] Replace hardcoded player list heading and empty-state text with `t()` calls (keys: `welcome.*`) in `frontend/src/components/WelcomeScreen/PlayerList.tsx`
- [x] T017 [P] [US5] Replace hardcoded player card labels and action button text with `t()` calls (keys: `player.*`) in `frontend/src/components/PlayerCard/PlayerCard.tsx`
- [x] T018 [P] [US5] Replace hardcoded delete confirmation message and button labels with `t()` calls (keys: `dialog.*`) in `frontend/src/components/DeleteConfirmation/DeleteConfirmation.tsx`
- [x] T019 [P] [US5] Replace hardcoded clear-all confirmation message and button labels with `t()` calls (keys: `dialog.*`) in `frontend/src/components/ClearAllConfirmation/ClearAllConfirmation.tsx`
- [x] T020 [P] [US5] Replace hardcoded round counter, game status text, and feedback messages with `t()` calls (keys: `game.*`) in `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx`
- [x] T021 [P] [US5] Replace hardcoded mode names ("Play", "Improve") and descriptions with `t()` calls (keys: `mode.*`) in `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx`
- [x] T022 [P] [US5] Replace hardcoded game-over heading, score labels, play-again button, and practice hints with `t()` calls (keys: `summary.*`) in `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx`
- [x] T023 [P] [US5] Replace hardcoded high-scores heading, table headers, and empty-state text with `t()` calls (keys: `scores.*`) in `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.tsx`
- [x] T024 [P] [US5] Replace hardcoded answer input placeholder and aria-labels with `t()` calls (keys: `game.*`, `a11y.*`) in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx`
- [x] T025 [P] [US5] Replace hardcoded numpad button labels and aria-labels with `t()` calls (keys: `game.*`, `a11y.*`) in `frontend/src/components/GamePlay/AnswerInput/TouchNumpad.tsx`
- [x] T026 [P] [US5] Replace hardcoded aria-labels and status text with `t()` calls (keys: `a11y.*`, `game.*`) in `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx`
- [x] T027 [P] [US5] Replace hardcoded avatar labels and descriptions with `t()` calls (keys: `avatar.*`) in `frontend/src/components/AvatarPicker/AvatarPicker.tsx`
- [x] T028 [US5] Remove hardcoded `label` and `description` strings from avatar constants; reference dictionary keys instead so avatar text is translated via `t()` in `frontend/src/constants/avatars.ts`

**Checkpoint**: All user-facing text uses `t()` calls. Switching language updates every visible string. Mathematical formulas and numeric scores remain unchanged.

---

## Phase 5: User Story 2 — Language Switcher via Flag Button (Priority: P1)

**Goal**: Logged-in players see a flag button in the header that opens a dropdown with all five languages. Selecting a language immediately updates the entire interface. Full WAI-ARIA menu button pattern with keyboard navigation.

**Independent Test**: Log in → click flag button in header → dropdown shows 5 languages with flags and native names → select a different language → all text updates immediately → flag button shows the new language's flag. Verify keyboard: Enter/Space opens menu, Arrow keys navigate, Escape closes.

- [x] T029 [P] [US2] Create `LanguageSwitcher` component with WAI-ARIA menu button pattern (keyboard navigation: ArrowDown/Up with wrap, Home, End, Escape, Enter/Space; focus management; `aria-expanded`, `aria-haspopup`, `role="menu"`, `role="menuitem"`, `aria-current`; click-outside-to-close) in `frontend/src/components/LanguageSwitcher/LanguageSwitcher.tsx`
- [x] T030 [P] [US2] Create `LanguageSwitcher` styles: `.wrapper` (relative positioning), `.flagButton` (44×44px min touch target), `.menu` (absolute dropdown, z-index), `.menuItem` (44px min height, flex row), `.menuItemActive`, `.menuItemFocused`; responsive positioning for ≤320px viewports in `frontend/src/components/LanguageSwitcher/LanguageSwitcher.module.css`
- [x] T031 [US2] Integrate `LanguageSwitcher` into Header: add to actions area next to "Switch player" button, add `.actions` wrapper class for button group layout in `frontend/src/components/Header/Header.tsx` and `frontend/src/components/Header/Header.module.css`

**Checkpoint**: Flag button visible in header for logged-in players, dropdown opens with 5 languages, selection changes language instantly, keyboard navigation works, touch targets are ≥44×44px.

---

## Phase 6: User Story 3 — Language Preference Persists Across Sessions (Priority: P1)

**Goal**: A manually selected language is remembered via localStorage and overrides browser detection on subsequent visits. Invalid stored values and unavailable storage are handled gracefully.

**Independent Test**: Select French manually → close browser → reopen app → interface is in French (not browser default). Clear localStorage → app falls back to browser detection.

**Note**: This story's core implementation is covered by the `LanguageProvider` in Phase 2 (T006), which reads `turbotiply_lang` from localStorage on mount, persists on `setLanguage()`, and handles the resolution priority chain (stored → detected → default).

- [x] T032 [US3] Verify that `LanguageProvider` correctly prioritizes stored language over browser detection, validates stored values against supported language codes, and wraps localStorage access in try/catch for unavailable storage in `frontend/src/i18n/LanguageContext.tsx`

**Checkpoint**: Language preference survives browser restart. Invalid stored values (`"xx"`) fall back to browser detection. Unavailable localStorage doesn't crash the app — language works for the current session.

---

## Phase 7: User Story 4 — Language Switcher on Welcome Screen (Priority: P2)

**Goal**: Players who haven't logged in can change the language from the welcome screen before creating a profile, using the same `LanguageSwitcher` component from US2.

**Independent Test**: Navigate to welcome screen (no active session) → find language selector in top-right area → change language to Japanese → all welcome screen text updates → create a profile and log in → Japanese is maintained on the main page.

- [x] T033 [US4] Add `LanguageSwitcher` component to the top-right area of the welcome screen layout in `frontend/src/pages/WelcomePage.tsx`

**Checkpoint**: Language can be changed before login. Selected language persists through player creation and login flow.

---

## Phase 8: User Story 6 — Dedicated Dictionary Files for Easy Editing (Priority: P2)

**Goal**: Dictionary files are self-documenting, easy to edit, and structured so that a new language can be added by creating one file and registering it — without modifying any component code.

**Independent Test**: Open the English dictionary file → every key has documentation explaining its context and placeholder usage. Compare `en.ts` and `fr.ts` key sets — they are identical. TypeScript compilation fails if a key is missing from any locale.

**Note**: The TypeScript dictionary structure established in Phase 2 (T003) and Phase 3 (T008–T011) automatically enforces key parity via the `Dictionary` type. This phase adds documentation to make the files contributor-friendly.

- [x] T034 [US6] Add JSDoc comments to English dictionary documenting placeholder names (`{playerName}`, `{answer}`, `{current}`, `{total}`, etc.), usage context for each namespace section, and translation guidance for contributors in `frontend/src/i18n/locales/en.ts`

**Checkpoint**: Dictionary files are self-documenting. Placeholder usage is clear. A new language can be added by copying `en.ts`, translating values, and registering it in `index.ts` and `LanguageContext.tsx` — no component code changes needed.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, layout integrity, and cross-language validation.

- [x] T035 Verify TypeScript compilation and build succeed with all translations by running `npm run build` in `frontend/`
- [x] T036 Verify text lengths and layout integrity across all five languages on 320px and 540px viewports — German compound words must not overflow or truncate essential content (FR-018)
- [x] T037 Run quickstart.md manual validation steps (9-step checklist: auto-detection, welcome screen switching, header flag button, dropdown with 5 languages, language selection, full gameplay in Japanese, persistence across sessions, German layout check, 320px responsive check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (English dictionary defines the `Dictionary` type)
- **US5 (Phase 4)**: Depends on Phase 3 (dictionaries must exist for `t()` to return translated text)
- **US2 (Phase 5)**: Depends on Phase 2 (needs `useTranslation` hook). Can run in parallel with Phase 4 but best sequenced after for visual verification
- **US3 (Phase 6)**: Depends on Phase 2 (verification of foundational behavior). Can run any time after Phase 2
- **US4 (Phase 7)**: Depends on Phase 5 (`LanguageSwitcher` component must exist)
- **US6 (Phase 8)**: Depends on Phase 3 (dictionary files must exist for documentation)
- **Polish (Phase 9)**: Depends on all preceding phases

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no dependencies on other stories
- **US5 (P1)**: After US1 — needs dictionaries but no dependency on US2/US3/US4
- **US2 (P1)**: After Phase 2 — independent of US5 but benefits from having translated text
- **US3 (P1)**: After Phase 2 — verification only, no new code beyond Phase 2
- **US4 (P2)**: After US2 — reuses `LanguageSwitcher` component
- **US6 (P2)**: After US1 — documentation of established structure

### Within Each User Story

- Dictionary files (US1) before component modifications (US5)
- Component modifications (US5) can all run in parallel (different files)
- `LanguageSwitcher` component (US2 T029+T030) before Header integration (US2 T031)
- All `[P]` tasks within a phase can run in parallel

### Parallel Opportunities

- T001 and T002 (Phase 1): different files
- T004 and T005 (Phase 2): different files
- T008–T011 (Phase 3): four different dictionary files
- T012–T027 (Phase 4): sixteen different component files
- T029 and T030 (Phase 5): component `.tsx` and `.module.css`

---

## Parallel Example: Phase 3 (Dictionaries)

```text
# All four dictionary tasks can run simultaneously — different files, same structure:
T008: French dictionary in locales/fr.ts
T009: Spanish dictionary in locales/es.ts
T010: Japanese dictionary in locales/ja.ts
T011: German dictionary in locales/de.ts
```

## Parallel Example: Phase 4 (Component Translations)

```text
# All component modification tasks can run simultaneously — different files:
T012: Header.tsx          T018: DeleteConfirmation.tsx
T013: WelcomePage.tsx     T019: ClearAllConfirmation.tsx
T014: MainPage.tsx        T020: GameStatus.tsx
T015: NewPlayerForm.tsx   T021: ModeSelector.tsx
T016: PlayerList.tsx      T022: ScoreSummary.tsx
T017: PlayerCard.tsx      T023: RecentHighScores.tsx
                          T024: AnswerInput.tsx
                          T025: TouchNumpad.tsx
                          T026: FormulaDisplay.tsx
                          T027: AvatarPicker.tsx
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (types + index.html)
2. Complete Phase 2: Foundational (i18n infrastructure + English dictionary)
3. Complete Phase 3: US1 (all five dictionaries)
4. **STOP and VALIDATE**: App auto-detects browser language and loads correct dictionary. Hardcoded strings still show English but the infrastructure works.

### Incremental Delivery

1. Setup + Foundational → i18n infrastructure ready
2. US1 (dictionaries) → Auto-detection works → **Infrastructure MVP**
3. US5 (all text translated) → Full translation visible in all components → **Translation MVP**
4. US2 (language switcher) → Manual language switching via header flag button → **Core feature complete**
5. US3 (persistence) → Verify preference survives browser sessions → **All P1 stories complete**
6. US4 (welcome screen switcher) → Pre-login language switching available
7. US6 (dictionary documentation) → Contributor-friendly dictionary files
8. Polish → Layout verified across languages, build passing → **Production-ready**

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map tasks to spec.md user stories for traceability
- Brand name "Turbotiply!" remains untranslated across all languages (A-004)
- Mathematical formulas and numeric scores are never translated (FR-013)
- Language preference is device-level, not per-player (A-002, stored as `turbotiply_lang` in localStorage)
- Dictionary keys use dot-notation namespaces (e.g., `header.greeting`, `game.correct`)
- The `Dictionary` type derived from `en.ts` enforces compile-time key parity across all locales
- `LanguageProvider` wraps outside `HashRouter` and `SessionProvider` — language applies even before login
- Commit after each completed phase
- Verify `npm run build` passes after each phase to catch TypeScript errors early
