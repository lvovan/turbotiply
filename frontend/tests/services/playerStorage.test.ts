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
  getRecentAverage,
  getRecentHighScores,
  getGameHistory,
} from '../../src/services/playerStorage';
import type { PlayerStore } from '../../src/types/player';
import type { GameRecord } from '../../src/types/player';

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

      // Verify store was updated to v4 (migrated through v2, v3, then v4)
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PlayerStore;
      expect(stored.version).toBe(4);
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
      expect(stored.version).toBe(4);
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

    it('appends a GameRecord with score and timestamp', () => {
      const now = 5000;
      vi.spyOn(Date, 'now').mockReturnValue(now);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      vi.spyOn(Date, 'now').mockReturnValue(6000);
      updatePlayerScore('Mia', 25);

      const players = getPlayers();
      expect(players[0].gameHistory).toBeDefined();
      expect(players[0].gameHistory).toHaveLength(1);
      expect(players[0].gameHistory![0].score).toBe(25);
      expect(players[0].gameHistory![0].completedAt).toBe(6000);

      vi.restoreAllMocks();
    });

    it('appends multiple GameRecords in chronological order', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      vi.spyOn(Date, 'now').mockReturnValue(2000);
      updatePlayerScore('Mia', 10);
      vi.spyOn(Date, 'now').mockReturnValue(3000);
      updatePlayerScore('Mia', 20);
      vi.spyOn(Date, 'now').mockReturnValue(4000);
      updatePlayerScore('Mia', 30);

      const players = getPlayers();
      expect(players[0].gameHistory).toHaveLength(3);
      expect(players[0].gameHistory![0].score).toBe(10);
      expect(players[0].gameHistory![1].score).toBe(20);
      expect(players[0].gameHistory![2].score).toBe(30);

      vi.restoreAllMocks();
    });

    it('enforces 100-record cap by discarding oldest', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      // Add 100 records
      for (let i = 0; i < 100; i++) {
        vi.spyOn(Date, 'now').mockReturnValue(2000 + i);
        updatePlayerScore('Mia', i);
      }

      let players = getPlayers();
      expect(players[0].gameHistory).toHaveLength(100);

      // Add 101st — oldest (score=0) should be discarded
      vi.spyOn(Date, 'now').mockReturnValue(9999);
      updatePlayerScore('Mia', 999);

      players = getPlayers();
      expect(players[0].gameHistory).toHaveLength(100);
      expect(players[0].gameHistory![0].score).toBe(1); // oldest remaining
      expect(players[0].gameHistory![99].score).toBe(999); // newest

      vi.restoreAllMocks();
    });

    it('still updates totalScore and gamesPlayed alongside gameHistory', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      vi.spyOn(Date, 'now').mockReturnValue(2000);
      updatePlayerScore('Mia', 15);
      vi.spyOn(Date, 'now').mockReturnValue(3000);
      updatePlayerScore('Mia', 25);

      const players = getPlayers();
      expect(players[0].totalScore).toBe(40);
      expect(players[0].gamesPlayed).toBe(2);
      expect(players[0].gameHistory).toHaveLength(2);

      vi.restoreAllMocks();
    });
  });

  describe('v3 → v4 migration', () => {
    it('creates synthetic GameRecord for players with gamesPlayed > 0', () => {
      const v3Store = {
        version: 3,
        players: [
          { name: 'Alice', avatarId: 'cat', lastActive: 5000, createdAt: 1000, totalScore: 100, gamesPlayed: 4 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Store));

      const players = getPlayers();
      expect(players[0].gameHistory).toBeDefined();
      expect(players[0].gameHistory).toHaveLength(1);
      expect(players[0].gameHistory![0].score).toBe(25); // Math.round(100/4)
      expect(players[0].gameHistory![0].completedAt).toBe(5000); // lastActive
    });

    it('sets gameHistory to empty array for players with gamesPlayed === 0', () => {
      const v3Store = {
        version: 3,
        players: [
          { name: 'Bob', avatarId: 'robot', lastActive: 3000, createdAt: 2000, totalScore: 0, gamesPlayed: 0 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Store));

      const players = getPlayers();
      expect(players[0].gameHistory).toBeDefined();
      expect(players[0].gameHistory).toEqual([]);
    });

    it('bumps version to 4 and persists migration', () => {
      const v3Store = {
        version: 3,
        players: [
          { name: 'A', avatarId: 'cat', lastActive: 100, createdAt: 50, totalScore: 30, gamesPlayed: 3 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Store));

      getPlayers(); // triggers migration

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as PlayerStore;
      expect(stored.version).toBe(4);
      expect(stored.players[0].gameHistory).toBeDefined();
      expect(stored.players[0].gameHistory).toHaveLength(1);
    });

    it('handles multiple players in migration', () => {
      const v3Store = {
        version: 3,
        players: [
          { name: 'Alice', avatarId: 'cat', lastActive: 5000, createdAt: 1000, totalScore: 100, gamesPlayed: 10 },
          { name: 'Bob', avatarId: 'robot', lastActive: 3000, createdAt: 2000, totalScore: 0, gamesPlayed: 0 },
          { name: 'Charlie', avatarId: 'star', lastActive: 4000, createdAt: 1500, totalScore: 75, gamesPlayed: 5 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Store));

      const players = getPlayers();
      const alice = players.find(p => p.name === 'Alice')!;
      const bob = players.find(p => p.name === 'Bob')!;
      const charlie = players.find(p => p.name === 'Charlie')!;

      expect(alice.gameHistory).toHaveLength(1);
      expect(alice.gameHistory![0].score).toBe(10); // Math.round(100/10)
      expect(bob.gameHistory).toEqual([]);
      expect(charlie.gameHistory).toHaveLength(1);
      expect(charlie.gameHistory![0].score).toBe(15); // Math.round(75/5)
    });

    it('retains totalScore and gamesPlayed fields after migration', () => {
      const v3Store = {
        version: 3,
        players: [
          { name: 'Alice', avatarId: 'cat', lastActive: 5000, createdAt: 1000, totalScore: 100, gamesPlayed: 4 },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v3Store));

      const players = getPlayers();
      expect(players[0].totalScore).toBe(100);
      expect(players[0].gamesPlayed).toBe(4);
    });
  });

  describe('savePlayer gameHistory initialization', () => {
    it('initializes gameHistory as empty array for new players', () => {
      savePlayer({ name: 'NewKid', avatarId: 'cat' });

      const players = getPlayers();
      expect(players[0].gameHistory).toBeDefined();
      expect(players[0].gameHistory).toEqual([]);
    });

    it('preserves existing gameHistory when overwriting a player', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1000);
      savePlayer({ name: 'Mia', avatarId: 'cat' });

      vi.spyOn(Date, 'now').mockReturnValue(2000);
      updatePlayerScore('Mia', 25);

      vi.spyOn(Date, 'now').mockReturnValue(3000);
      savePlayer({ name: 'Mia', avatarId: 'robot' }); // overwrite with new avatar

      const players = getPlayers();
      expect(players[0].avatarId).toBe('robot');
      expect(players[0].gameHistory).toHaveLength(1);
      expect(players[0].gameHistory![0].score).toBe(25);

      vi.restoreAllMocks();
    });
  });

  describe('getRecentAverage', () => {
    it('returns null when gameHistory is absent', () => {
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 0 };
      expect(getRecentAverage(player)).toBeNull();
    });

    it('returns null when gameHistory is empty', () => {
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 0, gameHistory: [] };
      expect(getRecentAverage(player)).toBeNull();
    });

    it('returns Math.round(mean) of all scores when fewer than 10 games', () => {
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 3,
        gameHistory: [
          { score: 10, completedAt: 100 },
          { score: 20, completedAt: 200 },
          { score: 30, completedAt: 300 },
        ],
      };
      // mean = (10 + 20 + 30) / 3 = 20
      expect(getRecentAverage(player)).toBe(20);
    });

    it('returns Math.round(mean) of last 10 scores when more than 10 games', () => {
      const history: GameRecord[] = [];
      for (let i = 1; i <= 12; i++) {
        history.push({ score: i * 5, completedAt: i * 100 });
      }
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 12,
        gameHistory: history,
      };
      // Last 10 scores: 15,20,25,30,35,40,45,50,55,60 → sum=375 → 375/10=37.5 → 38
      expect(getRecentAverage(player)).toBe(38);
    });

    it('respects custom count parameter', () => {
      const history: GameRecord[] = [
        { score: 10, completedAt: 100 },
        { score: 20, completedAt: 200 },
        { score: 30, completedAt: 300 },
        { score: 40, completedAt: 400 },
        { score: 50, completedAt: 500 },
      ];
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 5,
        gameHistory: history,
      };
      // Last 3: 30,40,50 → mean = 40
      expect(getRecentAverage(player, 3)).toBe(40);
    });

    it('rounds to nearest integer', () => {
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 3,
        gameHistory: [
          { score: 10, completedAt: 100 },
          { score: 11, completedAt: 200 },
          { score: 12, completedAt: 300 },
        ],
      };
      // mean = 33 / 3 = 11
      expect(getRecentAverage(player)).toBe(11);
    });
  });

  describe('getRecentHighScores', () => {
    it('returns empty array when gameHistory is absent', () => {
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 0 };
      expect(getRecentHighScores(player)).toEqual([]);
    });

    it('returns empty array when gameHistory is empty', () => {
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 0, gameHistory: [] };
      expect(getRecentHighScores(player)).toEqual([]);
    });

    it('returns last 5 records sorted by score descending', () => {
      const history: GameRecord[] = [
        { score: 10, completedAt: 100 },
        { score: 50, completedAt: 200 },
        { score: 30, completedAt: 300 },
        { score: 40, completedAt: 400 },
        { score: 20, completedAt: 500 },
      ];
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 5,
        gameHistory: history,
      };
      const result = getRecentHighScores(player);
      expect(result.map(r => r.score)).toEqual([50, 40, 30, 20, 10]);
    });

    it('breaks ties by most recent completedAt first', () => {
      const history: GameRecord[] = [
        { score: 30, completedAt: 100 },
        { score: 30, completedAt: 300 },
        { score: 30, completedAt: 200 },
      ];
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 3,
        gameHistory: history,
      };
      const result = getRecentHighScores(player);
      expect(result.map(r => r.completedAt)).toEqual([300, 200, 100]);
    });

    it('returns fewer when less than 5 games', () => {
      const history: GameRecord[] = [
        { score: 10, completedAt: 100 },
        { score: 20, completedAt: 200 },
      ];
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 2,
        gameHistory: history,
      };
      const result = getRecentHighScores(player);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.score)).toEqual([20, 10]);
    });

    it('takes only from the last N chronological entries', () => {
      const history: GameRecord[] = [
        { score: 99, completedAt: 100 }, // older, should be excluded with count=3
        { score: 10, completedAt: 200 },
        { score: 30, completedAt: 300 },
        { score: 20, completedAt: 400 },
      ];
      const player = {
        name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 4,
        gameHistory: history,
      };
      const result = getRecentHighScores(player, 3);
      expect(result.map(r => r.score)).toEqual([30, 20, 10]);
    });
  });

  describe('getGameHistory', () => {
    it('returns empty array when gameHistory is absent', () => {
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 0 };
      expect(getGameHistory(player)).toEqual([]);
    });

    it('returns empty array when gameHistory is empty', () => {
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 0, gameHistory: [] };
      expect(getGameHistory(player)).toEqual([]);
    });

    it('returns a defensive copy in chronological order', () => {
      const history: GameRecord[] = [
        { score: 10, completedAt: 100 },
        { score: 20, completedAt: 200 },
        { score: 30, completedAt: 300 },
      ];
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 3, gameHistory: history };
      const result = getGameHistory(player);

      // Same content
      expect(result).toEqual(history);
      // But a different array reference (defensive copy)
      expect(result).not.toBe(history);
    });

    it('does not mutate the original when result is modified', () => {
      const history: GameRecord[] = [
        { score: 10, completedAt: 100 },
        { score: 20, completedAt: 200 },
      ];
      const player = { name: 'A', avatarId: 'cat', lastActive: 0, createdAt: 0, totalScore: 0, gamesPlayed: 2, gameHistory: history };
      const result = getGameHistory(player);
      result.push({ score: 99, completedAt: 999 });
      expect(player.gameHistory).toHaveLength(2);
    });
  });
});
