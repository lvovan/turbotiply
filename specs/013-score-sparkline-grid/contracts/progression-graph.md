# Component Contract: ProgressionGraph

**Feature**: 013-score-sparkline-grid  
**Date**: 2026-02-16  
**Type**: React Component (modified)

## Interface

```typescript
interface ProgressionGraphProps {
  history: GameRecord[];  // Play-mode game records, chronological order
}
```

**Return**: `JSX.Element | null`
- Returns `null` when `history.length < 2`
- Returns an `<svg>` element when `history.length >= 2`

## Behavior Contract

### Input Processing

1. Receive `history: GameRecord[]` (already filtered to play-mode by caller)
2. Take the last `Math.min(history.length, 10)` records
3. Extract `.score` from each record for plotting

### Rendering Rules

| Condition | Behavior |
|-----------|----------|
| `history.length < 2` | Return `null` (no chart) |
| `history.length >= 2 && <= 10` | Render chart with `history.length` data points, proportionally narrower |
| `history.length > 10` | Render chart with exactly 10 data points (last 10) |

### SVG Structure

```
<svg role="img" aria-label="..." viewBox="0 0 {width} 100" preserveAspectRatio="xMinYMid meet">
  <title>...</title>
  <g aria-hidden="true">          ← grid group (decorative)
    <line ... />                   ← Y-axis line
    <line ... />                   ← X-axis line
    {for each guide value}
      <line ... />                 ← horizontal guide line (faded)
      <text ... />                 ← numeric label (e.g., "10", "20")
    {for each data point}
      <line ... />                 ← X-axis tick mark
  </g>
  <polyline aria-hidden="true" />  ← score progression line
</svg>
```

### Accessibility

- `role="img"` on `<svg>` element
- `aria-label`: `"Score progression: {count} games, from {firstScore} to {lastScore}, scale 0 to 50"`
- `<title>` element matches `aria-label` content
- All child elements (`<g>`, `<line>`, `<text>`, `<polyline>`) have `aria-hidden="true"`

### Visual Hierarchy

| Element | Visual Weight | Description |
|---------|--------------|-------------|
| Data line (polyline) | Heaviest | `stroke-width: 2`, full opacity, `currentColor` |
| Axis lines (X, Y) | Heavy | `stroke-width: 1.5`, full opacity |
| Tick marks | Medium | `stroke-width: 1`, full opacity |
| Guide lines | Light | `stroke-width: 0.5`, ~50% opacity |
| Guide labels | Light | Small font (~8px), muted color |

### Coordinate System

- **viewBox width**: `Y_LABEL_GUTTER + count * UNIT_WIDTH` (dynamic, 2–10 games)
- **viewBox height**: Fixed at 100 SVG units
- **Plot area X**: `Y_LABEL_GUTTER` to viewBox width
- **Plot area Y**: `PAD` (top = score 50) to `CHART_HEIGHT - PAD` (bottom = score 0)
- **Score-to-Y**: `y = PAD + (1 - score / 50) * (CHART_HEIGHT - 2 * PAD)`

## CSS Module Contract

### Classes

| Class | Purpose | Dark mode override |
|-------|---------|-------------------|
| `.graph` | Container: `width: 100%`, `max-height: 100px`, `max-width: 360px`, centered | `color: #aaa` |
| `.axis` | X/Y axis lines: stroke #555, width 1.5 | stroke #999 |
| `.guideLine` | Horizontal guide lines: stroke #ccc, width 0.5, opacity 0.5 | stroke #555, opacity 0.4 |
| `.axisLabel` | Y-axis text labels: fill #888, font-size 8px, sans-serif | fill #aaa |
| `.tickMark` | X-axis tick marks: stroke #555, width 1 | stroke #999 |
| `.dataLine` | Score polyline: stroke currentColor, width 2, fill none | (inherits from .graph color) |

### Responsive

- `@media (max-width: 320px)`: `max-height: 80px`

## Caller Contract

The caller (`MainPage.tsx`) is responsible for:
1. Fetching the player's game history via `getGameHistory(player)`
2. Passing the full play-mode history array to `ProgressionGraph`
3. The component internally slices to the last 10 records
4. Conditional rendering (`history.length >= 2`) is handled inside the component

**No changes needed** to `MainPage.tsx`, `playerStorage.ts`, or any other file outside the component.
