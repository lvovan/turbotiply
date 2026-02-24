import { useRef, useCallback, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession.tsx';
import { useGame } from '../hooks/useGame';
import { useRoundTimer } from '../hooks/useRoundTimer';
import { useAnswerInput } from '../hooks/useAnswerInput';
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
import { trackGameStarted, trackAnswerSubmitted, trackGameCompleted, trackReplayStarted, trackReplayCompleted } from '../services/clarityService';
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
  const prevStatusRef = useRef(gameState.status);

  const handleSubmit = useCallback(
    (answer: number) => {
      const elapsed = stop();
      const prevRound = currentRound;
      submitAnswer(answer, elapsed);
      if (prevRound) {
        const correct = answer === (prevRound.formula.hiddenPosition === 'C'
          ? prevRound.formula.product
          : prevRound.formula.hiddenPosition === 'A'
            ? prevRound.formula.factorA
            : prevRound.formula.factorB);
        trackAnswerSubmitted(correct, elapsed);
      }

      // Show feedback for FEEDBACK_DURATION_MS, then advance
      feedbackTimeoutRef.current = setTimeout(() => {
        nextRound();
        reset();
        start();
        feedbackTimeoutRef.current = null;
      }, FEEDBACK_DURATION_MS);
    },
    [stop, submitAnswer, nextRound, reset, start, currentRound],
  );

  const { typedDigits, handleDigit, handleBackspace, handleSubmit: hookSubmit, reset: resetInput } =
    useAnswerInput({ onSubmit: handleSubmit });

  // Reset typed digits on round change
  useEffect(() => {
    resetInput();
  }, [gameState.currentRoundIndex, resetInput]);

  // Track replay phase transitions
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = gameState.status;

    if (gameState.status === 'replay' && prev !== 'replay') {
      trackReplayStarted(gameState.replayQueue.length);
    }
    if (prev === 'replay' && gameState.status === 'completed') {
      trackReplayCompleted();
    }
  }, [gameState.status, gameState.replayQueue.length]);

  // Persist score when game completes + track telemetry
  useEffect(() => {
    if (gameState.status === 'completed' && session && !scorePersistedRef.current) {
      scorePersistedRef.current = true;
      const roundResults = extractRoundResults(gameState.rounds);
      saveGameRecord(session.playerName, gameState.score, roundResults, gameMode);
      const correctCount = gameState.rounds.filter((r) => r.isCorrect).length;
      trackGameCompleted(gameMode, gameState.score, correctCount);
    }
    if (gameState.status === 'not-started') {
      scorePersistedRef.current = false;
    }
  }, [gameState.status, gameState.score, gameState.rounds, gameMode, session]);

  const handleStartGame = useCallback(() => {
    startGame('play');
    trackGameStarted('play');
    start();
  }, [startGame, start]);

  const handleStartImprove = useCallback(() => {
    startGame('improve', session?.playerName);
    trackGameStarted('improve');
    start();
  }, [startGame, start, session]);

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
  const recentScores = currentPlayer ? getRecentHighScores(currentPlayer) : [];
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
                typedDigits={typedDigits}
                isInputPhase={gameState.currentPhase === 'input'}
              />
            </div>

            <AnswerInput
              typedDigits={typedDigits}
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onSubmit={hookSubmit}
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
