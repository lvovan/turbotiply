# Component Contracts: Score Display Rework

**Feature**: 006-score-display  
**Date**: 2026-02-16

---

## RecentHighScores (new component)

**Purpose**: Displays a ranked list of the player's most recent game scores in a "high score" aesthetic.  
**Location**: `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.tsx`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| scores | `GameRecord[]` | yes | Sorted by score descending (from `getRecentHighScores()`). May be empty. |
| isEmpty | `boolean` | yes | `true` when the player has 0 completed games (show encouraging message). |

### Behavior

- When `isEmpty` is `true`: renders a friendly encouraging message ("Play your first game to see your scores here!") in an italic, muted style
- When `isEmpty` is `false` and `scores.length > 0`: renders a ranked ordered list
  - Rank indicators: 🥇 (1st), 🥈 (2nd), 🥉 (3rd), "4th", "5th"
  - Score values displayed as "N points"
  - Top score row (#1) visually emphasized: `font-size: 1.25rem`, `font-weight: 700`, warm background (`#FFF8E1`), left border accent (`#FFB300`)
  - Rows 2–5: `font-size: 1rem`, `font-weight: 500`, white/neutral background

### Accessibility

- Semantic markup: `<section aria-labelledby>` + `<h2>` heading + `<ol aria-label="Recent high scores, ranked highest to lowest">`
- Medal emojis marked `aria-hidden="true"` (decorative — screen reader alt text is redundant)
- Each `<li>` includes a `.sr-only` span: "1st place: N points", "2nd place: N points", etc.
- Screen reader experience: "Recent High Scores, heading level 2. List, 5 items. 1 of 5: 1st place: 42 points. 2 of 5: 2nd place: 38 points. ..."
- Empty-state message uses `<p>` with appropriate color contrast (≥5.5:1)

### Styling (CSS Module: `RecentHighScores.module.css`)

- Vertical stacked layout, `flex-direction: column`, `gap: 4px`
- `max-width: 360px`, centered with `margin: 16px auto`
- Heading: `font-size: 1.125rem`, `font-weight: 700`, centered
- Score values use `font-variant-numeric: tabular-nums` for aligned digits
- `@media (max-width: 320px)`: reduce heading to `1rem`, top score to `1.125rem`
- Dark mode support via `@media (prefers-color-scheme: dark)`

---

## ProgressionGraph (new component)

**Purpose**: Renders a small inline SVG sparkline showing the player's score progression over their full game history.  
**Location**: `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| history | `GameRecord[]` | yes | Full game history in chronological order (from `getGameHistory()`). |

### Behavior

- Returns `null` if `history.length < 2` (per FR-011: no graph for fewer than 2 games)
- Renders an `<svg>` element with:
  - `viewBox="0 0 300 100"` (coordinate space; actual width is 100% via CSS)
  - `preserveAspectRatio="none"` for fluid container filling
  - A `<polyline>` mapping each game score to a point:
    - x = `(index / (count - 1)) * 300` (even spacing)
    - y = `pad + ((max - score) / range) * (height - 2 * pad)` (inverted Y for SVG)
  - Padding of 4px top/bottom so line doesn't clip edges
  - `stroke="currentColor"` for theme inheritance
  - `strokeWidth={2}`, `strokeLinejoin="round"`, `strokeLinecap="round"`
  - `fill="none"` (line chart, no area fill)

### Accessibility

- `role="img"` on `<svg>` element
- `aria-label` with descriptive text: "Score progression: N games, from X to Y"
- `<title>` element inside SVG for tooltip: same text as `aria-label`
- No interactive elements — purely informational

### Styling (CSS Module: `ProgressionGraph.module.css`)

- `max-height: 100px`, `width: 100%`
- Muted stroke color via `color` property (inherits from parent or set directly)
- `@media (max-width: 320px)`: reduce max-height to `80px`
- `margin: 8px auto`, `max-width: 360px`

---

## PlayerCard (modified)

**Location**: `frontend/src/components/PlayerCard/PlayerCard.tsx`

### Changes

- Average computation changes from:
  ```tsx
  const avgScore = player.gamesPlayed > 0
    ? `Avg: ${Math.round(player.totalScore / player.gamesPlayed)}`
    : '—';
  ```
  to:
  ```tsx
  import { getRecentAverage } from '../../services/playerStorage';

  const recentAvg = getRecentAverage(player, 10);
  const avgScore = recentAvg !== null ? `Avg: ${recentAvg}` : '—';
  ```

- No props changes
- No layout changes
- No accessibility changes (existing ARIA labels are sufficient)

---

## MainPage (modified)

**Location**: `frontend/src/pages/MainPage.tsx`

### Changes to `not-started` state

The `not-started` JSX block is enhanced with player data lookup, RecentHighScores, and ProgressionGraph.

**New imports**:
- `getPlayers`, `getRecentHighScores`, `getGameHistory` from `../../services/playerStorage`
- `RecentHighScores` component
- `ProgressionGraph` component
- `GameRecord` type

**New logic** (before JSX return):
```tsx
// Look up current player from storage
const currentPlayer = session
  ? getPlayers().find(p => p.name.toLowerCase() === session.playerName.toLowerCase())
  : null;

const recentScores = currentPlayer ? getRecentHighScores(currentPlayer, 5) : [];
const gameHistory = currentPlayer ? getGameHistory(currentPlayer) : [];
const hasNoGames = !currentPlayer || (currentPlayer.gamesPlayed === 0);
```

**Modified JSX** (`not-started` block):
```tsx
{gameState.status === 'not-started' && (
  <>
    <h1>Ready to play?</h1>
    <p>Answer 10 multiplication questions as fast as you can!</p>
    <RecentHighScores scores={recentScores} isEmpty={hasNoGames} />
    {gameHistory.length >= 2 && <ProgressionGraph history={gameHistory} />}
    <button onClick={handleStartGame}>Start Game</button>
  </>
)}
```

### No changes to other states

`playing`, `replay`, and `completed` states are unchanged.
