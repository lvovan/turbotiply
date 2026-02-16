# Data Model: Multilingual Support

**Feature**: 014-multilingual-support  
**Date**: 2026-02-16

## Entities

### Language (new)

A supported locale for the application interface.

| Field | Type | Description |
|-------|------|-------------|
| `code` | `'en' \| 'fr' \| 'es' \| 'ja' \| 'de'` | BCP 47 base language code |
| `nativeName` | `string` | Language name in its own language (e.g., "Français") |
| `flag` | `string` | Unicode flag emoji (e.g., "🇬🇧") |

**Constant list** — `SUPPORTED_LANGUAGES`:

| Code | Native Name | Flag |
|------|-------------|------|
| `en` | English | 🇬🇧 |
| `fr` | Français | 🇫🇷 |
| `es` | Español | 🇪🇸 |
| `ja` | 日本語 | 🇯🇵 |
| `de` | Deutsch | 🇩🇪 |

### Dictionary (new)

A flat key-value object mapping translation keys to localized text strings. One dictionary per supported language.

| Field | Type | Description |
|-------|------|-------------|
| (each key) | `string` | Translation key using dot-notation namespace (e.g., `'header.switchPlayer'`) |
| (each value) | `string` | Translated text, optionally containing named placeholders like `{playerName}` |

**Key namespaces**:

| Namespace | Description | Example Keys |
|-----------|-------------|--------------|
| `welcome` | Welcome/player selection screen | `welcome.subtitle`, `welcome.subtitleReturning` |
| `player` | Player creation and management | `player.namePlaceholder`, `player.letsGo` |
| `header` | Header bar | `header.greeting`, `header.switchPlayer`, `header.changeLanguage` |
| `game` | Gameplay (rounds, feedback) | `game.correct`, `game.incorrect`, `game.roundOf` |
| `mode` | Mode selector | `mode.play`, `mode.improve`, `mode.playDescription` |
| `summary` | Score summary screen | `summary.gameOver`, `summary.totalScore`, `summary.playAgain` |
| `scores` | High scores section | `scores.title`, `scores.empty` |
| `dialog` | Confirmation dialogs | `dialog.cancel`, `dialog.remove`, `dialog.clearAll` |
| `avatar` | Avatar labels and descriptions | `avatar.rocket`, `avatar.star` |
| `a11y` | Accessibility-only labels | `a11y.gameStatus`, `a11y.timeRemaining`, `a11y.submitAnswer` |

### Language Preference (new — persisted)

The player's manually selected language, stored in `localStorage`.

| Storage Key | Type | Description |
|-------------|------|-------------|
| `turbotiply_lang` | `Language \| null` | The language code stored when a player manually selects a language. `null` (absent) means use browser detection. |

**Resolution order** (priority highest → lowest):

1. `localStorage` key `turbotiply_lang` → use stored value
2. `navigator.languages` → first matching supported language code (base match, e.g., `es-MX` → `es`)
3. Default → `'en'`

### PlayerStore (existing — unchanged)

No changes to the `PlayerStore` schema. Language preference is stored in a separate `localStorage` key (`turbotiply_lang`), not within the player data structure. This aligns with assumption A-002: language is a device-level concern, not per-player.

## State Transitions

### Language State

```
┌─────────────────┐
│   App Launch     │
│                  │
│  Check storage   │
│  for turbotiply_ │
│  lang key        │
└────────┬────────┘
         │
    ┌────▼────┐     ┌──────────────┐
    │  Found  │────▶│ Use stored   │──────────────┐
    └─────────┘     │ language     │              │
                    └──────────────┘              │
    ┌─────────┐     ┌──────────────┐              │
    │Not Found│────▶│ Detect from  │──────────────┤
    └─────────┘     │ browser      │              │
                    └──────────────┘              │
                                                  ▼
                                         ┌─────────────────┐
                                         │  Active Language │◀────┐
                                         │  (React state)   │     │
                                         └────────┬────────┘     │
                                                  │              │
                                           ┌──────▼──────┐      │
                                           │ Player opens │      │
                                           │ language     │      │
                                           │ switcher     │      │
                                           └──────┬──────┘      │
                                                  │              │
                                           ┌──────▼──────┐      │
                                           │ Selects new  │      │
                                           │ language     │──────┘
                                           │              │
                                           │ Stores in    │
                                           │ localStorage │
                                           └─────────────┘
```

### Language Switcher UI State

| State | Trigger | Next State |
|-------|---------|------------|
| Closed | Click/Enter/Space on flag button | Open |
| Open | Click/Enter/Space on menu item | Closed (language changed) |
| Open | Escape key | Closed (no change) |
| Open | Click outside menu | Closed (no change) |
| Open | Tab away from menu | Closed (no change) |

## Validation Rules

- Language code must be one of the five supported values: `'en'`, `'fr'`, `'es'`, `'ja'`, `'de'`
- Stored language preference that doesn't match a supported code is ignored (treated as absent)
- Missing dictionary key falls back to English translation for that key (FR-016)
- Named placeholders (`{key}`) not matched by provided params are left as-is in output (safe fallback)
- All five dictionary files must export the exact same set of keys (enforced by TypeScript compiler)
