# Implementation Plan: First-Try Result Indicator

**Branch**: `027-first-try-result` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/027-first-try-result/spec.md`

## Summary

The post-game results table currently uses `r.isCorrect` (which gets overwritten during replay) to display ✓/✗ in the Result column. This feature adds a `firstTryCorrect` boolean field to the `Round` interface, set once during the primary playing phase and never overwritten during replay. The ScoreSummary component then uses this field to render ✅ (first-try correct) or ❌ (incorrect on first try) emojis with proper aria-labels, replacing the current Unicode ✓/✗ characters.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React ^19.2.0  
**Primary Dependencies**: Vite ^7.3.1, react-router-dom ^7.13.0  
**Storage**: Browser localStorage (no schema change needed — `RoundResult` persistence type unaffected)  
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, vitest-axe ^0.1.0  
**Target Platform**: Static SPA — latest 2 major versions of Chrome, Firefox, Safari, Edge; school Chromebooks  
**Project Type**: Single frontend directory (`frontend/`)  
**Performance Goals**: Lighthouse ≥ 90 mobile, TTI < 3s on 3G (no impact — trivial change)  
**Constraints**: WCAG 2.1 AA, mobile-first, 320px–1920px viewports  
**Scale/Scope**: 10 rounds per game, single table of 10 rows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Accessibility First | ✅ PASS | FR-004 mandates aria-labels for ✅/❌ emojis. Existing axe-core tests in `ScoreSummary.a11y.test.tsx` will validate. |
| II. Simplicity & Clarity | ✅ PASS | One new boolean field on `Round`; one conditional rendering change. No new abstractions, components, or patterns. YAGNI respected. |
| III. Responsive Design | ✅ PASS | No layout changes. Emoji replaces text character in existing table cell — same or smaller rendering footprint. |
| IV. Static SPA | ✅ PASS | Pure frontend change. No backend, no SSR, no API. |
| V. Test-First | ✅ PASS | Existing test suites for `gameEngine.test.ts` and `ScoreSummary.test.tsx` will be extended with new acceptance scenarios. |

**Gate result**: All 5 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/027-first-try-result/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal component contracts)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (affected files)

```text
frontend/
├── src/
│   ├── types/
│   │   └── game.ts                    # Add firstTryCorrect to Round interface
│   ├── services/
│   │   └── gameEngine.ts              # Set firstTryCorrect during primary phase; preserve during replay
│   └── components/
│       └── GamePlay/
│           └── ScoreSummary/
│               ├── ScoreSummary.tsx    # Render ✅/❌ based on firstTryCorrect
│               └── ScoreSummary.module.css  # Update/remove correctBadge/incorrectBadge styles
└── tests/
    ├── services/
    │   └── gameEngine.test.ts         # Test firstTryCorrect preservation through replay
    ├── components/
    │   └── ScoreSummary.test.tsx       # Test ✅/❌ rendering and aria-labels
    └── a11y/
        └── ScoreSummary.a11y.test.tsx  # Validate axe compliance with new emojis
```

**Structure Decision**: Single `frontend/` directory — matches existing project layout per Constitution Principle IV.
