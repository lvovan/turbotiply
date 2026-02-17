/**
 * English dictionary — source of truth for all translation keys.
 *
 * All other locale files (fr.ts, es.ts, ja.ts, de.ts) must export
 * an object with the exact same keys. TypeScript enforces this via
 * the Dictionary type derived from this file.
 *
 * ## Placeholder Convention
 * Named placeholders use `{name}` syntax. Translators may reorder
 * placeholders freely to match target language grammar.
 *
 * ## Adding a Key
 * 1. Add the key-value pair here
 * 2. TypeScript errors will guide you to add it in every other locale
 */
const en = {
  // ── Welcome / Player Selection Screen ──────────────────────────

  /** Subtitle shown when the new-player form is displayed (no existing players or "New player" clicked). */
  'welcome.subtitle': 'Create your player to get started!',
  /** Subtitle shown when the player list is displayed (returning users). */
  'welcome.subtitleReturning': 'Who is playing today?',
  /** Storage unavailability warning — first line. */
  'welcome.storageWarning': '⚠️ Your browser storage is not available.',
  /** Storage unavailability warning — second line. */
  'welcome.storageWarningDetail': "You can still play, but your profile won't be saved for next time.",
  /** Eviction notice shown when a player was auto-removed to make room. Placeholder: {names} */
  'welcome.evictionMessage': 'We made room for you! {names} was removed because we can only remember 50 players.',
  /** Error message when clearing all profiles fails. */
  'welcome.clearError': 'Failed to clear profiles. Please try again.',
  /** "Back to player list" button label on the new-player form. */
  'welcome.backToList': '← Back to player list',
  /** Aria-label for the error dismiss button. */
  'welcome.dismissError': 'Dismiss error',

  // ── Player Creation & Management ───────────────────────────────

  /** Label for the player name input field. */
  'player.nameLabel': 'Your name',
  /** Placeholder text inside the name input field. */
  'player.namePlaceholder': 'Type your name...',
  /** Label for the avatar selection section. */
  'player.chooseAvatar': 'Choose your avatar',
  /** Submit button text on the new-player form. */
  'player.letsGo': "Let's go! 🚀",
  /** Overwrite confirmation dialog message. Placeholder: {playerName} */
  'player.overwriteConfirm': 'A player called {playerName} already exists. Do you want to replace them?',
  /** Overwrite dialog — cancel button. */
  'player.goBack': 'Go back',
  /** Overwrite dialog — confirm button. */
  'player.replace': 'Replace',
  /** "New player" button in the player list. */
  'player.newPlayer': '➕ New player',
  /** "Clear all profiles" button in the player list. */
  'player.clearAll': 'Clear all profiles',
  /** Character counter hint. Placeholders: {current}, {max} */
  'player.charCount': '{current}/{max}',
  /** Aria-label for the "Play as {playerName}" button. Placeholder: {playerName} */
  'player.playAs': 'Play as {playerName}',
  /** Average score label in player card. Placeholder: {score} */
  'player.avgScore': 'Avg: {score}',
  /** Displayed when the player has no score history. */
  'player.noScore': '—',
  /** Aria-label for removing a player. Placeholder: {playerName} */
  'player.removePlayer': 'Remove {playerName}',
  /** Aria-label for the overwrite confirmation dialog. Placeholder: {playerName} */
  'player.replaceDialog': 'Replace {playerName}',

  // ── Header ─────────────────────────────────────────────────────

  /** Greeting shown in the header when logged in. Placeholder: {playerName} */
  'header.greeting': 'Hi, {playerName}',
  /** "Switch player" button label. */
  'header.switchPlayer': 'Switch player',
  /** Aria-label for the language switcher flag button. */
  'header.changeLanguage': 'Change language',

  // ── Gameplay ───────────────────────────────────────────────────

  /** Pre-game heading on the main page. */
  'game.readyToPlay': 'Ready to play?',
  /** Pre-game instructions on the main page. */
  'game.instructions': 'Answer 10 multiplication questions as fast as you can!',
  /** Feedback text when the player answers correctly. */
  'game.correct': 'Correct!',
  /** Feedback text when the player answers incorrectly. */
  'game.incorrect': 'Not quite!',
  /** Text showing the correct answer after an incorrect response. Placeholder: {answer} */
  'game.incorrectAnswer': 'The answer was {answer}',
  /** Round counter during primary phase. Placeholders: {current}, {total} */
  'game.roundOf': 'Round {current} of {total}',
  /** Completion count during feedback. Placeholders: {current}, {total} */
  'game.roundCompleted': 'Round {current} of {total} completed',
  /** Replay badge label. */
  'game.replay': 'Replay',
  /** Replay completion count during feedback. Placeholders: {current}, {total} */
  'game.replayCompleted': 'Replay {current} of {total} completed',
  /** Score label during gameplay. */
  'game.scoreLabel': 'Score:',
  /** Practice badge label (improve mode). */
  'game.practice': 'Practice',
  /** Default timer display. */
  'game.timerDefault': '5.0s',

  // ── Answer Input ───────────────────────────────────────────────

  /** Placeholder for the answer input field. */
  'game.answerPlaceholder': '?',
  /** Submit button text (desktop). */
  'game.submit': 'Submit',
  /** "Go" button on touch numpad. */
  'game.go': 'Go',

  // ── Mode Selector ──────────────────────────────────────────────

  /** Play mode button label. */
  'mode.play': 'Play',
  /** Play mode descriptor text. */
  'mode.playDescription': 'Go for a high score!',
  /** Aria-label for the Play button. */
  'mode.playAriaLabel': 'Play — Go for a high score!',
  /** Improve mode button label. */
  'mode.improve': 'Improve',
  /** Improve mode descriptor. Placeholder: {numbers} */
  'mode.improveDescription': 'Level up your tricky numbers: {numbers}',
  /** Aria-label for the Improve button. Placeholder: {numbers} */
  'mode.improveAriaLabel': 'Improve — Level up your tricky numbers: {numbers}',
  /** Encouragement message when no tricky numbers found. */
  'mode.encouragement': 'No tricky numbers right now — keep playing to unlock Improve mode!',
  /** Aria-label for the mode selector group. */
  'mode.groupLabel': 'Game mode selection',

  // ── Score Summary ──────────────────────────────────────────────

  /** Game over heading (play mode). */
  'summary.gameOver': 'Game Over!',
  /** Total score label. */
  'summary.totalScore': 'Total Score',
  /** Improve mode heading. Placeholders: {count}, {total} */
  'summary.correctCount': 'You got {count}/{total} right!',
  /** Practice hint showing incorrect pairs. Placeholder: {pairs} */
  'summary.practiceHint': 'Keep practising: {pairs}',
  /** "Play again" button. */
  'summary.playAgain': 'Play again',
  /** "Back to menu" button. */
  'summary.backToMenu': 'Back to menu',
  /** Table column header: round number. */
  'summary.colNumber': '#',
  /** Table column header: formula. */
  'summary.colFormula': 'Formula',
  /** Table column header: player's answer. */
  'summary.colAnswer': 'Answer',
  /** Table column header: correct/incorrect result. */
  'summary.colResult': 'Result',
  /** Table column header: response time. */
  'summary.colTime': 'Time',
  /** Table column header: points earned. */
  'summary.colPoints': 'Points',

  // ── Recent High Scores ─────────────────────────────────────────

  /** Section heading. */
  'scores.title': 'Recent High Scores',
  /** Empty state — no games played yet. */
  'scores.empty': 'Play your first game to see your scores here!',
  /** Aria-label for the scores list. */
  'scores.listLabel': 'Recent high scores, ranked highest to lowest',
  /** Score display with points. Placeholder: {score} */
  'scores.scorePoints': '{score} points',
  /** Screen reader text for score placement. Placeholders: {ordinal}, {score} */
  'scores.placeScore': '{ordinal} place: {score} points',

  // ── Ordinals ───────────────────────────────────────────────────

  /** Ordinal suffix: 1st. */
  'ordinal.1': '1st',
  /** Ordinal suffix: 2nd. */
  'ordinal.2': '2nd',
  /** Ordinal suffix: 3rd. */
  'ordinal.3': '3rd',
  /** Ordinal suffix: 4th. */
  'ordinal.4': '4th',
  /** Ordinal suffix: 5th. */
  'ordinal.5': '5th',

  // ── Confirmation Dialogs ───────────────────────────────────────

  /** Delete dialog title. Placeholder: {playerName} */
  'dialog.removeTitle': 'Remove {playerName}?',
  /** Delete dialog message. */
  'dialog.removeMessage': 'Their scores will be lost.',
  /** Delete dialog — cancel button. */
  'dialog.cancel': 'Cancel',
  /** Delete dialog — confirm button. */
  'dialog.remove': 'Remove',
  /** Delete dialog aria-label. Placeholder: {playerName} */
  'dialog.removeLabel': 'Remove {playerName}',
  /** Clear-all dialog title. */
  'dialog.clearAllTitle': 'Clear all profiles?',
  /** Clear-all dialog message. */
  'dialog.clearAllMessage': "This will delete all players and scores. Are you sure? This can't be undone!",
  /** Clear-all dialog aria-label. */
  'dialog.clearAllLabel': 'Clear all profiles',
  /** Clear-all dialog — confirm button. */
  'dialog.clearAll': 'Clear all',

  // ── Avatar Labels ──────────────────────────────────────────────

  /** Avatar label: Rocket. */
  'avatar.rocket': 'Rocket',
  /** Avatar label: Star. */
  'avatar.star': 'Star',
  /** Avatar label: Cat. */
  'avatar.cat': 'Cat',
  /** Avatar label: Turtle. */
  'avatar.turtle': 'Turtle',
  /** Avatar label: Robot. */
  'avatar.robot': 'Robot',
  /** Avatar label: Dinosaur. */
  'avatar.dinosaur': 'Dinosaur',
  /** Avatar label: Unicorn. */
  'avatar.unicorn': 'Unicorn',
  /** Avatar label: Lightning. */
  'avatar.lightning': 'Lightning',

  // ── Avatar Descriptions ────────────────────────────────────────

  /** Avatar description: Rocket. */
  'avatar.rocketDesc': 'A flying rocket ship',
  /** Avatar description: Star. */
  'avatar.starDesc': 'A shining star',
  /** Avatar description: Cat. */
  'avatar.catDesc': 'A friendly cat face',
  /** Avatar description: Turtle. */
  'avatar.turtleDesc': 'A smiling turtle',
  /** Avatar description: Robot. */
  'avatar.robotDesc': 'A cute robot',
  /** Avatar description: Dinosaur. */
  'avatar.dinosaurDesc': 'A friendly dinosaur',
  /** Avatar description: Unicorn. */
  'avatar.unicornDesc': 'A magical unicorn',
  /** Avatar description: Lightning. */
  'avatar.lightningDesc': 'A lightning bolt',

  // ── Accessibility (screen-reader-only) ─────────────────────────

  /** Aria-label for the game status container. */
  'a11y.gameStatus': 'Game status',
  /** Aria-label for the answer input field. */
  'a11y.yourAnswer': 'Your answer',
  /** Aria-label for the submit button. */
  'a11y.submitAnswer': 'Submit answer',
  /** Aria-label on touch numpad display. */
  'a11y.currentAnswer': 'Current answer',
  /** Aria-label for numpad digit buttons. Placeholder: {digit} */
  'a11y.digit': 'digit {digit}',
  /** Aria-label for numpad delete button. */
  'a11y.deleteDigit': 'delete last digit',
  /** Aria-label for numpad submit button. */
  'a11y.submitNumpad': 'submit answer',
  /** Aria-label for the avatar radiogroup. */
  'a11y.chooseAvatar': 'Choose your avatar',
  /** Formula aria-label with answer. Placeholders: {a}, {b}, {c}, {answer} */
  'a11y.formulaWithAnswer': 'Multiplication formula: {a} times {b} equals {c}. Your answer was {answer}.',
  /** Formula aria-label without answer. Placeholders: {a}, {b}, {c} */
  'a11y.formulaWithoutAnswer': 'Multiplication formula: {a} times {b} equals {c}. Find the missing value.',
} as const;

export default en;
