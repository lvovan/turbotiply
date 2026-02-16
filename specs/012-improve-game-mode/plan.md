# Implementation Plan: Improve Game Mode

**Branch**: `012-improve-game-mode` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-improve-game-mode/spec.md`

## Summary

Add an "Improve" game mode that analyzes a player's most recent completed game to identify challenging multiplication pairs (those answered incorrectly AND slowly — ≥ 1.5× game average response time), then generates a targeted practice game biased toward those weak areas. The game screen gains dual-mode buttons ("Play" / "Improve") with descriptor text. Improve games replace the score display with a "Practice" indicator, show a practice-oriented completion screen ("You got X/10 right!" + pairs still wrong), and are excluded from all scoring metrics. The `GameRecord` data model is extended to include per-round results and a game-mode flag.

## Technical Context

**Language/Version**: TypeScript ~5.9, React 19  
**Primary Dependencies**: React 19, React Router, Vite 7  
**Storage**: localStorage (`turbotiply_players` key), sessionStorage (tab-scoped sessions)  
**Testing**: Vitest 4, React Testing Library, vitest-axe  
**Target Platform**: Static SPA — browser (Chrome, Firefox, Safari, Edge latest 2 versions; Chromebooks)  
**Project Type**: Single frontend project (`frontend/`)  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G  
**Constraints**: No backend, no SSR. All data in browser localStorage. COPPA/GDPR-K compliant (no PII).  
**Scale/Scope**: 50 players max, 100 game records per player, 10 rounds per game, 66 unique multiplication pairs (factors 2–12)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | FR-018 mandates keyboard + screen reader support. New buttons need ARIA labels. "Practice" indicator needs text, not color-only. |
| II. Simplicity & Clarity | ✅ PASS | Two buttons with clear descriptors. No new abstractions beyond what's needed. YAGNI: analysis is a pure function, no new state management library. |
| III. Responsive Design | ✅ PASS | FR-019 mandates responsive layout. Descriptor text wraps on mobile. Touch targets ≥ 44×44 px. |
| IV. Static SPA | ✅ PASS | All logic client-side. Per-round data stored in localStorage alongside existing `GameRecord`. No backend changes. |
| V. Test-First | ✅ PASS | Acceptance tests from spec scenarios drive implementation. axe-core tests for new components. |

**Gate result**: ALL PASS — no violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/012-improve-game-mode/
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
│   ├── types/
│   │   ├── game.ts              # Extended: GameMode type
│   │   └── player.ts            # Extended: RoundResult, GameRecord with rounds[]
│   ├── services/
│   │   ├── gameEngine.ts        # Modified: accept game mode, track per-round data
│   │   ├── formulaGenerator.ts  # Extended: generateImproveFormulas()
│   │   ├── playerStorage.ts     # Modified: persist/read round results, Improve flag
│   │   └── challengeAnalyzer.ts # NEW: analyze game → challenging pairs
│   ├── hooks/
│   │   └── useGame.ts           # Modified: accept game mode, pass to reducer
│   ├── pages/
│   │   └── MainPage.tsx         # Modified: dual-mode buttons, Improve completion screen
│   └── components/
│       └── GamePlay/
│           ├── GameStatus/      # Modified: "Practice" indicator for Improve mode
│           ├── ScoreSummary/    # Modified: Improve completion variant
│           └── ModeSelector/    # NEW: Play/Improve buttons with descriptors
└── tests/
    ├── services/
    │   └── challengeAnalyzer.test.ts  # NEW
    ├── components/
    │   └── ModeSelector.test.tsx      # NEW
    ├── integration/
    │   └── improveMode.test.tsx       # NEW
    └── [existing test files modified]
```

**Structure Decision**: Single `frontend/` project per constitution principle IV. New code follows existing directory conventions. One new service (`challengeAnalyzer.ts`) and one new component (`ModeSelector`). All other changes are modifications to existing files.

## Complexity Tracking

> No violations — section not applicable.
