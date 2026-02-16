# Research: Minor UI Polish

**Feature**: 016-minor-ui-polish  
**Date**: 2026-02-16

## Research 1: Copyright Footer Positioning

**Decision**: Use `min-height: 100dvh` on `.welcomePage` with `margin-top: auto` on the footer element.

**Rationale**: The `#root` container already sets `min-height: 100vh` / `100dvh` (in `App.css`). The `.welcomePage` div is a flex column child of `#root`. Adding `min-height: 100dvh` to `.welcomePage` ensures the page fills the viewport, and `margin-top: auto` on the footer pushes it to the bottom of the available space. This is a standard CSS flexbox pattern that degrades gracefully — on very short screens, the footer simply flows below the content rather than overlapping it.

**Alternatives considered**:
- Fixed/sticky positioning: Rejected because it would overlap content on small screens and requires z-index management.
- Adding height to `#root` and using `flex: 1`: Would require modifying the shared App.css which could affect other pages.

## Research 2: Compact Heading Size

**Decision**: Apply `font-size: 1.25rem` (20px) to the "Ready to play?" heading and reduce vertical margins. Instructions paragraph remains at `1rem` (16px, the constitutional minimum).

**Rationale**: The current h1 style from `index.css` is `3.2em` (≈51px), which is the primary cause of vertical overflow on small screens. Reducing to `1.25rem` (20px) is still clearly a heading while saving ~31px of vertical space. Combined with tighter margins, this prevents scroll on 320×568 viewports. The `<p>` instructions text already inherits 16px — no change needed, but explicit sizing via a CSS module class ensures stability.

**Alternatives considered**:
- Using `1.5rem` (24px): Still large on compact screens; marginal improvement.
- Using `1rem` (16px): Too small to visually distinguish from body text; heading hierarchy lost.

**Implementation note**: A new `MainPage.module.css` file is needed since MainPage currently uses only inline styles.

## Research 3: Top 3 Scores — Ordinal Rank Handling

**Decision**: Change the `count` parameter from `5` to `3` in the `getRecentHighScores(currentPlayer, 5)` call at MainPage.tsx line 97. No changes needed to the `RecentHighScores` component itself.

**Rationale**: The `RecentHighScores` component already handles variable-length arrays — it renders whatever `scores[]` it receives. The existing medal system shows 🥇🥈🥉 for positions 1–3, with ordinal text ("4th", "5th") for positions 4–5. By limiting to 3 entries, only medal emojis are ever shown, which simplifies the visual and aligns with the podium concept.

**Alternatives considered**:
- Making the count configurable via a prop: Overengineered for a static constant; YAGNI applies.
- Changing it in `getRecentHighScores` default parameter: Would affect any future callers that rely on the default of 5.

## Research 4: Sparkline on Result Screen — Data Timing

**Decision**: Construct the history array for the sparkline by appending the just-completed game's record to the existing `gameHistory` before passing it to `ProgressionGraph`.

**Rationale**: The score persistence `useEffect` in MainPage fires **after** the render that displays `ScoreSummary`. This means `getGameHistory()` called during render does not include the just-completed game. Rather than reorganizing the persistence timing (which would require moving `saveGameRecord` out of the effect and into a callback, with cascading test changes), we append a synthetic `GameRecord` for the current game to the array:

```
const historyWithCurrent = [...gameHistory, {
  score: gameState.score,
  completedAt: Date.now(),
  roundResults: extractRoundResults(gameState.rounds),
  gameMode
}];
```

This ensures the sparkline always includes the latest game, regardless of effect timing. On subsequent renders (after the effect persists), the real record will already be in localStorage and the synthetic append will be a harmless near-duplicate that gets deduplicated by the 10-game display limit.

**Alternatives considered**:
- Moving `saveGameRecord` into the game completion callback (before render): Requires refactoring `useGame` hook and all its tests. Too invasive for this feature.
- Triggering a re-render after effect runs: Wasteful double-render with visible flicker.
- Reading from localStorage after a timeout: Race condition, unreliable.

## Research 5: ScoreSummary Prop Extension

**Decision**: Add an optional `history?: GameRecord[]` prop to `ScoreSummaryProps`. When provided with ≥ 2 entries, render `<ProgressionGraph history={history} />` between the score display and the round-by-round table.

**Rationale**: `ScoreSummary` is a presentational component — it should receive data via props rather than fetching internally. MainPage already computes `gameHistory` and can construct the augmented array (including the current game). The `ProgressionGraph` component handles its own rendering guard (returns `null` for < 2 entries), but the prop being optional means existing callers are unaffected.

**Alternatives considered**:
- Having `ScoreSummary` call `getGameHistory()` internally: Violates the presentational component pattern already established. MMainPage should remain the data owner.
- Creating a wrapper component: Unnecessary complexity for inserting one child.
