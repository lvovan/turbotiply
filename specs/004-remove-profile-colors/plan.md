# Implementation Plan: Remove Profile Colors

**Branch**: `004-remove-profile-colors` | **Date**: 2026-02-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-remove-profile-colors/spec.md`

## Summary

Remove the color selection feature from player profiles entirely. Players are identified only by avatar (emoji) and name. This involves deleting the `ColorPicker` component, removing `colorId` from the `Player` and `Session` data models, updating the storage migration to strip legacy color data, and cleaning up all references in hooks, services, components, pages, and tests.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18+)
**Primary Dependencies**: React, Vite
**Storage**: Browser localStorage (player profiles) and sessionStorage (active sessions)
**Testing**: Vitest + React Testing Library + axe-core (accessibility)
**Target Platform**: Static SPA — latest 2 versions of Chrome, Firefox, Safari, Edge
**Project Type**: Single frontend SPA (`frontend/` directory)
**Performance Goals**: Lighthouse ≥ 90 mobile, TTI < 3s on 3G (unchanged — removal only simplifies)
**Constraints**: WCAG 2.1 AA, mobile-first, 320–1920 px viewports, no server-side code
**Scale/Scope**: Max 50 player profiles, single-tab sessions. ~25 files affected (4 delete, ~10 modify src, ~14 modify tests)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Accessibility First | PASS | Removing color picker reduces reliance on color as an identifier. Avatar emoji + ARIA labels remain. No new UI elements. |
| II. Simplicity & Clarity | PASS | Removal feature — strictly reduces complexity. YAGNI: removing unused/unnecessary feature. |
| III. Responsive Design | PASS | No new UI. Removing color dot and color picker simplifies layout on all viewports. |
| IV. Static SPA | PASS | No backend, no SSR. Change is entirely within `frontend/`. |
| V. Test-First | PASS | Tests will be updated to remove color references; new migration test added. Accessibility tests updated. |

**Gate result: PASS** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-remove-profile-colors/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── storage-migration.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── types/
│   │   └── player.ts              # MODIFY: remove colorId from Player & Session
│   ├── constants/
│   │   ├── avatars.ts             # unchanged
│   │   ├── avatarEmojis.ts        # unchanged
│   │   └── colors.ts             # DELETE
│   ├── services/
│   │   ├── playerStorage.ts       # MODIFY: remove COLOR_REMAP, strip colorId in migration, update savePlayer
│   │   └── sessionManager.ts      # MODIFY: remove colorId from startSession
│   ├── hooks/
│   │   ├── usePlayers.ts          # MODIFY: remove colorId from savePlayer signature
│   │   └── useSession.tsx         # MODIFY: remove colorId from startSession signature
│   ├── components/
│   │   ├── ColorPicker/           # DELETE entire directory
│   │   ├── WelcomeScreen/
│   │   │   └── NewPlayerForm.tsx  # MODIFY: remove ColorPicker import/render, colorId state
│   │   ├── PlayerCard/
│   │   │   ├── PlayerCard.tsx     # MODIFY: remove color dot, COLORS import
│   │   │   └── PlayerCard.module.css  # MODIFY: remove .colorDot class
│   │   └── Header/
│   │       └── Header.tsx         # MODIFY: remove color-based border/text styling
│   └── pages/
│       └── WelcomePage.tsx        # MODIFY: remove colorId from handler signatures
└── tests/
    ├── components/
    │   ├── ColorPicker.test.tsx   # DELETE
    │   ├── NewPlayerForm.test.tsx  # MODIFY
    │   ├── PlayerCard.test.tsx    # MODIFY
    │   ├── Header.test.tsx        # MODIFY
    │   └── PlayerList.test.tsx    # MODIFY
    ├── hooks/
    │   ├── usePlayers.test.tsx    # MODIFY
    │   └── useSession.test.tsx    # MODIFY
    ├── services/
    │   ├── playerStorage.test.ts  # MODIFY
    │   └── sessionManager.test.ts # MODIFY
    ├── pages/
    │   ├── WelcomePage.test.tsx   # MODIFY
    │   └── MainPage.test.tsx      # MODIFY
    ├── integration/
    │   ├── clearAllFlow.test.tsx   # MODIFY
    │   ├── gameplayFlow.test.tsx   # MODIFY
    │   └── sessionLifecycle.test.tsx # MODIFY
    └── a11y/
        └── accessibility.test.tsx  # MODIFY
```

**Structure Decision**: Single `frontend/` directory (Static SPA, per Constitution IV). No structural changes — only file modifications and deletions within the existing layout.

## Complexity Tracking

> No violations. Table not needed.
