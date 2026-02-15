# React Hooks Contract

**Module**: `frontend/src/hooks/useSession.ts` and `frontend/src/hooks/usePlayers.ts`
**Purpose**: React hooks exposing session and player state to components.

## useSession Hook

**File**: `frontend/src/hooks/useSession.ts`

```typescript
interface UseSessionReturn {
  /** Current active session, or null if no session is active */
  session: Session | null;

  /** Whether a session is currently active */
  isActive: boolean;

  /** Start a session for the given player. Navigates away from welcome screen. */
  startSession: (player: Pick<Player, 'name' | 'avatarId' | 'colorId'>) => void;

  /** End the current session. Returns to welcome screen. */
  endSession: () => void;
}

function useSession(): UseSessionReturn;
```

**Provided via**: `SessionContext` + `SessionProvider` wrapping the app.

**Behavior**:
- On mount, reads from `sessionStorage` to restore session if tab was not closed.
- `startSession()` writes to sessionStorage, updates player lastActive, sets React state.
- `endSession()` clears sessionStorage and sets React state to null.
- Components re-render when session changes.

## usePlayers Hook

**File**: `frontend/src/hooks/usePlayers.ts`

```typescript
interface UsePlayersReturn {
  /** All stored players, ordered by lastActive desc */
  players: Player[];

  /** Whether localStorage is available */
  storageAvailable: boolean;

  /** Add a new player or overwrite existing */
  savePlayer: (data: Pick<Player, 'name' | 'avatarId' | 'colorId'>) => Player;

  /** Remove a player by name */
  deletePlayer: (name: string) => void;

  /** Check if a name is already taken (case-insensitive) */
  playerExists: (name: string) => boolean;
}

function usePlayers(): UsePlayersReturn;
```

**Behavior**:
- Reads player list from localStorage on mount.
- Re-reads after any mutation (save, delete) to keep state in sync.
- Returns `storageAvailable: false` if localStorage is inaccessible (triggers graceful degradation UI).

## Component → Hook Mapping

| Component | Hooks Used | Purpose |
|-----------|-----------|---------|
| `WelcomePage` | `useSession`, `usePlayers` | Route guard: if session active → redirect to main |
| `WelcomeScreen` (returning) | `usePlayers` | Display player list, handle delete |
| `WelcomeScreen` (new player) | `usePlayers`, `useSession` | Create profile, start session |
| `Header` | `useSession` | Display current player, "Switch player" button |
| `MainPage` | `useSession` | Route guard: if no session → redirect to welcome |
