import { useRef, useCallback, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.tsx';
import { useGame } from '../hooks/useGame';
import { useRoundTimer } from '../hooks/useRoundTimer';
import { updatePlayerScore, getPlayers, getRecentHighScores, getGameHistory } from '../services/playerStorage';
import { FEEDBACK_DURATION_MS } from '../constants/scoring';
import Header from '../components/Header/Header';
import FormulaDisplay from '../components/GamePlay/FormulaDisplay/FormulaDisplay';
import AnswerInput from '../components/GamePlay/AnswerInput/AnswerInput';
import InlineFeedback from '../components/GamePlay/InlineFeedback/InlineFeedback';
import GameStatus from '../components/GamePlay/GameStatus/GameStatus';
import ScoreSummary from '../components/GamePlay/ScoreSummary/ScoreSummary';
import RecentHighScores from '../components/GamePlay/RecentHighScores/RecentHighScores';
import ProgressionGraph from '../components/GamePlay/ProgressionGraph/ProgressionGraph';

/**
 * Main gameplay page. Orchestrates the full game lifecycle:
 * not-started → playing → (optional) replay → completed.
 */
export default function MainPage() {
  const navigate = useNavigate();
  const { session, isActive } = useSession();
  const { gameState, currentRound, correctAnswer, startGame, submitAnswer, nextRound, resetGame } =
    useGame();
  const { displayRef, barRef, start, stop, reset } = useRoundTimer();
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scorePersistedRef = useRef(false);

  // Persist score when game completes
  useEffect(() => {
    if (gameState.status === 'completed' && session && !scorePersistedRef.current) {
      scorePersistedRef.current = true;
      updatePlayerScore(session.playerName, gameState.score);
    }
    if (gameState.status === 'not-started') {
      scorePersistedRef.current = false;
    }
  }, [gameState.status, gameState.score, session]);

  const handleStartGame = useCallback(() => {
    startGame();
    start();
  }, [startGame, start]);

  const handleSubmit = useCallback(
    (answer: number) => {
      const elapsed = stop();
      submitAnswer(answer, elapsed);

      // Show feedback for FEEDBACK_DURATION_MS, then advance
      feedbackTimeoutRef.current = setTimeout(() => {
        nextRound();
        reset();
        start();
        feedbackTimeoutRef.current = null;
      }, FEEDBACK_DURATION_MS);
    },
    [stop, submitAnswer, nextRound, reset, start],
  );

  const handlePlayAgain = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    resetGame();
  }, [resetGame]);

  const handleBackToMenu = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    resetGame();
    navigate('/');
  }, [resetGame, navigate]);

  if (!isActive || !session) {
    return <Navigate to="/" replace />;
  }

  // Look up current player from storage for score display
  const currentPlayer = getPlayers().find(
    (p) => p.name.toLowerCase() === session.playerName.toLowerCase(),
  );
  const recentScores = currentPlayer ? getRecentHighScores(currentPlayer, 5) : [];
  const gameHistory = currentPlayer ? getGameHistory(currentPlayer) : [];
  const hasNoGames = !currentPlayer || currentPlayer.gamesPlayed === 0;

  return (
    <div>
      <Header />
      <main style={{ padding: '24px 16px', textAlign: 'center' }}>
        {gameState.status === 'not-started' && (
          <div>
            <h1>Ready to play?</h1>
            <p>Answer 10 multiplication questions as fast as you can!</p>
            <RecentHighScores scores={recentScores} isEmpty={hasNoGames} />
            {gameHistory.length >= 2 && <ProgressionGraph history={gameHistory} />}
            <button onClick={handleStartGame}>Start Game</button>
          </div>
        )}

        {(gameState.status === 'playing' || gameState.status === 'replay') && currentRound && (
          <div>
            <GameStatus
              roundNumber={gameState.currentRoundIndex + 1}
              totalRounds={
                gameState.status === 'replay'
                  ? gameState.replayQueue.length
                  : gameState.rounds.length
              }
              score={gameState.score}
              timerRef={displayRef}
              barRef={barRef}
              isReplay={gameState.status === 'replay'}
            />

            <div data-testid="formula-area" style={{ minHeight: 88 }}>
              {gameState.currentPhase === 'feedback' &&
                currentRound.isCorrect !== null &&
                correctAnswer !== null ? (
                  <InlineFeedback
                    isCorrect={currentRound.isCorrect}
                    correctAnswer={correctAnswer}
                  />
                ) : (
                  <FormulaDisplay formula={currentRound.formula} />
                )}
            </div>

            <AnswerInput
              onSubmit={handleSubmit}
              disabled={gameState.currentPhase !== 'input'}
            />
          </div>
        )}

        {gameState.status === 'completed' && (
          <ScoreSummary
            rounds={gameState.rounds}
            score={gameState.score}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </main>
    </div>
  );
}
