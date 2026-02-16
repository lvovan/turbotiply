# Implementation Plan: Practice Mode Update

**Branch**: `017-practice-mode-update` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/017-practice-mode-update/spec.md`

## Summary

Two targeted changes to Practice (Improve) mode: (1) Replace single-game tricky-number analysis with a multi-game algorithm that aggregates mistake counts across up to the player's 10 most recent games, falling back to slowest average response time when no mistakes exist. (2) Hide the animated countdown bar (both the progress bar and the remaining-seconds text) during Practice mode rounds while continuing to record response times internally. Play mode remains completely unchanged.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19.2 / Vite 7.3
**Primary Dependencies**: react, react-dom, react-router-dom 7.13
**Storage**: Browser localStorage (no backend)
**Testing**: Vitest 4.0 + React Testing Library 16.3 + vitest-axe (a11y)
**Target Platform**: Static SPA — Chrome, Firefox, Safari, Edge (latest 2 versions), school Chromebooks
**Project Type**: Single frontend SPA (`frontend/` directory)
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G
**Constraints**: Offline-capable, no server, WCAG 2.1 AA, child-safe (COPPA), mobile-first responsive (320–1920 px)
**Scale/Scope**: ~25 source files, ~30 test files, single page app with 2 routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| **I. Accessibility First** | ✅ PASS | Removing the countdown bar in Practice mode simplifies the UI for the target audience. No new interactive elements are introduced. The existing timer text (`<span ref={timerRef}>`) will also be hidden, so there is no orphaned ARIA content. Internal timing continues, so `elapsedMs` data is preserved for analytics. |
| **II. Simplicity & Clarity** | ✅ PASS | No new abstractions or layers. The change modifies one existing service function (`getChallengingPairsForPlayer`) and conditionally hides one existing component. YAGNI: no speculative features added. |
| **III. Responsive Design** | ✅ PASS | No new UI components. Hiding the countdown bar removes content from all viewports equally — no layout regressions. |
| **IV. Static SPA** | ✅ PASS | Pure client-side logic change. No server dependency introduced. All data remains in localStorage. |
| **V. Test-First** | ✅ PASS | Existing test suites for `challengeAnalyzer`, `CountdownBar`, `useRoundTimer`, `GameStatus`, `improveMode` integration, and `gameplayFlow` integration provide comprehensive coverage targets. New tests will be written first (red-green-refactor). |

**Gate result**: All 5 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/017-practice-mode-update/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── challenge-analyzer-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   └── GamePlay/
│   │       ├── CountdownBar/
│   │       │   └── CountdownBar.tsx        # (unchanged)
│   │       └── GameStatus/
│   │           └── GameStatus.tsx          # Conditionally hide timer & countdown bar in improve mode
│   ├── services/
│   │   └── challengeAnalyzer.ts            # Multi-game analysis algorithm
│   └── types/
│       └── game.ts                         # ChallengingPair type update (difficultyRatio → mistakeCount + avgMs)
└── tests/
    ├── components/
    │   ├── CountdownBar.test.tsx            # Add test: hidden in improve mode
    │   └── GameStatus.test.tsx             # Add tests: timer/bar hidden in improve mode
    ├── integration/
    │   └── improveMode.test.tsx            # Add tests: multi-game tricky analysis, no countdown bar
    └── services/
        └── challengeAnalyzer.test.ts       # Rewrite: multi-game aggregation scenarios
```

**Structure Decision**: Single `frontend/` directory. All changes are within existing files or existing test files — no new files are created. The feature touches 3 source files and 4 test files.

## Complexity Tracking

> No constitution violations. This section is intentionally empty.
