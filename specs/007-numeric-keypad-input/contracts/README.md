# Contracts: Numeric Keypad Input on Touch Devices

**Feature**: `007-numeric-keypad-input`  
**Date**: 2026-02-16

## Summary

This feature has **no API contracts**. The application is a static SPA with no backend. The change is purely to HTML input element attributes within a single React component.

## Component Interface (unchanged)

The `AnswerInput` component's TypeScript interface is not modified:

```typescript
interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  disabled: boolean;
}
```

No props are added, removed, or changed. The component's public contract with its parent (`MainPage`) is identical.
