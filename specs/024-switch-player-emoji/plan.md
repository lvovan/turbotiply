# Implementation Plan: Switch Player Emoji Button

**Branch**: `024-switch-player-emoji` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/024-switch-player-emoji/spec.md`

## Summary

Replace the translated text label inside the Header's "Switch player" button with a static 👥 emoji. Add a localised `aria-label` for accessibility. Adjust button padding to suit emoji-only content. Update existing tests.

## Technical Context

**Language/Version**: TypeScript (React 18+, Vite)
**Primary Dependencies**: React, react-router-dom, CSS Modules, custom i18n (no library)
**Storage**: N/A (no data changes)
**Testing**: Vitest + React Testing Library + axe-core
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; Chromebooks
**Project Type**: Single `frontend/` directory (static SPA, no backend)
**Performance Goals**: N/A (trivial UI change, no performance impact)
**Constraints**: WCAG 2.1 AA; 44×44 px minimum touch target; mobile-first (320 px+)
**Scale/Scope**: 1 component (Header), 1 CSS module, 0 locale string additions (existing key reused for aria-label)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Notes |
|-----------|---------|-------|
| I. Accessibility First | ✅ PASS | `aria-label` using existing localised `header.switchPlayer` string ensures screen readers announce purpose. Emoji marked `aria-hidden`. Keyboard and focus behaviour unchanged. |
| II. Simplicity & Clarity | ✅ PASS | Removes text, adds a universally-recognised emoji — reduces cognitive load and clutter. No new abstractions. |
| III. Responsive Design | ✅ PASS | Button already has `min-height: 44px; min-width: 44px`. Emoji-only content is narrower, improving narrow-viewport fit. |
| IV. Static SPA | ✅ PASS | No architectural change. Pure frontend edit. |
| V. Test-First | ✅ PASS | Existing `Header.test.tsx` tests query by `role('button', { name: /switch player/i })` which matches `aria-label`. Tests will be updated to also verify emoji content. |

**Gate result**: ALL PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/024-switch-player-emoji/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (affected files)

```text
frontend/
├── src/
│   └── components/
│       └── Header/
│           ├── Header.tsx          # Button content + aria-label
│           └── Header.module.css   # Button padding adjustment
└── tests/
    └── components/
        └── Header.test.tsx         # Updated assertions
```

**Structure Decision**: Single `frontend/` directory per constitution (IV. Static SPA). No new files created; only existing files are modified.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.
