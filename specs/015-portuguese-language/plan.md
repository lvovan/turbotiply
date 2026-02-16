# Implementation Plan: Portuguese Language Support

**Branch**: `015-portuguese-language` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-portuguese-language/spec.md`

## Summary

Add Portuguese (Brazilian variant, pt-BR) as the sixth supported language in TurboTiply. This is a well-scoped incremental addition to the existing i18n infrastructure built in feature 014. The work involves creating a Portuguese dictionary file (`pt.ts`) with ~100 translation keys, extending the `Language` type to include `'pt'`, adding Portuguese to the `SUPPORTED_LANGUAGES` list and `detectLanguage` supported set, importing the dictionary in the `LanguageContext`, and verifying all existing tests pass with the new language. No architectural changes — the existing system was designed for exactly this kind of extension.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0  
**Primary Dependencies**: react, react-dom, react-router-dom (custom i18n — no library)  
**Storage**: localStorage (`turbotiply_lang` key — existing, unchanged)  
**Testing**: Vitest 4.0.18, @testing-library/react 16.3.2, vitest-axe 0.1.0  
**Target Platform**: Static SPA — latest 2 major versions of Chrome, Firefox, Safari, Edge; school Chromebooks  
**Project Type**: single (frontend-only, `frontend/` directory)  
**Performance Goals**: Lighthouse Performance ≥90 on mobile, TTI <3s on 3G; language switch <100ms  
**Constraints**: WCAG 2.1 AA, mobile-first (320px min), child-friendly vocabulary, no server, COPPA/GDPR-K safe  
**Scale/Scope**: 1 new dictionary file (~100 keys), 4 files modified (type, index, context, detectLanguage), 0 new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Accessibility First — PASS

- Portuguese text will maintain age-appropriate vocabulary for children ages 6–12 (matching existing language standards)
- The HTML `lang` attribute will correctly update to `"pt"` when Portuguese is active (FR-008), ensuring screen readers use Portuguese pronunciation
- All existing translated `aria-label` keys already exist — Portuguese dictionary provides values for them
- Flag emoji (🇧🇷) is already paired with text ("Português") in the LanguageSwitcher dropdown — not a sole visual indicator
- No new interactive elements — the existing LanguageSwitcher already handles keyboard navigation

### II. Simplicity & Clarity — PASS

- Follows the documented "How to Add a New Language" pattern from 014: create dictionary file, add to type/list/context/detection
- No new abstractions, patterns, or architectural changes
- YAGNI: no pt-BR vs pt-PT variant system — single Portuguese dictionary (A-002)
- 4 files modified, 1 file created — minimal footprint

### III. Responsive Design — PASS

- Portuguese text lengths are comparable to existing Latin-script languages (French, Spanish, German) — same ~15–25% expansion over English
- No new UI components — the LanguageSwitcher dropdown already accommodates 5 entries; a 6th entry fits without scrolling
- 44×44px touch targets are unchanged
- Layout was already validated with German (longest existing text) at 320px viewport

### IV. Static SPA — PASS

- Portuguese dictionary is a TypeScript module bundled at build time — no runtime fetching
- No server-side anything
- All changes within `frontend/` directory

### V. Test-First — PASS

- Existing test utilities (`test-utils.tsx` with `LanguageProvider` wrapper) already handle i18n context
- Dictionary completeness is enforced by TypeScript — `const pt: Dictionary = { ... }` will fail to compile if any key is missing or extra
- Existing tests continue to work — they use English dictionary via the LanguageProvider
- Any new Portuguese-specific tests follow existing patterns

**Gate result: ALL PASS — no violations.**

### Post-Design Re-Check (after Phase 1)

All five gates re-evaluated against the designed data model and research findings:

- **I. Accessibility First** — PASS: Portuguese dictionary includes all `a11y.*` keys. HTML `lang="pt"` set dynamically by existing LanguageContext. Flag paired with text "Português". Child-friendly informal register ("você").
- **II. Simplicity & Clarity** — PASS: 1 new file, 4 small modifications. No new abstractions. Follows documented "How to Add a New Language" pattern exactly.
- **III. Responsive Design** — PASS: Portuguese text lengths comparable to existing Latin-script languages. Spot-checked key translations — some shorter than English. Layout already validated with German (longest language).
- **IV. Static SPA** — PASS: Dictionary bundled at build time. All code in `frontend/`. No runtime fetching.
- **V. Test-First** — PASS: TypeScript compile-time validation enforces dictionary completeness. Existing 476 tests unaffected. Build verification confirms integration.

**Post-Design Gate Result: ALL PASS — no new violations.**

## Project Structure

### Documentation (this feature)

```text
specs/015-portuguese-language/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no new API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── i18n/
│   │   ├── index.ts             # MODIFIED — add 'pt' to SUPPORTED_LANGUAGES
│   │   ├── LanguageContext.tsx   # MODIFIED — import pt dictionary, add to dictionaries map
│   │   ├── detectLanguage.ts    # MODIFIED — add 'pt' to SUPPORTED_CODES set
│   │   └── locales/
│   │       ├── en.ts            # UNCHANGED (source of truth)
│   │       ├── fr.ts            # UNCHANGED
│   │       ├── es.ts            # UNCHANGED
│   │       ├── ja.ts            # UNCHANGED
│   │       ├── de.ts            # UNCHANGED
│   │       └── pt.ts            # NEW — Portuguese (Brazilian) dictionary
│   └── types/
│       └── i18n.ts              # MODIFIED — add 'pt' to Language union type
└── tests/                       # UNCHANGED — existing tests continue passing
```

**Structure Decision**: Single `frontend/` directory (static SPA per constitution). One new file (`pt.ts`) added to the existing `locales/` directory. Four existing files receive small, targeted modifications to register the new language. No new directories, components, or architectural changes.

## Complexity Tracking

> No violations — table not required.
