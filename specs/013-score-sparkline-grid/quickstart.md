# Quickstart: Score Sparkline Grid

**Feature**: 013-score-sparkline-grid  
**Date**: 2026-02-16

## What Changed

The `ProgressionGraph` component is enhanced from a bare sparkline (single polyline) to a gridded chart with:
- Clear X-axis and Y-axis lines
- Faded horizontal guide lines at score intervals of 10 (0, 10, 20, 30, 40, 50)
- Numeric labels on the Y-axis at each guide line position
- Small tick marks on the X-axis at each game position
- Fixed Y-axis range of 0–50
- Proportional chart width based on number of games (2–10)

## Files Modified

| File | Change |
|------|--------|
| `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.tsx` | Add grid elements (axes, guide lines, labels, ticks), dynamic viewBox, fixed Y range |
| `frontend/src/components/GamePlay/ProgressionGraph/ProgressionGraph.module.css` | Add CSS classes for axis, guideLine, axisLabel, tickMark, dataLine with dark mode |
| `frontend/tests/components/ProgressionGraph.test.tsx` | Add tests for grid, axes, guide lines, proportional width, fixed range |

## How to Verify

```bash
cd frontend

# Run tests
npm test

# Start dev server and check visually
npm run dev
```

1. Open the app, select or create a player with 2+ completed play-mode games
2. Navigate to the pre-game screen (after selecting the player)
3. Verify the sparkline shows a grid with axis lines, guide lines, and labels
4. Create a player with 10+ games and verify the chart shows exactly 10 data points
5. Create a player with 3 games and verify the chart is proportionally narrower
6. Check on a 320px-wide viewport — chart should scale down properly
7. Toggle dark mode — chart colors should adapt

## Key Design Decisions

- **No new dependencies** — pure SVG, no charting library
- **Fixed 0–50 Y range** — charts are comparable across sessions
- **Dynamic viewBox width** — chart is narrower with fewer games, not stretched
- **`preserveAspectRatio="xMinYMid meet"`** — left-aligned, uniform scaling
- **Guide lines every 10 points** — balanced between detail and compactness
- **Scores below 0 clipped to 0** — negative scores (rare) render at the bottom
