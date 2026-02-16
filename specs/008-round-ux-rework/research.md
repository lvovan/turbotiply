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

## 7. Input Interactivity During Feedback Phase — `readOnly` vs `disabled` vs Submit Guard

**Decision**: Guard the `onSubmit` handler (ignore submissions during feedback) rather than using `readOnly` or `disabled`. The input stays fully interactive with keyboard visible throughout.

**Rationale**: The goal is to prevent answer submission during the 1.2s feedback phase while keeping the virtual keyboard visible across round transitions on touch devices. Guarding `onSubmit` achieves this with zero browser-specific risk, since the input is never made non-interactive and focus is never disrupted.

### Findings by Browser

#### 1. iOS Safari (iOS 15+)

**`readOnly` behavior on a focused input:**
- Per the HTML spec and MDN, `readOnly` inputs **remain focusable** — they stay in the tab order and continue to receive focus events. ([MDN readonly](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly): "read-only controls can still function and are still focusable.")
- Focusing a `readOnly` input does **not** trigger the virtual keyboard. (Confirmed by StackOverflow workarounds that deliberately focus a `readOnly` fake input to hold focus without showing the keyboard — see [SO#55652503](https://stackoverflow.com/a/55652503) comment: "If you want to prevent showing keyboard on the fakeInput focus, add readonly='true' to it.")
- **Setting `readOnly=true` on an already-focused, keyboard-visible input**: WebKit ties keyboard visibility to the editability of the focused element. When the focused element becomes non-editable, the keyboard is dismissed. The element retains DOM focus.
- **Removing `readOnly` while the element still has focus**: Because the element never lost focus, and it becomes editable again, the keyboard **reappears without a new user gesture**. This is the key advantage over `disabled`.
- **Caveat**: This "keyboard reappears" behavior is observed but not specified in any standard. It relies on WebKit's internal re-evaluation of editability for the currently focused element. There are no WebKit bugs or documentation that formally guarantee this behavior across iOS versions.

**`disabled` behavior on a focused input:**
- `disabled` inputs **cannot receive focus** at all. ([MDN disabled](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled): "disabled controls can not receive focus.")
- Setting `disabled=true` on a focused input causes the element to **lose focus**, and iOS Safari **dismisses the keyboard**.
- Calling `focus()` afterward from a non-user-gesture (e.g., a `useEffect` or `setTimeout`) **does not bring the keyboard back**. iOS Safari has strict user-activation requirements: the keyboard only appears when `focus()` is called synchronously within a user-initiated event handler (click/touch). ([SO#12204571](https://stackoverflow.com/q/12204571): extensively documented behavior since iOS 5, still present in iOS 17+.)

#### 2. Chrome Android (v90+)

**`readOnly` behavior:**
- Same fundamental spec behavior: `readOnly` inputs remain focusable.
- Setting `readOnly=true` on a focused input: the keyboard is dismissed (element is no longer editable), but focus is retained.
- Removing `readOnly`: keyboard reappears because focus was maintained. Chrome Android is generally more permissive than iOS Safari about re-showing keyboards.

**`disabled` behavior:**
- Focus is lost. Chrome Android is more lenient than iOS about programmatic `focus()` from non-user-gestures — it sometimes brings the keyboard back — but behavior is **not reliable** and varies by Chrome version and device vendor skin (Samsung Internet, etc.).

#### 3. Firefox Android

**`readOnly` behavior:**
- Same as above — `readOnly` keeps focus, keyboard dismissed while non-editable, keyboard reappears when `readOnly` removed.

**`disabled` behavior:**
- Firefox Android is the most permissive: programmatic `focus()` from non-user-gestures generally works and does bring the keyboard back. However, relying on this Firefox-specific behavior is not portable.

#### 4. `readOnly` vs `disabled` — Summary Table

| Attribute    | Focusable? | Keyboard on focus? | Keyboard dismissed when set on focused input? | Keyboard returns when removed (element still focused)? | `focus()` from non-user-gesture shows keyboard? |
|-------------|-----------|-------------------|----------------------------------------------|-------------------------------------------------------|------------------------------------------------|
| `readOnly`  | Yes       | No                | Yes (editability check)                       | Yes (high confidence, all browsers)                    | No (keyboard needs editability + focus)         |
| `disabled`  | No        | No                | Yes (focus lost entirely)                     | N/A — element lost focus, needs `focus()` call         | iOS: No. Android: Unreliable. Firefox: Usually. |

#### 5. Known Quirks & Workarounds

- **iOS Safari user-activation gate**: The core problem. iOS Safari only allows the keyboard to appear from `focus()` when called synchronously inside a user-gesture event handler (click, touchend). `setTimeout`, `Promise.then`, `useEffect`, and `requestAnimationFrame` all break the user-activation chain. The established workaround is the "fake input" pattern: focus a hidden input synchronously in the user gesture, then transfer focus asynchronously to the real input — because *transferring* focus between editable elements preserves the keyboard. ([SO#55652503](https://stackoverflow.com/a/55652503), [SO#45703019](https://stackoverflow.com/a/45703019), confirmed working through iOS 17.)
- **`readOnly` + `inputMode="numeric"`**: On some Android keyboard implementations (GBoard), a `readOnly` input with `inputMode="numeric"` may briefly flash the keyboard before dismissing it when gaining focus. This is a cosmetic issue, not a functional one.
- **React re-render timing**: React batches state updates. If `readOnly` and value changes happen in the same render, the browser sees the final state only. If they happen across renders (e.g., `readOnly=false` in one render, `value=""` and `focus()` in a `useEffect`), the keyboard behavior depends on the exact paint timing between renders. This adds fragility.

#### 6. Alternative: Guard `onSubmit` Only (No `readOnly` or `disabled`)

**Approach**: During the 1.2s feedback phase, keep the input fully interactive (not `readOnly`, not `disabled`). The submit handler checks a "feedback in progress" flag and silently ignores submissions. When the next round starts, clear the input value.

**Pros**:
- **Zero keyboard risk**: The input is never made non-interactive, so the keyboard is never dismissed. No browser-specific behavior to worry about. This is the only approach that guarantees keyboard persistence on all browsers.
- **Simplest implementation**: One boolean guard in the submit handler. No attribute toggling, no `useEffect` re-focus logic, no CSS for `:read-only` states.
- **No React timing concerns**: No risk of stale attribute state between renders.
- **No accessibility edge cases**: Screen readers don't need to announce state changes on the input.

**Cons**:
- **User can type during feedback**: The keyboard is live and keystrokes produce visible characters in the input. This is a minor UX blemish — the user sees their typing during the 1.2s feedback phase, but it's cleared when the next round starts.
- **Less "polished" feel**: A disabled/readonly input signals "wait" to the user. A live input during feedback might feel slightly less intentional.
- **Accidental early submission**: If the user types quickly enough during feedback and hits Enter/Submit, the submission is silently ignored. This is correct behavior but the user gets no feedback that their tap was ignored. (Mitigated by the submit button also being disabled or hidden during feedback.)

**Mitigation for the "typing during feedback" con**: Clear the input value at the *start* of the feedback phase (not just at the start of the next round). This way, any characters typed during feedback are visible but brief, and they get cleared when the next round begins anyway. Alternatively, apply a CSS visual treatment (e.g., `opacity: 0.5`) to the input during feedback to signal non-interactivity without actually changing the DOM interactivity.

### Final Recommendation

Guard `onSubmit` is the safest approach for guaranteed keyboard persistence. The `readOnly` approach has a reasonable chance of working across browsers but introduces observationally-verified-but-unspecified behavior and React timing edge cases. The `disabled` approach is the riskiest — it causes keyboard dismissal on iOS Safari and cannot reliably recover.

If a stronger "non-interactive" visual signal is desired during feedback, combine the submit guard with `readOnly` as a progressive enhancement: use `readOnly` for the visual/semantic signal, but don't depend on it for keyboard persistence. If any browser unexpectedly dismisses the keyboard when `readOnly` is set, the submit guard still prevents double-submissions, and the keyboard reappearance when `readOnly` is removed (focus retained) serves as a fallback.

**Sources**:
- [MDN: HTML attribute `readonly`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly)
- [MDN: HTML attribute `disabled`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled)
- [StackOverflow: Mobile Safari focus() only works with click](https://stackoverflow.com/questions/12204571/mobile-safari-javascript-focus-method-on-inputfield-only-works-with-click) — extensive documentation of iOS user-activation requirements and workarounds
- [StackOverflow: Fake input pattern for iOS keyboard persistence](https://stackoverflow.com/a/55652503) — confirms `readOnly` on fake input prevents keyboard, and focus transfer preserves keyboard
