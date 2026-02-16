# Research: Touch Answer Keypad

**Feature**: 011-touch-answer-keypad  
**Date**: 2026-02-16

## Research Tasks

### 1. Touch detection via JavaScript APIs

**Context**: The app needs to detect whether the current device has a touchscreen so it can conditionally show the custom numpad (FR-001). The spec says "show numpad on all touch-capable devices," regardless of whether a physical keyboard is also attached.

**Decision**: Use `navigator.maxTouchPoints > 0` as the primary detection method, with `window.matchMedia('(any-pointer: coarse)').matches` as a complementary signal.

**Rationale**: Three JavaScript APIs were evaluated:

| API | Browser support | Behavior on hybrid (Surface Pro) | Reliability |
|-----|----------------|----------------------------------|-------------|
| `navigator.maxTouchPoints > 0` | Chrome 35+, Edge 12+, Firefox 59+, Safari 13+ | Returns > 0 (correctly detects touch) | **High** — returns actual hardware capability |
| `'ontouchstart' in window` | All browsers | Unreliable — some desktop browsers (Firefox) register the property even without a touchscreen | **Low** — false positives on desktop |
| `window.matchMedia('(pointer: coarse)').matches` | Chrome 41+, Edge 12+, Firefox 64+, Safari 9+ | Returns `false` — tests only the *primary* pointer (mouse/trackpad on hybrid) | **Wrong semantics** — misses touch on hybrids |
| `window.matchMedia('(any-pointer: coarse)').matches` | Chrome 41+, Edge 12+, Firefox 64+, Safari 9+ | Returns `true` — tests whether *any* input is coarse | **High** — correct semantics for "has touch" |

`navigator.maxTouchPoints` is the most direct API — it reports hardware capability as an integer. A non-zero value means the device has a touchscreen. It does not change based on which input is "primary," making it the correct choice for the spec requirement "show numpad on all touch-capable devices."

`matchMedia('(any-pointer: coarse)')` provides the same answer via the CSS media query system and can serve as a secondary check, but `maxTouchPoints` alone is sufficient and has broader support (Chrome 35 vs 41).

For school Chromebooks (touch-enabled Chromebooks running Chrome), `maxTouchPoints` returns the correct value. Non-touch Chromebooks return 0.

**Alternatives considered**:
- **`'ontouchstart' in window`**: Legacy touch detection. Produces false positives on Firefox desktop (the property exists even without touch hardware). Rejected — unreliable in 2026 browsers.
- **`window.matchMedia('(pointer: coarse)')`**: Tests only the *primary* pointing device. On a Surface Pro with Type Cover attached, the primary pointer is the trackpad (fine), so this returns `false` even though the device has a touchscreen. Rejected — wrong semantics for "any touch capability."
- **`navigator.maxTouchPoints > 0 || 'ontouchstart' in window`**: Some older guides recommend combining checks. The `ontouchstart` fallback adds no value in browsers released after 2019 and introduces false positives. Rejected — unnecessary complexity.

---

### 2. Touch detection via CSS media queries

**Context**: CSS media queries can also detect input capabilities. Understanding their behavior on hybrid devices is essential for choosing the right detection strategy and for potential CSS-only responsive adaptations.

**Decision**: Use `@media (any-pointer: coarse)` for any CSS-level touch adaptations. Do NOT use `@media (pointer: coarse)` or `@media (hover: none)` as touch detection signals.

**Rationale**:

| Media query | What it tests | Hybrid device (Surface Pro w/ keyboard) | Use case |
|-------------|---------------|----------------------------------------|----------|
| `@media (pointer: coarse)` | Primary pointer accuracy | `false` (primary is trackpad = fine) | **Wrong** for touch detection on hybrids |
| `@media (pointer: fine)` | Primary pointer accuracy | `true` (trackpad) | Desktop styling |
| `@media (any-pointer: coarse)` | Any pointer accuracy | `true` (touchscreen exists) | **Correct** for "has touch" |
| `@media (any-pointer: fine)` | Any pointer accuracy | `true` (trackpad exists) | Not useful alone |
| `@media (hover: none)` | Primary pointer hover | `false` (mouse/trackpad supports hover) | **Wrong** for touch detection on hybrids |
| `@media (any-hover: none)` | Any pointer lacks hover | `true` (touchscreen lacks hover) | Rarely useful |

Key behaviors on target devices:
- **Phone/tablet (touch only)**: `pointer: coarse` ✓, `any-pointer: coarse` ✓, `hover: none` ✓
- **Desktop (mouse only)**: `pointer: fine` ✓, `any-pointer: coarse` ✗, `hover: hover` ✓
- **Surface Pro (touch + keyboard)**: `pointer: fine` ✓, `any-pointer: coarse` ✓, `hover: hover` ✓
- **Touch Chromebook**: `pointer: coarse` ✓ (touch is primary), `any-pointer: coarse` ✓

All of these media queries can be queried from JavaScript via `window.matchMedia(query).matches`. The `matchMedia` API also supports an `addEventListener('change', callback)` for reactive updates, though this is not needed here (see §3).

For CSS styling, `@media (any-pointer: coarse)` can be used directly in stylesheets for touch-specific layout adjustments (e.g., larger touch targets) without any JavaScript involvement.

Browser support: `any-pointer` is supported in Chrome 41+, Edge 12+, Firefox 64+, Safari 9+ — all classified as "Baseline Widely Available" by MDN.

**Alternatives considered**:
- **Using `@media (pointer: coarse)` for touch detection**: Fails on hybrid devices where the primary pointer is a mouse/trackpad. On a Surface Pro with Type Cover, this is `false`. Rejected — would incorrectly hide the numpad on hybrid devices.
- **Using `@media (hover: none)` as a proxy for "no keyboard"**: Hover capability correlates with mouse presence, not keyboard absence. On hybrids, `hover` is supported. Rejected — wrong proxy.

---

### 3. React hook pattern for `useTouchDetection`

**Context**: A custom hook is needed to expose touch detection state to the `AnswerInput` component so it can conditionally render the `TouchNumpad` or the standard text input.

**Decision**: Implement `useTouchDetection` as a one-time check on mount using `useState` with a lazy initializer. No reactive listeners needed.

**Rationale**: Touch hardware capability is a static property of the device — users cannot add or remove a touchscreen at runtime. The spec requirement is binary: "show numpad on all touch-capable devices." There is no scenario where the detection result would change during a session, so a reactive hook with `matchMedia` change listeners or `touchstart` event monitoring would add complexity with no benefit.

```typescript
// Recommended implementation pattern
function useTouchDetection(): boolean {
  const [isTouchDevice] = useState(() => navigator.maxTouchPoints > 0);
  return isTouchDevice;
}
```

Why a lazy `useState` initializer vs. a bare constant:
- The lazy initializer runs only once per component mount, which is correct.
- Returning from `useState` (rather than a bare `const`) makes the hook follow React conventions and allows future extension to reactive behavior if ever needed.
- A bare `const isTouchDevice = navigator.maxTouchPoints > 0` would also work but breaks SSR patterns (not relevant here, but good practice).

Why NOT reactive:
- `matchMedia('(any-pointer: coarse)')` supports `addEventListener('change', ...)` but this event fires when input devices change (e.g., Bluetooth keyboard connect/disconnect changes the "primary" pointer). Since we use `any-pointer` (not `pointer`), the event would only fire if *all* coarse pointers are removed — which means the touchscreen hardware itself was disconnected. This doesn't happen in practice.
- Listening for actual `touchstart` events (to detect first touch) would delay the numpad's appearance until the user tries to touch — a poor UX since the standard input would briefly appear and potentially trigger the OS keyboard.

**Alternatives considered**:
- **Reactive hook with `matchMedia` change listener**: Would react to input device changes. Rejected — unnecessary for static touch hardware detection, adds event listener overhead.
- **First-touch detection (`touchstart` listener)**: Show standard input initially, switch to numpad on first touch. Rejected — poor UX; user would see OS keyboard flash before the numpad replaces it.
- **`useMemo` instead of `useState`**: Would work but `useMemo` semantics imply a cached computation that could be recalculated, which is misleading for a one-time hardware check. `useState` with a lazy initializer is more explicit about "compute once, never change."
- **Bare function (not a hook)**: A plain `isTouchDevice()` utility function would also work but wouldn't integrate into React's rendering lifecycle. Using a hook keeps the pattern consistent with the rest of the codebase (`useGame`, `usePlayers`, `useRoundTimer`, `useSession`).

---

### 4. Preventing the OS keyboard on touch devices

**Context**: When the custom numpad is displayed, the OS on-screen keyboard must not appear (FR-019). The existing `AnswerInput` uses `<input type="text" inputMode="numeric">` which triggers the OS keyboard when focused. The spec clarification says: "Reuse the existing answer field position and styling as a read-only display element (not focusable, no OS keyboard triggered)."

**Decision**: When the numpad is active, replace the `<input>` element with a non-focusable `<div>` styled identically to the input field. The `<div>` acts as a pure display for the composed answer. Add `aria-live="polite"` and `role="status"` so screen readers announce digit changes.

**Rationale**: Three approaches were evaluated:

| Approach | OS keyboard suppressed? | Physical keyboard works? | ARIA accessible? | Complexity |
|----------|------------------------|-------------------------|-------------------|------------|
| `<input inputMode="none">` | Yes (Chrome 66+, Edge 79+, Firefox 95+, Safari 12.1+) | Yes (input is still focusable, receives keydown) | Yes (native input semantics) | Low |
| `<input readOnly>` | Yes (browsers don't show keyboard for readOnly inputs) | No — `readOnly` prevents `onChange` from firing; must use `onKeyDown` to manually update value | Partial — readOnly announced by screen readers | Medium |
| `<div>` as display element | Yes (not an input = no keyboard trigger) | No — must listen for keyboard events at document level | Requires manual ARIA (`aria-live`, `role`) | Medium |

The `<div>` approach best matches the spec clarification ("read-only display element, not focusable, no OS keyboard triggered"):
- It is **impossible** for the OS keyboard to appear — there's no focusable input element.
- It aligns with the spec direction of keeping the display separate from the input mechanism (the numpad buttons are the input mechanism).
- `aria-live="polite"` on the `<div>` ensures screen readers announce the current answer value as digits are added/removed.
- Physical keyboard support is handled separately (see §5) via document-level `keydown` listeners, which work regardless of focused element.

The `inputMode="none"` approach is tempting due to simplicity — it keeps a real `<input>` that suppresses the virtual keyboard while still accepting physical keyboard input. However:
- `inputMode="none"` has browser support starting at Chrome 66 / Firefox 95 / Safari 12.1 — well within our target range, but the `<div>` approach has zero browser dependencies (no feature to support, it just works).
- Having a focusable `<input>` risks accidental keyboard popup if focus management is imperfect. The `<div>` is bulletproof.
- The spec explicitly says "not focusable" — a `<div>` without `tabIndex` naturally satisfies this.

**Alternatives considered**:
- **`<input inputMode="none">`**: Keeps native input semantics and physical keyboard support "for free." Rejected — the spec says the display should not be focusable. Having a focusable input with `inputMode="none"` still allows users to tap the display and expect to type, which creates a confusing interaction model when the numpad is the intended input method. The risk of browser edge cases around `inputMode="none"` is also non-zero (e.g., some Android WebViews have historically ignored `inputMode`).
- **`<input readOnly>`**: Prevents value changes via the input itself. Rejected — `readOnly` semantics are wrong (it implies a value the user cannot change, but the value IS changing via the numpad). Screen readers announce "read-only" which is confusing.
- **`contentEditable` div**: Would create an editable area that could trigger the OS keyboard. Rejected — defeats the purpose.

---

### 5. Physical keyboard coexistence on hybrid devices

**Context**: On devices with both a touchscreen and a physical keyboard (e.g., Surface Pro, touch Chromebook with external keyboard), the numpad is shown (touch detected) but physical keyboard input must also work (FR-001: "Physical keyboard input still works alongside the numpad"). Since the display element is a `<div>` (not an `<input>`), keyboard events must be captured through an alternative mechanism.

**Decision**: Use a document-level `keydown` event listener managed by `useEffect` within the `AnswerInput` / `TouchNumpad` component. Listen for digit keys (0-9), Enter (submit), and Backspace (delete). Scope the listener to the component's mount lifetime.

**Rationale**: Three approaches were evaluated:

| Approach | Keyboard works without clicking? | OS keyboard risk? | Complexity | Focus management |
|----------|--------------------------------|-------------------|------------|-----------------|
| `document.addEventListener('keydown', ...)` in `useEffect` | Yes — always captures | None — no focusable input | Low | None needed |
| Wrapper `<div tabIndex={0}>` with `onKeyDown` | Only when wrapper is focused | None — div, not input | Medium | Must manage focus (auto-focus, re-focus after interaction) |
| Hidden `<input>` kept focused | Only when hidden input is focused | **Yes** — `<input>` focus may trigger OS keyboard on touch devices | High | Complex focus juggling |

The document-level `keydown` listener is the simplest and most reliable approach:
- It works immediately — no clicking required to "activate" keyboard input.
- It has zero risk of triggering the OS keyboard (no focusable input element).
- During gameplay, the numpad component is the only interactive element, so there's no conflict with other keyboard-listening components.
- The listener is added on mount and removed on unmount via `useEffect` cleanup, preventing memory leaks.

Implementation pattern:
```typescript
useEffect(() => {
  if (!acceptingInput) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      appendDigit(e.key);
    } else if (e.key === 'Backspace') {
      deleteLastDigit();
    } else if (e.key === 'Enter') {
      submitAnswer();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [acceptingInput, /* stable callbacks */]);
```

Key considerations:
- The listener is conditionally active only when `acceptingInput` is true, preventing keyboard input during the feedback phase.
- The handler checks `e.key` (not `e.keyCode`, which is deprecated) for digits, Backspace, and Enter.
- No `e.preventDefault()` is needed for digit keys (they have no default action at the document level). `e.preventDefault()` on Enter prevents potential form submissions elsewhere if any exist.
- The same digit validation rules apply to keyboard input as to numpad button taps: max 3 digits (FR-016), no leading zeros (FR-017).

**Alternatives considered**:
- **Wrapper `<div tabIndex={0} onKeyDown={...}>`**: Requires the wrapper div to have focus to receive keyboard events. Users would need to click/tap the game area first, and focus could be lost if they interact with other parts of the page. Rejected — adds focus management complexity and fragile UX.
- **Hidden offscreen `<input>` that stays focused**: Classic mobile game technique. However, any focused `<input>` risks triggering the OS keyboard on touch devices — even with `inputMode="none"`, some browsers show a small keyboard toolbar. This directly conflicts with FR-019 ("MUST NOT summon the operating system's on-screen keyboard"). Rejected — OS keyboard risk on touch devices.
- **`window.addEventListener` instead of `document.addEventListener`**: Functionally identical for `keydown` events since they bubble to both. Using `document` is the convention and avoids confusion with `window`-specific events like `resize`. Preferred by convention.

---

### 6. Answer display element — ARIA accessibility

**Context**: The composed answer (digits entered so far) is displayed in a `<div>` instead of an `<input>` (see §4). Screen reader users on touch devices must be able to perceive the current answer value as it changes (FR-020).

**Decision**: Use a `<div>` with `role="status"`, `aria-live="polite"`, and `aria-label="Current answer"`. Display the placeholder "?" when empty (matching existing `AnswerInput` placeholder behavior).

**Rationale**: 
- `role="status"` establishes the element as a live region with an implicit `aria-live="polite"`. Adding `aria-live="polite"` explicitly ensures screen readers announce changes without interrupting current speech.
- The `aria-label` provides a persistent label so screen readers identify the element ("Current answer: 72").
- `aria-live="polite"` (not `"assertive"`) is appropriate because digit-by-digit updates are incremental — interrupting the user after every digit tap would be disruptive.
- The `<div>` is not focusable (no `tabIndex`), matching the spec requirement. Screen readers can still read it in browse/reading mode and receive live region updates.

**Alternatives considered**:
- **`aria-live="assertive"`**: Would interrupt screen reader speech on every digit change. Rejected — too disruptive for rapid digit entry.
- **`role="textbox"` with `aria-readonly="true"`**: Would make screen readers treat it as an editable field, prompting users to try typing into it. Rejected — confusing semantics.
- **Announcing only on submit**: Would leave screen readers uninformed during digit composition. Rejected — users need real-time feedback on what they've entered.

---

### 7. Numpad grid layout approach

**Context**: The numpad must display in a calculator-style grid: rows 1-2-3, 4-5-6, 7-8-9, and a bottom row with 0, ⌫, and Go. The "Go" button should be visually prominent (FR-004).

**Decision**: Use a uniform `grid-template-columns: repeat(3, 1fr)` CSS Grid. All buttons occupy equal-width cells. The "Go" button is distinguished via styling (accent background color `#6c63ff`, bold font weight `700`) rather than extra width.

**Rationale**: A uniform 3-column grid ensures all buttons have identical touch target widths, maximizing consistency and reducing mis-taps — critical for children (ages 6-12). The bottom row aligns perfectly with rows above. Making "Go" wider would require a different column structure for the bottom row (e.g., 6-column subgrid), adding CSS complexity for marginal UX benefit. The accent color (`#6c63ff`, the app's primary purple used on the existing Submit button) provides strong visual distinction.

**Alternatives considered**:
- **6-column grid with spans**: Digit buttons span 2 cols each, Go spans 3 cols for ~50% more width. Viable but adds CSS complexity. Kept as fallback if user feedback demands more Go prominence.
- **Go on a separate full-width 5th row**: Wastes vertical space, risks pushing formula off-screen on 568px-tall phones. Rejected.

---

### 8. Touch target sizing for children

**Context**: Each button must be at least 44×44 CSS pixels (WCAG 2.5.5 / FR-013), targeting children ages 6-12.

**Decision**: Set `min-height: 48px` with `padding: 12px 0` for an effective height of ~56px. Button width is determined by the grid (`1fr` columns) and naturally exceeds 48px on all supported screen widths.

**Rationale**: 48px matches Google Material Design's minimum. 12px vertical padding pushes effective height to 56px, exceeding Apple HIG (44pt). Children's UI research recommends 56-72px for ages 6-8; our 56px target suits the full 6-12 range. On a 320px phone with 16px padding and 16px total gap, each button is ~90px wide.

**Alternatives considered**:
- **`aspect-ratio: 1` (square buttons)**: ~90×90px buttons would consume too much vertical space on 568px screens. Rejected.
- **Percentage-based height** (e.g., `18vh`): Unpredictable across screen sizes. Rejected.

---

### 9. Button interaction feedback

**Context**: Buttons need clear visual feedback when tapped. The 300ms tap delay must be eliminated.

**Decision**: Use `:active` pseudo-class with `background-color` darkening and `transform: scale(0.95)`. Apply `touch-action: manipulation` on the numpad container. Scope `:hover` to desktop via `@media (hover: hover) and (pointer: fine)`.

**Rationale**: `:active` fires instantly on modern mobile browsers with `touch-action: manipulation`. No JavaScript handlers needed for visual feedback. The 0.95 scale provides a subtle "press-in" effect perceivable by children without layout shift. `-webkit-tap-highlight-color: transparent` removes default highlight rectangles on iOS/Android.

**Alternatives considered**:
- **JavaScript `touchstart`/`touchend` class toggling**: More control but added complexity. Rejected.
- **Haptic feedback via `navigator.vibrate()`**: Not supported on iOS Safari. Deferred as future enhancement.

---

### 10. Double-tap prevention on "Go" button

**Context**: React state updates are asynchronous — a second tap could fire before the re-render disables the button after submission.

**Decision**: Use a synchronous `useRef` guard. Set `submittedRef.current = true` immediately before calling the submit callback. Reset when `acceptingInput` transitions to `true` (new round). The `disabled` attribute provides secondary defense.

**Rationale**: `useRef` mutations are synchronous — the second click sees `true` immediately after the first sets it. `useState` updates are batched and could allow both clicks to read `false`. This is the standard React double-submit prevention pattern.

**Alternatives considered**:
- **`useState` guard**: Asynchronous — race condition possible. Rejected.
- **Debounce/throttle**: Arbitrary time window, could swallow legitimate interactions. Rejected.

---

### 11. Answer display styling reuse

**Context**: The spec requires reusing the existing answer field position and styling for the composed answer display.

**Decision**: Apply the existing `.input` CSS class from `AnswerInput.module.css` to the display `<div>`. Remove the focus ring (non-focusable) and show "?" placeholder when empty.

**Rationale**: Reusing the existing CSS class guarantees visual consistency between touch and non-touch modes. The `.input` class already specifies the correct width (120px → 100% on mobile), padding (12px 16px), font-size (1.5rem), border (2px solid #ccc), and border-radius (8px).

**Alternatives considered**:
- **New CSS class**: Would duplicate existing styles. Rejected per DRY.
- **`<output>` element**: Different default styling across browsers. Rejected.

---

### 12. Font sizing for numpad buttons

**Context**: The app targets children ages 6-12. Numpad buttons must be legible on phone screens.

**Decision**: Use `1.5rem` (24px) for digit buttons and `1.25rem` (20px) for "Go" and "⌫" labels. `font-weight: 600` for digits, `700` for "Go".

**Rationale**: 1.5rem matches the existing `AnswerInput` font-size, maintaining visual consistency. Children's UI research recommends at least 14pt (~18.67px) for ages 6-8 — 24px exceeds this comfortably. On a ~90px-wide button, 24px text occupies ~43% of height, well-centered with padding. "Go" at 1.25rem + bold weight balances prominence — the accent color is the primary distinguishing factor. The app uses `system-ui` font stack which renders crisply on all devices.
