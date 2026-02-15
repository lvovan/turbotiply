# Quickstart: Player Sessions

**Feature**: 001-player-sessions
**Date**: 2026-02-14

## Prerequisites

- Node.js 18+ (for frontend)
- Git

## Project Setup (First Time)

This is a greenfield project. The following commands scaffold the monorepo.

### 1. Frontend

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom
```

Key files to create/modify:
- `src/types/player.ts` — Player, Session, PlayerStore type definitions
- `src/constants/avatars.ts` — 12 predefined avatar definitions
- `src/constants/colors.ts` — 8 predefined color definitions
- `src/services/playerStorage.ts` — localStorage CRUD
- `src/services/sessionManager.ts` — sessionStorage lifecycle
- `src/hooks/useSession.ts` — Session context + hook
- `src/hooks/usePlayers.ts` — Player list hook
- `src/components/WelcomeScreen/` — New + returning player flows
- `src/components/AvatarPicker/` — Accessible avatar grid
- `src/components/ColorPicker/` — Accessible color grid
- `src/components/PlayerCard/` — Player display card
- `src/components/Header/` — Session header with switch button
- `src/pages/WelcomePage.tsx` — Entry point
- `src/pages/MainPage.tsx` — Post-session stub


### 3. Dev Server

```bash
# Terminal 1: Frontend dev server
cd frontend
npm run dev
```

## Testing

```bash
# Frontend tests
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npx vitest run
```

## Key Architecture Decisions

| Decision | Rationale | Reference |
|----------|-----------|-----------|
| All data in localStorage | Constitution v1.1.0: no server-side DB | [constitution.md](../../.specify/memory/constitution.md) |
| Session via sessionStorage | Auto-clears on tab close, crash-safe | [research.md](research.md#4-session-detection-on-tab-close) |
| React Context for session state | YAGNI: simplest approach for ~4 fields | [research.md](research.md#5-react-state-management-for-session) |
| ARIA radiogroup for pickers | WAI-ARIA APG recommended pattern | [research.md](research.md#6-wcag-21-aa-avatarcolor-picker-patterns) |
| 12 emoji avatars, 8 colors | Bias-free, accessible, kid-appropriate | [research.md](research.md#1-avatar-system-for-children) |

## Implementation Order

1. **Types & constants** — `player.ts`, `avatars.ts`, `colors.ts`
2. **Storage services** — `playerStorage.ts`, `sessionManager.ts` (+ tests)
3. **React hooks** — `useSession.ts`, `usePlayers.ts` (+ tests)
4. **Components** — AvatarPicker, ColorPicker, PlayerCard, WelcomeScreen, Header (+ tests)
5. **Pages & routing** — WelcomePage, MainPage, App.tsx routing (+ tests)
6. **Accessibility audit** — axe-core, keyboard nav, screen reader testing
7. **Responsive check** — 320px and 1280px viewport spot-check

## File Reference

| Artifact | Path |
|----------|------|
| Feature spec | [specs/001-player-sessions/spec.md](spec.md) |
| Implementation plan | [specs/001-player-sessions/plan.md](plan.md) |
| Research | [specs/001-player-sessions/research.md](research.md) |
| Data model | [specs/001-player-sessions/data-model.md](data-model.md) |
| Contracts | [specs/001-player-sessions/contracts/](contracts/) |
| Constitution | [.specify/memory/constitution.md](../../.specify/memory/constitution.md) |
