# Contract: Component Changes

**Feature**: 004-remove-profile-colors  
**Date**: 2026-02-16

## Deleted Components

### ColorPicker

**Files removed**:
- `frontend/src/components/ColorPicker/ColorPicker.tsx`
- `frontend/src/components/ColorPicker/ColorPicker.module.css`

**Previous interface**:
```
Props: { selectedId: string, onSelect: (colorId: string) => void }
Renders: radiogroup of 6 color swatches with roving tabindex
```

No replacement component. The avatar picker already provides profile customization.

## Modified Components

### NewPlayerForm

**File**: `frontend/src/components/WelcomeScreen/NewPlayerForm.tsx`

**Props change**:

| Prop | Before | After |
|------|--------|-------|
| `onSubmit` | `(data: Pick<Player, 'name' \| 'avatarId' \| 'colorId'>) => void` | `(data: Pick<Player, 'name' \| 'avatarId'>) => void` |

**Behavior change**:
- Remove `colorId` state variable and `DEFAULT_COLOR_ID` import
- Remove `ColorPicker` import and rendering
- Remove "Choose your color" label
- Submit data contains only `{ name, avatarId }`

### PlayerCard

**File**: `frontend/src/components/PlayerCard/PlayerCard.tsx`

**Props**: Unchanged (receives `Player` type which no longer has `colorId`)

**Behavior change**:
- Remove `COLORS` import
- Remove `color` lookup variable
- Remove `<span className={styles.colorDot}>` element
- Remove `.colorDot` CSS class from module

**Layout after change**: `avatar emoji | name | avg score | delete button`  
(Previously: `avatar emoji | name | avg score | color dot | delete button`)

### Header

**File**: `frontend/src/components/Header/Header.tsx`

**Props**: Unchanged (receives `Session` type which no longer has `colorId`)

**Behavior change**:
- Remove `COLORS` import
- Remove `color` lookup from `session.colorId`
- Remove `style={{ borderBottomColor: color?.hex }}` from `<header>`
- Remove `style={{ color: color?.hex }}` from greeting `<span>`
- Header uses default CSS styling only

## Modified Pages

### WelcomePage

**File**: `frontend/src/pages/WelcomePage.tsx`

**Behavior change**:
- `handleTemporaryPlay` signature: remove `colorId` from Pick type
- `handleNewPlayer` signature: remove `colorId` from Pick type
- `handleSelectPlayer`: remove `colorId` from `startSession()` call

## Modified Hooks

### usePlayers

**File**: `frontend/src/hooks/usePlayers.ts`

| Method | Before | After |
|--------|--------|-------|
| `savePlayer` | `(data: Pick<Player, 'name' \| 'avatarId' \| 'colorId'>) => SavePlayerResult` | `(data: Pick<Player, 'name' \| 'avatarId'>) => SavePlayerResult` |

### useSession

**File**: `frontend/src/hooks/useSession.tsx`

| Method | Before | After |
|--------|--------|-------|
| `startSession` | `(player: Pick<Player, 'name' \| 'avatarId' \| 'colorId'>) => void` | `(player: Pick<Player, 'name' \| 'avatarId'>) => void` |
