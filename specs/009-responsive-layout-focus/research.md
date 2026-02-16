# Research: Responsive Layout & Persistent Keyboard

**Feature**: 009-responsive-layout-focus  
**Date**: 2026-02-16

## 1. Virtual Keyboard Persistence: `readOnly` vs Submit Guard

### Decision

Use a **submit guard** (ignore submissions during feedback) instead of `readOnly`. The input stays fully interactive throughout the feedback phase — the keyboard is never dismissed.

### Rationale

Research revealed that `readOnly` **dismisses** the virtual keyboard on iOS Safari, Chrome Android, and Firefox Android (the element retains focus, but the keyboard is hidden because the input is no longer editable). When `readOnly` is removed, the keyboard reappears because focus was never lost. This means using `readOnly` during the 1.2s feedback phase would cause a keyboard dismiss→reappear flicker, contradicting the spec's goal of persistent keyboard visibility.

The submit-guard approach avoids this entirely:
- The `onSubmit` handler checks `currentPhase !== 'input'` and returns early during feedback
- The `<input>` is never disabled or readOnly — it stays fully interactive
- The keyboard is never dismissed at any point during gameplay
- The user can technically type during feedback, but this is harmless: the input is auto-cleared when the next round begins (FR-011)
- No browser-specific behavior to worry about

### Alternatives Considered

| Approach | Keyboard During Feedback | Pros | Cons |
|----------|-------------------------|------|------|
| `disabled` (current) | ❌ Dismissed, cannot return via `focus()` | Clear visual state | Breaks keyboard entirely on mobile |
| `readOnly` | ❌ Dismissed, returns when removed | Focus retained | 1.2s keyboard flicker; browser-specific |
| Submit guard | ✅ Stays visible | Zero keyboard risk; simplest | User can type during feedback (cosmetic) |
| `readOnly` + submit guard | ❌ Dismissed during feedback | Belt-and-suspenders | Worst of both; still flickers |

### Spec Impact

FR-005 and FR-006 need updating: replace `readOnly` approach with submit-guard approach. The `disabled` prop changes to a `readOnly` semantic prop name (to communicate intent to the component), but the HTML `readOnly` attribute itself should NOT be applied to the `<input>` element. Instead, the component ignores submissions when the prop indicates feedback phase.

**Updated approach for AnswerInput**:
- Replace `disabled: boolean` prop with `acceptingInput: boolean` (or keep `disabled` but don't apply it to the HTML element)
- When `acceptingInput` is `false` (feedback phase): input stays interactive, `onSubmit` is no-oped, value is preserved
- When `acceptingInput` transitions to `true` (new round): input value is cleared, focus is confirmed
- The `autoFocus` and `useEffect` focus logic remain; the key difference is the input is never actually disabled/readOnly at the DOM level

## 2. Responsive CSS Layout Strategy

### Decision

Apply responsive layout at `#root` level (App.css) with no media queries needed. Use `max-width: 540px; margin: 0 auto` which naturally provides full-width on mobile and centered on desktop.

### Rationale

`max-width: 540px` is inherently responsive:
- On viewports ≤540px: the element takes 100% width (max-width doesn't constrain)
- On viewports >540px: capped at 540px with `margin: 0 auto` centering
- The 481–767px gap resolves naturally: narrow viewports get full width; wider ones get centered 540px column
- No media query breakpoints needed for the container itself

Root-level (`#root`) centering is preferred over per-page because:
- It's a single source of truth for the app's content width
- MainPage currently has no width constraint at all (content stretches infinitely on wide screens)
- WelcomePage has its own redundant `max-width: 540px` that would become unnecessary
- New pages automatically get the correct layout behavior

### Final CSS Architecture

```css
/* index.css — global reset + foundation */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  /* Keep existing :root font, color, theme variables */
}
/* REMOVE: display: flex; place-items: center; min-height: 100vh */

/* App.css — app layout container */
#root {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh; /* progressive enhancement for mobile browser chrome */
}
/* REMOVE: padding: 2rem; text-align: center; max-width: 1280px */
/* REMOVE: all Vite demo styles (.logo, .card, .read-the-docs, logo-spin) */
```

### Alternatives Considered

| Approach | Verdict |
|----------|---------|
| Per-page centering | Rejected — duplicates logic; MainPage already demonstrates what happens when forgotten |
| Shared `<Layout>` React component | Over-engineering — pure CSS concern; unnecessary JSX nesting |
| Keep `body { display: flex }` with `align-items: start` | Fixed vertical centering but uses flex for no reason; block layout is simpler |
| `width: min(100%, 540px)` | Functionally equivalent but less readable than `width: 100%; max-width: 540px` |

## 3. `body` Styling Cleanup

### Decision

Remove `display: flex`, `place-items: center`, and `min-height: 100vh` from `body`. Keep `margin: 0` and `min-width: 320px`.

### Rationale

- `place-items: center` vertically centers `#root` within the viewport, pushing content to the middle of the screen. For an app with a header, content should start at the top.
- `display: flex` causes `#root` to shrink-wrap content width by default. Removing it makes `#root` a block element that naturally takes full width.
- `min-height: 100vh` moves to `#root` where it ensures the app container (not just the body) fills the viewport.

## 4. Global `box-sizing: border-box`

### Decision

Add `*, *::before, *::after { box-sizing: border-box }` to `index.css`.

### Rationale

Without this, `width: 100%` + `padding: 16px` on pages would cause 32px horizontal overflow — the primary source of horizontal scrolling bugs. This is an industry-standard reset used by Normalize.css, modern-normalize, and every CSS framework. Currently the app has no global box-sizing reset.

## 5. Downstream CSS Cleanups

### Decision

Remove redundant `max-width: 540px` from WelcomePage's `.content`, `.storageWarning`, `.evictionNotice`, `.errorBanner`. Remove `min-height: 100vh` from `.welcomePage`.

### Rationale

With `#root { max-width: 540px }`, no descendant can exceed 540px. Keeping redundant declarations is technically harmless but architecturally misleading — a future developer would think the per-element constraint is the source of truth when it's actually `#root`.

### Files Affected

| File | Change |
|------|--------|
| `App.css` | Replace entirely: remove Vite defaults, add responsive `#root` |
| `index.css` | Remove `body { display: flex; place-items: center; min-height: 100vh }`, add `box-sizing` reset |
| `WelcomePage.module.css` | Remove redundant `max-width`, `min-height` |
| `AnswerInput.tsx` | Change `disabled` prop to submit-guard pattern, auto-clear input |
| `AnswerInput.module.css` | Replace `.input:disabled` with appropriate state styles |
| `MainPage.tsx` | Update prop passed to AnswerInput |
| `AnswerInput.test.tsx` | Update tests for new behavior |
| `accessibility.test.tsx` | Update a11y tests if needed |

## 6. `100dvh` Progressive Enhancement

### Decision

Use `min-height: 100vh; min-height: 100dvh;` on `#root` (fallback then override).

### Rationale

`100dvh` (dynamic viewport height) accounts for mobile browser chrome (URL bar appearing/disappearing), preventing content from being hidden behind the URL bar. It has ~94% browser support. The `100vh` declaration provides the fallback for older browsers (notably older iOS Safari).
