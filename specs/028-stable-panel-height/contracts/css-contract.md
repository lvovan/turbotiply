# CSS Contract: Stable Status Panel Height

**Feature**: 028-stable-panel-height  
**Date**: 2026-02-24

## Overview

This feature has no REST/GraphQL API surface — it is a pure CSS change to the GameStatus component's module stylesheet. The "contract" is the CSS sizing behavior of the `.status` class.

## `.status` class contract

### Current behavior (before change)

```css
.status {
  /* ... other properties unchanged ... */
  min-height: 5rem;    /* allows growth beyond 5rem */
}

@media (max-width: 480px) {
  .status {
    /* ... other properties unchanged ... */
    min-height: 4rem;  /* allows growth beyond 4rem */
  }
}
```

### New behavior (after change)

```css
.status {
  /* ... other properties unchanged ... */
  height: 5rem;        /* fixed at exactly 5rem — no growth */
  overflow: hidden;    /* clip content if it exceeds fixed height */
}

@media (max-width: 480px) {
  .status {
    /* ... other properties unchanged ... */
    height: 4rem;      /* fixed at exactly 4rem — no growth */
  }
}
```

### Properties changed

| Property | Before | After | Scope |
|----------|--------|-------|-------|
| `min-height` | `5rem` | Removed | `.status` |
| `height` | Not set | `5rem` | `.status` |
| `overflow` | Not set (default `visible`) | `hidden` | `.status` |
| `min-height` (mobile) | `4rem` | Removed | `.status` @media ≤480px |
| `height` (mobile) | Not set | `4rem` | `.status` @media ≤480px |

### Invariants

1. The `.status` element's `offsetHeight` MUST be identical (within 1px) regardless of `currentPhase` (`input` or `feedback`).
2. The `.status` element's `offsetHeight` MUST be identical (within 1px) regardless of `gameMode` (`play` or `improve`).
3. The `.status` element's `offsetHeight` MUST be identical (within 1px) regardless of `isReplay` value.
4. No properties other than `min-height`, `height`, and `overflow` are modified.
5. All child elements (`.feedbackContent`, `.feedbackMain`, `.roundInfo`, `.score`, `.timer`, `CountdownBar`) render identically.

## Test contract

Tests MUST verify:

1. The panel height does not change between input and feedback phases (correct answer).
2. The panel height does not change between input and feedback phases (incorrect answer with correct answer text).
3. The panel height does not change between play mode and improve mode.
4. The `overflow: hidden` property is applied to the root element.
