# Service & Hook Contracts: Home Screen Rework

**Feature**: 003-home-screen-rework  
**Date**: 2026-02-15

---

## playerStorage.ts (modified)

### New Exports

#### `clearAllStorage(): void`

Clears all app data from browser storage.

- Calls `localStorage.clear()`
- Calls `sessionStorage.clear()`
- Throws `StorageUnavailableError` if the operation fails

#### `AVATAR_REMAP: Record<string, string>`

Mapping from removed avatar IDs to their replacement IDs.

```
{ dog: 'cat', planet: 'rocket', flower: 'star', crown: 'star' }
```

#### `COLOR_REMAP: Record<string, string>`

Mapping from removed color IDs to their replacement IDs.

```
{ orange: 'red', green: 'teal' }
```

### Modified Functions

#### `readStore(): PlayerStore` (internal)

**Changes**:
- After parsing, checks `store.version`:
  - If version 1: migrates all players by adding `totalScore: 0` and `gamesPlayed: 0`, sets version to 2, writes back.
- After migration, runs avatar/color remapping:
  - For each player, if `avatarId` is in `AVATAR_REMAP`, replaces it.
  - For each player, if `colorId` is in `COLOR_REMAP`, replaces it.
  - If any remappings occurred, writes the updated store back.

#### `updatePlayerScore(name: string, gameScore: number): void` (new)

Updates a player's cumulative score data after a game completes.

- Finds player by name (case-insensitive)
- Adds `gameScore` to `player.totalScore`
- Increments `player.gamesPlayed` by 1
- Writes store back

#### `getPlayers(): Player[]`

**Changes**: Return type now includes `totalScore` and `gamesPlayed` fields on each Player.

---

## usePlayers.ts (modified)

### New Return Fields

| Field | Type | Description |
|-------|------|-------------|
| **clearAllPlayers** | `() => void` | Calls `clearAllStorage()` then `window.location.reload()`. On failure, throws (caller handles error display). |

### Modified Behavior

- `players` array is now additionally sorted alphabetically by `player.name` (case-insensitive) for the returning-player list view. The `getPlayers()` function still returns by lastActive desc; the hook applies alphabetical sorting on top.

### Updated Interface

```typescript
export interface UsePlayersReturn {
  players: Player[];              // now sorted alphabetically
  storageAvailable: boolean;
  savePlayer: (data: Pick<Player, 'name' | 'avatarId' | 'colorId'>) => SavePlayerResult;
  deletePlayer: (name: string) => void;
  playerExists: (name: string) => boolean;
  clearAllPlayers: () => void;    // NEW
}
```

---

## avatars.ts (modified)

### Changes

- `AVATARS` array reduced from 12 to 8 entries
- Removed: `dog`, `planet`, `flower`, `crown`
- Order: rocket, star, cat, turtle, robot, dinosaur, unicorn, lightning
- `DEFAULT_AVATAR_ID` remains `'rocket'` (first in list, unchanged)

---

## avatarEmojis.ts (modified)

### Changes

- `AVATAR_EMOJIS` record reduced from 12 to 8 entries
- Removed keys: `dog`, `planet`, `flower`, `crown`
- `getAvatarEmoji()` fallback (⭐) unchanged — still handles unknown IDs

---

## colors.ts (modified)

### Changes

- `COLORS` array reduced from 8 to 6 entries
- Removed: `orange`, `green`
- Order: red, gold, teal, blue, purple, pink
- `DEFAULT_COLOR_ID` remains `'red'` (first in list, unchanged)

---

## player.ts (modified)

### Player Interface

Two new fields added:

```typescript
export interface Player {
  name: string;
  avatarId: string;
  colorId: string;
  lastActive: number;
  createdAt: number;
  totalScore: number;    // NEW — sum of completed game scores, default 0
  gamesPlayed: number;   // NEW — count of completed games, default 0
}
```

### PlayerStore Interface

```typescript
export interface PlayerStore {
  version: number;   // now 2 (was 1)
  players: Player[];
}
```
