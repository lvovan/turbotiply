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
  COLOR_REMAP,
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
          { name: 'Alice', avatarId: 'cat', colorId: 'blue', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
          { name: 'Bob', avatarId: 'robot', colorId: 'red', lastActive: 300, createdAt: 60, totalScore: 0, gamesPlayed: 0 },
          { name: 'Charlie', avatarId: 'star', colorId: 'teal', lastActive: 200, createdAt: 70, totalScore: 0, gamesPlayed: 0 },
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
        colorId: 'blue',
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

      const { player, evictedNames } = savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

      expect(player.name).toBe('Mia');
      expect(player.avatarId).toBe('cat');
      expect(player.colorId).toBe('blue');
      expect(player.lastActive).toBe(now);
      expect(player.createdAt).toBe(now);
      expect(evictedNames).toEqual([]);

      const stored = getPlayers();
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Mia');

      vi.restoreAllMocks();
    });

    it('trims whitespace from the name', () => {
      const { player } = savePlayer({ name: '  Mia  ', avatarId: 'cat', colorId: 'blue' });
      expect(player.name).toBe('Mia');
    });

    it('overwrites existing player (case-insensitive) preserving createdAt', () => {
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

      vi.spyOn(Date, 'now').mockReturnValue(2000);
      const { player: updated } = savePlayer({ name: 'mia', avatarId: 'robot', colorId: 'red' });

      expect(updated.avatarId).toBe('robot');
      expect(updated.colorId).toBe('red');
      expect(updated.lastActive).toBe(2000);
      expect(updated.createdAt).toBe(1000); // preserved

      expect(getPlayers()).toHaveLength(1);
      vi.restoreAllMocks();
    });

    it('enforces 50-player cap by evicting oldest inactive', () => {
      for (let i = 0; i < 50; i++) {
        vi.spyOn(Date, 'now').mockReturnValue(i * 100);
        savePlayer({ name: `Player${i}`, avatarId: 'cat', colorId: 'blue' });
        vi.restoreAllMocks();
      }
      expect(getPlayers()).toHaveLength(50);

      vi.spyOn(Date, 'now').mockReturnValue(99999);
      const { evictedNames } = savePlayer({ name: 'NewPlayer', avatarId: 'star', colorId: 'teal' });
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
      savePlayer({ name: 'Alice', avatarId: 'cat', colorId: 'blue' });
      vi.spyOn(Date, 'now').mockReturnValue(200);
      savePlayer({ name: 'Bob', avatarId: 'robot', colorId: 'red' });
      vi.spyOn(Date, 'now').mockReturnValue(300);
      savePlayer({ name: 'Charlie', avatarId: 'star', colorId: 'teal' });

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

      expect(() => savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' })).toThrow(
        StorageUnavailableError,
      );

      Storage.prototype.setItem = original;
    });
  });

  describe('deletePlayer', () => {
    it('removes a player by name (case-insensitive)', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });
      expect(getPlayers()).toHaveLength(1);

      deletePlayer('mia');
      expect(getPlayers()).toHaveLength(0);
    });

    it('is a no-op if player does not exist', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });
      deletePlayer('NonExistent');
      expect(getPlayers()).toHaveLength(1);
    });
  });

  describe('playerExists', () => {
    it('returns true for existing player (case-insensitive)', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });
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
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

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
      savePlayer({ name: 'Alice', avatarId: 'cat', colorId: 'blue' });
      vi.spyOn(Date, 'now').mockReturnValue(200);
      savePlayer({ name: 'Bob', avatarId: 'robot', colorId: 'red' });
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

      // Verify store was updated to v2
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PlayerStore;
      expect(stored.version).toBe(2);
    });
  });

  describe('avatar/color remapping', () => {
    it('remaps removed avatar IDs to their replacements on load', () => {
      const store = {
        version: 2,
        players: [
          { name: 'A', avatarId: 'dog', colorId: 'blue', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
          { name: 'B', avatarId: 'planet', colorId: 'red', lastActive: 200, createdAt: 60, totalScore: 0, gamesPlayed: 0 },
          { name: 'C', avatarId: 'flower', colorId: 'purple', lastActive: 300, createdAt: 70, totalScore: 0, gamesPlayed: 0 },
          { name: 'D', avatarId: 'crown', colorId: 'pink', lastActive: 400, createdAt: 80, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

      const players = getPlayers();
      expect(players.find((p) => p.name === 'A')!.avatarId).toBe('cat');
      expect(players.find((p) => p.name === 'B')!.avatarId).toBe('rocket');
      expect(players.find((p) => p.name === 'C')!.avatarId).toBe('star');
      expect(players.find((p) => p.name === 'D')!.avatarId).toBe('star');
    });

    it('remaps removed color IDs to their replacements on load', () => {
      const store = {
        version: 2,
        players: [
          { name: 'A', avatarId: 'cat', colorId: 'orange', lastActive: 100, createdAt: 50, totalScore: 0, gamesPlayed: 0 },
          { name: 'B', avatarId: 'star', colorId: 'green', lastActive: 200, createdAt: 60, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

      const players = getPlayers();
      expect(players.find((p) => p.name === 'A')!.colorId).toBe('red');
      expect(players.find((p) => p.name === 'B')!.colorId).toBe('teal');
    });

    it('persists remapped avatars and colors after load', () => {
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
      expect(stored.players[0].colorId).toBe('red');
    });

    it('AVATAR_REMAP maps dog→cat, planet→rocket, flower→star, crown→star', () => {
      expect(AVATAR_REMAP).toEqual({ dog: 'cat', planet: 'rocket', flower: 'star', crown: 'star' });
    });

    it('COLOR_REMAP maps orange→red, green→teal', () => {
      expect(COLOR_REMAP).toEqual({ orange: 'red', green: 'teal' });
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
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });
      expect(getPlayers()).toHaveLength(1);

      clearAllStorage();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('updatePlayerScore', () => {
    it('increments totalScore and gamesPlayed for existing player', () => {
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

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
      savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

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
