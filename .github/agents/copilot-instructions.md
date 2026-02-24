# Multis Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-14

## Active Technologies
- TypeScript ~5.9.3, React 19.2, Node.js 18+ + React, React Router DOM 7.13, Vite 7.3 (main)
- `localStorage` (player profiles), `sessionStorage` (active session — tab-scoped) (main)
- None for game state — ephemeral in-memory only. Player session from sessionStorage (feature 001). (002-core-gameplay)
- TypeScript ~5.9, React 19, Vite 7 + react-router-dom 7, vitest 4, @testing-library/react 16, vitest-axe (003-home-screen-rework)
- Browser localStorage (`multis_players` key) and sessionStorage (`multis_session` key) (003-home-screen-rework)
- TypeScript 5.x (React 18+) + React, Vite (004-remove-profile-colors)
- Browser localStorage (player profiles) and sessionStorage (active sessions) (004-remove-profile-colors)
- TypeScript 5.x + React 19, Vite 6 (005-min-factor-two)
- Browser localStorage (unchanged by this feature) (005-min-factor-two)
- Browser localStorage (`multis_players` key, schema v3 → v4) and sessionStorage (`multis_session` key) (006-score-display)
- TypeScript ~5.9.3, React 19.2, bundled via Vite 7.3 + React, React DOM, CSS Modules (007-numeric-keypad-input)
- N/A (no data model changes) (007-numeric-keypad-input)
- TypeScript 5.9.3, React 19.2.0 + React, React Router DOM 7.13, Vite 7.3.1 (008-round-ux-rework)
- Browser localStorage (no changes needed for this feature) (008-round-ux-rework)
- TypeScript 5.x / React 18 + React, Vite, CSS Modules (010-round-result-panel)
- N/A (no persistence changes) (010-round-result-panel)
- TypeScript ~5.9, React 19 + React 19, React Router, Vite 7 (012-improve-game-mode)
- localStorage (`multis_players` key), sessionStorage (tab-scoped sessions) (012-improve-game-mode)
- TypeScript ~5.9, React 19.2 + React, React DOM (no charting libraries — hand-rolled SVG) (013-score-sparkline-grid)
- N/A (reads existing `GameRecord[]` from player's game history via `getGameHistory()`) (013-score-sparkline-grid)
- TypeScript ~5.9.3, React 19.2.0 + react, react-dom, react-router-dom (no i18n library — custom solution) (014-multilingual-support)
- localStorage (`multis_lang` key for language preference) (014-multilingual-support)
- TypeScript ~5.9.3, React 19.2.0 + react, react-dom, react-router-dom (custom i18n — no library) (015-portuguese-language)
- localStorage (`multis_lang` key — existing, unchanged) (015-portuguese-language)
- TypeScript ~5.9.3, React 19.2, JSX + react-router-dom 7.13, Vite 7.3, CSS Modules (016-minor-ui-polish)
- N/A (no storage changes) (016-minor-ui-polish)
- TypeScript 5.9 / React 19.2 / Vite 7.3 + react, react-dom, react-router-dom 7.13 (017-practice-mode-update)
- Browser localStorage (no backend) (017-practice-mode-update)
- TypeScript 5.9, React 19.2 + `microsoft-clarity` (npm package), Vite 7.3, Vitest 4 (018-rename-to-multis, 019-clarity-telemetry)
- N/A (telemetry is fire-and-forget to external service) (019-clarity-telemetry)
- Browser localStorage (`multis_players`, `multis_lang`) and sessionStorage (`multis_session`) (018-rename-to-multis)
- TypeScript 5.9, React 19.2 + React Router DOM 7.13, Vite 7.3, CSS Modules (020-page-header-consistency)
- TypeScript 5.x (React 18, Vite) + React, React Router, Vitest, React Testing Library, axe-core (021-practice-score-separation)
- TypeScript ~5.9.3 + React ^19.2.0, React Router DOM ^7.13.0, Vite ^7.3.1 (022-player-name-limit)
- Browser localStorage (key `multis_players`) (022-player-name-limit)
- TypeScript ~5.9.3, React ^19.2.0 + Vite ^7.3.1, React Router DOM ^7.13.0, CSS Modules (023-inline-answer-input)
- TypeScript (React 18+, Vite) + React, react-router-dom, CSS Modules, custom i18n (no library) (024-switch-player-emoji)
- N/A (no data changes) (024-switch-player-emoji)
- TypeScript ~5.9.3 / React 19.2.0 + Vite 7.3.1, react-router-dom 7.13.0 (025-hide-practice-sparkline)
- Browser localStorage (no change) (025-hide-practice-sparkline)
- TypeScript ~5.9.3, React 19.2.0 + Vite, Vitest 4.0.18, React Testing Library 16.3.2 (026-high-scores-medals)
- Browser localStorage (player.gameHistory, 100-record cap) (026-high-scores-medals)
- TypeScript ~5.9.3, React ^19.2.0 + Vite ^7.3.1, react-router-dom ^7.13.0 (027-first-try-result)
- Browser localStorage (no schema change needed — `RoundResult` persistence type unaffected) (027-first-try-result)

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
- 027-first-try-result: Added TypeScript ~5.9.3, React ^19.2.0 + Vite ^7.3.1, react-router-dom ^7.13.0
- 026-high-scores-medals: Added TypeScript ~5.9.3, React 19.2.0 + Vite, Vitest 4.0.18, React Testing Library 16.3.2
- 025-hide-practice-sparkline: Added TypeScript ~5.9.3 / React 19.2.0 + Vite 7.3.1, react-router-dom 7.13.0


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
