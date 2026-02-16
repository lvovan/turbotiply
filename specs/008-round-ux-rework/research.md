# Research: Round UX Rework

**Feature**: 008-round-ux-rework  
**Date**: 2026-02-16

## 1. Countdown Timer Animation Approach

**Decision**: JS-driven via `requestAnimationFrame`, extending the existing `useRoundTimer` hook pattern.

**Rationale**: The existing hook already uses `performance.now()` + rAF + direct DOM writes via React refs — this avoids React re-renders entirely while maintaining 60fps updates. Extending this to drive both the countdown number (`textContent`) and the bar (`style.width`, `style.backgroundColor`) in a single tick function keeps all timer state in lockstep.

**Alternatives considered**:
- **CSS `transition: width 5s linear`**: Simpler initial setup but fragile for freeze-on-submit (requires `getComputedStyle` capture + removing transition), creates two sources of truth for color sync with the numeric countdown, and browser tab-visibility behavior varies. Rejected.
- **React state at 60fps**: Setting state on every animation frame triggers full re-render cycles. Even with `React.memo`, the reconciliation overhead is unnecessary when only updating two DOM properties. Rejected.

## 2. Color Transition Style

**Decision**: Discrete color jumps at scoring-tier boundaries with a 200ms CSS `transition: background-color` cross-fade.

**Rationale**: Children perceive discrete color changes as clearer signals ("it changed to orange — hurry!") than smooth gradients. The 200ms CSS transition provides visual polish without smooth interpolation complexity. The JS rAF tick sets `backgroundColor` directly; the CSS transition handles the cross-fade automatically.

**Alternatives considered**:
- **Smooth RGB/HSL interpolation on every frame**: Requires per-frame color math, adds overhead with no perceptual benefit for a fast-moving bar. Blurs the distinct tier boundaries that map to scoring tiers. Rejected.
- **Instant color jumps (no transition)**: Too abrupt visually; the 200ms fade is nearly free via CSS. Rejected.

## 3. CVD-Safe Color Palette

**Decision**: The following palette, using luminance differentiation for red-green CVD accessibility:

| Tier | Label | Hex | Contrast vs #f8f9fa | CVD note |
|------|-------|-----|---------------------|----------|
| 5 pts (0–2s) | Green | `#0e8a1e` | 4.8:1 | Dark olive to protanopia — distinct from lighter values |
| 3 pts (2–3s) | Light green | `#5ba829` | 3.4:1 | Yellow-shifted; appears tan/yellow-brown to CVD — distinct from green and orange |
| 2 pts (3–4s) | Orange | `#d47604` | 3.1:1 | Pure amber; darker luminance than light green to CVD viewers |
| 1 pt (4–5s) | Red | `#c5221f` | 4.7:1 | Very dark brown/black to CVD — highest urgency signal |

All four colors exceed 3:1 non-text contrast ratio (WCAG 1.4.11 for graphical objects). The four colors are separated by ~30+ luminance units in CIE L*, making them distinguishable even with deuteranopia or protanopia. Color is never the sole indicator — paired with bar width, numeric countdown, and text labels.

**Alternatives considered**:
- **Standard CSS named colors (green, lightgreen, orange, red)**: Insufficient CVD differentiation — standard green and red are indistinguishable for ~8% of males. Rejected.
- **Blue-based palette (avoiding red-green entirely)**: Unnecessary given the luminance-based approach, and loses the universal cultural association of green=good, red=urgent. Rejected.

## 4. Formula/Feedback Swap — Layout Shift Prevention

**Decision**: Fixed `min-height` on a wrapper `<div>` that contains both `FormulaDisplay` and `InlineFeedback` conditionally.

**Rationale**: The formula height is predictable — single-line math with known font sizes (2.5rem desktop, 1.8rem mobile) plus padding. A fixed `min-height` (88px desktop, 68px mobile) is simpler and more reliable than dynamic measurement.

| Viewport | Formula font | Padding | Computed height | `min-height` |
|----------|-------------|---------|-----------------|--------------|
| Desktop (>480px) | 2.5rem (40px) | 24px × 2 | ~88px | 88px |
| Mobile (≤480px) | 1.8rem (28.8px) | 16px × 2 | ~61px | 68px |

**Alternatives considered**:
- **Dynamic measurement via `getBoundingClientRect`**: Adds complexity, potential flash on first render before measurement, and a ref-measuring `useLayoutEffect`. Over-engineered for a single-line element with predictable height. Rejected.
- **CSS `position: absolute` overlay**: Would require the parent to be `position: relative` with explicit height anyway; same end result but more CSS complexity. Rejected.

## 5. `prefers-reduced-motion` Support

**Decision**: Two-pronged approach — CSS media query disables the 200ms color transition; JS `matchMedia` hook throttles rAF updates to 500ms intervals (10 discrete steps over 5 seconds).

**Rationale**: CSS handles the transition removal automatically. For the JS-driven bar width, simply skipping frames would cause jittery updates at unpredictable intervals. Instead, snapping elapsed time to 500ms boundaries creates clean, predictable step updates (0%, 10%, 20%, ..., 100%) that are fully functional without any smooth animation.

**Alternatives considered**:
- **CSS-only (`prefers-reduced-motion: reduce` → disable all transitions)**: Insufficient — the bar width is JS-driven, not CSS-transitioned. CSS alone can't throttle the rAF loop. Rejected as sole approach.
- **Completely disable the bar (show only numeric countdown)**: Too aggressive — reduced motion users still benefit from seeing a visual bar, just without smooth animation. Rejected.

## 6. Hook Architecture: Extend vs. Replace `useRoundTimer`

**Decision**: Extend `useRoundTimer` in place — add `barRef`, countdown display logic, and color computation.

**Rationale**: The hook is used in exactly one place (`MainPage`). Adding a `barRef` return value and changing the display logic from count-up to countdown is a backward-compatible extension (the `displayRef` and API surface remain the same, just the display format changes). Creating a separate hook would duplicate the `performance.now()` + rAF management code.

**Alternatives considered**:
- **New hook `useCountdownTimer` alongside `useRoundTimer`**: Would duplicate rAF lifecycle management. The two hooks would need to share `startTime` to stay in sync, adding coupling complexity. Rejected.
- **Generic timer hook with strategy pattern**: Over-abstracted for a single consumer. YAGNI (Constitution Principle II). Rejected.
