# Quickstart: Home Screen Rework

**Feature**: 003-home-screen-rework  
**Date**: 2026-02-15

---

## Prerequisites

- Node.js (LTS)
- Git
- Branch `003-home-screen-rework` checked out

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev          # Start Vite dev server (hot reload)
npm run test:watch   # Run Vitest in watch mode
```

## Key Files to Modify

### Constants (start here — other files depend on these)

1. **`src/constants/avatars.ts`** — Remove dog, planet, flower, crown from `AVATARS` array
2. **`src/constants/avatarEmojis.ts`** — Remove dog, planet, flower, crown from `AVATAR_EMOJIS` record
3. **`src/constants/colors.ts`** — Remove orange, green from `COLORS` array

### Types

4. **`src/types/player.ts`** — Add `totalScore: number` and `gamesPlayed: number` to `Player` interface

### Services

5. **`src/services/playerStorage.ts`** — Add remapping logic in `readStore()`, add `clearAllStorage()` function, add `updatePlayerScore()` function, add migration v1→v2

### Hooks

6. **`src/hooks/usePlayers.ts`** — Add `clearAllPlayers` to return value, add alphabetical sort

### Components (implement after services are ready)

7. **`src/components/ClearAllConfirmation/ClearAllConfirmation.tsx`** — New confirmation dialog (follow DeleteConfirmation pattern)
8. **`src/components/PlayerCard/PlayerCard.tsx`** — Refactor to single-line horizontal layout with average score
9. **`src/components/WelcomeScreen/PlayerList.tsx`** — Add "Clear all profiles" button, wire up dialog
10. **`src/components/AvatarPicker/AvatarPicker.tsx`** — Update grid to 4×2
11. **`src/components/ColorPicker/ColorPicker.tsx`** — Update grid to 6×1

### Pages

12. **`src/pages/WelcomePage.tsx`** — Wire `onClearAll` handler, reduce spacing
13. **`src/pages/WelcomePage.module.css`** — Compact padding/margins

### CSS Modules (alongside their components)

14. Various `.module.css` files — Reduce gaps, padding per space budget

## Testing Strategy

### Write tests first (Test-First per constitution V)

```bash
npm run test         # Run once
npm run test:watch   # Watch mode
```

### Test files to create/modify

| Test file | What to test |
|-----------|-------------|
| `tests/components/ClearAllConfirmation.test.tsx` | **New**: Dialog renders, confirm/cancel callbacks, Escape key, overlay click, a11y |
| `tests/components/AvatarPicker.test.tsx` | Renders exactly 8 avatars, grid layout |
| `tests/components/ColorPicker.test.tsx` | Renders exactly 6 colors, grid layout |
| `tests/components/PlayerCard.test.tsx` | Single-line layout, average score display, "—" for no games |
| `tests/components/PlayerList.test.tsx` | Alphabetical sort, Clear all button visible/hidden, dialog flow |
| `tests/services/playerStorage.test.ts` | `clearAllStorage()`, v1→v2 migration, avatar/color remapping |
| `tests/integration/clearAllFlow.test.tsx` | Full flow: tap clear → confirm → storage empty → reload |
| `tests/a11y/accessibility.test.tsx` | axe-core on ClearAllConfirmation, modified WelcomePage |

## Verification Checklist

- [x] Avatar picker shows exactly 8 options in 4×2 grid
- [x] Color picker shows exactly 6 options in single row
- [x] Player cards are single-line: emoji, name, avg score, color dot, delete
- [x] Player list is sorted alphabetically (case-insensitive)
- [x] "Clear all profiles" button appears only when profiles exist
- [x] "Clear all profiles" button is at the bottom, de-emphasized
- [x] Confirmation dialog shows friendly warning text
- [x] Confirming clears all localStorage + sessionStorage and reloads
- [x] Cancelling (button or Escape) closes dialog without data loss
- [x] Legacy profiles with dog/planet/flower/crown avatars remap correctly
- [x] Legacy profiles with orange/green colors remap correctly
- [x] All content fits on 360×640 viewport without scrolling (both views)
- [ ] All tap targets ≥ 44×44px
- [ ] All axe-core accessibility tests pass
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] `npm run lint` passes
