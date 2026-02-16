# Data Model: Responsive Layout & Persistent Keyboard

**Feature**: 009-responsive-layout-focus  
**Date**: 2026-02-16

## Summary

This feature introduces **no data model changes**. It is a pure CSS/layout and component behavior fix with no new entities, no new storage, and no changes to existing types.

## Existing Entities (unchanged)

### GameState (types/game.ts)

The `currentPhase: 'input' | 'feedback'` field is used by AnswerInput to determine whether to accept submissions. This field is **not modified** — its semantics remain the same. The only change is how AnswerInput consumes it: instead of mapping it to an HTML `disabled` attribute, it maps it to a submit-guard condition.

```typescript
// No changes to this interface
export interface GameState {
  status: 'not-started' | 'playing' | 'replay' | 'completed';
  currentPhase: 'input' | 'feedback';
  // ... other fields unchanged
}
```

### AnswerInputProps (components/GamePlay/AnswerInput/AnswerInput.tsx)

The component's prop interface changes from `disabled: boolean` to `acceptingInput: boolean` to better communicate intent. This is a **component interface change**, not a data model change.

```typescript
// Before
interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  disabled: boolean;
}

// After
interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  acceptingInput: boolean;
}
```

## State Transitions

No new state transitions. The existing `input` → `feedback` → `input` cycle in `GameState.currentPhase` is unchanged. The difference is purely in how the UI layer responds to the `feedback` phase.

## Validation Rules

No new validation rules. Existing digit-only input validation (`/[^0-9]/g` filter) remains unchanged.

## Storage

No localStorage changes. No new keys, no schema changes.
