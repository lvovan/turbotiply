# Implementation Plan: Practice Score Separation

**Branch**: `021-practice-score-separation` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/021-practice-score-separation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Separate Practice (Improve) mode scores from Normal (Play) mode across high scores and sparkline displays. The high scores list and sparkline already filter to Play-only games in `playerStorage.ts`. This feature mainly changes the tricky number display: reduce the Improve button descriptor from up to 8 tricky numbers to at most 3, selected by ranking each individual factor (2–12) by aggregate mistake count across all tricky pairs. Also confirm and document that tricky number analysis continues to use both Play and Improve game records.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18, Vite)
**Primary Dependencies**: React, React Router, Vitest, React Testing Library, axe-core
**Storage**: Browser localStorage (`multis_players` key)
**Testing**: Vitest + React Testing Library + axe-core accessibility tests
**Target Platform**: Static SPA — modern browsers (latest 2 versions Chrome/Firefox/Safari/Edge), mobile-first
**Project Type**: Single (`frontend/` directory)
**Performance Goals**: Lighthouse Performance ≥ 90 on mobile, TTI < 3s on 3G
**Constraints**: Offline-capable (all data in localStorage), no PII, WCAG 2.1 AA
**Scale/Scope**: ~20 screens, single-player local profiles, game history capped at 100 records/player

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | **PASS** | No new interactive elements. Updated descriptor text already has ARIA labels via existing `ModeSelector` component. |
| II | Simplicity & Clarity | **PASS** | Reduces descriptor from 8 numbers to 3 — simpler for children to parse. Algorithm change is localized to `extractTrickyNumbers()`. No new abstractions. |
| III | Responsive Design | **PASS** | Shorter descriptor text improves fit on narrow viewports. No layout changes needed. |
| IV | Static SPA | **PASS** | All changes are client-side. No server-side code involved. |
| V | Test-First | **PASS** | New unit tests for `extractTrickyNumbers()` (per-factor ranking). Component test update for `ModeSelector` (3-number cap). |

**Gate: PASSED** — no violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/021-practice-score-separation/
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
│   │       ├── ModeSelector/
│   │       │   ├── ModeSelector.tsx          # MAX_DISPLAY: 8 → 3, remove ellipsis logic
│   │       │   └── ModeSelector.module.css
│   │       ├── RecentHighScores/             # No changes needed (already play-only)
│   │       └── ProgressionGraph/             # No changes needed (already play-only)
│   ├── pages/
│   │   └── MainPage.tsx                      # No changes needed (data flow unchanged)
│   ├── services/
│   │   ├── challengeAnalyzer.ts              # extractTrickyNumbers: per-factor ranking algorithm
│   │   └── playerStorage.ts                  # No changes needed (already play-only filtering)
│   └── types/
│       ├── player.ts                         # No changes needed
│       └── game.ts                           # No changes needed
└── tests/
    ├── services/
    │   └── challengeAnalyzer.test.ts         # New: test per-factor ranking with ties, caps
    └── components/
        └── ModeSelector.test.tsx             # New/update: verify 3-number cap display
```

**Structure Decision**: Single `frontend/` directory. All changes are within `src/services/` (algorithm) and `src/components/` (display cap). No new files needed except tests.


