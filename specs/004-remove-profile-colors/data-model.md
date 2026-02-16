# Data Model: Remove Profile Colors

**Feature**: 004-remove-profile-colors  
**Date**: 2026-02-16

## Entity Changes

### Player (MODIFIED)

Represents a stored player profile in localStorage.

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| name | string | unchanged | Display name (1–20 chars, trimmed) |
| avatarId | string | unchanged | References a predefined avatar |
| ~~colorId~~ | ~~string~~ | **REMOVED** | ~~References a predefined color~~ |
| lastActive | number | unchanged | Epoch ms of last activity |
| createdAt | number | unchanged | Epoch ms of profile creation |
| totalScore | number | unchanged | Sum of all completed game scores |
| gamesPlayed | number | unchanged | Count of completed games |

**Validation rules** (unchanged):
- `name`: 1–20 characters after trimming, unique (case-insensitive)
- `avatarId`: Must reference a valid avatar in `AVATARS` constant

### Session (MODIFIED)

Represents a tab-scoped play session in sessionStorage.

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| playerName | string | unchanged | Name of the session player |
| avatarId | string | unchanged | Avatar copied from Player at session start |
| ~~colorId~~ | ~~string~~ | **REMOVED** | ~~Color copied from Player at session start~~ |
| startedAt | number | unchanged | Epoch ms of session start |

### PlayerStore (MODIFIED)

Top-level localStorage structure under key `turbotiply_players`.

| Field | Type | Change | Description |
|-------|------|--------|-------------|
| version | number | **UPDATED**: 2 → 3 | Schema version for migration |
| players | Player[] | unchanged structure | Array of player profiles (max 50) |

## Removed Entities

### ColorDefinition (DELETED)

Previously defined in `constants/colors.ts`. No longer needed.

| Field | Type | Description |
|-------|------|-------------|
| ~~id~~ | ~~string~~ | ~~Unique identifier~~ |
| ~~label~~ | ~~string~~ | ~~Human-readable label~~ |
| ~~hex~~ | ~~string~~ | ~~Hex color value~~ |
| ~~textColor~~ | ~~string~~ | ~~WCAG AA contrast text color~~ |

### COLORS constant (DELETED)

Previously: 6 predefined colors (red, gold, teal, blue, purple, pink). Removed entirely.

### COLOR_REMAP constant (DELETED)

Previously: `{ orange: 'red', green: 'teal' }`. No longer needed since the field itself is removed.

## State Transitions

### Storage Migration: v2 → v3

```
v2 store loaded
  │
  ├─ For each player:
  │    └─ delete player.colorId
  │
  ├─ Remove COLOR_REMAP logic (code deletion)
  │
  ├─ Set version = 3
  │
  └─ Write updated store to localStorage
```

**Invariants**:
- All non-color fields are preserved exactly
- Players array ordering is maintained
- Migration is idempotent (running on v3 data is a no-op)

## Relationships

```
PlayerStore (1) ──contains──▶ Player (0..50)
Session (0..1 per tab) ──references──▶ Player (by name + avatarId)
```

No relationship to ColorDefinition after this change.
