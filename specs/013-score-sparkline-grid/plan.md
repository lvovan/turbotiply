# Implementation Plan: Score Sparkline Grid

**Branch**: `013-score-sparkline-grid` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-score-sparkline-grid/spec.md`

## Summary

Enhance the existing `ProgressionGraph` SVG sparkline component to display a proper grid with clear X/Y axis lines, faded horizontal guide lines with numeric labels, X-axis tick marks, and a fixed 0–50 Y-axis range. The chart width scales proportionally to the number of games played (2–10), keeping the chart compact for mobile screens.

## Technical Context

**Language/Version**: TypeScript ~5.9, React 19.2  
**Primary Dependencies**: React, React DOM (no charting libraries — hand-rolled SVG)  
**Storage**: N/A (reads existing `GameRecord[]` from player's game history via `getGameHistory()`)  
**Testing**: Vitest 4.0 + React Testing Library 16.3 + vitest-axe  
**Target Platform**: Static SPA — browsers (Chrome, Firefox, Safari, Edge latest 2), including Chromebooks  
**Project Type**: Single frontend directory (`frontend/`)  
**Performance Goals**: Lighthouse Performance ≥ 90, time-to-interactive < 3s on 3G  
**Constraints**: Chart must fit within 667px viewport height alongside other pre-game elements; no horizontal scrolling on 320px+ viewports; WCAG 2.1 AA compliance  
**Scale/Scope**: Single component enhancement — modifies `ProgressionGraph` (TSX + CSS module) and its tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | PASS | Chart already has `role="img"` + `aria-label`. Guide line labels are visual-only (score values encoded in aria-label). Existing axe test covers the component. Will update aria-label to reflect grid changes. |
| II. Simplicity & Clarity | PASS | No new dependencies, no new abstractions. Enhancement of existing component with additional SVG elements. |
| III. Responsive Design | PASS | Chart already uses `max-width: 360px` + responsive breakpoint at 320px. Proportional width for <10 games is mobile-friendly. |
| IV. Static SPA | PASS | Pure client-side SVG rendering. No server interaction. |
| V. Test-First | PASS | Existing tests will be updated. New tests for grid elements, guide lines, axis visibility, proportional width. axe-core test already exists. |
| Technology Stack | PASS | No new dependencies. Pure SVG + CSS modules. |
| Performance | PASS | SVG with ~15 additional line elements — negligible render cost. |

**Gate result: PASS — no violations. Proceeding to Phase 0.**

### Post-Design Re-evaluation (Phase 1 complete)

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Accessibility First | PASS | aria-label updated to include scale (0–50). All grid/axis elements marked `aria-hidden="true"`. Guide labels use sans-serif font at readable size. Existing axe-core test validates. |
| II. Simplicity & Clarity | PASS | No new abstractions. 6 guide lines + 6 labels + tick marks added to existing SVG. No charting library introduced. |
| III. Responsive Design | PASS | Dynamic viewBox with `preserveAspectRatio="xMinYMid meet"` ensures uniform scaling. 320px breakpoint preserved. Proportional width for 2–9 games yields naturally narrower chart. |
| IV. Static SPA | PASS | No changes to architecture. Pure client-side rendering. |
| V. Test-First | PASS | Tests will verify: grid presence, axis visibility, guide line count/opacity, proportional width, fixed Y range, aria-label content, axe-core pass. |
| Technology Stack | PASS | No new dependencies added. |
| Performance | PASS | ~20 extra SVG elements (6 guide lines + 6 labels + up to 10 ticks + 2 axes). Negligible render cost. |

**Post-design gate result: PASS — no violations found.**

## Project Structure

### Documentation (this feature)

```text
specs/013-score-sparkline-grid/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component interface contract)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── GamePlay/
│   │       └── ProgressionGraph/
│   │           ├── ProgressionGraph.tsx        # Modified — add grid, axes, guide lines
│   │           └── ProgressionGraph.module.css # Modified — compact height, guide line styling
│   └── services/
│       └── playerStorage.ts                    # Unchanged — getGameHistory() already provides needed data
└── tests/
    ├── components/
    │   └── ProgressionGraph.test.tsx            # Modified — add grid/axis/guide tests
    └── a11y/
        └── accessibility.test.tsx              # Verify existing axe test still passes
```

**Structure Decision**: Single `frontend/` directory. This feature modifies one existing component (`ProgressionGraph`) and its test file. No new files or directories needed.
