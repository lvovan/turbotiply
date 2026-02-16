# Research: Score Sparkline Grid

**Feature**: 013-score-sparkline-grid  
**Date**: 2026-02-16  
**Status**: Complete

## 1. SVG ViewBox Strategy for Proportional Width

**Decision**: Dynamic viewBox width, computed from data count.

**Rationale**: A dynamic viewBox (e.g., `viewBox="0 0 ${gutterWidth + count * unitWidth} 100"`) naturally makes the SVG narrower with fewer data points. The browser scales it to fit `width: 100%` while respecting `max-width` and aspect ratio. Each game column occupies a consistent visual width regardless of total count.

**Alternatives considered**:
- Fixed viewBox with CSS clipping: Wastes space and complicates coordinate math.
- Fixed viewBox with empty columns: Contradicts spec requirement for "shorter" chart with fewer games.

**Constants**:
- `MAX_GAMES = 10`
- `UNIT_WIDTH = 30` (SVG units per game column)
- `Y_LABEL_GUTTER = 24` (left margin for Y-axis labels)
- `CHART_HEIGHT = 100` (SVG units)

## 2. Guide Line Spacing

**Decision**: Every 10 points → lines at 0, 10, 20, 30, 40, 50 (6 lines total).

**Rationale**: At ~100px rendered height, the usable plot area is ~80–90px. With 6 horizontal lines, spacing is ~16px between lines — readable but compact. Every 5 points (11 lines) would create ~8px spacing, causing visual clutter and label overlaps. Score intervals of 10 are cognitively easy for children to estimate against. The 0 line coincides with the X-axis, so there are effectively 5 guide lines (10, 20, 30, 40, 50) plus the axis.

**Alternatives considered**:
- Every 5 points (11 lines): Too dense for compact chart, label overlap risk.
- Every 25 points (3 lines at 0/25/50): Too sparse for useful comparison.

## 3. Y-axis Label Rendering

**Decision**: SVG `<text>` elements with `textAnchor="end"`, `dominantBaseline="central"`, font-size ~8 SVG units, positioned within a 24-unit left gutter.

**Rationale**: Right-aligned labels (`textAnchor="end"`) prevent misalignment between 1-digit and 2-digit values. `dominantBaseline="central"` vertically centers labels on their guide lines (more reliable cross-browser than `dy` hacks). Font-size of 8 SVG units renders at ~8px at the 100px chart height — readable but not dominant. The 24-unit gutter fits "50" with padding.

**Alternatives considered**:
- Labels outside the viewBox: Causes clipping on narrower containers.
- Larger font: Competes with the data line and guide lines.

## 4. Accessibility

**Decision**: Keep `role="img"` + `aria-label` on `<svg>`. Update aria-label to include scale context. Mark all child elements (`<g>` containing axes, grid, labels, polyline) as `aria-hidden="true"`.

**Rationale**: The WCAG-recommended pattern for data visualization is a single image role with a descriptive label. Screen readers announce the SVG as one image element. All grid lines, axis lines, tick marks, labels, and the polyline are visual-only — the textual summary already conveys the data. Adding `<title>` inside the SVG provides a tooltip and fallback.

**Updated aria-label format**: `"Score progression: {count} games, from {first} to {last}, scale 0 to 50"`

## 5. Visual Hierarchy via CSS

**Decision**: CSS module classes for colors/opacity/stroke-width, SVG attributes only for geometry (coordinates).

**Visual hierarchy** (most to least prominent):

| Element | stroke-width | opacity | Light color | Dark color |
|---------|-------------|---------|-------------|------------|
| Data line | 2 | 1.0 | `currentColor` (#888) | `currentColor` (#aaa) |
| Axis lines | 1.5 | 1.0 | #555 | #999 |
| Tick marks | 1 | 1.0 | #555 | #999 |
| Guide lines | 0.5 | 0.5 | #ccc | #555 |
| Guide labels | — | 1.0 | #888 (fill) | #aaa (fill) |

**Rationale**: CSS provides dark mode support via `prefers-color-scheme`, clean separation of concerns, and matches the existing codebase pattern. Axis lines are at least twice as prominent as guide lines (satisfying SC-004).

## 6. preserveAspectRatio

**Decision**: Switch from `"none"` to `"xMinYMid meet"`.

**Rationale**: With `"none"`, the SVG stretches to fill its container, distorting grid lines. With a grid, uniform scaling is essential so grid squares remain proportional and stroke widths are consistent. `"meet"` ensures the entire viewBox is visible without clipping. `"xMinYMid"` left-aligns the chart (where the Y-axis is) rather than centering, which is more natural for a left-to-right progression chart.

**Alternatives considered**:
- `"xMidYMid meet"`: Centers the chart, which looks awkward when the chart is narrow (few games).
- Keep `"none"`: Distorts grid lines and text — unusable with a grid.

## 7. Coordinate Mapping Summary

**Plot area**: X from `Y_LABEL_GUTTER` to `Y_LABEL_GUTTER + count * UNIT_WIDTH`; Y from `PAD` (top, score=50) to `CHART_HEIGHT - PAD` (bottom, score=0).

**Score-to-Y mapping**: `y = PAD + (1 - score / 50) * (CHART_HEIGHT - 2 * PAD)`

**Game-to-X mapping**: `x = Y_LABEL_GUTTER + (i + 0.5) * UNIT_WIDTH` (center of each column, or `Y_LABEL_GUTTER + i * UNIT_WIDTH` for left-edge)

**Tick marks**: Small vertical lines (3–4 SVG units tall) at each game X position, extending below the X-axis line.
