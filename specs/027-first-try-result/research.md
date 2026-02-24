# Research: First-Try Result Indicator

**Feature**: 027-first-try-result  
**Date**: 2026-02-24

## Research Task 1: How to preserve first-try correctness through replay

### Context

The `handleSubmitAnswer` function in `gameEngine.ts` overwrites the `Round` object during replay — `isCorrect`, `playerAnswer`, `elapsedMs`, and `points` are all replaced. By game completion, a replayed-then-correct round has `isCorrect: true` and `points: null`, making `isCorrect` unreliable for determining first-try status.

### Decision: Add explicit `firstTryCorrect` boolean to `Round` interface

### Rationale

- **Explicit is better than implicit.** While `points === null && isCorrect === true` could theoretically detect replayed rounds, this is fragile — it fails if scoring logic ever changes, and the meaning is not self-documenting.
- The field is set exactly once during the primary playing phase (when `status === 'playing'`) and never modified during replay.
- Adding a single boolean to `Round` is the minimal data model change. It doesn't break existing code — all existing code that reads `isCorrect` continues to work.
- Field is `boolean | null` (initialized as `null` for unanswered rounds), consistent with the existing `Round` field pattern.

### Alternatives considered

| Alternative | Why rejected |
|---|---|
| Infer from `points !== null` | Fragile coupling to scoring logic; practice mode sets `points` differently; not self-documenting |
| Store separate `firstTryResults[]` array on `GameState` | Redundant parallel array; harder to keep in sync; violates YAGNI |
| Store original `Round` copies before replay overwrites | Over-engineering; duplicates entire round objects for one boolean signal |

### Implementation approach

1. Add `firstTryCorrect: boolean | null` to the `Round` interface in `game.ts`
2. In `handleSubmitAnswer`, when `status === 'playing'`: set `firstTryCorrect: isCorrect` alongside the other field updates
3. In `handleSubmitAnswer`, when `status === 'replay'`: spread the existing round but do NOT overwrite `firstTryCorrect` (it preserves the value from step 2)
4. In `handleStartGame`: initialize `firstTryCorrect: null` for each round

---

## Research Task 2: Emoji accessibility best practices

### Context

FR-004 requires accessible labels for the ✅ and ❌ emojis so screen readers convey meaning.

### Decision: Use `role="img"` with `aria-label` on a `<span>` wrapping each emoji

### Rationale

- The WAI-ARIA best practice for decorative-but-meaningful emoji is `<span role="img" aria-label="description">emoji</span>`.
- This ensures screen readers announce the label text instead of attempting to read the emoji Unicode name (which varies across readers).
- The current implementation already uses `aria-label` on `<span>` elements, so this is a natural extension — just adding `role="img"` for full compliance.
- Label text: "Correct on first try" for ✅, "Incorrect on first try" for ❌ — matches spec FR-004.

### Alternatives considered

| Alternative | Why rejected |
|---|---|
| `aria-hidden="true"` + visually hidden text | More DOM elements for the same outcome |
| `title` attribute | Not reliably announced by screen readers |
| Custom SVG icons | Spec explicitly says "use emojis if possible" |

---

## Research Task 3: CSS impact of switching from Unicode characters to emoji

### Context

Current `.correctBadge` / `.incorrectBadge` classes apply `color` and `font-weight` to Unicode ✓/✗ characters. Emoji characters (✅/❌) have their own built-in colors and are not affected by CSS `color`.

### Decision: Remove CSS `color` from badge classes; keep classes for potential future use but simplify them

### Rationale

- Emoji ✅ and ❌ are inherently colored (green/red) — CSS `color` has no visible effect on emoji rendering in any major browser.
- `font-weight: 700` may slightly affect emoji sizing on some platforms but is harmless. Can be kept or removed.
- The `.correctBadge` and `.incorrectBadge` classes can be retained (empty or with `font-size` adjustment) to provide a hook for future styling, or removed entirely since the emoji is self-styled.

### Implementation approach

- Remove `color` declarations from `.correctBadge` and `.incorrectBadge`.
- Keep classNames on the `<span>` elements for test selectors and potential future styling.
- Optionally set `font-size` on the badge to ensure consistent emoji sizing across platforms.

---

## Research Task 4: Impact on persisted `RoundResult` type

### Context

`extractRoundResults()` maps `rounds[0..9]` to `RoundResult[]` for persistence in `GameRecord`. The `RoundResult` type has: `factorA`, `factorB`, `isCorrect`, `elapsedMs`. Should `firstTryCorrect` be persisted?

### Decision: Do NOT add `firstTryCorrect` to `RoundResult` / persistence

### Rationale

- The spec scope is limited to the post-game results screen display. The `firstTryCorrect` field is only needed during the active game session for rendering the ScoreSummary.
- Adding it to persistence would require a storage migration and increase localStorage usage for no user-facing benefit.
- Historical game records do not display the results table — only the sparkline graph and score.
- If future features need historical first-try data, it can be added then (YAGNI).

### Alternatives considered

| Alternative | Why rejected |
|---|---|
| Add `firstTryCorrect` to `RoundResult` | Storage migration needed; no current consumer; YAGNI |
| Derive from `points` in stored data | Same fragility as Research Task 1; and `points` isn't stored in `RoundResult` anyway |
