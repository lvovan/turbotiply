# Implementation Plan: Round UX Rework

**Branch**: `008-round-ux-rework` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-round-ux-rework/spec.md`

## Summary

Replace the count-up stopwatch timer with an animated countdown progress bar (5s → 0s) that changes color through four scoring-tier stages (green → light green → orange → red). Replace the standalone RoundFeedback result panel with a compact inline feedback banner that occupies the same space as the formula display, preventing layout shift and preserving virtual keyboard focus on touch devices across round transitions.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.2.0  
**Primary Dependencies**: React, React Router DOM 7.13, Vite 7.3.1  
**Storage**: Browser localStorage (no changes needed for this feature)  
**Testing**: Vitest 4.0.18, React Testing Library 16.3.2, vitest-axe 0.1.0  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; school Chromebooks  
**Project Type**: Single frontend SPA (no backend)  
**Performance Goals**: 60fps countdown animation via requestAnimationFrame; Lighthouse Performance ≥ 90  
**Constraints**: Timer accuracy ±100ms using `performance.now()`; `prefers-reduced-motion` support; WCAG 2.1 AA  
**Scale/Scope**: 2 modified components (GameStatus, FormulaDisplay area), 1 new component (CountdownBar), 1 removed component (RoundFeedback), 1 modified hook (useRoundTimer)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Feedback banner uses `aria-live="assertive"`, color is never sole indicator (paired with icons + text), minimum 16px font maintained. Countdown bar has color + width + numeric display. |
| II. Simplicity & Clarity | ✅ PASS | No new abstractions or patterns beyond existing component/hook architecture. YAGNI respected — only visual presentation changes, no scoring logic changes. |
| III. Responsive Design | ✅ PASS | Countdown bar scales with container width. Mobile-first CSS with `@media` breakpoints. Touch targets ≥ 44×44px maintained. |
| IV. Static SPA | ✅ PASS | No server-side code added. All changes within `frontend/src/`. Pure client-side rendering. |
| V. Test-First | ✅ PASS | Tests will be written before implementation per existing pattern. axe-core accessibility tests for new/modified components. |

### Post-Design Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | CountdownBar uses `role="progressbar"` with `aria-valuemin/max/now/text`. InlineFeedback uses `aria-live="assertive"`. CVD-safe palette with 30+ CIE L* separation (research.md §3). `prefers-reduced-motion` support via CSS media query + JS throttling (research.md §5). |
| II. Simplicity & Clarity | ✅ PASS | 1 new component (CountdownBar), 1 replacement (InlineFeedback for RoundFeedback). Hook extended in-place. No new dependencies. No new abstractions. |
| III. Responsive Design | ✅ PASS | Fixed-height formula container (88px desktop, 68px mobile). Bar scales to container width. Existing mobile breakpoints preserved. |
| IV. Static SPA | ✅ PASS | All changes in `frontend/src/`. No server code. No new top-level directories. |
| V. Test-First | ✅ PASS | Test plan: new tests for CountdownBar + InlineFeedback, modified tests for GameStatus + MainPage + useRoundTimer, axe-core tests for all new/modified components. |

**Gate result**: All principles satisfied. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/008-round-ux-rework/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── GamePlay/
│   │       ├── AnswerInput/          # Modified: no structural changes (already keeps focus)
│   │       ├── CountdownBar/         # NEW: animated countdown progress bar
│   │       │   ├── CountdownBar.tsx
│   │       │   └── CountdownBar.module.css
│   │       ├── FormulaDisplay/       # Modified: container becomes fixed-height swap zone
│   │       │   ├── FormulaDisplay.tsx
│   │       │   └── FormulaDisplay.module.css
│   │       ├── GameStatus/           # Modified: integrates CountdownBar, countdown display
│   │       │   ├── GameStatus.tsx
│   │       │   └── GameStatus.module.css
│   │       ├── InlineFeedback/       # NEW: replaces RoundFeedback
│   │       │   ├── InlineFeedback.tsx
│   │       │   └── InlineFeedback.module.css
│   │       └── RoundFeedback/        # REMOVED
│   ├── constants/
│   │   └── scoring.ts               # Modified: add countdown color constants
│   ├── hooks/
│   │   └── useRoundTimer.ts          # Modified: countdown mode, bar width, color output
│   ├── pages/
│   │   └── MainPage.tsx              # Modified: swap RoundFeedback for InlineFeedback
│   └── types/
│       └── game.ts                   # No changes expected
└── tests/
    ├── a11y/
    │   └── accessibility.test.tsx    # Modified: replace RoundFeedback tests with InlineFeedback
    └── components/
        ├── CountdownBar.test.tsx     # NEW
        ├── InlineFeedback.test.tsx   # NEW
        ├── GameStatus.test.tsx       # Modified
        ├── RoundFeedback.test.tsx    # REMOVED
        └── FormulaDisplay.test.tsx   # Modified if container changes
```

**Structure Decision**: Single `frontend/` directory per constitution (Principle IV: Static SPA). No new top-level directories. New components follow existing `GamePlay/` subdirectory pattern with co-located CSS modules.

## Complexity Tracking

> No constitution violations found. No justifications needed.
