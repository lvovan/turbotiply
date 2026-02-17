# Implementation Plan: Player Name Limit

**Branch**: `022-player-name-limit` | **Date**: 2025-07-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/022-player-name-limit/spec.md`

## Summary

Reduce the maximum player name length from 20 to 10 characters and add a visible character counter to the new-player form. The existing `MAX_NAME_LENGTH` constant in `NewPlayerForm.tsx` is updated, a `<span>` counter element is added to the form, the CSS module is extended for counter styling, and tests are updated to validate the new limit. Existing player names longer than 10 characters are preserved as-is in storage and display.

## Technical Context

**Language/Version**: TypeScript ~5.9.3  
**Primary Dependencies**: React ^19.2.0, React Router DOM ^7.13.0, Vite ^7.3.1  
**Storage**: Browser localStorage (key `multis_players`)  
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, @testing-library/user-event ^14.6.1, vitest-axe ^0.1.0  
**Target Platform**: Static SPA — Chrome, Firefox, Safari, Edge (latest 2 versions), school Chromebooks  
**Project Type**: Single frontend project (`frontend/`)  
**Performance Goals**: Lighthouse Performance ≥ 90, TTI < 3s on 3G  
**Constraints**: No backend, all data in localStorage, WCAG 2.1 AA, mobile-first (320px–1920px)  
**Scale/Scope**: Small UI-only change — 1 component, 1 CSS module, 1 type JSDoc, 1 test file, i18n keys

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | Character counter uses `aria-live="polite"` for screen readers (FR-008). Touch targets unaffected. |
| II | Simplicity & Clarity | ✅ PASS | Single constant change + one new UI element. No new abstractions. YAGNI respected. |
| III | Responsive Design | ✅ PASS | Character counter is inline text — flows naturally on all viewports. No layout changes. |
| IV | Static SPA | ✅ PASS | Pure client-side validation. No backend involved. |
| V | Test-First | ✅ PASS | Existing test updated for new limit; new test added for character counter. Tests written to fail first. |

**Gate result**: ALL PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/022-player-name-limit/
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
│   ├── components/
│   │   └── WelcomeScreen/
│   │       ├── NewPlayerForm.tsx          # MAX_NAME_LENGTH 20→10, add counter
│   │       └── NewPlayerForm.module.css   # Add .charCounter style
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.ts                      # Add player.charCount key
│   │       ├── fr.ts
│   │       ├── de.ts
│   │       ├── ja.ts
│   │       └── pt.ts
│   └── types/
│       └── player.ts                      # JSDoc: "1–20" → "1–10"
└── tests/
    └── components/
        └── NewPlayerForm.test.tsx          # Update limit assertions, add counter tests
```

**Structure Decision**: Single `frontend/` directory. No new files created — only modifications to existing files plus new i18n keys.
