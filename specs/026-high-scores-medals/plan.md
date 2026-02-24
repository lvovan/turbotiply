# Implementation Plan: High Scores Medals — Best of Last 10 Games

**Branch**: `026-high-scores-medals` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/026-high-scores-medals/spec.md`

## Summary

Change the high scores medals section so it displays the **best 3 scores from the last 10 play-mode games** instead of the current behavior (best 3 from the last 3 games). The `getRecentHighScores` function in `playerStorage.ts` needs a new parameter to separate *window size* (how many recent games to consider) from *result count* (how many top scores to return). The call site in `MainPage.tsx` passes `windowSize=10, topN=3`. The `RecentHighScores` component already handles variable-length arrays and needs no UI changes.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2.0
**Primary Dependencies**: Vite, Vitest 4.0.18, React Testing Library 16.3.2
**Storage**: Browser localStorage (player.gameHistory, 100-record cap)
**Testing**: Vitest + React Testing Library + axe-core
**Target Platform**: Static SPA — browsers (Chrome, Firefox, Safari, Edge latest 2 versions)
**Project Type**: Single frontend/ directory (static SPA, no backend)
**Performance Goals**: Lighthouse ≥ 90, TTI < 3s on 3G — trivial for this change (in-memory sort of ≤10 items)
**Constraints**: Offline-capable, no PII, WCAG 2.1 AA
**Scale/Scope**: 1 function signature change, 1 call-site update, updated unit tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | No UI changes. Existing ARIA labels, screen-reader text, and medal emojis are preserved. Component already meets WCAG 2.1 AA. |
| II. Simplicity & Clarity | ✅ PASS | Minimal change: one function signature update + one call-site change. No new abstractions, no new components. YAGNI respected. |
| III. Responsive Design | ✅ PASS | No layout changes. Medals section already renders correctly on all viewports. |
| IV. Static SPA | ✅ PASS | Pure client-side logic change. No server-side code introduced. |
| V. Test-First | ✅ PASS | Existing test suite covers `getRecentHighScores` and `RecentHighScores` component. Tests will be updated before implementation (red-green-refactor). |

**Gate result**: ALL PASS — no violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/026-high-scores-medals/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (affected files)

```text
frontend/
├── src/
│   ├── services/
│   │   └── playerStorage.ts       # getRecentHighScores — add windowSize/topN params
│   └── pages/
│       └── MainPage.tsx            # Call site — update arguments
└── tests/
    ├── services/
    │   └── playerStorage.test.ts   # Update test suite for new behavior
    └── components/
        └── RecentHighScores.test.tsx  # Existing tests — no changes expected
```

**Structure Decision**: Single `frontend/` directory. This feature touches only the data-selection layer (`playerStorage.ts`) and its call site (`MainPage.tsx`). No new files or components are created.
