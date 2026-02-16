# turbotiply Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-14

## Active Technologies
- TypeScript ~5.9.3, React 19.2, Node.js 18+ + React, React Router DOM 7.13, Vite 7.3 (main)
- `localStorage` (player profiles), `sessionStorage` (active session — tab-scoped) (main)
- None for game state — ephemeral in-memory only. Player session from sessionStorage (feature 001). (002-core-gameplay)
- TypeScript ~5.9, React 19, Vite 7 + react-router-dom 7, vitest 4, @testing-library/react 16, vitest-axe (003-home-screen-rework)
- Browser localStorage (`turbotiply_players` key) and sessionStorage (`turbotiply_session` key) (003-home-screen-rework)
- TypeScript 5.x (React 18+) + React, Vite (004-remove-profile-colors)
- Browser localStorage (player profiles) and sessionStorage (active sessions) (004-remove-profile-colors)
- TypeScript 5.x + React 19, Vite 6 (005-min-factor-two)
- Browser localStorage (unchanged by this feature) (005-min-factor-two)
- Browser localStorage (`turbotiply_players` key, schema v3 → v4) and sessionStorage (`turbotiply_session` key) (006-score-display)
- TypeScript ~5.9.3, React 19.2, bundled via Vite 7.3 + React, React DOM, CSS Modules (007-numeric-keypad-input)
- N/A (no data model changes) (007-numeric-keypad-input)
- TypeScript 5.9.3, React 19.2.0 + React, React Router DOM 7.13, Vite 7.3.1 (008-round-ux-rework)
- Browser localStorage (no changes needed for this feature) (008-round-ux-rework)
- TypeScript 5.x / React 18 + React, Vite, CSS Modules (010-round-result-panel)
- N/A (no persistence changes) (010-round-result-panel)
- TypeScript ~5.9 / React 19 + React, Vite, CSS Modules (011-touch-answer-keypad)

- TypeScript 5.x (frontend), Python 3.11+ (backend — serves static files only for this feature) + React 18+, Vite (bundler), React Router (navigation), FastAPI (backend — static file serving only) (main)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

cd src; pytest; ruff check .

## Code Style

TypeScript 5.x (frontend): Follow standard conventions

## Recent Changes
- 011-touch-answer-keypad: Added TypeScript ~5.9 / React 19 + React, Vite, CSS Modules
- 010-round-result-panel: Added TypeScript 5.x / React 18 + React, Vite, CSS Modules
- 009-responsive-layout-focus: Added TypeScript 5.9.3, React 19.2.0 + React, React Router DOM 7.13, Vite 7.3.1


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
