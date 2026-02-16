import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Player, Session } from '../types/player';
import {
  startSession as sessionStartSession,
  endSession as sessionEndSession,
  getActiveSession,
} from '../services/sessionManager';
import { touchPlayer } from '../services/playerStorage';

/** Shape of the session context value. */
export interface UseSessionReturn {
  /** Current active session, or null if no session is active. */
  session: Session | null;
  /** Whether a session is currently active. */
  isActive: boolean;
  /** Start a session for the given player. */
  startSession: (player: Pick<Player, 'name' | 'avatarId'>) => void;
  /** End the current session. */
  endSession: () => void;
}

const SessionContext = createContext<UseSessionReturn | null>(null);

/** Provides session state to the component tree. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getActiveSession());

  const startSession = useCallback((player: Pick<Player, 'name' | 'avatarId'>) => {
    const newSession = sessionStartSession(player);
    setSession(newSession);
  }, []);

  const endSession = useCallback(() => {
    sessionEndSession();
    setSession(null);
  }, []);

  // Listen for visibilitychange to update lastActive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && session) {
        touchPlayer(session.playerName);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  const value: UseSessionReturn = {
    session,
    isActive: session !== null,
    startSession,
    endSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Hook to access the session context. Must be used within a SessionProvider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): UseSessionReturn {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
