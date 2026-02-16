# Quickstart: Round UX Rework

**Feature**: 008-round-ux-rework  
**Branch**: `008-round-ux-rework`  
**Date**: 2026-02-16

## Prerequisites

- Node.js (see `frontend/package.json` for engine requirements)
- npm

## Setup

```bash
git checkout 008-round-ux-rework
cd frontend
npm install
```

## Development

```bash
npm run dev          # Vite dev server with HMR
npm run test:watch   # Vitest in watch mode
```

## Key Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/hooks/useRoundTimer.ts` | Modify | Add `barRef`, switch to countdown, add color logic |
| `src/constants/scoring.ts` | Modify | Add `COUNTDOWN_DURATION_MS`, `COUNTDOWN_COLORS` |
| `src/components/GamePlay/CountdownBar/` | Create | New component: animated bar with `barRef` |
| `src/components/GamePlay/InlineFeedback/` | Create | New component: replaces RoundFeedback |
| `src/components/GamePlay/GameStatus/GameStatus.tsx` | Modify | Add `barRef` prop, render CountdownBar |
| `src/pages/MainPage.tsx` | Modify | Wrap formula area, swap feedback, pass `barRef` |
| `src/components/GamePlay/RoundFeedback/` | Delete | Replaced by InlineFeedback |

## Key Files to Test

| Test File | Action | Notes |
|-----------|--------|-------|
| `tests/components/CountdownBar.test.tsx` | Create | Bar rendering, ref attachment, a11y attributes |
| `tests/components/InlineFeedback.test.tsx` | Create | Correct/incorrect display, aria-live, a11y |
| `tests/components/GameStatus.test.tsx` | Modify | Add barRef prop, CountdownBar presence |
| `tests/hooks/useRoundTimer.test.ts` | Modify | Countdown display, barRef updates, freeze |
| `tests/components/RoundFeedback.test.tsx` | Delete | Component removed |
| `tests/a11y/accessibility.test.tsx` | Modify | Replace RoundFeedback tests with InlineFeedback + CountdownBar |
| `tests/pages/MainPage.test.tsx` | Modify | Verify inline feedback in formula area |

## Build & Verify

```bash
npm run build        # TypeScript type-check + Vite production build
npm run test         # Full test suite (must be all green)
npm run lint         # ESLint check
```

## Architecture Notes

- **Timer pattern**: `useRoundTimer` writes directly to DOM via refs (`displayRef`, `barRef`) using `requestAnimationFrame` — bypasses React rendering for 60fps animation.
- **CSS Modules**: All components use `*.module.css` with `styles.className` pattern.
- **No new dependencies**: Everything uses existing React, Vitest, and CSS capabilities.
- **Constitution compliance**: Static SPA (Principle IV), accessibility-first (Principle I), test-first (Principle V).
