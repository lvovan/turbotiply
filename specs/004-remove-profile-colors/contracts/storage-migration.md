# Contract: Storage Migration v2 → v3

**Feature**: 004-remove-profile-colors  
**Date**: 2026-02-16

## Overview

Defines the contract for migrating localStorage player data from schema version 2 (with `colorId`) to version 3 (without `colorId`).

## Migration Function (within `readStore`)

### Trigger

- When `parsed.version === 2` (or any version < 3)

### Behavior

```
Input:  PlayerStore { version: 2, players: Player[] }
        where each Player MAY have a colorId: string property

Output: PlayerStore { version: 3, players: Player[] }
        where NO Player has a colorId property
```

### Postconditions

1. `store.version === 3`
2. For each player in `store.players`:
   - `player.colorId` is `undefined` (property deleted)
   - `player.name` is unchanged
   - `player.avatarId` is unchanged (avatar remap still applies separately)
   - `player.lastActive` is unchanged
   - `player.createdAt` is unchanged
   - `player.totalScore` is unchanged
   - `player.gamesPlayed` is unchanged
3. `store.players.length` is unchanged
4. Updated store is persisted to localStorage

### Error Handling

- If localStorage is unavailable, `readStore` returns a default empty store (existing behavior, unchanged)
- If JSON parsing fails, `readStore` returns a default empty store (existing behavior, unchanged)
- Migration is idempotent: calling on v3 data produces no changes

## Removed Exports

The following exports from `playerStorage.ts` are removed:

| Export | Type | Replacement |
|--------|------|-------------|
| `COLOR_REMAP` | `Record<string, string>` | None — deleted |

## Modified Exports

### `savePlayer`

**Before**: `savePlayer(data: Pick<Player, 'name' | 'avatarId' | 'colorId'>): SavePlayerResult`

**After**: `savePlayer(data: Pick<Player, 'name' | 'avatarId'>): SavePlayerResult`

Behavior change: No `colorId` is stored on the created/updated Player object.

### `getPlayers`

**Before**: Returns `Player[]` where each player has `colorId: string`

**After**: Returns `Player[]` where no player has `colorId`

No signature change — the return type narrows automatically from the `Player` interface change.

## Session Manager Contract Change

### `startSession`

**Before**: `startSession(player: Pick<Player, 'name' | 'avatarId' | 'colorId'>): Session`

**After**: `startSession(player: Pick<Player, 'name' | 'avatarId'>): Session`

The returned `Session` object no longer includes `colorId`.

## Test Expectations

1. A v2 store with players containing `colorId` must be loaded and migrated to v3 with `colorId` stripped
2. A v3 store (already migrated) must load without errors
3. `savePlayer` must accept data without `colorId` and produce a player without `colorId`
4. `startSession` must accept data without `colorId` and produce a session without `colorId`
