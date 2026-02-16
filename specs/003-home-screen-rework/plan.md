# Implementation Plan: Home Screen Rework

**Branch**: `003-home-screen-rework` | **Date**: 2026-02-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-home-screen-rework/spec.md`

## Summary

Rework the home (login) screen to: (A) add a "Clear all profiles" button with confirmation dialog that wipes all localStorage and reloads the page, and (B) make the entire screen fit on a 360×640 CSS pixel viewport without vertical scrolling by reducing avatars from 12→8, colors from 8→6, using single-line player cards (with average score, alphabetically sorted), and tightening spacing. Existing profiles referencing removed avatars/colors are silently remapped to the nearest equivalent at load time.

## Technical Context

**Language/Version**: TypeScript ~5.9, React 19, Vite 7  
**Primary Dependencies**: react-router-dom 7, vitest 4, @testing-library/react 16, vitest-axe  
**Storage**: Browser localStorage (`turbotiply_players` key) and sessionStorage (`turbotiply_session` key)  
**Testing**: Vitest + React Testing Library + vitest-axe (a11y)  
**Target Platform**: Static SPA, browser (Chrome/Firefox/Safari/Edge, latest 2 major versions)  
**Project Type**: Single — `frontend/` directory only (no backend)  
**Performance Goals**: Lighthouse Performance ≥ 90 mobile, TTI < 3s on 3G  
**Constraints**: All content visible without scrolling on 360×640 viewport; tap targets ≥ 44×44 CSS px; WCAG 2.1 AA  
**Scale/Scope**: ~15 source files modified or created; 1 page (WelcomePage), 5 components, 2 constants files, 1 service, 1 type, 1 hook

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Accessibility First | ✅ PASS | Confirmation dialog uses existing focus-trap + Escape pattern. All tap targets ≥ 44px. Friendly child-appropriate language. ARIA labels on all interactive elements. vitest-axe tests required. |
| II | Simplicity & Clarity | ✅ PASS | No new abstractions. Reuses existing DeleteConfirmation pattern. Avatar/color reduction simplifies the UI. Single-line card layout reduces cognitive load. |
| III | Responsive Design | ✅ PASS | Primary design target is 360×640 mobile viewport. All content fits without scrolling. Touch targets ≥ 44px. Mobile-first approach. No horizontal scrolling. |
| IV | Static SPA | ✅ PASS | No backend changes. All logic client-side. localStorage + sessionStorage only. Single `frontend/` directory. |
| V | Test-First | ✅ PASS | Acceptance tests from spec scenarios written before implementation. vitest-axe a11y tests for new/modified components. |

**Gate result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── AvatarPicker/
│   │   │   ├── AvatarPicker.tsx          # Modified: render 8 avatars, 4×2 grid
│   │   │   └── AvatarPicker.module.css   # Modified: compact grid
│   │   ├── ColorPicker/
│   │   │   ├── ColorPicker.tsx           # Modified: render 6 colors
│   │   │   └── ColorPicker.module.css    # Modified: 6-item single row
│   │   ├── ClearAllConfirmation/
│   │   │   ├── ClearAllConfirmation.tsx  # New: confirmation dialog
│   │   │   └── ClearAllConfirmation.module.css # New
│   │   ├── DeleteConfirmation/           # Unchanged (pattern reference)
│   │   ├── PlayerCard/
│   │   │   ├── PlayerCard.tsx            # Modified: single-line layout + avg score
│   │   │   └── PlayerCard.module.css     # Modified: horizontal layout
│   │   └── WelcomeScreen/
│   │       ├── NewPlayerForm.tsx         # Modified: tighter spacing
│   │       ├── NewPlayerForm.module.css  # Modified: compact padding/margins
│   │       ├── PlayerList.tsx            # Modified: add clear-all button, alphabetical sort
│   │       └── PlayerList.module.css     # Modified
│   ├── constants/
│   │   ├── avatars.ts                    # Modified: 12→8 avatars
│   │   ├── avatarEmojis.ts              # Modified: 12→8 + remapping table
│   │   └── colors.ts                     # Modified: 8→6 colors + remapping table
│   ├── hooks/
│   │   └── usePlayers.ts                 # Modified: add clearAllPlayers, alphabetical sort
│   ├── pages/
│   │   ├── WelcomePage.tsx               # Modified: wire clear-all, tighter layout
│   │   └── WelcomePage.module.css        # Modified: compact spacing
│   ├── services/
│   │   └── playerStorage.ts             # Modified: add clearAll(), avatar/color remap on load
│   └── types/
│       └── player.ts                     # Modified: add averageScore field to Player
├── tests/
│   ├── components/
│   │   ├── AvatarPicker.test.tsx         # Modified: test 8 avatars
│   │   ├── ColorPicker.test.tsx          # Modified: test 6 colors
│   │   ├── ClearAllConfirmation.test.tsx # New
│   │   ├── PlayerCard.test.tsx           # Modified: test single-line + avg score
│   │   ├── PlayerList.test.tsx           # Modified: test clear-all button + alphabetical
│   │   └── NewPlayerForm.test.tsx        # Modified: test compact layout
│   ├── services/
│   │   └── playerStorage.test.ts        # Modified: test clearAll, remap
│   ├── integration/
│   │   └── clearAllFlow.test.tsx         # New: e2e clear-all flow
│   └── a11y/
│       └── accessibility.test.tsx        # Modified: test new dialog a11y
```

**Structure Decision**: Single `frontend/` directory per constitution principle IV (Static SPA). No new top-level directories. New component `ClearAllConfirmation/` follows existing `DeleteConfirmation/` pattern.

## Complexity Tracking

> No constitution violations detected — this section is intentionally empty.
