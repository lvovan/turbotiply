# Data Model: Score Sparkline Grid

**Feature**: 013-score-sparkline-grid  
**Date**: 2026-02-16

## Entities

### GameRecord (existing — unchanged)

The sparkline reads from the existing `GameRecord` type. No modifications needed.

| Field | Type | Description |
|-------|------|-------------|
| `score` | `number` | Total points for the game (theoretical range: -20 to 50) |
| `completedAt` | `number` | Epoch milliseconds timestamp |
| `rounds` | `RoundResult[]?` | Per-round details (optional, absent for legacy records) |
| `gameMode` | `GameMode?` | `'play'` or `'improve'` (optional, defaults to `'play'`) |

### Player (existing — unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `gameHistory` | `GameRecord[]?` | Ordered list of game results (oldest first), capped at 100 |

### Data Flow

```
Player.gameHistory
  → getGameHistory(player)         // filters to play-mode only
  → slice(-10)                     // last 10 (or fewer)
  → ProgressionGraph component     // renders as SVG sparkline with grid
```

## Chart Layout Constants

These are implementation-level constants derived from the spec and research. They are not stored entities.

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_GAMES` | 10 | Maximum data points on the X-axis |
| `MIN_GAMES` | 2 | Minimum data points to display the chart |
| `Y_MIN` | 0 | Fixed Y-axis floor |
| `Y_MAX` | 50 | Fixed Y-axis ceiling |
| `GUIDE_INTERVAL` | 10 | Score interval between horizontal guide lines |
| `GUIDE_VALUES` | [0, 10, 20, 30, 40, 50] | Y-axis positions for guide lines and labels |

## State Transitions

Not applicable — this feature is a pure rendering enhancement with no state changes. The component receives `history: GameRecord[]` and renders a static chart. No user interaction or state mutation occurs.

## Validation Rules

- Chart is only rendered when `history.length >= 2` (after play-mode filtering)
- Chart displays `min(history.length, 10)` most recent data points
- Scores are plotted against the fixed 0–50 range; scores below 0 are clamped to 0
- All data is read-only (no writes, no mutations)
