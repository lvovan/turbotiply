# Quickstart: Minor UI Polish

**Feature**: 016-minor-ui-polish  
**Branch**: `016-minor-ui-polish`

## Prerequisites

- Node.js (LTS)
- npm

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173 in a browser.

## What to verify

### Change 1: Copyright footer on Welcome Screen
1. Open the app (http://localhost:5173/)
2. Verify "© 2025, Luc Vo Van - Built with AI" appears at the bottom of the screen
3. Resize to 320px wide — confirm no overlap with interactive elements
4. Confirm text is small and muted (not visually dominant)

### Change 2: Compact heading on Main Menu
1. Create/select a player to reach the main menu (/play)
2. On a 320×568 viewport, verify "Ready to play?" heading, instructions, scores, and mode selector are all visible without scrolling
3. On desktop, verify the heading is still readable and proportional

### Change 3: Top 3 scores only
1. Play 4+ games as the same player
2. Return to the main menu
3. Verify only 3 scores are shown with medals (🥇🥈🥉)
4. Play only 2 games with a new player — verify 2 scores shown (no empty rows)

### Change 4: Sparkline on result screen
1. Play 2+ games as the same player
2. After completing the second game, verify the sparkline graph appears above the round-by-round table
3. Verify the sparkline includes the just-completed game as the rightmost data point
4. With a brand-new player (1 game), verify no sparkline is shown

## Tests

```bash
npm test
```

Key test files to check:
- `tests/pages/WelcomePage.test.tsx` — copyright text presence
- `tests/pages/MainPage.test.tsx` — top-3 scores, sparkline on result
- `tests/components/ScoreSummary.test.tsx` — sparkline rendering in ScoreSummary
