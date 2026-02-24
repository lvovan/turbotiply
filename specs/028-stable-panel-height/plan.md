# Implementation Plan: Stable Status Panel Height

**Branch**: `028-stable-panel-height` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/028-stable-panel-height/spec.md`

## Summary

The GameStatus panel currently uses `min-height` which allows the container to grow when content varies between input and feedback phases, causing layout shifts for elements below it. The fix replaces `min-height` with a fixed `height` on the `.status` class (5rem desktop, 4rem mobile) and adds `overflow: hidden` as a safety net for extreme edge cases. This is a CSS-only change — no component logic changes required.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18  
**Primary Dependencies**: React, Vite, CSS Modules  
**Storage**: N/A (no persistence changes)  
**Testing**: Vitest + React Testing Library + axe-core  
**Target Platform**: Browser (static SPA)  
**Project Type**: Single frontend project  
**Performance Goals**: No layout shift (CLS = 0) during phase transitions  
**Constraints**: Panel must contain all content variants without clipping under normal conditions  
**Scale/Scope**: 1 CSS file change, 1 test file addition

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | ✅ PASS | No UI content changes. All ARIA attributes, icons, text preserved. `overflow: hidden` only clips in extreme zoom (spec acknowledges this edge case). |
| II. Simplicity & Clarity | ✅ PASS | Minimal CSS-only change. No new abstractions, components, or layers. YAGNI fully respected. |
| III. Responsive Design | ✅ PASS | Separate fixed height for mobile breakpoint (≤480px). Both values match current rendered heights. |
| IV. Static SPA | ✅ PASS | Pure client-side CSS change. No server involvement. |
| V. Test-First | ✅ PASS | Tests will verify panel height stability across phase transitions and game modes. |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/028-stable-panel-height/
├── plan.md              # This file
├── research.md          # Phase 0 output — CSS approach analysis
├── data-model.md        # Phase 1 output — no data model changes
├── quickstart.md        # Phase 1 output — verification guide
├── contracts/           # Phase 1 output — CSS contract
│   └── css-contract.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   └── components/
│       └── GamePlay/
│           └── GameStatus/
│               ├── GameStatus.tsx          # Unchanged
│               └── GameStatus.module.css   # Modified — height fix
└── tests/
    └── components/
        └── GameStatus.test.tsx             # Modified — add height stability tests
```

**Structure Decision**: Single `frontend/` directory per constitution (IV. Static SPA). Only 1 CSS file modified; 1 test file extended.
