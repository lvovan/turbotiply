# Implementation Plan: Multilingual Support

**Branch**: `014-multilingual-support` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-multilingual-support/spec.md`

## Summary

Add localization support for five languages (English, French, Spanish, Japanese, German) to TurboTiply. The system auto-detects language from browser settings, allows manual switching via a flag button in the header (and on the welcome screen), persists the preference in localStorage, and sources all translatable text from dedicated per-language dictionary files using named placeholders for dynamic values. A lightweight custom i18n solution (React Context + TypeScript dictionary files) will be used — no external i18n library — to align with the constitution's YAGNI and simplicity mandates.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0  
**Primary Dependencies**: react, react-dom, react-router-dom (no i18n library — custom solution)  
**Storage**: localStorage (`turbotiply_lang` key for language preference)  
**Testing**: Vitest 4.0.18, @testing-library/react 16.3.2, vitest-axe 0.1.0  
**Target Platform**: Static SPA — latest 2 major versions of Chrome, Firefox, Safari, Edge; school Chromebooks  
**Project Type**: single (frontend-only, `frontend/` directory)  
**Performance Goals**: Lighthouse Performance ≥90 on mobile, TTI <3s on 3G; language switch <100ms  
**Constraints**: WCAG 2.1 AA, mobile-first (320px min), child-friendly language, no server, COPPA/GDPR-K safe  
**Scale/Scope**: ~15 components, 5 languages, ~80–100 translation keys per language, ~5 dictionary files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Accessibility First — PASS

- Language dropdown will be fully keyboard-navigable (Escape to close, arrow keys to navigate, Enter to select)
- Flag button will have an `aria-label` translated to the current language (e.g., "Change language")
- Dropdown items will show flag emoji + native language name (not flag-only — visual is never sole indicator)
- All existing aria-labels will be translated (FR-012)
- Translations will maintain age-appropriate vocabulary for children ages 6–12

### II. Simplicity & Clarity — PASS

- Custom i18n solution using React Context + typed dictionary files — no external library, no complex ICU message syntax
- YAGNI: no pluralization engine, no RTL support, no date formatting (A-005, A-006)
- Single `useTranslation()` hook provides all translation access — one pattern for all components
- Dictionary files are flat key-value TypeScript objects — immediately understandable

### III. Responsive Design — PASS

- Language dropdown will be sized to fit within 320px viewport
- Flag button and dropdown items will meet 44×44px touch target minimum
- Mobile-first styling; dropdown positioned to avoid edge clipping
- Text lengths tested across all languages (German longest, Japanese may need font considerations)

### IV. Static SPA — PASS

- All dictionary files are TypeScript modules bundled at build time — no runtime fetching
- No server-side translation, no SSR
- All code stays within `frontend/` directory

### V. Test-First — PASS

- Acceptance tests derived from each user story's scenarios
- Tests will mock `navigator.languages` for auto-detection scenarios
- Accessibility tests with axe-core for language dropdown component
- Tests will verify translation completeness (all keys present in all dictionaries)

**Gate result: ALL PASS — no violations.**

### Post-Design Re-Check (after Phase 1)

All five gates re-evaluated against the designed contracts and data model:

- **I. Accessibility First** — PASS: `LanguageSwitcher` contract specifies full WAI-ARIA Menu Button pattern (keyboard navigation, `aria-expanded`, `role="menu"`, `aria-current`, 44×44px touch targets). All aria-labels translated. Flag emoji never sole indicator — paired with text.
- **II. Simplicity & Clarity** — PASS: Custom solution is ~100 lines, <2 KB. Single `useTranslation()` hook. Flat key-value dictionaries. Mirrors existing `useSession` pattern exactly.
- **III. Responsive Design** — PASS: Contract specifies dropdown positioning for 320px viewport. German text accommodation required by FR-018.
- **IV. Static SPA** — PASS: All dictionaries bundled at build time. No runtime fetching. All code in `frontend/`.
- **V. Test-First** — PASS: Test files defined for LanguageSwitcher, i18n detection, and dictionary completeness. axe-core accessibility tests specified.

**Post-Design Gate Result: ALL PASS — no new violations.**

## Project Structure

### Documentation (this feature)

```text
specs/014-multilingual-support/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── i18n/                    # NEW — localization module
│   │   ├── index.ts             # Public API: exports, types, helpers
│   │   ├── LanguageContext.tsx   # React Context + Provider + useTranslation hook
│   │   ├── detectLanguage.ts    # Browser language detection logic
│   │   └── locales/             # Per-language dictionary files
│   │       ├── en.ts            # English (source of truth for keys)
│   │       ├── fr.ts            # French
│   │       ├── es.ts            # Spanish
│   │       ├── ja.ts            # Japanese
│   │       └── de.ts            # German
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx       # MODIFIED — add LanguageSwitcher
│   │   │   └── Header.module.css
│   │   └── LanguageSwitcher/    # NEW — flag button + dropdown
│   │       ├── LanguageSwitcher.tsx
│   │       └── LanguageSwitcher.module.css
│   ├── pages/
│   │   ├── WelcomePage.tsx      # MODIFIED — add LanguageSwitcher + use translations
│   │   └── MainPage.tsx         # MODIFIED — use translations
│   ├── hooks/
│   │   └── useSession.tsx       # UNCHANGED
│   ├── services/
│   │   └── playerStorage.ts     # UNCHANGED
│   ├── constants/
│   │   └── avatars.ts           # MODIFIED — avatar labels moved to dictionaries
│   └── types/
│       └── i18n.ts              # NEW — translation key type, Language type
└── tests/
    ├── components/
    │   └── LanguageSwitcher/     # NEW
    ├── i18n/                     # NEW — detectLanguage, translation completeness
    └── integration/              # MODIFIED — add language switching integration tests
```

**Structure Decision**: Single `frontend/` directory (static SPA per constitution). New `i18n/` module under `src/` contains all localization logic and locale files. New `LanguageSwitcher` component under `components/`. One new type file under `types/`.

## Complexity Tracking

> No violations — table not required.
