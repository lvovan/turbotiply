# Implementation Plan: Numeric Keypad Input on Touch Devices

**Branch**: `007-numeric-keypad-input` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-numeric-keypad-input/spec.md`

## Summary

The answer input field during gameplay currently uses `type="number"` with `inputMode="numeric"`. While `inputMode="numeric"` hints at a numeric keyboard, `type="number"` can cause iOS Safari to show a phone-dialler-style keypad (with `+`, `*`, `#`). The fix is to switch to `type="text"` with `inputMode="numeric"` and `pattern="[0-9]*"`. On iOS Safari, `pattern="[0-9]*"` specifically triggers a pure 0–9 digit keypad. On Android Chrome, `inputMode="numeric"` already shows a digit keypad. The existing non-digit stripping logic remains unchanged. Tests must be updated since the ARIA role changes from `spinbutton` to `textbox`.

## Technical Context

**Language/Version**: TypeScript ~5.9.3, React 19.2, bundled via Vite 7.3  
**Primary Dependencies**: React, React DOM, CSS Modules  
**Storage**: N/A (no data model changes)  
**Testing**: Vitest 4.0 + React Testing Library 16.3 + vitest-axe  
**Target Platform**: Static SPA — iOS Safari 14+, Android Chrome 10+, desktop Chrome/Firefox/Safari/Edge  
**Project Type**: Single `frontend/` directory (static SPA)  
**Performance Goals**: No impact — this changes HTML attributes only  
**Constraints**: Must not break existing desktop keyboard interaction; must not introduce browser-native spinner controls  
**Scale/Scope**: 1 component file, 1 test file, ~5 lines of attribute changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | **PASS** | `aria-label="Your answer"` preserved. `pattern="[0-9]*"` improves mobile UX for children. `inputMode="numeric"` retained. Keyboard+touch+assistive tech all supported. |
| II. Simplicity & Clarity | **PASS** | Minimal change — 3 HTML attribute modifications. No new abstractions. |
| III. Responsive Design | **PASS** | Improves touch experience on mobile. Desktop unaffected. No layout changes. |
| IV. Static SPA | **PASS** | No server-side changes. Pure client-side React component edit. |
| V. Test-First | **PASS** | Tests will be updated to use `textbox` role (from `spinbutton`). Existing a11y tests unaffected. |

**Gate result**: All 5 principles PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-numeric-keypad-input/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data model)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no API contracts)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   └── components/
│       └── GamePlay/
│           └── AnswerInput/
│               ├── AnswerInput.tsx       # Input field component (MODIFIED)
│               └── AnswerInput.module.css # Styling (minor cleanup)
└── tests/
    └── components/
        └── AnswerInput.test.tsx          # Tests (MODIFIED — role change)
```

**Structure Decision**: Single `frontend/` directory per constitution principle IV. Only the `AnswerInput` component and its test file are affected. No new files created in source.

## Complexity Tracking

No constitution violations detected. This table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)* | — | — |
