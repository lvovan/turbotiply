import type { Player, Session } from '../types/player';
import { touchPlayer } from './playerStorage';

/** sessionStorage key for active session. */
export const SESSION_KEY = 'turbotiply_session';

/**
 * Start a new session for the given player.
 * - Writes session data to sessionStorage.
 * - Updates the player's lastActive timestamp in localStorage.
 * - Returns the created Session object.
 */
export function startSession(player: Pick<Player, 'name' | 'avatarId'>): Session {
  const session: Session = {
    playerName: player.name,
    avatarId: player.avatarId,
    startedAt: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  touchPlayer(player.name);
  return session;
}

/**
 * End the current session.
 * - Removes session data from sessionStorage.
 */
export function endSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Get the current active session, if any.
 * - Returns null if no session exists.
 */
export function getActiveSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/**
 * Check whether a session is currently active.
 */
export function hasActiveSession(): boolean {
  return getActiveSession() !== null;
}
