# Quickstart: Remove Profile Colors

**Feature**: 004-remove-profile-colors  
**Date**: 2026-02-16

## What this feature does

Removes the color selection feature from player profiles in TurboTiply. Players are identified solely by their avatar emoji and name. The color picker UI, color dot display, and all color-related data storage are eliminated.

## Key changes at a glance

| Area | Change |
|------|--------|
| Player type | Remove `colorId` field |
| Session type | Remove `colorId` field |
| Storage schema | Bump v2 → v3, migration strips `colorId` from existing profiles |
| ColorPicker component | Delete entirely |
| NewPlayerForm | Remove color picker section |
| PlayerCard | Remove color dot |
| Header | Remove color-based border/text styling |
| constants/colors.ts | Delete entirely |
| All hooks/services | Remove `colorId` from signatures |

## Files deleted (4)

- `frontend/src/constants/colors.ts`
- `frontend/src/components/ColorPicker/ColorPicker.tsx`
- `frontend/src/components/ColorPicker/ColorPicker.module.css`
- `frontend/tests/components/ColorPicker.test.tsx`

## Files modified (~21)

### Source (10)
- `frontend/src/types/player.ts` — Remove `colorId` from Player & Session
- `frontend/src/services/playerStorage.ts` — Schema v3 migration, remove COLOR_REMAP, update savePlayer
- `frontend/src/services/sessionManager.ts` — Remove `colorId` from startSession
- `frontend/src/hooks/usePlayers.ts` — Remove `colorId` from savePlayer signature
- `frontend/src/hooks/useSession.tsx` — Remove `colorId` from startSession signature
- `frontend/src/components/WelcomeScreen/NewPlayerForm.tsx` — Remove ColorPicker import/render
- `frontend/src/components/PlayerCard/PlayerCard.tsx` — Remove color dot
- `frontend/src/components/PlayerCard/PlayerCard.module.css` — Remove `.colorDot` class
- `frontend/src/components/Header/Header.tsx` — Remove color styling
- `frontend/src/pages/WelcomePage.tsx` — Remove `colorId` from handler signatures

### Tests (14)
- `frontend/tests/components/NewPlayerForm.test.tsx`
- `frontend/tests/components/PlayerCard.test.tsx`
- `frontend/tests/components/Header.test.tsx`
- `frontend/tests/components/PlayerList.test.tsx`
- `frontend/tests/hooks/usePlayers.test.tsx`
- `frontend/tests/hooks/useSession.test.tsx`
- `frontend/tests/services/playerStorage.test.ts`
- `frontend/tests/services/sessionManager.test.ts`
- `frontend/tests/pages/WelcomePage.test.tsx`
- `frontend/tests/pages/MainPage.test.tsx`
- `frontend/tests/integration/clearAllFlow.test.tsx`
- `frontend/tests/integration/gameplayFlow.test.tsx`
- `frontend/tests/integration/sessionLifecycle.test.tsx`
- `frontend/tests/a11y/accessibility.test.tsx`

## Implementation order (suggested)

1. **Types first** — Remove `colorId` from `Player` and `Session` interfaces
2. **Services** — Update `playerStorage.ts` (migration + savePlayer) and `sessionManager.ts`
3. **Hooks** — Update `usePlayers.ts` and `useSession.tsx`
4. **Components** — Delete ColorPicker, update NewPlayerForm, PlayerCard, Header
5. **Pages** — Update WelcomePage
6. **Delete files** — Remove `constants/colors.ts`, `ColorPicker/` directory
7. **Tests** — Update all test files to remove `colorId` references
8. **Verify** — Run full test suite, check for TypeScript errors

## How to verify

```bash
cd frontend
npx tsc --noEmit          # No type errors
npx vitest run             # All tests pass
npx vitest run tests/a11y  # Accessibility tests pass
```
