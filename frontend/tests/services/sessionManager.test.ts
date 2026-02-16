import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  startSession,
  endSession,
  getActiveSession,
  hasActiveSession,
  SESSION_KEY,
} from '../../src/services/sessionManager';
import * as playerStorage from '../../src/services/playerStorage';

describe('sessionManager', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('startSession', () => {
    it('creates a session and stores it in sessionStorage', () => {
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});

      const session = startSession({ name: 'Mia', avatarId: 'cat' });

      expect(session.playerName).toBe('Mia');
      expect(session.avatarId).toBe('cat');
      expect(session.startedAt).toBe(now);

      const stored = JSON.parse(sessionStorage.getItem(SESSION_KEY)!);
      expect(stored.playerName).toBe('Mia');

      vi.restoreAllMocks();
    });

    it('updates the player lastActive timestamp via touchPlayer', () => {
      const touchSpy = vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});

      startSession({ name: 'Mia', avatarId: 'cat' });

      expect(touchSpy).toHaveBeenCalledWith('Mia');

      vi.restoreAllMocks();
    });
  });

  describe('endSession', () => {
    it('clears the session from sessionStorage', () => {
      vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});
      startSession({ name: 'Mia', avatarId: 'cat' });
      vi.restoreAllMocks();

      expect(hasActiveSession()).toBe(true);

      endSession();

      expect(hasActiveSession()).toBe(false);
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('is a no-op if no session exists', () => {
      expect(() => endSession()).not.toThrow();
    });
  });

  describe('getActiveSession', () => {
    it('returns null if no session exists', () => {
      expect(getActiveSession()).toBeNull();
    });

    it('returns null if sessionStorage contains invalid JSON', () => {
      sessionStorage.setItem(SESSION_KEY, 'not json');
      expect(getActiveSession()).toBeNull();
    });

    it('returns the active session', () => {
      vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});
      startSession({ name: 'Mia', avatarId: 'cat' });
      vi.restoreAllMocks();

      const session = getActiveSession();
      expect(session).not.toBeNull();
      expect(session!.playerName).toBe('Mia');
    });
  });

  describe('hasActiveSession', () => {
    it('returns false when no session', () => {
      expect(hasActiveSession()).toBe(false);
    });

    it('returns true when session is active', () => {
      vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});
      startSession({ name: 'Mia', avatarId: 'cat' });
      vi.restoreAllMocks();

      expect(hasActiveSession()).toBe(true);
    });

    it('returns false after endSession', () => {
      vi.spyOn(playerStorage, 'touchPlayer').mockImplementation(() => {});
      startSession({ name: 'Mia', avatarId: 'cat' });
      vi.restoreAllMocks();

      endSession();
      expect(hasActiveSession()).toBe(false);
    });
  });
});
