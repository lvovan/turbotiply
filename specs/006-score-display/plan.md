# Implementation Plan: Score Display Rework

**Branch**: `006-score-display` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-score-display/spec.md`

## Summary

Rework score display in three areas: (1) change the profile average shown on player cards from all-time cumulative to last-10-games moving average, (2) add a "Recent High Scores" ranked list on the pre-game screen showing the last 5 scores sorted highest-first, and (3) add a small score progression sparkline graph on the pre-game screen showing full game history. This requires extending the `Player` data model with per-game history (`GameRecord[]`), adding a localStorage schema migration (v3→v4), three new service helper functions, two new components (RecentHighScores, ProgressionGraph), and modifications to PlayerCard and MainPage.

## Technical Context

**Language/Version**: TypeScript ~5.9, React 19, Vite 7  
**Primary Dependencies**: react-router-dom 7, vitest 4, @testing-library/react 16, vitest-axe  
**Storage**: Browser localStorage (`turbotiply_players` key, schema v3 → v4) and sessionStorage (`turbotiply_session` key)  
**Testing**: Vitest + React Testing Library + vitest-axe (a11y)  
**Target Platform**: Static SPA, browser (Chrome/Firefox/Safari/Edge, latest 2 major versions)  
**Project Type**: Single — `frontend/` directory only (no backend)  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G; scores display within 1s of page load (SC-002)  
**Constraints**: All main menu content visible without scrolling on 320×640 viewport (constitution) / 360×640 viewport (spec); tap targets ≥ 44×44 CSS px; WCAG 2.1 AA; no new runtime dependencies (graph uses pure inline SVG)  
**Scale/Scope**: ~8 source files modified or created; 1 type file, 1 service file, 2 new components, 1 modified component, 1 modified page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | RecentHighScores uses semantic `<ol>` with `aria-label`, `.sr-only` text per rank. ProgressionGraph uses `role="img"` + `aria-label` + `<title>`. Medal emojis marked `aria-hidden="true"`. All text ≥ 16px base, contrast ratios ≥ 4.5:1 verified in research. Age-appropriate language ("Play your first game to see your scores here!"). |
| II | Simplicity & Clarity | ✅ PASS | No new runtime dependencies (pure inline SVG instead of charting library — YAGNI). Three focused helper functions with clear signatures. Existing `updatePlayerScore` extended, not replaced. One primary action per screen preserved (Start Game button remains the focus). |
| III | Responsive Design | ✅ PASS | Both new components designed mobile-first, max-width 360px, with `@media (max-width: 320px)` breakpoints. SVG graph uses `viewBox` + `width: 100%` for fluid scaling. Space budget verified: 5-row high scores (~216px) + graph (~100px) + heading/button (~156px) = ~472px, fits 640px viewport height. No horizontal scrolling. |
| IV | Static SPA | ✅ PASS | All logic client-side. localStorage only. Single `frontend/` directory. No new dependencies. |
| V | Test-First | ✅ PASS | Acceptance tests derived from spec scenarios required before implementation. axe-core a11y tests required for RecentHighScores and ProgressionGraph components. Existing playerStorage tests extended for new functions and migration. |

**Gate result**: ALL PASS — proceed to Phase 0.

### Post-Design Gate (Phase 1 re-check)

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | Component contracts specify full ARIA markup, screen reader text, semantic HTML. Contrast ratios verified (see [research.md R2](research.md#r2)). |
| II | Simplicity & Clarity | ✅ PASS | Three helper functions, two new components, one modified component, one modified page. No abstractions beyond what is needed. |
| III | Responsive Design | ✅ PASS | CSS contracts include 320px breakpoint. SVG sparkline is inherently responsive. |
| IV | Static SPA | ✅ PASS | No changes to architecture. |
| V | Test-First | ✅ PASS | Test file list specified in [quickstart.md](quickstart.md). |

**Gate result**: ALL PASS — design is compliant.

## Project Structure

### Documentation (this feature)

```text
specs/006-score-display/
├── plan.md              # This file
├── research.md          # Phase 0 output (R1–R5: graph approach, styling, migration, rounding, viewport)
├── data-model.md        # Phase 1 output (GameRecord, Player extension, PlayerStore v4)
├── quickstart.md        # Phase 1 output (setup, key files, architecture decisions)
├── contracts/
│   ├── services.md      # Phase 1 output (playerStorage new/modified functions)
│   └── components.md    # Phase 1 output (RecentHighScores, ProgressionGraph, PlayerCard, MainPage)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── types/
│   │   └── player.ts                     # Modified: add GameRecord interface, gameHistory? field
│   ├── services/
│   │   └── playerStorage.ts             # Modified: v3→v4 migration, updatePlayerScore refactor,
│   │                                    #   savePlayer default, 3 new helper functions
│   ├── components/
│   │   ├── PlayerCard/
│   │   │   └── PlayerCard.tsx            # Modified: use getRecentAverage(player, 10)
│   │   └── GamePlay/
│   │       ├── RecentHighScores/
│   │       │   ├── RecentHighScores.tsx  # New: ranked score list with medals
│   │       │   └── RecentHighScores.module.css # New: high-score aesthetic
│   │       └── ProgressionGraph/
│   │           ├── ProgressionGraph.tsx  # New: inline SVG sparkline
│   │           └── ProgressionGraph.module.css # New: compact sparkline styling
│   └── pages/
│       └── MainPage.tsx                  # Modified: add player lookup, RecentHighScores,
│                                         #   ProgressionGraph to not-started state
├── tests/
│   ├── services/
│   │   └── playerStorage.test.ts        # Modified: new helper tests, migration test, cap test
│   ├── components/
│   │   ├── PlayerCard.test.tsx           # Modified: test getRecentAverage usage
│   │   ├── RecentHighScores.test.tsx     # New: ranked list, empty state, medals, sr text
│   │   └── ProgressionGraph.test.tsx     # New: SVG render, <2 points null, ARIA
│   ├── integration/
│   │   └── scoreDisplayFlow.test.tsx     # New: e2e score persistence + display
│   └── a11y/
│       └── accessibility.test.tsx        # Modified: axe tests for new components
```

**Structure Decision**: Single `frontend/` directory per constitution principle IV (Static SPA). New components placed under `GamePlay/` following the existing pattern for gameplay-related UI (FormulaDisplay, AnswerInput, RoundFeedback, ScoreSummary are all under `GamePlay/`).

## Complexity Tracking

> No constitution violations detected — this section is intentionally empty.
