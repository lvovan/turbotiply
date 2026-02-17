# Data Model: Player Name Limit

**Feature**: 022-player-name-limit  
**Date**: 2025-07-15  

## Entities

### Player (modified)

| Field | Type | Constraint Change |
|-------|------|-------------------|
| `name` | `string` | Max length reduced from 20 → 10 for new entries. Existing entries with length > 10 are preserved as-is. |

All other fields (`avatarId`, `lastActive`, `createdAt`, `totalScore`, `gamesPlayed`, `gameHistory`) are unchanged.

### PlayerStore (unchanged)

No structural changes. `version` remains at 5. No migration needed.

## Validation Rules

| Rule | Layer | Before | After |
|------|-------|--------|-------|
| Max name length | UI (NewPlayerForm) | 20 | **10** |
| HTML `maxLength` attribute | UI (input element) | 20 | **10** |
| JS `.slice()` in `onChange` | UI (input handler) | `.slice(0, 20)` | `.slice(0, 10)` |
| Submit-time validation | UI (form submit) | `length <= 20` | `length <= 10` |
| Storage-layer validation | Service (playerStorage) | None | None (unchanged) |

## State Transitions

No new states. The character counter is derived state computed from `name.length` — no separate state variable needed.

## New UI State

| Element | Source | Description |
|---------|--------|-------------|
| Character counter text | `name.length` / `MAX_NAME_LENGTH` | Rendered as `"{current}/{max}"` below input |
| Warning style | `name.length >= MAX_NAME_LENGTH` | Orange text when at capacity |
