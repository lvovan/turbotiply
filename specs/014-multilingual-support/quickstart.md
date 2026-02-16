# Quickstart: Multilingual Support

**Feature**: 014-multilingual-support  
**Date**: 2026-02-16

## What Changed

TurboTiply gains full localization for five languages (English, French, Spanish, Japanese, German). All hardcoded UI strings are replaced with translation lookups from per-language dictionary files. A flag button in the header (and on the welcome screen) lets players switch language manually. The app auto-detects the browser's language on first visit and persists the player's manual choice in localStorage.

## New Files

| File | Purpose |
|------|---------|
| `frontend/src/i18n/index.ts` | Public API — re-exports types, constants, hooks |
| `frontend/src/i18n/LanguageContext.tsx` | React Context, `LanguageProvider`, `useTranslation` hook |
| `frontend/src/i18n/detectLanguage.ts` | Browser language detection + localStorage persistence |
| `frontend/src/i18n/locales/en.ts` | English dictionary (source of truth for all keys) |
| `frontend/src/i18n/locales/fr.ts` | French dictionary |
| `frontend/src/i18n/locales/es.ts` | Spanish dictionary |
| `frontend/src/i18n/locales/ja.ts` | Japanese dictionary |
| `frontend/src/i18n/locales/de.ts` | German dictionary |
| `frontend/src/types/i18n.ts` | `Language` type, `TranslationKey` type |
| `frontend/src/components/LanguageSwitcher/LanguageSwitcher.tsx` | Flag button + dropdown component |
| `frontend/src/components/LanguageSwitcher/LanguageSwitcher.module.css` | Styles for language switcher |

## Modified Files

| File | Change |
|------|--------|
| `frontend/src/App.tsx` | Wrap app in `LanguageProvider` (outermost provider) |
| `frontend/src/components/Header/Header.tsx` | Add `LanguageSwitcher` next to "Switch player" button; replace hardcoded strings with `t()` calls |
| `frontend/src/components/Header/Header.module.css` | Add `.actions` wrapper for button group layout |
| `frontend/src/pages/WelcomePage.tsx` | Add `LanguageSwitcher` in top-right; replace all hardcoded strings with `t()` calls |
| `frontend/src/pages/MainPage.tsx` | Replace all hardcoded strings with `t()` calls |
| `frontend/src/components/WelcomeScreen/NewPlayerForm.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/WelcomeScreen/PlayerList.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/PlayerCard/PlayerCard.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/DeleteConfirmation/DeleteConfirmation.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/ClearAllConfirmation/ClearAllConfirmation.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/GameStatus/GameStatus.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/ModeSelector/ModeSelector.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/ScoreSummary/ScoreSummary.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/RecentHighScores/RecentHighScores.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/AnswerInput/TouchNumpad.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/GamePlay/FormulaDisplay/FormulaDisplay.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/components/AvatarPicker/AvatarPicker.tsx` | Replace hardcoded strings with `t()` calls |
| `frontend/src/constants/avatars.ts` | Remove hardcoded labels/descriptions (moved to dictionaries) |
| `frontend/index.html` | Remove hardcoded `lang="en"` (now set dynamically) |

## How to Verify

```bash
cd frontend

# Run tests
npm test

# Start dev server
npm run dev
```

1. Open the app — text should appear in your browser's language (if it's one of en/fr/es/ja/de)
2. On the welcome screen, find the language selector and switch to French — all text should update
3. Create a player and log in — the header should show a flag button next to "Switch player"
4. Click the flag button — a dropdown should appear with all five languages
5. Select Japanese — all text should update immediately, flag button should show 🇯🇵
6. Play a complete game — verify all feedback, labels, and summary text are in Japanese
7. Close and reopen the browser — the app should remember Japanese
8. Switch to German — verify longer German text doesn't break any layouts
9. Check on a 320px viewport — language switcher and dropdown should fit

## How to Add a New Language

1. Create `frontend/src/i18n/locales/xx.ts` (copy `en.ts` and translate all values)
2. Type the file as `Dictionary` — TypeScript will flag any missing or extra keys
3. Import the new dictionary in `frontend/src/i18n/LanguageContext.tsx` and add to `dictionaries` map
4. Add the language to `SUPPORTED_LANGUAGES` in `frontend/src/i18n/index.ts` with its code, native name, and flag emoji
5. Update the `Language` type to include the new code

No component code changes needed.

## Key Design Decisions

- **No i18n library** — custom React Context solution (~100 lines, <2 KB) avoids YAGNI violation
- **TypeScript dictionary files** — compile-time key validation, IDE autocompletion
- **Named placeholders** (`{playerName}`) — translators can reorder words for grammar
- **Device-level language** — preference stored globally, not per-player profile
- **Disclosure button pattern** — WAI-ARIA Menu Button for keyboard-accessible dropdown
- **English fallback** — missing keys in any locale fall back to English, never blank
- **Brand name preserved** — "Turbotiply!" remains untranslated across all languages
