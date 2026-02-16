# Implementation Plan: Minor UI Polish

**Branch**: `016-minor-ui-polish` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-minor-ui-polish/spec.md`

## Summary

Four independent, cosmetic UI changes to improve space efficiency and add branding. All changes are CSS/JSX-only within existing components — no new data models, APIs, or state management required.

1. Add copyright footer to WelcomePage
2. Reduce heading/instruction size on MainPage pre-game view
3. Reduce score count from 5 → 3 on MainPage
4. Add existing ProgressionGraph component to ScoreSummary on result screen

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2, JSX  
**Primary Dependencies**: react-router-dom 7.13, Vite 7.3, CSS Modules  
**Storage**: N/A (no storage changes)  
**Testing**: Vitest 4.0 + React Testing Library 16.3 + vitest-axe  
**Target Platform**: Static SPA — all modern browsers, 320px–1920px viewports  
**Project Type**: Single frontend/ directory (static SPA, no backend)  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G  
**Constraints**: WCAG 2.1 AA, 44×44px touch targets, 16px minimum font base  
**Scale/Scope**: 4 small UI changes touching 4 existing components/pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Copyright text uses semantic HTML, meets contrast. Heading size reduction stays ≥ 16px. No new interactive elements. ProgressionGraph already has `role="img"` + `aria-label`. |
| II. Simplicity & Clarity | ✅ PASS | No new abstractions or components. Reuses existing ProgressionGraph. Single param change (5→3). |
| III. Responsive Design | ✅ PASS | Changes specifically improve small-screen usability (compact heading, fewer scores). Copyright footer uses flexible layout. |
| IV. Static SPA | ✅ PASS | Pure client-side changes. No server code. |
| V. Test-First | ✅ PASS | All 4 affected components have existing test files. Tests will be updated/added for new behavior. axe-core tests required for WelcomePage copyright element. |

**Gate result: PASS** — no violations, no complexity justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/016-minor-ui-polish/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data changes)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no API contracts)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── pages/
│   │   ├── WelcomePage.tsx           # Change 1: add copyright footer
│   │   ├── WelcomePage.module.css    # Change 1: copyright styles
│   │   └── MainPage.tsx              # Changes 2, 3, 4: compact heading, top-3 scores, sparkline on result
│   └── components/
│       └── GamePlay/
│           ├── ScoreSummary/
│           │   └── ScoreSummary.tsx   # Change 4: accept + render ProgressionGraph
│           ├── ProgressionGraph/
│           │   └── ProgressionGraph.tsx  # Reused as-is (no changes)
│           └── RecentHighScores/
│               └── RecentHighScores.tsx  # No changes needed (receives props)
└── tests/
    ├── pages/
    │   ├── WelcomePage.test.tsx       # New tests for copyright text
    │   └── MainPage.test.tsx          # Updated tests for top-3 and sparkline on result
    ├── components/
    │   └── ScoreSummary.test.tsx      # New tests for sparkline rendering
    └── a11y/                          # axe-core checks for new elements
```

**Structure Decision**: Single `frontend/` directory per constitution (Principle IV). One new file created: `MainPage.module.css` for compact heading styles. All other changes are within existing files.

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Copyright footer uses `<p>` with muted styling (0.75rem = 12px, but non-interactive decorative text — not subject to 16px minimum for body text). Heading reduced to 1.25rem (20px) ≥ 16px minimum. ProgressionGraph already has `role="img"` + `aria-label`. |
| II. Simplicity & Clarity | ✅ PASS | No new abstractions. One new CSS module file (MainPage.module.css). One optional prop added to ScoreSummaryProps. The history array construction appends current game inline — no new utility functions. |
| III. Responsive Design | ✅ PASS | Copyright footer uses flexbox `margin-top: auto` — pushes to bottom on tall screens, flows naturally on short screens. Heading/score changes directly reduce vertical overflow on 320×568. |
| IV. Static SPA | ✅ PASS | No server-side code. |
| V. Test-First | ✅ PASS | Existing test files cover all affected components. New tests for: copyright text presence, top-3 limit, sparkline on result screen. axe-core accessibility tests update for WelcomePage footer. |

**Post-design gate result: PASS** — no new violations introduced by design decisions.
