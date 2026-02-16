# Implementation Plan: Touch Answer Keypad

**Branch**: `011-touch-answer-keypad` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-touch-answer-keypad/spec.md`

## Summary

Add a custom in-page numpad component for answer input on touch-capable devices. When a touchscreen is detected (via CSS media query / JS touch feature detection), the standard `AnswerInput` text field is replaced with a `TouchNumpad` component: a 4-row calculator-style grid of digit buttons (1-2-3, 4-5-6, 7-8-9, 0-⌫-Go), plus a read-only answer display reusing the existing field's styling. Digits are composed by tapping, "Go" submits, "⌫" deletes the last digit. Physical keyboard input continues to work alongside the numpad on hybrid devices. On non-touch devices (no touchscreen), the existing `AnswerInput` component renders unchanged.

## Technical Context

**Language/Version**: TypeScript ~5.9 / React 19
**Primary Dependencies**: React, Vite, CSS Modules
**Storage**: N/A (no persistence changes)
**Testing**: Vitest + React Testing Library + axe-core
**Target Platform**: Browser (static SPA) — Chrome, Firefox, Safari, Edge (latest 2 versions) + school Chromebooks; primary use on mobile phones and tablets
**Project Type**: Single frontend SPA (`frontend/` directory)
**Performance Goals**: Numpad visible within 1 second of gameplay load; Lighthouse Performance ≥ 90 on mobile
**Constraints**: WCAG 2.1 AA; mobile-first responsive (320px–1920px); minimum 44×44 CSS px touch targets; no OS keyboard triggered on touch devices
**Scale/Scope**: New `TouchNumpad` component + `useTouchDetection` hook + `AnswerInput` conditional rendering wrapper. No game state model changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Design | Post-Design | Notes |
|-----------|-----------|-------------|-------|
| I. Accessibility First | PASS | PASS | FR-020 requires ARIA labels on all buttons. `role="status"` + `aria-live="polite"` on answer display. Touch targets ≥ 48px (exceeds WCAG 2.5.5's 44px). Screen reader navigable. No color-only state indicators. |
| II. Simplicity & Clarity | PASS | PASS | Single new component (TouchNumpad) + one hook (useTouchDetection). Calculator layout immediately recognizable. No game state changes. |
| III. Responsive Design | PASS | PASS | Mobile-first CSS Grid. 320px minimum verified: buttons ~90px wide × 56px tall. `max-width: 360px` prevents tablet over-stretching. Formula + numpad fit 568px viewport. |
| IV. Static SPA | PASS | PASS | Pure client-side UI. No server, no new npm dependencies. Detection via browser APIs. |
| V. Test-First | PASS | PASS | New tests for TouchNumpad (interaction + axe-core a11y) and useTouchDetection. Existing AnswerInput tests updated for conditional rendering. |

**Pre-design gate: PASS** — No violations. Proceeded to Phase 0.
**Post-design gate: PASS** — No violations introduced by design decisions.

## Project Structure

### Documentation (this feature)

```text
specs/011-touch-answer-keypad/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── GamePlay/
│   │       └── AnswerInput/
│   │           ├── AnswerInput.tsx          # MODIFY — conditional render: TouchNumpad vs text input
│   │           ├── AnswerInput.module.css   # NO CHANGE
│   │           ├── TouchNumpad.tsx          # NEW — numpad grid component
│   │           └── TouchNumpad.module.css   # NEW — numpad grid styles
│   ├── hooks/
│   │   └── useTouchDetection.ts            # NEW — touch capability detection hook
│   └── pages/
│       └── MainPage.tsx                     # NO CHANGE (AnswerInput interface unchanged)
└── tests/
    ├── components/
    │   ├── AnswerInput.test.tsx             # MODIFY — add tests for conditional rendering
    │   └── TouchNumpad.test.tsx             # NEW — numpad interaction + a11y tests
    └── hooks/
        └── useTouchDetection.test.ts        # NEW — detection logic tests
```

**Structure Decision**: Single `frontend/` directory — pure React SPA. New `TouchNumpad` component co-located under `AnswerInput/` since it replaces the text input within the same parent. Detection hook lives in `hooks/` alongside existing hooks. `AnswerInput` props interface remains unchanged — the touch detection and component switching happen internally.

## Complexity Tracking

> No constitution violations — this section is empty.
