import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayers } from '../../src/hooks/usePlayers';
import * as playerStorage from '../../src/services/playerStorage';

describe('usePlayers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads player list from localStorage on mount', () => {
    vi.spyOn(Date, 'now').mockReturnValue(100);
    playerStorage.savePlayer({ name: 'Alice', avatarId: 'cat', colorId: 'blue' });
    vi.spyOn(Date, 'now').mockReturnValue(200);
    playerStorage.savePlayer({ name: 'Bob', avatarId: 'robot', colorId: 'red' });

    const { result } = renderHook(() => usePlayers());

    expect(result.current.players).toHaveLength(2);
    // Alphabetically sorted
    expect(result.current.players[0].name).toBe('Alice');
    expect(result.current.players[1].name).toBe('Bob');
    vi.restoreAllMocks();
  });

  it('returns storageAvailable as true when localStorage works', () => {
    const { result } = renderHook(() => usePlayers());
    expect(result.current.storageAvailable).toBe(true);
  });

  it('savePlayer adds a player and refreshes the list', () => {
    const { result } = renderHook(() => usePlayers());

    act(() => {
      result.current.savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });
    });

    expect(result.current.players).toHaveLength(1);
    expect(result.current.players[0].name).toBe('Mia');
  });

  it('deletePlayer removes a player and refreshes the list', () => {
    playerStorage.savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

    const { result } = renderHook(() => usePlayers());
    expect(result.current.players).toHaveLength(1);

    act(() => {
      result.current.deletePlayer('Mia');
    });

    expect(result.current.players).toHaveLength(0);
  });

  it('playerExists checks for existing player (case-insensitive)', () => {
    playerStorage.savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

    const { result } = renderHook(() => usePlayers());

    expect(result.current.playerExists('mia')).toBe(true);
    expect(result.current.playerExists('MIA')).toBe(true);
    expect(result.current.playerExists('Ghost')).toBe(false);
  });

  it('sorts players alphabetically (case-insensitive)', () => {
    playerStorage.savePlayer({ name: 'Charlie', avatarId: 'cat', colorId: 'blue' });
    playerStorage.savePlayer({ name: 'alice', avatarId: 'robot', colorId: 'red' });
    playerStorage.savePlayer({ name: 'Bob', avatarId: 'star', colorId: 'teal' });

    const { result } = renderHook(() => usePlayers());

    expect(result.current.players.map((p) => p.name)).toEqual(['alice', 'Bob', 'Charlie']);
  });

  it('clearAllPlayers calls clearAllStorage and reloads', () => {
    playerStorage.savePlayer({ name: 'Mia', avatarId: 'cat', colorId: 'blue' });

    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    const { result } = renderHook(() => usePlayers());

    act(() => {
      result.current.clearAllPlayers();
    });

    expect(localStorage.getItem(playerStorage.STORAGE_KEY)).toBeNull();
    expect(reloadMock).toHaveBeenCalled();
  });
});
