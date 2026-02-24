# Component Contract: ScoreSummary Result Column

**Feature**: 027-first-try-result  
**Date**: 2026-02-24

## Contract: ScoreSummary Result Column Rendering

### Input

The `ScoreSummary` component receives `rounds: Round[]` via props. Each `Round` now includes `firstTryCorrect: boolean | null`.

### Rendering Rules

| `firstTryCorrect` value | Result column output | Aria label |
|--------------------------|---------------------|------------|
| `true` | `<span role="img" aria-label="Correct on first try">✅</span>` | "Correct on first try" |
| `false` | `<span role="img" aria-label="Incorrect on first try">❌</span>` | "Incorrect on first try" |
| `null` | Should not occur at render time (game is completed) | N/A |

### CSS

- The `.correctBadge` and `.incorrectBadge` classes remain on the `<span>` elements for test selector stability.
- The `color` property is removed from both classes (emoji characters use their own built-in colors).
- `font-weight` may be retained or removed (no visible effect on emoji).

### Behavioral Contract

1. The Result column MUST use `r.firstTryCorrect` (not `r.isCorrect`) to determine which emoji to display.
2. The rendering is a pure function of `firstTryCorrect` — no other fields influence the Result column indicator.
3. Row coloring (`getRowClass`) continues to use `round.points` and is not affected by this change.

---

## Contract: gameEngine — `firstTryCorrect` Lifecycle

### handleStartGame

Each round is initialized with `firstTryCorrect: null`.

### handleSubmitAnswer (status: 'playing')

Sets `firstTryCorrect: isCorrect` on the round object, alongside `playerAnswer`, `isCorrect`, `elapsedMs`, and `points`.

### handleSubmitAnswer (status: 'replay')

Overwrites `playerAnswer`, `isCorrect`, `elapsedMs`, and `points` (to `null`), but **preserves** `firstTryCorrect` from the primary phase. The round spread must explicitly carry forward `firstTryCorrect` from the existing round.

### Invariant

At `status: 'completed'`, for all `rounds[0..9]`: `firstTryCorrect !== null`.
