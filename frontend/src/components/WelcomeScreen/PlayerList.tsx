import { useState } from 'react';
import type { Player } from '../../types/player';
import PlayerCard from '../PlayerCard/PlayerCard';
import DeleteConfirmation from '../DeleteConfirmation/DeleteConfirmation';
import ClearAllConfirmation from '../ClearAllConfirmation/ClearAllConfirmation';
import styles from './PlayerList.module.css';

interface PlayerListProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onDeletePlayer: (name: string) => void;
  onNewPlayer: () => void;
  onClearAll: () => void;
}

/**
 * Displays the list of existing players with a "New player" button
 * and a "Clear all profiles" button.
 * Shows delete/clear-all confirmation dialogs as needed.
 */
export default function PlayerList({
  players,
  onSelectPlayer,
  onDeletePlayer,
  onNewPlayer,
  onClearAll,
}: PlayerListProps) {
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);

  const handleDeleteConfirm = () => {
    if (playerToDelete) {
      onDeletePlayer(playerToDelete.name);
      setPlayerToDelete(null);
    }
  };

  const handleClearAllConfirm = () => {
    setShowClearAll(false);
    onClearAll();
  };

  return (
    <>
      <div className={`${styles.playerList} ${players.length > 5 ? styles.withFade : ''}`}>
        {players.map((player) => (
          <PlayerCard
            key={player.name}
            player={player}
            onSelect={onSelectPlayer}
            onDelete={setPlayerToDelete}
          />
        ))}
        <button className={styles.newPlayerButton} onClick={onNewPlayer}>
          ➕ New player
        </button>
        {players.length > 0 && (
          <button
            className={styles.clearAllButton}
            onClick={() => setShowClearAll(true)}
          >
            Clear all profiles
          </button>
        )}
      </div>

      {playerToDelete && (
        <DeleteConfirmation
          playerName={playerToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPlayerToDelete(null)}
        />
      )}

      {showClearAll && (
        <ClearAllConfirmation
          onConfirm={handleClearAllConfirm}
          onCancel={() => setShowClearAll(false)}
        />
      )}
    </>
  );
}
