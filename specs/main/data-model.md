# Data Model: Player Sessions

**Feature**: 001-player-sessions
**Date**: 2026-02-14

## Entities

### Player

Represents a person who has used the app on this device. Multiple players can exist per device (up to 50).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | `string` | 1–20 chars, trimmed, non-empty | Display name chosen by the child |
| `avatarId` | `string` | Must match a predefined avatar ID | Identifier referencing a predefined avatar (e.g., `"cat"`, `"rocket"`) |
| `colorId` | `string` | Must match a predefined color ID | Identifier referencing a predefined color (e.g., `"blue"`, `"purple"`) |
| `lastActive` | `number` | Unix epoch milliseconds | Timestamp of the most recent session start or activity. Used for ordering and eviction. |
| `createdAt` | `number` | Unix epoch milliseconds | Timestamp of profile creation. Immutable after creation. |

**Validation Rules**:
- `name`: Must be 1–20 characters after trimming leading/trailing whitespace. Special characters and emojis are allowed.
- `name` uniqueness: Case-insensitive comparison against existing players. If a match is found, user is prompted to overwrite or go back.
- `avatarId`: Must be one of the 12 predefined avatar identifiers. Default: first avatar in the list (pre-selected).
- `colorId`: Must be one of the 8 predefined color identifiers. Default: first color in the list (pre-selected).

**Relationships**:
- A Player has zero or more Sessions (one-to-many, but sessions are ephemeral and not stored).
- A Player's identity is their `name` (case-insensitive).

### Session

Represents a single play period for one player. Exists only while the browser tab is open. Not persisted to localStorage.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `playerName` | `string` | Must match an existing Player name | The name of the player this session belongs to |
| `avatarId` | `string` | Copied from Player at session start | Avatar for display in the session header |
| `colorId` | `string` | Copied from Player at session start | Color for display in the session header |
| `startedAt` | `number` | Unix epoch milliseconds | When the session was started |

**Lifecycle**:
- Created when a player is selected or a new player completes profile creation.
- Stored in `sessionStorage` (tab-scoped, auto-cleared on tab close).
- Destroyed when: tab/browser closes, user taps "Switch player", or browser crashes.
- NOT persisted across tab closures — welcome screen always shown on fresh page load.

**State Transitions**:
```
[No Session] ---(select player / create profile)---> [Active Session]
[Active Session] ---(tab close / switch player)---> [No Session]
[Active Session] ---(browser crash)---> [No Session]
[Active Session] ---(back button / URL re-entry)---> [Active Session]  (no change)
```

### PlayerStore (Storage Wrapper)

The top-level object persisted in localStorage under key `turbotiply_players`.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `version` | `number` | Positive integer | Schema version for migration support (starts at 1) |
| `players` | `Player[]` | Max 50 items, ordered by `lastActive` desc | Array of all stored player profiles |

**Invariants**:
- `players` array is always sorted by `lastActive` descending (most recent first).
- When `players.length` exceeds 50, the last item (oldest inactive) is removed before writing.
- `version` is bumped only when the schema changes; migration functions transform old versions.

## Predefined Data

### Avatars (12)

| ID | Label | Description |
|----|-------|-------------|
| `rocket` | Rocket | A flying rocket ship |
| `star` | Star | A shining star |
| `cat` | Cat | A friendly cat face |
| `dog` | Dog | A happy dog face |
| `turtle` | Turtle | A smiling turtle |
| `robot` | Robot | A cute robot |
| `dinosaur` | Dinosaur | A friendly dinosaur |
| `unicorn` | Unicorn | A magical unicorn |
| `planet` | Planet | A colorful planet |
| `flower` | Flower | A blooming flower |
| `lightning` | Lightning | A lightning bolt |
| `crown` | Crown | A royal crown |

### Colors (8)

| ID | Label | Hex | Text Color |
|----|-------|-----|------------|
| `red` | Red | `#D32F2F` | White |
| `orange` | Orange | `#E65100` | White |
| `gold` | Gold | `#F9A825` | `#1A1A1A` |
| `green` | Green | `#2E7D32` | White |
| `teal` | Teal | `#00796B` | White |
| `blue` | Blue | `#1565C0` | White |
| `purple` | Purple | `#6A1B9A` | White |
| `pink` | Pink | `#C2185B` | White |

## Storage Layout

```
localStorage:
  turbotiply_players → JSON(PlayerStore)

sessionStorage (per tab):
  turbotiply_session → JSON(Session)
```

## TypeScript Type Definitions

```typescript
// types/player.ts

export interface Player {
  name: string;          // 1–20 chars, trimmed
  avatarId: string;      // e.g., "cat", "rocket"
  colorId: string;       // e.g., "blue", "purple"
  lastActive: number;    // Date.now() epoch ms
  createdAt: number;     // Date.now() epoch ms, immutable
}

export interface Session {
  playerName: string;
  avatarId: string;
  colorId: string;
  startedAt: number;     // Date.now() epoch ms
}

export interface PlayerStore {
  version: number;       // Schema version (starts at 1)
  players: Player[];     // Max 50, sorted by lastActive desc
}
```
