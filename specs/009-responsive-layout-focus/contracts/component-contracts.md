# Component Contracts: Responsive Layout & Persistent Keyboard

**Feature**: 009-responsive-layout-focus  
**Date**: 2026-02-16

## Overview

This feature has no REST/GraphQL APIs (pure client-side SPA). Contracts define the component interface changes and CSS architecture.

## AnswerInput Component Contract

### Props Interface (changed)

```typescript
interface AnswerInputProps {
  /** Called when the user submits an answer. Only invoked when acceptingInput is true. */
  onSubmit: (answer: number) => void;
  /** When false (feedback phase), the input stays interactive but submissions are ignored. */
  acceptingInput: boolean;
}
```

### Behavioral Contract

| State | `acceptingInput` | Input DOM state | Submit behavior | Keyboard |
|-------|------------------|-----------------|-----------------|----------|
| Input phase | `true` | Normal, focused | Calls `onSubmit(answer)`, clears value | Visible |
| Feedback phase | `false` | Normal, focused | No-op (early return) | Visible |
| New round transition | `true` (from `false`) | Value auto-cleared, focused | Ready for next answer | Visible |

### Focus Contract

- On mount: `autoFocus` attribute places initial focus
- On `acceptingInput` change (either direction): focus is maintained (no `disabled` attribute to cause blur)
- On new round (`acceptingInput` false → true): input value cleared to empty string
- The `useEffect` for re-focusing only fires on mount (no dependency on `acceptingInput` for focus since input is never blurred)

## CSS Architecture Contract

### Global Layout (index.css + App.css)

```css
/* index.css: Global reset */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; min-width: 320px; /* no flex, no place-items */ }

/* App.css: App container */
#root {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
}
```

### Layout Behavior by Viewport

| Viewport Width | `#root` Width | Centering | Side Space |
|---------------|---------------|-----------|------------|
| ≤540px | 100% (full width) | N/A | Pages provide ≤16px padding |
| 541–767px | 540px | `margin: 0 auto` | Balanced |
| ≥768px | 540px | `margin: 0 auto` | Balanced |

### Page Padding Contract

Pages are responsible for their own internal padding:
- WelcomePage: `padding: 16px` (via `.welcomePage` CSS module)
- MainPage: `padding: 24px 16px` (via inline style or CSS module)

`#root` provides **no padding** — only width constraint and centering.
