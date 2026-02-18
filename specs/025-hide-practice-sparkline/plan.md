# Implementation Plan: Hide Sparkline in Practice/Improve Mode

**Branch**: `025-hide-practice-sparkline` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/025-hide-practice-sparkline/spec.md`

## Summary

The score progression sparkline (`ProgressionGraph`) currently appears on the result screen (`ScoreSummary`) for all game modes. This change adds a single conditional guard so the sparkline renders only when `gameMode === 'play'`. The pre-game screen sparkline is unaffected (it already filters to play-mode data). This is a minimal, single-line conditional change in one component with corresponding test updates.

## Technical Context

**Language/Version**: TypeScript ~5.9.3 / React 19.2.0  
**Primary Dependencies**: Vite 7.3.1, react-router-dom 7.13.0  
**Storage**: Browser localStorage (no change)  
**Testing**: Vitest 4.0.18, React Testing Library 16.3.2, vitest-axe 0.1.0  
**Target Platform**: Static SPA — modern browsers (Chrome, Firefox, Safari, Edge latest 2 versions)  
**Project Type**: Single frontend project (`frontend/`)  
**Performance Goals**: Lighthouse ≥ 90 mobile (no impact — change is purely conditional rendering)  
**Constraints**: WCAG 2.1 AA, mobile-first 320px–1920px  
**Scale/Scope**: Single component conditional change — ~1 LOC production, ~15 LOC tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | Removing sparkline from improve mode has no negative a11y impact. The sparkline is supplementary visual data; removing it simplifies the screen. No ARIA or keyboard concerns. |
| II. Simplicity & Clarity | ✅ PASS | Removing irrelevant data from the improve result screen reduces cognitive load. The change itself is minimal (~1 LOC). |
| III. Responsive Design | ✅ PASS | No layout changes. Removing the sparkline frees vertical space on mobile. |
| IV. Static SPA | ✅ PASS | No architecture changes. No backend involved. |
| V. Test-First | ✅ PASS | Existing ScoreSummary tests cover sparkline rendering. New tests must verify sparkline hidden in improve mode. Tests written before implementation. |

**Gate result**: ALL PASS — no violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/025-hide-practice-sparkline/
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
│   │       ├── ProgressionGraph/
│   │       │   ├── ProgressionGraph.tsx        # No changes
│   │       │   └── ProgressionGraph.module.css
│   │       └── ScoreSummary/
│   │           ├── ScoreSummary.tsx             # MODIFIED: conditional sparkline
│   │           └── ScoreSummary.module.css
│   ├── pages/
│   │   └── MainPage.tsx                        # No changes needed
│   ├── services/
│   │   └── playerStorage.ts                    # No changes
│   └── types/
│       ├── game.ts                             # No changes
│       └── player.ts                           # No changes
└── tests/
    └── components/
        └── ScoreSummary.test.tsx                # MODIFIED: add improve-mode sparkline tests
```

**Structure Decision**: Single `frontend/` project. Only two files modified: `ScoreSummary.tsx` (production) and `ScoreSummary.test.tsx` (tests).

## Complexity Tracking

No constitution violations. This table is intentionally empty.
