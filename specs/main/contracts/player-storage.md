# Player Storage Service Contract

**Module**: `frontend/src/services/playerStorage.ts`
**Purpose**: CRUD operations for player profiles in localStorage.
**Storage Key**: `turbotiply_players`

## Interface

```typescript
/**
 * Retrieve all stored players, ordered by lastActive descending.
 * Returns empty array if no data exists or storage is unavailable.
 */
function getPlayers(): Player[];

/**
 * Add a new player or overwrite an existing player (by name, case-insensitive).
 * - Sets lastActive and createdAt to Date.now() for new players.
 * - Preserves createdAt, updates lastActive for overwrites.
 * - Re-sorts array by lastActive desc.
 * - Enforces 50-player cap (evicts oldest inactive).
 * - Throws StorageUnavailableError if localStorage is not accessible.
 */
function savePlayer(player: Pick<Player, 'name' | 'avatarId' | 'colorId'>): Player;

/**
 * Remove a player by name (case-insensitive).
 * Also removes all associated data (future: scores, progress).
 * No-op if player does not exist.
 */
function deletePlayer(name: string): void;

/**
 * Check if a player with the given name exists (case-insensitive).
 */
function playerExists(name: string): boolean;

/**
 * Update the lastActive timestamp for a player (called on session start
 * and on visibilitychange events).
 */
function touchPlayer(name: string): void;

/**
 * Check if localStorage is available and writable.
 */
function isStorageAvailable(): boolean;
```

## Error Handling

```typescript
class StorageUnavailableError extends Error {
  constructor() {
    super('Browser storage is not available');
    this.name = 'StorageUnavailableError';
  }
}
```

## Behaviors

| Operation | Precondition | Postcondition |
|-----------|--------------|---------------|
| `getPlayers()` | None | Returns `Player[]` sorted by `lastActive` desc, max 50 |
| `savePlayer()` | Name is 1–20 chars, trimmed, non-empty | Player stored, array re-sorted, cap enforced |
| `savePlayer()` (overwrite) | Player with same name exists | `avatarId`/`colorId` updated, `lastActive` updated, `createdAt` preserved |
| `deletePlayer()` | None | Player removed if exists; no-op otherwise |
| `touchPlayer()` | Player exists | `lastActive` updated to `Date.now()`, array re-sorted |
| `isStorageAvailable()` | None | Returns boolean |
