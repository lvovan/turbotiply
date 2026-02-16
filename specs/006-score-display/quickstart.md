# Quickstart: Score Display Rework

**Feature**: 006-score-display  
**Date**: 2026-02-16

---

## Prerequisites

- Node.js (LTS)
- Git
- Branch `006-score-display` checked out

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev          # Start Vite dev server (hot reload)
npm run test:watch   # Run Vitest in watch mode
```

## Key Files to Modify

### Types (start here — other files depend on these)

1. **`src/types/player.ts`** — Add `GameRecord` interface, add optional `gameHistory?: GameRecord[]` to `Player`

### Services (implement after types)

2. **`src/services/playerStorage.ts`** — Add v3→v4 migration in `readStore()`, refactor `updatePlayerScore()` to append `GameRecord` + enforce 100-cap, initialize `gameHistory: []` in `savePlayer()`, add 3 helper functions: `getRecentAverage()`, `getRecentHighScores()`, `getGameHistory()`

### Components — US1 (after services)

3. **`src/components/PlayerCard/PlayerCard.tsx`** — Replace inline average computation with `getRecentAverage(player, 10)` import

### Components — US2 (after services, parallel with US1)

4. **`src/components/GamePlay/RecentHighScores/RecentHighScores.tsx`** — New component: ranked score list with medal emojis
5. **`src/components/GamePlay/RecentHighScores/RecentHighScores.module.css`** — Styles: high-score aesthetic, compact layout
6. **`src/pages/MainPage.tsx`** — Import `RecentHighScores`, add player lookup + rendering in `not-started` block

### Components — US3 (after services, parallel with US1/US2)

7. **`src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`** — New component: inline SVG sparkline
8. **`src/components/GamePlay/ProgressionGraph/ProgressionGraph.module.css`** — Styles: compact sparkline
9. **`src/pages/MainPage.tsx`** — Import `ProgressionGraph`, add to `not-started` block (after US2 integration)

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Graph visualization | Pure inline SVG | 0 KB bundle impact; YAGNI — no chart library for a single sparkline |
| Rank indicators | 🥇🥈🥉 + ordinal text | Fun for kids, zero-cost, accessible emoji alt-text |
| Top score emphasis | Larger font + warm background | Clear hierarchy without animation; respects `prefers-reduced-motion` |
| `gameHistory` typing | Optional (`?:`) | Honestly models pre-migration JSON; consumers use `?? []` |
| `totalScore`/`gamesPlayed` | Retain | Zero-cost backward compat; protects against SPA rollback |
| Migration seed data | Single synthetic record | Per spec FR-005; only honest representation of available data |
| History cap enforcement | Write-only (in `updatePlayerScore`) | Migration creates ≤1 record; matches existing player-cap pattern |
| Average rounding | `Math.round()` to integer | Matches existing behavior; reduces cognitive load for children |

## Verification

```bash
npm run test         # All tests pass
npm run lint         # No lint errors
npm run build        # Clean production build
```

## Testing New Components

After implementation, the following test files should be added:

- `tests/services/playerStorage.test.ts` — extend with tests for `getRecentAverage`, `getRecentHighScores`, `getGameHistory`, v3→v4 migration, `updatePlayerScore` game record appending, 100-cap enforcement
- `tests/components/RecentHighScores.test.tsx` — new: ranked list rendering, empty state, medal indicators, screen reader text
- `tests/components/ProgressionGraph.test.tsx` — new: SVG rendering with 2+ points, null return for <2 points, ARIA attributes
- `tests/a11y/accessibility.test.tsx` — extend with axe tests for RecentHighScores and ProgressionGraph
