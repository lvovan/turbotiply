# Component Contracts: Home Screen Rework

**Feature**: 003-home-screen-rework  
**Date**: 2026-02-15

---

## ClearAllConfirmation (new component)

**Purpose**: Accessible modal dialog confirming the "Clear all profiles" destructive action.  
**Pattern**: Follows existing `DeleteConfirmation` component pattern.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onConfirm | `() => void` | yes | Called when user confirms the clear action |
| onCancel | `() => void` | yes | Called when user cancels or presses Escape |

### Behavior

- Renders a fixed overlay with centered dialog
- Dialog has `role="dialog"`, `aria-modal="true"`, `aria-label="Clear all profiles"`
- Focus is set to the dialog container on mount
- Escape key calls `onCancel`
- Clicking overlay background calls `onCancel`
- Clicking inside dialog stops propagation
- Dialog title: "Clear all profiles?"
- Dialog message: "This will delete all players and scores. Are you sure? This can't be undone!"
- Two buttons: "Cancel" (calls `onCancel`) and "Clear all" (calls `onConfirm`, styled as destructive — red background)
- Cancel button appears before Clear button (left to right) to match existing delete dialog pattern

### Accessibility

- `role="dialog"` + `aria-modal="true"`
- Focus trapped within dialog (tabIndex=-1 on container, auto-focus on mount)
- Escape key dismissal
- Minimum 44×44px tap targets on both buttons

---

## AvatarPicker (modified)

### Changes

- Renders 8 avatars instead of 12 (reads from reduced `AVATARS` constant)
- Grid layout: 4 columns × 2 rows (mobile and desktop)
- No props changes — component reads from the `AVATARS` array constant
- `aria-label` values unchanged for retained avatars

### Grid CSS

- `grid-template-columns: repeat(4, 1fr)` — same on all viewports
- Gap: 8px (reduced from 12px)
- Avatar emoji font size: 1.75rem (reduced from 2rem) for compactness
- Min item size: 44×44px maintained

---

## ColorPicker (modified)

### Changes

- Renders 6 colors instead of 8 (reads from reduced `COLORS` constant)
- Grid layout: 6 columns × 1 row (single row)
- No props changes — component reads from the `COLORS` array constant

### Grid CSS

- `grid-template-columns: repeat(6, 1fr)`
- Gap: 10px (reduced from 12px)
- Min item size: 44×44px maintained

---

## PlayerCard (modified)

### Props Changes

| Prop | Type | Change | Description |
|------|------|--------|-------------|
| player | Player | modified | Now includes `totalScore` and `gamesPlayed` fields |
| onSelect | `(player: Player) => void` | unchanged | |
| onDelete | `(player: Player) => void` | unchanged | |

### Layout Change

Single-line horizontal layout (left to right):
1. Avatar emoji (1.5rem, flex-shrink: 0)
2. Player name (flex: 1, ellipsis overflow)
3. Average score text ("Avg: {n}" or "—", muted color, flex-shrink: 0)
4. Color dot (12×12px circle, flex-shrink: 0)
5. Delete button "✕" (44×44px tap target, flex-shrink: 0)

### CSS

- Card: `display: flex; align-items: center; gap: 8px; padding: 8px 12px; min-height: 44px`
- Name: `font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`
- Score: `font-size: 0.8rem; color: #888`
- Remove separate `.info` column layout — everything in a single row

---

## PlayerList (modified)

### Props Changes

| Prop | Type | Change | Description |
|------|------|--------|-------------|
| players | Player[] | unchanged | |
| onSelectPlayer | `(player: Player) => void` | unchanged | |
| onDeletePlayer | `(name: string) => void` | unchanged | |
| onNewPlayer | `() => void` | unchanged | |
| **onClearAll** | **`() => void`** | **new** | **Called when user taps "Clear all profiles"** |

### Behavior Changes

- Players arrive pre-sorted alphabetically from `usePlayers` hook — PlayerList does NOT sort
- Renders `ClearAllConfirmation` dialog when clear-all is triggered (internal state)
- "Clear all profiles" button positioned after "New player" button
- "Clear all profiles" button styled as de-emphasized: smaller text (0.85rem), muted color (#888), transparent background, text-only (no emoji prefix)
- When >5 player cards rendered, the card list container MUST show a bottom fade gradient (24px tall, semi-transparent white-to-transparent) to visually indicate scroll overflow (FR-015)

### Rendering Order

1. Player cards (pre-sorted alphabetically by `usePlayers` hook)
2. "New player" button
3. "Clear all profiles" button (de-emphasized, text-only)
4. ClearAllConfirmation dialog (conditional)

---

## NewPlayerForm (modified — CSS only)

### Changes

- Reduced gap between field groups: 16px (from 24px)
- Reduced form padding: 12px (from 16px)
- No props or behavior changes

---

## WelcomePage (modified)

### Changes

- Reduced top padding: 16px (from 24px)
- Reduced subtitle margin-bottom: 16px (from 32px)
- Passes `onClearAll` handler to `PlayerList`
- `onClearAll` handler: calls `clearAllPlayers()` from the `usePlayers` hook (which internally calls `clearAllStorage()` then `window.location.reload()`)
- Wraps `clearAllPlayers()` call in try/catch; on failure, sets an error message state and renders a dismissible error banner in the UI
