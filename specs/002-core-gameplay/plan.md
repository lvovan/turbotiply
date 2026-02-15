# Implementation Plan: Core Gameplay

**Branch**: `002-core-gameplay` | **Date**: 2026-02-15 | **Spec**: [specs/002-core-gameplay/spec.md](spec.md)
**Input**: Feature specification from `/specs/002-core-gameplay/spec.md`

## Summary

Implement a timed multiplication quiz game for Turbotiply. Each game consists of 10 primary rounds of A × B = C with one value hidden, followed by a replay phase for any incorrect answers. Scoring is time-based (+5 to 0 for correct, –2 for incorrect). The game runs entirely client-side within the existing React SPA session, with no persistence — game state lives only in React component state. The MainPage stub from feature 001 is replaced with the full gameplay experience.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2, Node.js 18+
**Primary Dependencies**: React, React Router DOM 7.13, Vite 7.3
**Storage**: None for game state — ephemeral in-memory only. Player session from sessionStorage (feature 001).
**Testing**: Vitest 4.0, React Testing Library 16.3, vitest-axe 0.1 (accessibility)
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; school Chromebooks
**Project Type**: Single frontend SPA (`frontend/` directory)
**Performance Goals**: Lighthouse Performance ≥ 90 on mobile, TTI < 3s on 3G, round transitions < 500ms
**Constraints**: WCAG 2.1 AA, COPPA/GDPR-K (no PII), 320px–1920px responsive, no server-side logic
**Scale/Scope**: 10 rounds per game, 78 possible unique factor pairs, 7 new components, 2 new services (game engine + formula generator)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Accessibility First** | ✅ PASS | Feedback uses color + icon + text (FR-018 mandates "Color MUST NOT be the sole indicator"). Numeric input is keyboard-operable. Timer is visible text. Score summary table will use proper semantic HTML. All components get axe-core tests. |
| **II. Simplicity & Clarity** | ✅ PASS | One primary action per screen (answer a question, or review score). Game state is ephemeral React state — no external state library. Formula generation is a pure function. YAGNI: no leaderboards, no persistence, no difficulty settings. |
| **III. Responsive Design** | ✅ PASS | Game screen has a single centered formula + input + submit — naturally responsive. Score summary uses a scrollable table. Touch targets ≥ 44×44px for submit button and navigation. Mobile-first CSS modules. |
| **IV. Static SPA** | ✅ PASS | Pure client-side. Formula generation, timing, and scoring computed in-browser. No backend calls. Single `frontend/` directory. |
| **V. Test-First** | ✅ PASS | Acceptance tests derived from user-story scenarios. Pure-function game engine and formula generator are highly testable. axe-core accessibility tests for gameplay screens. |

**Technology Stack Compliance**:
- ✅ React + TypeScript + Vite
- ✅ Static deployment (no server-side logic)
- ✅ No PII collection
- ✅ CSS modules (no heavy CSS-in-JS)
- ✅ ESLint + TypeScript type-checking

**Gate Result**: ✅ ALL GATES PASS — no violations, no complexity tracking needed.

### Post-Design Re-evaluation (Phase 1 Complete)

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Accessibility First** | ✅ PASS | `RoundFeedback` contract specifies color + icon + text triple-indicator (FR-018). Persistent `aria-live="assertive"` region in DOM. Numeric input is keyboard-operable. Timer is visible text in DOM via ref. `ScoreSummary` uses semantic table markup. All 5 gameplay components get axe-core tests per quickstart.md. |
| **II. Simplicity & Clarity** | ✅ PASS | One action per screen (answer question OR review score). Pure `gameReducer` in standalone `gameEngine.ts` — no external state library. `calculateScore` is a pure function with no side effects. `formulaGenerator` is stateless shuffle-and-slice. No leaderboards, no persistence, no difficulty settings. |
| **III. Responsive Design** | ✅ PASS | Data model is UI-agnostic. Components are single-column (formula + input + submit) — naturally responsive. `ScoreSummary` table scrollable on narrow viewports. Touch targets specified ≥ 44×44px for submit button. Mobile-first CSS modules in each component directory. |
| **IV. Static SPA** | ✅ PASS | All game logic is pure client-side TypeScript. `gameEngine.ts` and `formulaGenerator.ts` are pure functions. `useRoundTimer` uses browser APIs (`performance.now`, `requestAnimationFrame`). No network calls, no server-side dependencies. Single `frontend/` directory. |
| **V. Test-First** | ✅ PASS | Every contract includes a Test Contract section with example assertions. Pure services (`formulaGenerator`, `gameEngine`) are trivially testable. Hooks tested via `renderHook`. Components tested with React Testing Library. Integration test (`gameplayFlow.test.tsx`) covers full game flow. axe-core accessibility tests for gameplay screens. |

**Post-Design Gate Result**: ✅ ALL GATES PASS — design artifacts are constitution-compliant.

## Project Structure

### Documentation (this feature)

```text
specs/002-core-gameplay/
├── plan.md              # This file
├── research.md          # Phase 0 output — all unknowns resolved
├── data-model.md        # Phase 1 output — Game, Round, Formula entities
├── quickstart.md        # Phase 1 output — setup and implementation guide
├── contracts/           # Phase 1 output — service and hook contracts
│   ├── formula-generator.md
│   ├── game-engine.md
│   └── react-hooks.md
├── tasks.md             # Phase 2 output (created by /speckit.tasks)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── types/
│   │   ├── player.ts              # (existing) Player, Session interfaces
│   │   └── game.ts                # Game, Round, Formula, GameState types
│   ├── constants/
│   │   ├── avatars.ts             # (existing)
│   │   ├── avatarEmojis.ts        # (existing)
│   │   ├── colors.ts              # (existing)
│   │   └── scoring.ts             # Scoring tier thresholds and point values
│   ├── services/
│   │   ├── playerStorage.ts       # (existing)
│   │   ├── sessionManager.ts      # (existing)
│   │   ├── formulaGenerator.ts    # Pure function: generate 10 unique formulas
│   │   └── gameEngine.ts          # Game state machine: start, answer, advance
│   ├── hooks/
│   │   ├── usePlayers.ts          # (existing)
│   │   ├── useSession.tsx         # (existing)
│   │   ├── useGame.ts             # Game lifecycle hook wrapping gameEngine
│   │   └── useRoundTimer.ts       # Per-round timer with elapsed ms
│   ├── components/
│   │   ├── AvatarPicker/          # (existing)
│   │   ├── ColorPicker/           # (existing)
│   │   ├── DeleteConfirmation/    # (existing)
│   │   ├── Header/                # (existing)
│   │   ├── PlayerCard/            # (existing)
│   │   ├── WelcomeScreen/         # (existing)
│   │   └── GamePlay/
│   │       ├── FormulaDisplay/    # Shows "A × ? = C" with hidden placeholder
│   │       │   ├── FormulaDisplay.tsx
│   │       │   └── FormulaDisplay.module.css
│   │       ├── AnswerInput/       # Numeric input + submit button
│   │       │   ├── AnswerInput.tsx
│   │       │   └── AnswerInput.module.css
│   │       ├── RoundFeedback/     # Correct/incorrect feedback overlay (1.2s)
│   │       │   ├── RoundFeedback.tsx
│   │       │   └── RoundFeedback.module.css
│   │       ├── GameStatus/        # Round counter + running score + timer
│   │       │   ├── GameStatus.tsx
│   │       │   └── GameStatus.module.css
│   │       └── ScoreSummary/      # End-of-game results + play again + back
│   │           ├── ScoreSummary.tsx
│   │           └── ScoreSummary.module.css
│   ├── pages/
│   │   ├── WelcomePage.tsx        # (existing)
│   │   └── MainPage.tsx           # Replaced: now hosts GamePlay or start button
│   ├── App.tsx                    # (existing) Root with routing + SessionProvider
│   └── main.tsx                   # (existing) React DOM entry point
├── tests/
│   ├── setup.ts                   # (existing)
│   ├── a11y/
│   │   └── accessibility.test.tsx # (existing) + new gameplay screen tests
│   ├── components/
│   │   ├── (existing tests)
│   │   ├── FormulaDisplay.test.tsx
│   │   ├── AnswerInput.test.tsx
│   │   ├── RoundFeedback.test.tsx
│   │   ├── GameStatus.test.tsx
│   │   └── ScoreSummary.test.tsx
│   ├── hooks/
│   │   ├── (existing tests)
│   │   ├── useGame.test.tsx
│   │   └── useRoundTimer.test.ts
│   ├── integration/
│   │   ├── sessionLifecycle.test.tsx  # (existing)
│   │   └── gameplayFlow.test.tsx      # End-to-end game flow
│   ├── pages/
│   │   ├── WelcomePage.test.tsx    # (existing)
│   │   └── MainPage.test.tsx      # New: game lifecycle from MainPage
│   └── services/
│       ├── playerStorage.test.ts  # (existing)
│       ├── sessionManager.test.ts # (existing)
│       ├── formulaGenerator.test.ts
│       └── gameEngine.test.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Structure Decision**: Single `frontend/` directory per Constitution IV (Static SPA). New game logic added under `services/` (pure functions) and `components/GamePlay/` (UI). No new top-level directories. Game state is ephemeral — no new storage services needed.

## Complexity Tracking

> No violations detected — this section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)* | — | — |
