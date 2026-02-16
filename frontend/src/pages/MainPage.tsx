import { useRef, useCallback, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.tsx';
import { useGame } from '../hooks/useGame';
import { useRoundTimer } from '../hooks/useRoundTimer';
import { saveGameRecord, getPlayers, getRecentHighScores, getGameHistory } from '../services/playerStorage';
import { extractRoundResults } from '../services/gameEngine';
import { getChallengingPairsForPlayer, extractTrickyNumbers } from '../services/challengeAnalyzer';
import { FEEDBACK_DURATION_MS } from '../constants/scoring';
import Header from '../components/Header/Header';
import FormulaDisplay from '../components/GamePlay/FormulaDisplay/FormulaDisplay';
import AnswerInput from '../components/GamePlay/AnswerInput/AnswerInput';
import GameStatus from '../components/GamePlay/GameStatus/GameStatus';
import ScoreSummary from '../components/GamePlay/ScoreSummary/ScoreSummary';
import RecentHighScores from '../components/GamePlay/RecentHighScores/RecentHighScores';
import ProgressionGraph from '../components/GamePlay/ProgressionGraph/ProgressionGraph';
import ModeSelector from '../components/GamePlay/ModeSelector/ModeSelector';
import { useTranslation } from '../i18n';
import styles from './MainPage.module.css';

/**
 * Main gameplay page. Orchestrates the full game lifecycle:
 * not-started → playing → (optional) replay → completed.
 */
export default function MainPage() {
  const navigate = useNavigate();
  const { session, isActive } = useSession();
  const { gameState, currentRound, correctAnswer, startGame, submitAnswer, nextRound, resetGame, gameMode } =
    useGame();
  const { t } = useTranslation();
  const { displayRef, barRef, start, stop, reset } = useRoundTimer();
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scorePersistedRef = useRef(false);

  // Persist score when game completes
  useEffect(() => {
    if (gameState.status === 'completed' && session && !scorePersistedRef.current) {
      scorePersistedRef.current = true;
      const roundResults = extractRoundResults(gameState.rounds);
      saveGameRecord(session.playerName, gameState.score, roundResults, gameMode);
    }
    if (gameState.status === 'not-started') {
      scorePersistedRef.current = false;
    }
  }, [gameState.status, gameState.score, gameState.rounds, gameMode, session]);

  const handleStartGame = useCallback(() => {
    startGame('play');
    start();
  }, [startGame, start]);

  const handleStartImprove = useCallback(() => {
    startGame('improve', session?.playerName);
    start();
  }, [startGame, start, session]);

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
  const recentScores = currentPlayer ? getRecentHighScores(currentPlayer, 3) : [];
  const gameHistory = currentPlayer ? getGameHistory(currentPlayer) : [];
  const hasNoGames = !currentPlayer || currentPlayer.gamesPlayed === 0;

  // Challenge analysis for Improve mode
  const challengingPairs = session ? getChallengingPairsForPlayer(session.playerName) : [];
  const showImprove = challengingPairs.length > 0;
  const trickyNumbers = extractTrickyNumbers(challengingPairs);
  const showEncouragement = !hasNoGames && !showImprove;

  return (
    <div>
      <Header />
      <main style={{ padding: '24px 16px', textAlign: 'center' }}>
        {gameState.status === 'not-started' && (
          <div>
            <h1 className={styles.readyHeading}>{t('game.readyToPlay')}</h1>
            <p className={styles.instructions}>{t('game.instructions')}</p>
            <RecentHighScores scores={recentScores} isEmpty={hasNoGames} />
            {gameHistory.length >= 2 && <ProgressionGraph history={gameHistory} />}
            <ModeSelector
              onStartPlay={handleStartGame}
              onStartImprove={handleStartImprove}
              trickyNumbers={trickyNumbers}
              showImprove={showImprove}
              showEncouragement={showEncouragement}
            />
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
              currentPhase={gameState.currentPhase}
              isCorrect={currentRound.isCorrect ?? null}
              correctAnswer={correctAnswer}
              completedRound={gameState.currentRoundIndex + 1}
              gameMode={gameMode}
            />

            <div data-testid="formula-area" style={{ minHeight: 88 }}>
              <FormulaDisplay
                formula={currentRound.formula}
                playerAnswer={
                  gameState.currentPhase === 'feedback'
                    ? currentRound.playerAnswer ?? undefined
                    : undefined
                }
              />
            </div>

            <AnswerInput
              onSubmit={handleSubmit}
              acceptingInput={gameState.currentPhase === 'input'}
            />
          </div>
        )}

        {gameState.status === 'completed' && (
          <ScoreSummary
            rounds={gameState.rounds}
            score={gameState.score}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
            gameMode={gameMode}
            history={[...gameHistory, {
              score: gameState.score,
              completedAt: Date.now(),
              rounds: extractRoundResults(gameState.rounds),
              gameMode,
            }]}
          />
        )}
      </main>
    </div>
  );
}
