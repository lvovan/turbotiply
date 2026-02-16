# Data Model: Portuguese Language Support

**Feature**: 015-portuguese-language  
**Date**: 2026-02-16

## Entities

### Language (existing — modified)

A supported locale for the application interface. Extended to include Portuguese.

| Field | Type | Description |
|-------|------|-------------|
| `code` | `'en' \| 'fr' \| 'es' \| 'ja' \| 'de' \| 'pt'` | BCP 47 base language code |
| `nativeName` | `string` | Language name in its own language (e.g., "Português") |
| `flag` | `string` | Unicode flag emoji (e.g., "🇧🇷") |

**Constant list** — `SUPPORTED_LANGUAGES` (updated):

| Code | Native Name | Flag | Status |
|------|-------------|------|--------|
| `en` | English | 🇬🇧 | Existing |
| `fr` | Français | 🇫🇷 | Existing |
| `es` | Español | 🇪🇸 | Existing |
| `ja` | 日本語 | 🇯🇵 | Existing |
| `de` | Deutsch | 🇩🇪 | Existing |
| `pt` | Português | 🇧🇷 | **NEW** |

### Dictionary — Portuguese (new)

A flat key-value object mapping all existing translation keys to Brazilian Portuguese text strings. Uses the same structure and key set as the five existing dictionaries.

| Field | Type | Description |
|-------|------|-------------|
| (each key) | `string` | Translation key using dot-notation namespace (e.g., `'header.switchPlayer'`) |
| (each value) | `string` | Portuguese translation, optionally containing named placeholders like `{playerName}` |

**Key namespaces** (unchanged from 014 — Portuguese dictionary provides values for all):

| Namespace | Description | Example Keys |
|-----------|-------------|--------------|
| `welcome` | Welcome/player selection screen | `welcome.subtitle`, `welcome.subtitleReturning` |
| `player` | Player creation and management | `player.namePlaceholder`, `player.letsGo` |
| `header` | Header bar | `header.greeting`, `header.switchPlayer`, `header.changeLanguage` |
| `game` | Gameplay (rounds, feedback) | `game.correct`, `game.incorrect`, `game.roundOf` |
| `mode` | Mode selector | `mode.play`, `mode.improve`, `mode.playDescription` |
| `summary` | Score summary screen | `summary.gameOver`, `summary.totalScore`, `summary.playAgain` |
| `scores` | High scores section | `scores.title`, `scores.empty` |
| `ordinal` | Ordinal suffixes | `ordinal.1`, `ordinal.2`, `ordinal.other` |
| `dialog` | Confirmation dialogs | `dialog.cancel`, `dialog.remove`, `dialog.clearAll` |
| `avatar` | Avatar labels and descriptions | `avatar.rocket`, `avatar.star` |
| `a11y` | Accessibility-only labels | `a11y.gameStatus`, `a11y.timeRemaining`, `a11y.submitAnswer` |

### Language Preference (existing — unchanged)

No changes to persistence. The `turbotiply_lang` localStorage key can now store `'pt'` as a valid value.

| Storage Key | Type | Description |
|-------------|------|-------------|
| `turbotiply_lang` | `Language \| null` | The language code stored when a player manually selects a language. Now includes `'pt'` as valid. |

**Resolution order** (unchanged):

1. `localStorage` key `turbotiply_lang` → use stored value
2. `navigator.languages` → first matching supported language code (base match, e.g., `pt-BR` → `pt`)
3. Default → `'en'`

### Supported Codes Set (existing — modified)

The `SUPPORTED_CODES` set in `detectLanguage.ts` is extended to include `'pt'` for O(1) lookup during browser language detection.

**Before**: `new Set(['en', 'fr', 'es', 'ja', 'de'])`  
**After**: `new Set(['en', 'fr', 'es', 'ja', 'de', 'pt'])`

## State Transitions

No new state transitions. The existing language state machine (Launch → Check storage → Detect/Use stored → Active Language → Switcher → Update + Persist) handles Portuguese identically to the existing five languages. The `'pt'` code flows through all the same paths.

## Relationships

```
Language type ──defines──▶ valid codes including 'pt'
     │
     ├── SUPPORTED_LANGUAGES ──lists──▶ { code: 'pt', nativeName: 'Português', flag: '🇧🇷' }
     │
     ├── SUPPORTED_CODES set ──enables──▶ detectLanguage() matching 'pt', 'pt-BR', 'pt-PT'
     │
     ├── dictionaries map ──imports──▶ pt.ts dictionary
     │
     └── LanguageSwitcher ──renders from──▶ SUPPORTED_LANGUAGES (automatic)
```
