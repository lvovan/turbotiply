# Research: Score Display Rework

**Feature**: 006-score-display  
**Date**: 2026-02-16

## R1: Progression Graph Visualization Approach

**Decision**: Pure inline SVG (`<svg>` + `<polyline>`)

**Rationale**: Zero bundle cost (0 KB added), full accessibility control (custom `role="img"`, `aria-label`, `<title>`), native responsive scaling via `viewBox` + `width: 100%`, and no maintenance risk from third-party dependencies. The application currently has only 3 runtime dependencies (react, react-dom, react-router-dom); adding a charting library for a single sparkline violates the Constitution's YAGNI principle (II. Simplicity & Clarity). With ≤100 data points, the SVG math is ~5 lines of coordinate mapping — trivial complexity.

**Alternatives considered**:

| Option | Bundle (gzip) | Rejected because |
|---|---|---|
| Recharts | ~45–55 KB | Pulls in d3 subset; roughly doubles app JS payload for a single sparkline with no interactivity. Poor YAGNI alignment. |
| react-sparklines | ~4 KB | Last published 2017, no React 18/19 support, deprecated lifecycle methods, no TypeScript types. |
| @fnando/sparkline | ~1 KB | Vanilla JS with imperative DOM manipulation — fights React's model, requires useRef+useEffect glue. |
| peity | ~2 KB | jQuery dependency, unmaintained. |

**Implementation sketch**: Component receives `scores: number[]`, computes SVG `<polyline>` points by mapping game index to x and score to y within a `viewBox`. Uses `preserveAspectRatio="none"` for fluid width, `stroke="currentColor"` for theme inheritance, and returns `null` when fewer than 2 data points (FR-011).

**Accessibility**: `role="img"`, `aria-label` with summary text (e.g., "Score progression: 15 games, from 20 to 45"), and `<title>` element for tooltip. SVG stroke/fill is decorative and paired with text alternative.

---

## R2: High Score Visual Treatment

**Decision**: Medal emojis (🥇🥈🥉) for ranks 1–3, ordinal text ("4th", "5th") for ranks 4–5. Top score row gets larger font (1.25rem) and warm background highlight (`#FFF8E1` with `#FFB300` left border).

**Rationale**: Medal emojis are instantly recognizable for children aged 6–12, render at zero cost on all modern devices, and carry accessible names in screen readers. The warm highlight for the top score provides clear visual hierarchy without animation (avoids `prefers-reduced-motion` issues and cognitive overload for younger children). All colors pass WCAG AA contrast requirements on both light and dark backgrounds.

**Alternatives considered**:

| Option | Rejected because |
|---|---|
| Gold/silver/bronze background colors for each rank | Color-only indicators fail colorblind users; overly colorful clashes with the clean design system |
| Numbered badges (custom shapes) | More CSS overhead for marginal visual improvement over emojis |
| CSS animation for top score | Fails `prefers-reduced-motion`; distracting for attention-sensitive children |

**Color values (all pass WCAG AA 4.5:1)**:

| Element | Color | Background | Contrast |
|---|---|---|---|
| Score text (all rows) | `#333333` | `white` | 12.6:1 |
| #1 row text | `#333333` | `#FFF8E1` | 11.4:1 |
| #1 left border (decorative) | `#FFB300` | — | N/A |
| Rank ordinal text (4th/5th) | `#666666` | `white` | 5.7:1 |
| Empty-state text | `#666666` | `#fafafa` | 5.5:1 |

**Layout**: Vertical stacked `<ol>` with compact 4px gap, max-width 360px. Fits within 360×640 viewport alongside heading, subtext, start button, and future progression graph (~216px for 5 rows, leaving ~200px for graph).

**Semantic HTML**: `<section aria-labelledby>` + `<h2>` + `<ol aria-label>`. Medal emojis marked `aria-hidden="true"` (decorative); each `<li>` includes a `.sr-only` span with explicit announcement text: "1st place: 42 points".

---

## R3: localStorage Migration Strategy (v3→v4)

### R3.1: `gameHistory` field typing

**Decision**: Optional (`gameHistory?: GameRecord[]`)

**Rationale**: Honestly models the pre-migration JSON shape. Before `readStore()` runs migration, raw `JSON.parse()` output will not have the field. All consumers use helper functions (`getRecentAverage`, `getRecentHighScores`, `getGameHistory`) that handle `undefined` via `player.gameHistory ?? []`.

### R3.2: Retain `totalScore` and `gamesPlayed`

**Decision**: Keep both fields

**Rationale**: Zero-cost backward compatibility (protects against SPA rollback/cached older version), useful as cross-check during development, spec explicitly permits retention (FR-005). Ongoing maintenance cost is one extra line in `updatePlayerScore()`.

### R3.3: Single synthetic record for migration

**Decision**: Create exactly one synthetic `GameRecord` per player with `gamesPlayed > 0`

**Rationale**: Spec FR-005 mandates "a single synthetic game record." This is the only honest representation: we know the average (`Math.round(totalScore / gamesPlayed)`) and last activity time (`lastActive`), but not individual scores. Alternative approaches (proportional copies, random variance) fabricate data that would mislead the graph and average.

**Behavior**: After migration, a player with 50 prior games shows a "last 10" average based on 1 data point. Within 10 real games, the average becomes fully real. The graph requires 2+ points, so no graph appears until the player completes 1 more game post-migration — honest and self-healing.

### R3.4: 100-record cap enforcement

**Decision**: Enforce on write only (in `updatePlayerScore()`), not during migration

**Rationale**: Migration creates at most 1 record per player — can never exceed 100. The cap is a write-time invariant, matching the existing pattern where the 50-player cap is enforced in `writeStore()`, not `readStore()`. Implementation: `if (player.gameHistory.length > 100) player.gameHistory = player.gameHistory.slice(-100)`.

---

## R4: Average Rounding Behavior

**Decision**: Round to nearest integer via `Math.round()`

**Rationale**: Matches the existing behavior in PlayerCard (`Math.round(player.totalScore / player.gamesPlayed)`). Display format remains "Avg: N" (integer). Fractional scores would add cognitive load for children and provide no meaningful precision for a 0–50 point range.

---

## R5: Viewport Minimum (Constitution Alignment)

**Decision**: Test at 320px width minimum (not 360px as stated in spec SC-005)

**Rationale**: Constitution Principle III mandates rendering correctly from 320px. The spec references 360px as the "standard 2020+ smartphone" baseline but the constitution supersedes. Both new components (RecentHighScores, ProgressionGraph) must degrade gracefully at 320px — compact styling, slightly reduced font sizes via `@media (max-width: 320px)` breakpoint.
