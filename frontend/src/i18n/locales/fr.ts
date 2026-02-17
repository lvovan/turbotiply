import type { Dictionary } from '../index';

const fr: Dictionary = {
  // ── Écran d\u2019accueil / Sélection du joueur ──────────────────────
  'welcome.subtitle': 'Crée ton joueur pour commencer !',
  'welcome.subtitleReturning': 'Qui joue aujourd\u2019hui ?',
  'welcome.storageWarning': '⚠️ Le stockage de ton navigateur n\u2019est pas disponible.',
  'welcome.storageWarningDetail': 'Tu peux quand même jouer, mais ton profil ne sera pas sauvegardé.',
  'welcome.evictionMessage': 'On t\u2019a fait de la place ! {names} a été retiré car on ne peut retenir que 50 joueurs.',
  'welcome.clearError': 'Impossible d\u2019effacer les profils. Réessaie.',
  'welcome.backToList': '← Retour à la liste des joueurs',
  'welcome.dismissError': 'Fermer l\u2019erreur',

  // ── Création et gestion des joueurs ────────────────────────────
  'player.nameLabel': 'Ton prénom',
  'player.namePlaceholder': 'Tape ton prénom...',
  'player.chooseAvatar': 'Choisis ton avatar',
  'player.letsGo': 'C\u2019est parti ! 🚀',
  'player.overwriteConfirm': 'Un joueur appelé {playerName} existe déjà. Veux-tu le remplacer ?',
  'player.goBack': 'Retour',
  'player.replace': 'Remplacer',
  'player.newPlayer': '➕ Nouveau joueur',
  'player.clearAll': 'Effacer tous les profils',
  'player.playAs': 'Jouer en tant que {playerName}',
  'player.avgScore': 'Moy : {score}',
  'player.noScore': '—',
  'player.removePlayer': 'Supprimer {playerName}',
  'player.replaceDialog': 'Remplacer {playerName}',

  // ── En-tête ────────────────────────────────────────────────────
  'header.greeting': 'Salut, {playerName}',
  'header.switchPlayer': 'Changer de joueur',
  'header.changeLanguage': 'Changer de langue',

  // ── Jeu ────────────────────────────────────────────────────────
  'game.readyToPlay': 'Prêt à jouer ?',
  'game.instructions': 'Réponds à 10 multiplications le plus vite possible !',
  'game.correct': 'Correct !',
  'game.incorrect': 'Pas tout à fait !',
  'game.incorrectAnswer': 'La réponse était {answer}',
  'game.roundOf': 'Manche {current} sur {total}',
  'game.roundCompleted': 'Manche {current} sur {total} terminée',
  'game.replay': 'Rejouer',
  'game.replayCompleted': 'Rejouer {current} sur {total} terminé',
  'game.scoreLabel': 'Score :',
  'game.practice': 'Entraînement',
  'game.timerDefault': '5,0s',

  // ── Saisie de la réponse ───────────────────────────────────────
  'game.answerPlaceholder': '?',
  'game.submit': 'Valider',
  'game.go': 'Ok',

  // ── Sélection du mode ──────────────────────────────────────────
  'mode.play': 'Jouer',
  'mode.playDescription': 'Vise le meilleur score !',
  'mode.playAriaLabel': 'Jouer — Vise le meilleur score !',
  'mode.improve': 'S\u2019améliorer',
  'mode.improveDescription': 'Travaille tes nombres difficiles : {numbers}',
  'mode.improveAriaLabel': 'S\u2019améliorer — Travaille tes nombres difficiles : {numbers}',
  'mode.encouragement': 'Pas de nombres difficiles pour l\u2019instant — continue à jouer pour débloquer le mode Amélioration !',
  'mode.groupLabel': 'Sélection du mode de jeu',

  // ── Résumé des scores ──────────────────────────────────────────
  'summary.gameOver': 'Partie terminée !',
  'summary.totalScore': 'Score total',
  'summary.correctCount': 'Tu as eu {count}/{total} bonnes réponses !',
  'summary.practiceHint': 'Continue à t\u2019entraîner : {pairs}',
  'summary.playAgain': 'Rejouer',
  'summary.backToMenu': 'Retour au menu',
  'summary.colNumber': '#',
  'summary.colFormula': 'Formule',
  'summary.colAnswer': 'Réponse',
  'summary.colResult': 'Résultat',
  'summary.colTime': 'Temps',
  'summary.colPoints': 'Points',

  // ── Meilleurs scores récents ───────────────────────────────────
  'scores.title': 'Meilleurs scores récents',
  'scores.empty': 'Joue ta première partie pour voir tes scores ici !',
  'scores.listLabel': 'Meilleurs scores récents, du plus élevé au plus bas',
  'scores.scorePoints': '{score} points',
  'scores.placeScore': '{ordinal} place : {score} points',

  // ── Ordinaux ───────────────────────────────────────────────────
  'ordinal.1': '1er',
  'ordinal.2': '2e',
  'ordinal.3': '3e',
  'ordinal.4': '4e',
  'ordinal.5': '5e',

  // ── Dialogues de confirmation ──────────────────────────────────
  'dialog.removeTitle': 'Supprimer {playerName} ?',
  'dialog.removeMessage': 'Ses scores seront perdus.',
  'dialog.cancel': 'Annuler',
  'dialog.remove': 'Supprimer',
  'dialog.removeLabel': 'Supprimer {playerName}',
  'dialog.clearAllTitle': 'Effacer tous les profils ?',
  'dialog.clearAllMessage': 'Ceci supprimera tous les joueurs et scores. Es-tu sûr ? C\u2019est irréversible !',
  'dialog.clearAllLabel': 'Effacer tous les profils',
  'dialog.clearAll': 'Tout effacer',

  // ── Avatars ────────────────────────────────────────────────────
  'avatar.rocket': 'Fusée',
  'avatar.star': 'Étoile',
  'avatar.cat': 'Chat',
  'avatar.turtle': 'Tortue',
  'avatar.robot': 'Robot',
  'avatar.dinosaur': 'Dinosaure',
  'avatar.unicorn': 'Licorne',
  'avatar.lightning': 'Éclair',

  'avatar.rocketDesc': 'Une fusée qui décolle',
  'avatar.starDesc': 'Une étoile brillante',
  'avatar.catDesc': 'Un chat sympa',
  'avatar.turtleDesc': 'Une tortue souriante',
  'avatar.robotDesc': 'Un robot mignon',
  'avatar.dinosaurDesc': 'Un dinosaure sympa',
  'avatar.unicornDesc': 'Une licorne magique',
  'avatar.lightningDesc': 'Un éclair',

  // ── Accessibilité ──────────────────────────────────────────────
  'a11y.gameStatus': 'État du jeu',
  'a11y.yourAnswer': 'Ta réponse',
  'a11y.submitAnswer': 'Envoyer la réponse',
  'a11y.currentAnswer': 'Réponse actuelle',
  'a11y.digit': 'chiffre {digit}',
  'a11y.deleteDigit': 'effacer le dernier chiffre',
  'a11y.submitNumpad': 'envoyer la réponse',
  'a11y.chooseAvatar': 'Choisis ton avatar',
  'a11y.formulaWithAnswer': 'Formule de multiplication : {a} fois {b} égale {c}. Ta réponse était {answer}.',
  'a11y.formulaWithoutAnswer': 'Formule de multiplication : {a} fois {b} égale {c}. Trouve la valeur manquante.',
};

export default fr;
