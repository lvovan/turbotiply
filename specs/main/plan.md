# Implementation Plan: Player Sessions

**Branch**: `main` | **Date**: 2026-02-14 | **Spec**: [specs/main/spec.md](spec.md)
**Input**: Feature specification from `/specs/main/spec.md`

## Summary

Implement a player session system for Turbotiply that shows a welcome/player-selection screen on every app load. New players create a profile (avatar, name, color); returning players tap their name from a list. Sessions are tab-scoped via `sessionStorage` and end automatically on tab close. Player profiles persist in `localStorage` (max 50, ordered by most recently active). The app is a pure client-side React SPA with no backend.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2, Node.js 18+  
**Primary Dependencies**: React, React Router DOM 7.13, Vite 7.3  
**Storage**: `localStorage` (player profiles), `sessionStorage` (active session — tab-scoped)  
**Testing**: Vitest 4.0, React Testing Library 16.3, vitest-axe 0.1 (accessibility)  
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge; school Chromebooks  
**Project Type**: Single frontend SPA (`frontend/` directory)  
**Performance Goals**: Lighthouse Performance ≥ 90 on mobile, TTI < 3s on 3G  
**Constraints**: WCAG 2.1 AA, COPPA/GDPR-K (no PII collection), offline-capable localStorage, 320px–1920px responsive  
**Scale/Scope**: ≤ 50 stored players per device, 2 screens (Welcome, Main), 7 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Accessibility First** | ✅ PASS | Avatar/color pickers use `role="radiogroup"` with roving tabindex per WAI-ARIA APG. All interactive elements have `aria-label`. Min 16px text. Focus indicators via `:focus-visible`. Delete confirmation is a modal dialog with `aria-modal="true"` and Escape dismissal. axe-core tests included. |
| **II. Simplicity & Clarity** | ✅ PASS | One primary action per screen (create profile or select player). No external state libraries — React Context + `useState` for ~4 fields. No unnecessary abstractions. YAGNI applied throughout. |
| **III. Responsive Design** | ✅ PASS | CSS modules with mobile-first approach. Touch targets ≥ 44×44 CSS px. Avatar grid 3×4 (mobile) / 4×3 (desktop). No horizontal scroll. Tested at 320px and 1920px. |
| **IV. Static SPA** | ✅ PASS | Pure client-side React SPA. No backend, no SSR. Single `frontend/` directory. Static assets output to `frontend/dist/`. All logic runs in the browser. |
| **V. Test-First** | ✅ PASS | Acceptance tests derived from user-story scenarios. Vitest + React Testing Library. axe-core accessibility tests for every screen and component. Tests written to fail first. |

**Technology Stack Compliance**:
- ✅ React + TypeScript + Vite
- ✅ Static deployment (Vite build → `frontend/dist/`)
- ✅ Browser storage only (localStorage + sessionStorage)
- ✅ CSS modules (no heavy CSS-in-JS)
- ✅ No PII collection (informal nicknames only)
- ✅ ESLint + Prettier + TypeScript type-checking in CI

**Gate Result**: ✅ ALL GATES PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md              # This file
├── research.md          # Phase 0 output — all unknowns resolved
├── data-model.md        # Phase 1 output — Player, Session, PlayerStore entities
├── quickstart.md        # Phase 1 output — setup and implementation guide
├── contracts/           # Phase 1 output — service and hook contracts
│   ├── player-storage.md
│   ├── session-manager.md
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
│   │   └── player.ts           # Player, Session, PlayerStore interfaces
│   ├── constants/
│   │   ├── avatars.ts           # 12 predefined avatar definitions
│   │   ├── avatarEmojis.ts      # Emoji renderer for avatars
│   │   └── colors.ts            # 8 predefined color definitions
│   ├── services/
│   │   ├── playerStorage.ts     # localStorage CRUD for players
│   │   └── sessionManager.ts    # sessionStorage session lifecycle
│   ├── hooks/
│   │   ├── usePlayers.ts        # Player list hook (localStorage)
│   │   └── useSession.tsx       # Session context + provider + hook
│   ├── components/
│   │   ├── AvatarPicker/        # Accessible avatar radiogroup grid
│   │   ├── ColorPicker/         # Accessible color radiogroup grid
│   │   ├── DeleteConfirmation/  # Modal dialog for player deletion
│   │   ├── Header/              # Session header with switch button
│   │   ├── PlayerCard/          # Player display card with delete
│   │   └── WelcomeScreen/       # NewPlayerForm + PlayerList
│   ├── pages/
│   │   ├── WelcomePage.tsx      # Entry/selection screen
│   │   └── MainPage.tsx         # Post-session stub
│   ├── App.tsx                  # Root with routing + SessionProvider
│   └── main.tsx                 # React DOM entry point
├── tests/
│   ├── setup.ts
│   ├── a11y/                    # axe-core accessibility tests
│   ├── components/              # Component unit tests
│   ├── hooks/                   # Hook unit tests
│   ├── integration/             # Session lifecycle integration tests
│   ├── pages/                   # Page-level tests
│   └── services/                # Service unit tests
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Structure Decision**: Single `frontend/` directory per Constitution IV (Static SPA). No backend. All source in `frontend/src/`, all tests in `frontend/tests/`.

## Complexity Tracking

> No violations detected — this section is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)* | — | — |
