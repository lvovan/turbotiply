import { useState, useCallback } from 'react';
import type { Player } from '../types/player';
import {
  getPlayers,
  savePlayer as storageSavePlayer,
  deletePlayer as storageDeletePlayer,
  playerExists as storagePlayerExists,
  isStorageAvailable,
  clearAllStorage,
} from '../services/playerStorage';
import type { SavePlayerResult } from '../services/playerStorage';

/** Shape returned by the usePlayers hook. */
export interface UsePlayersReturn {
  /** All stored players, sorted alphabetically by name (case-insensitive). */
  players: Player[];
  /** Whether localStorage is available. */
  storageAvailable: boolean;
  /** Add a new player or overwrite existing. Returns player + evicted names. */
  savePlayer: (data: Pick<Player, 'name' | 'avatarId' | 'colorId'>) => SavePlayerResult;
  /** Remove a player by name. */
  deletePlayer: (name: string) => void;
  /** Check if a name is already taken (case-insensitive). */
  playerExists: (name: string) => boolean;
  /** Clear all player data and reload the page. */
  clearAllPlayers: () => void;
}

/** Hook for managing the player list via localStorage. */
export function usePlayers(): UsePlayersReturn {
  const [players, setPlayers] = useState<Player[]>(() =>
    getPlayers().sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
  );
  const storageAvailable = isStorageAvailable();

  const refreshPlayers = useCallback(() => {
    setPlayers(
      getPlayers().sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    );
  }, []);

  const savePlayer = useCallback(
    (data: Pick<Player, 'name' | 'avatarId' | 'colorId'>): SavePlayerResult => {
      const result = storageSavePlayer(data);
      refreshPlayers();
      return result;
    },
    [refreshPlayers],
  );

  const deletePlayer = useCallback(
    (name: string): void => {
      storageDeletePlayer(name);
      refreshPlayers();
    },
    [refreshPlayers],
  );

  const playerExists = useCallback((name: string): boolean => {
    return storagePlayerExists(name);
  }, []);

  const clearAllPlayers = useCallback((): void => {
    clearAllStorage();
    window.location.reload();
  }, []);

  return {
    players,
    storageAvailable,
    savePlayer,
    deletePlayer,
    playerExists,
    clearAllPlayers,
  };
}
