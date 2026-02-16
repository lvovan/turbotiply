# Implementation Plan: Minimum Factor of Two

**Branch**: `005-min-factor-two` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-min-factor-two/spec.md`

## Summary

Change the multiplication factor range from 1–12 to 2–12 to eliminate trivial ×1 questions. This is a single-constant change in `formulaGenerator.ts` (loop start from 2 instead of 1), with corresponding updates to JSDoc comments in `formulaGenerator.ts` and `types/game.ts`, and test expectations in `formulaGenerator.test.ts`. The change reduces the pair pool from 78 to 66 unique unordered pairs, which is still well above the 10 pairs needed per game.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 19, Vite 6  
**Storage**: Browser localStorage (unchanged by this feature)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Static SPA — browser (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single frontend project (`frontend/`)  
**Performance Goals**: N/A — no performance impact from this change  
**Constraints**: None specific to this feature  
**Scale/Scope**: 1 source file changed, 1 type file comment updated, 1 test file updated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | **PASS** | No UI changes. Factor range is internal logic only. |
| II. Simplicity & Clarity | **PASS** | Single constant change. No new abstractions. YAGNI compliant. |
| III. Responsive Design | **PASS** | No UI changes. |
| IV. Static SPA | **PASS** | Pure client-side logic. No server changes. |
| V. Test-First | **PASS** | Tests will be updated to assert the new range [2,12]. Existing test patterns preserved. |

**Gate result**: All 5 principles PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/005-min-factor-two/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── formula-generator.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── services/
│   │   └── formulaGenerator.ts    # PRIMARY: change loop start from 1 to 2
│   └── types/
│       └── game.ts                # UPDATE: JSDoc comments (1–12 → 2–12)
└── tests/
    └── services/
        └── formulaGenerator.test.ts  # UPDATE: assertions (78→66, [1,12]→[2,12])
```

**Structure Decision**: Single `frontend/` directory per constitution (Principle IV). No new files or directories needed in source code.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
