````markdown
# Research: Core Gameplay

**Feature**: 002-core-gameplay
**Date**: 2026-02-15
**Status**: Complete — all unknowns resolved

## Research Topics

### 1. React Game State Machine Pattern

**Decision**: `useReducer` with a pure reducer function in a standalone `gameEngine.ts` service.

**Rationale**: The game has four distinct states (`not-started`, `playing`, `replay`, `completed`) with ~6 well-defined transitions. The reducer function lives in `gameEngine.ts` as a pure exported function — completely decoupled from React. The `useGame` hook wraps it with `useReducer` and exposes a clean API. This makes the game engine testable without React rendering and ensures all state transitions are explicit and atomic.

**Alternatives Considered**:
- **Multiple `useState` hooks**: With 6+ pieces of interdependent state (status, round index, score, replay queue, feedback phase), keeping them in sync is fragile. A single dispatch touching all fields atomically is safer.
- **XState / state machine library**: Overkill for 4 states and ~6 transitions. Adds ~15KB dependency and violates Simplicity & Clarity principle.
- **Context + useReducer**: Game state is used in one component subtree (MainPage → GamePlay children). No need for context — props or a single `useGame` hook suffice.
- **Inline reducer**: Defining the reducer inside the hook loses testability. The key insight is placing the reducer in `gameEngine.ts` as a pure function testable without `renderHook`.

---

### 2. Unique Formula Generation Algorithm

**Decision**: Pre-compute all 78 unordered pairs {A, B} where 1 ≤ A ≤ B ≤ 12, Fisher-Yates shuffle, take first 10. For each selected pair, randomly assign the hidden position (A, B, or C) with uniform ⅓ probability.

**Rationale**: 78 = 12 × 13 / 2 total unique pairs. Shuffling all 78 then slicing 10 guarantees no duplicates by construction — no rejection sampling or dedup checks needed. Fisher-Yates produces a uniformly random permutation. ~15 lines of code. The function is pure — it takes an optional random number source for deterministic testing.

**Alternatives Considered**:
- **Reservoir sampling (Algorithm R)**: Designed for streaming/unknown-size inputs. With only 78 known elements, unnecessarily complex. Fisher-Yates is simpler.
- **Random draw with rejection**: Pick random pair, check if already selected, retry if duplicate. Works but has non-deterministic runtime and requires maintaining a Set for comparison. Shuffle-and-slice guarantees uniqueness structurally.
- **Forced hidden-position balancing** (exactly 3-3-4 split across A/B/C): The spec says "roughly equal probability across rounds" (FR-003). Uniform random per-round achieves this in expectation. Forced balancing reduces randomness for no educational benefit.

---

### 3. Timer Implementation in React

**Decision**: `performance.now()` for elapsed-time measurement (scoring), `requestAnimationFrame` + ref for display updates, separated into a `useRoundTimer` hook.

**Rationale**: Two distinct timing needs:
1. **Measurement** (scoring): `performance.now()` at round start and answer submission. Difference = elapsed time. Sub-millisecond precision, monotonic (immune to system clock adjustments). Satisfies SC-005 (within 100ms of wall-clock time).
2. **Display** (visible timer): A `requestAnimationFrame` loop reads `performance.now() - startTime` and writes directly to a DOM element's `textContent` via ref — zero React re-renders per frame. Updates at ~60fps visually but only triggers a React state update when `stop()` is called with the final elapsed time.

**Alternatives Considered**:
- **`Date.now()` for measurement**: Not monotonic — a system clock correction mid-round would corrupt timing. `performance.now()` is strictly better for interval measurement.
- **`setInterval` at 100ms for display**: Runs when tab is hidden (wasted cycles), accumulates drift. rAF automatically pauses when backgrounded.
- **React state updates at 60fps**: Triggers re-renders of the entire game UI 60×/second. Direct DOM manipulation via ref is the standard React escape hatch for high-frequency visual updates.
- **Web Workers for timing**: Massive overkill for a simple subtraction.

---

### 4. Accessible Timed Feedback

**Decision**: Triple-indicator feedback (color + icon + text), persistent `aria-live="assertive"` region, `setTimeout` with cleanup, input disabled during feedback.

**Visual design per FR-018**:
- **Correct**: Green background + ✓ checkmark icon + "Correct!" text
- **Incorrect**: Red background + ✗ X icon + "Not quite!" text

**Accessibility implementation**:
- A persistent `aria-live="assertive"` region (always in the DOM, initially empty) is populated with feedback text when shown. Screen readers announce immediately.
- `role="status"` is not used — `aria-live="assertive"` on a neutral `<div>` is semantically appropriate for both correct and incorrect outcomes.
- During the 1.2s feedback window, input and submit button are `disabled`, preventing double-submission.
- `setTimeout(advanceToNextRound, 1200)` with cleanup via `clearTimeout` in `useEffect` return.

**Rationale**:
- WCAG 1.4.1 (Use of Color): Icon + text accompany color changes. Color is never the sole indicator.
- `aria-live="assertive"` over `"polite"`: Feedback is time-critical (1.2s visible). `"polite"` may delay announcement past the display window.
- Persistent live region: Dynamically created live regions are unreliable across screen readers. The region must exist at page load.

**Alternatives Considered**:
- **CSS `onAnimationEnd`**: Ties logic to CSS timing. If CSS and JS disagree on duration, state gets out of sync.
- **`role="alert"`**: Implies error/warning semantic. "Correct!" is not an alert. `aria-live` is more neutral.
- **Toast/snackbar library**: External dependency, generic styling, not designed for game feedback timing.
- **Modal/dialog**: Requires dismissal. Spec says feedback auto-advances after 1.2s.

---

### 5. Scoring Model Design

**Decision**: Pure function `calculateScore(isCorrect: boolean, elapsedMs: number): number` with scoring constants in `constants/scoring.ts`. Replay round handling is the caller's responsibility — the scorer does not know about game phases.

**Scoring tiers** (correct answers only):

| Response Time | Points |
|---------------|--------|
| ≤ 2000ms | +5 |
| > 2000–3000ms | +3 |
| > 3000–4000ms | +2 |
| > 4000–5000ms | +1 |
| > 5000ms | 0 |
| Incorrect | –2 |

**Rationale**:
- **Pure function**: No side effects, deterministically testable. `calculateScore(true, 1500) === 5` is trivially verifiable.
- **Replay excluded by caller**: The scoring function shouldn't need an `isReplay` parameter. During replay, the game engine simply records results without calling `calculateScore`. Single-responsibility separation.
- **Threshold ordering**: Checked from fastest to slowest (first match wins). `≤` boundaries mean exactly-on-boundary times (e.g., 2000ms) get the higher tier — more child-friendly.
- **Integer scores**: No floating point. Negative totals are valid per spec edge cases.
- **Constants file**: Scoring thresholds, penalty, and feedback duration as named constants prevent magic numbers and simplify future tuning.

**Alternatives Considered**:
- **Scoring function receives `isReplay` flag**: Mixes concerns. The scorer shouldn't know about game flow.
- **Scoring as a method on a Round class**: Classes add OOP ceremony to a stateless calculation.
- **Rounding elapsed time before scoring**: `performance.now()` gives sub-ms precision. Comparing `elapsedMs <= 2000` directly is correct — rounding introduces edge-case bugs.

---

## Summary Matrix

| Topic | Decision | Key Driver |
|-------|----------|------------|
| State machine | `useReducer` + pure reducer in `gameEngine.ts` | Testability, determinism, atomicity |
| Formula generation | 78 pairs → Fisher-Yates shuffle → take 10 | Correctness guarantee, simplicity |
| Timer | `performance.now()` + rAF for display | Precision, monotonic, no re-renders |
| Accessible feedback | Color + icon + text + `aria-live="assertive"` | WCAG 1.4.1, screen reader reliability |
| Scoring | Pure function + constants file, caller excludes replays | Single responsibility, testability |
````
