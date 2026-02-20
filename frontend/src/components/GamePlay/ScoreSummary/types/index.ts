// Types for ScoreSummary component

import type { Round } from '../../../../types/game';
import type { GameRecord } from '../../../../types/player';

export interface ScoreSummaryProps {
  /** The completed rounds from the game (Round[] from game.ts). */
  rounds: Round[];
  /** Total score earned in the game session. */
  score: number;
  /** Callback fired when the player clicks "Play Again". */
  onPlayAgain: () => void;
  /** Callback fired when the player clicks "Back to Menu". */
  onBackToMenu: () => void;
  /** Which mode the game was played in. Defaults to 'play'. */
  gameMode?: 'play' | 'improve';
  /** Game history for sparkline display. */
  history?: GameRecord[];
}
