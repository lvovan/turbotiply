import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPlayers,
  savePlayer,
  deletePlayer,
  playerExists,
  touchPlayer,
  isStorageAvailable,
  StorageUnavailableError,
  STORAGE_KEY,
  clearAllStorage,
  updatePlayerScore,
  AVATAR_REMAP,
} from '../../src/services/playerStorage';
import type { PlayerStore } from '../../src/types/player';

describe('playerStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isStorageAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage throws', () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceeded');
      };
      expect(isStorageAvailable()).toBe(false);
      Storage.prototype.setItem = original;
    });
  });

  describe('getPlayers', () => {
    it('returns empty array when no data exists', () => {
      expect(getPlayers()).toEqual([]);
    });

    it('returns empty array when storage contains invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not json');
      expect(getPlayers()).toEqual([]);
    });

    it('returns players sorted by lastActive descending', () => {
      const store: PlayerStore = {
        version: 2,
        players: [
          { name: 'Alice', avatarId: 'cat', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
          { name: 'Bob', avatarId: 'robot', lastActive: 300, createdAt: 60, totalScore: 0, gamesPlayed: 0 },
          { name: 'Charlie', avatarId: 'star', lastActive: 200, createdAt: 70, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      const players = getPlayers();
      expect(players).toHaveLength(3);
      expect(players[0].name).toBe('Bob');
      expect(players[1].name).toBe('Charlie');
      expect(players[2].name).toBe('Alice');
    });

    it('returns at most 50 players', () => {
      const players = Array.from({ length: 55 }, (_, i) => ({
        name: `Player${i}`,
        avatarId: 'cat',
        lastActive: i,
        createdAt: i,
      }));
      const store: PlayerStore = { version: 1, players };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      expect(getPlayers()).toHaveLength(50);
    });
  });

  describe('savePlayer', () => {
    it('saves a new player with timestamps', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const { player, evictedNames } = savePlayer({ name: 'Mia', avatarId: 'cat' });

      expect(player.name).toBe('Mia');
      expect(player.avatarId).toBe('cat');
      expect(player.lastActive).toBe(now);
      expect(player.createdAt).toBe(now);
      expect(evictedNames).toEqual([]);

      const stored = getPlayers();
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Mia');

      vi.restoreAllMocks();
    });

    it('trims whitespace from the name', () => {
      const { player } = savePlayer({ name: '  Mia  ', avatarId: 'cat' });
      expect(player.name).toBe('Mia');
    });

    it('overwrites existing player (case-insensitive) preserving createdAt', () => {
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      vi.spyOn(Date, 'now').mockReturnValue(2000);
      const { player: updated } = savePlayer({ name: 'mia', avatarId: 'robot' });

      expect(updated.avatarId).toBe('robot');
      expect(updated.lastActive).toBe(2000);
      expect(updated.createdAt).toBe(1000); // preserved

      expect(getPlayers()).toHaveLength(1);
      vi.restoreAllMocks();
    });

    it('enforces 50-player cap by evicting oldest inactive', () => {
      for (let i = 0; i < 50; i++) {
        vi.spyOn(Date, 'now').mockReturnValue(i * 100);
        savePlayer({ name: `Player${i}`, avatarId: 'cat' });
        vi.restoreAllMocks();
      }
      expect(getPlayers()).toHaveLength(50);

      vi.spyOn(Date, 'now').mockReturnValue(99999);
      const { evictedNames } = savePlayer({ name: 'NewPlayer', avatarId: 'star' });
      vi.restoreAllMocks();

      const players = getPlayers();
      expect(players).toHaveLength(50);
      expect(players[0].name).toBe('NewPlayer');
      // Oldest player (Player0) should have been evicted
      expect(players.find((p) => p.name === 'Player0')).toBeUndefined();
      expect(evictedNames).toContain('Player0');
    });

    it('re-sorts array by lastActive desc after save', () => {
      vi.spyOn(Date, 'now').mockReturnValue(100);
      savePlayer({ name: 'Alice', avatarId: 'cat' });
      vi.spyOn(Date, 'now').mockReturnValue(200);
      savePlayer({ name: 'Bob', avatarId: 'robot' });
      vi.spyOn(Date, 'now').mockReturnValue(300);
      savePlayer({ name: 'Charlie', avatarId: 'star' });

      vi.restoreAllMocks();

      const players = getPlayers();
      expect(players[0].name).toBe('Charlie');
      expect(players[1].name).toBe('Bob');
      expect(players[2].name).toBe('Alice');
    });

    it('throws StorageUnavailableError when localStorage is not accessible', () => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceeded');
      };

      expect(() => savePlayer({ name: 'Mia', avatarId: 'cat' })).toThrow(
        StorageUnavailableError,
      );

      Storage.prototype.setItem = original;
    });
  });

  describe('deletePlayer', () => {
    it('removes a player by name (case-insensitive)', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat' });
      expect(getPlayers()).toHaveLength(1);

      deletePlayer('mia');
      expect(getPlayers()).toHaveLength(0);
    });

    it('is a no-op if player does not exist', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat' });
      deletePlayer('NonExistent');
      expect(getPlayers()).toHaveLength(1);
    });
  });

  describe('playerExists', () => {
    it('returns true for existing player (case-insensitive)', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat' });
      expect(playerExists('mia')).toBe(true);
      expect(playerExists('MIA')).toBe(true);
      expect(playerExists('Mia')).toBe(true);
    });

    it('returns false for non-existing player', () => {
      expect(playerExists('Ghost')).toBe(false);
    });
  });

  describe('touchPlayer', () => {
    it('updates lastActive timestamp for existing player', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      vi.spyOn(Date, 'now').mockReturnValue(5000);
      touchPlayer('Mia');

      const players = getPlayers();
      expect(players[0].lastActive).toBe(5000);
      expect(players[0].createdAt).toBe(1000); // unchanged

      vi.restoreAllMocks();
    });

    it('is a no-op if player does not exist', () => {
      touchPlayer('Ghost');
      expect(getPlayers()).toHaveLength(0);
    });

    it('re-sorts players after touch', () => {
      vi.spyOn(Date, 'now').mockReturnValue(100);
      savePlayer({ name: 'Alice', avatarId: 'cat' });
      vi.spyOn(Date, 'now').mockReturnValue(200);
      savePlayer({ name: 'Bob', avatarId: 'robot' });
      vi.restoreAllMocks();

      // Alice is oldest, touch her to make her most recent
      vi.spyOn(Date, 'now').mockReturnValue(999);
      touchPlayer('Alice');
      vi.restoreAllMocks();

      const players = getPlayers();
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
    });
  });

  describe('v1 → v2 migration', () => {
    it('adds totalScore=0 and gamesPlayed=0 to v1 players', () => {
      const v1Store = {
        version: 1,
        players: [
          { name: 'Alice', avatarId: 'cat', colorId: 'blue', lastActive: 100, createdAt: 50 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v1Store));

      const players = getPlayers();
      expect(players[0].totalScore).toBe(0);
      expect(players[0].gamesPlayed).toBe(0);

      // Verify store was updated to v3 (migrated through v2 then v3)
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PlayerStore;
      expect(stored.version).toBe(3);
    });
  });

  describe('v2 → v3 migration', () => {
    it('strips colorId from all v2 players on load', () => {
      const v2Store = {
        version: 2,
        players: [
          { name: 'Alice', avatarId: 'cat', colorId: 'blue', lastActive: 100, createdAt: 50, totalScore: 10, gamesPlayed: 2 },
          { name: 'Bob', avatarId: 'robot', colorId: 'red', lastActive: 200, createdAt: 60, totalScore: 5, gamesPlayed: 1 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v2Store));

      const players = getPlayers();
      expect(players).toHaveLength(2);
      // colorId should be gone
      for (const p of players) {
        expect((p as Record<string, unknown>)['colorId']).toBeUndefined();
      }
      // Other fields preserved
      const alice = players.find((p) => p.name === 'Alice')!;
      expect(alice.avatarId).toBe('cat');
      expect(alice.totalScore).toBe(10);
      expect(alice.gamesPlayed).toBe(2);
    });

    it('bumps version to 3 and persists', () => {
      const v2Store = {
        version: 2,
        players: [
          { name: 'A', avatarId: 'cat', colorId: 'blue', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v2Store));

      getPlayers();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PlayerStore;
      expect(stored.version).toBe(3);
      expect((stored.players[0] as Record<string, unknown>)['colorId']).toBeUndefined();
    });

    it('is idempotent on v3 data', () => {
      const v3Store: PlayerStore = {
        version: 3,
        players: [
          { name: 'A', avatarId: 'cat', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Store));

      const players = getPlayers();
      expect(players).toHaveLength(1);
      expect(players[0].name).toBe('A');
    });
  });

  describe('avatar remapping', () => {
    it('remaps removed avatar IDs to their replacements on load', () => {
      const store = {
        version: 2,
        players: [
          { name: 'A', avatarId: 'dog', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
          { name: 'B', avatarId: 'planet', lastActive: 200, createdAt: 60, totalScore: 0, gamesPlayed: 0 },
          { name: 'C', avatarId: 'flower', lastActive: 300, createdAt: 70, totalScore: 0, gamesPlayed: 0 },
          { name: 'D', avatarId: 'crown', lastActive: 400, createdAt: 80, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

      const players = getPlayers();
      expect(players.find((p) => p.name === 'A')!.avatarId).toBe('cat');
      expect(players.find((p) => p.name === 'B')!.avatarId).toBe('rocket');
      expect(players.find((p) => p.name === 'C')!.avatarId).toBe('star');
      expect(players.find((p) => p.name === 'D')!.avatarId).toBe('star');
    });

    it('persists remapped avatars after load', () => {
      const store = {
        version: 2,
        players: [
          { name: 'A', avatarId: 'dog', colorId: 'orange', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

      // Trigger the load + remap
      getPlayers();

      // Read raw storage to verify persistence
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PlayerStore;
      expect(stored.players[0].avatarId).toBe('cat');
    });

    it('AVATAR_REMAP maps dog→cat, planet→rocket, flower→star, crown→star', () => {
      expect(AVATAR_REMAP).toEqual({ dog: 'cat', planet: 'rocket', flower: 'star', crown: 'star' });
    });
  });

  describe('clearAllStorage', () => {
    it('clears all localStorage and sessionStorage', () => {
      localStorage.setItem('test_key', 'value');
      sessionStorage.setItem('session_key', 'value');

      clearAllStorage();

      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
    });

    it('clears player data from localStorage', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat' });
      expect(getPlayers()).toHaveLength(1);

      clearAllStorage();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('updatePlayerScore', () => {
    it('increments totalScore and gamesPlayed for existing player', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      updatePlayerScore('Mia', 15);
      let players = getPlayers();
      expect(players[0].totalScore).toBe(15);
      expect(players[0].gamesPlayed).toBe(1);

      updatePlayerScore('Mia', 20);
      players = getPlayers();
      expect(players[0].totalScore).toBe(35);
      expect(players[0].gamesPlayed).toBe(2);
    });

    it('finds player case-insensitively', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      updatePlayerScore('mia', 10);
      const players = getPlayers();
      expect(players[0].totalScore).toBe(10);
    });

    it('is a no-op if player does not exist', () => {
      updatePlayerScore('Ghost', 10);
      expect(getPlayers()).toHaveLength(0);
    });
  });
});
