# Session Manager Contract

**Module**: `frontend/src/services/sessionManager.ts`
**Purpose**: Session lifecycle management using sessionStorage.
**Storage Key**: `turbotiply_session`

## Interface

```typescript
/**
 * Start a new session for the given player.
 * - Writes session data to sessionStorage.
 * - Updates the player's lastActive timestamp in localStorage.
 * - Returns the created Session object.
 */
function startSession(player: Pick<Player, 'name' | 'avatarId' | 'colorId'>): Session;

/**
 * End the current session.
 * - Removes session data from sessionStorage.
 * - Does NOT delete the player from localStorage.
 */
function endSession(): void;

/**
 * Get the current active session, if any.
 * - Reads from sessionStorage.
 * - Returns null if no session exists (tab was closed, never started, etc.).
 */
function getActiveSession(): Session | null;

/**
 * Check whether a session is currently active.
 */
function hasActiveSession(): boolean;
```

## Behaviors

| Operation | Precondition | Postcondition |
|-----------|--------------|---------------|
| `startSession()` | No active session (or previous session ended) | Session stored in sessionStorage, player's `lastActive` updated |
| `endSession()` | Session active | sessionStorage cleared, React state set to null |
| `getActiveSession()` | None | Returns `Session` or `null` |
| `hasActiveSession()` | None | Returns boolean |

## Session Data (sessionStorage)

```json
{
  "playerName": "Mia",
  "avatarId": "cat",
  "colorId": "blue",
  "startedAt": 1739520000000
}
```

## Lifecycle Events

| Event | Trigger | Action |
|-------|---------|--------|
| Tab close | Browser closes tab | sessionStorage auto-cleared by browser — no code needed |
| Browser crash | OS/browser force-quit | sessionStorage lost — session gone on next load |
| Switch player | User taps "Switch player" | `endSession()` called explicitly |
| Visibility change | Tab hidden/shown | Update `lastActive` via `touchPlayer()` |
