# Module Contract: i18n (LanguageContext + useTranslation)

**Feature**: 014-multilingual-support  
**Date**: 2026-02-16  
**Type**: React Context + Hook + Utilities (new)

## Public API

### Types

```typescript
/** Supported language codes */
type Language = 'en' | 'fr' | 'es' | 'ja' | 'de';

/** Translation key — derived from English dictionary keys */
type TranslationKey = keyof typeof import('./locales/en').default;

/** A complete dictionary — shape defined by the English locale */
type Dictionary = Record<TranslationKey, string>;

/** Metadata for a supported language */
interface LanguageInfo {
  code: Language;
  nativeName: string;  // e.g., "Français"
  flag: string;        // e.g., "🇫🇷"
}
```

### Constants

```typescript
/** Ordered list of all supported languages with metadata */
const SUPPORTED_LANGUAGES: readonly LanguageInfo[];

/** Default language when no preference or match is found */
const DEFAULT_LANGUAGE: Language; // 'en'
```

### LanguageProvider

```typescript
interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app to provide language context.
 * Placed in App.tsx, wrapping HashRouter and SessionProvider.
 *
 * On mount:
 *   1. Reads localStorage('turbotiply_lang') → if valid, use it
 *   2. Else, calls detectLanguage() → uses browser preference
 *   3. Sets document.documentElement.lang
 */
function LanguageProvider(props: LanguageProviderProps): JSX.Element;
```

### useTranslation Hook

```typescript
interface UseTranslationReturn {
  /** Current active language code */
  language: Language;
  
  /**
   * Translate a key, with optional named parameter substitution.
   * Falls back to English if key is missing in current locale.
   * Falls back to the raw key string if missing in English too.
   *
   * @example t('header.greeting', { playerName: 'Alice' }) → "Hi, Alice!"
   * @example t('game.correct') → "Correct!"
   */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  
  /** Switch active language. Persists to localStorage. */
  setLanguage: (lang: Language) => void;
}

/**
 * Hook to access translation functions and language state.
 * Must be used within a LanguageProvider.
 * Throws if used outside provider.
 */
function useTranslation(): UseTranslationReturn;
```

### detectLanguage

```typescript
/**
 * Detect the best matching language from browser settings.
 * Iterates navigator.languages, strips region codes (e.g., 'es-MX' → 'es'),
 * returns first match against SUPPORTED_LANGUAGES.
 * Falls back to 'en' if no match.
 */
function detectLanguage(): Language;
```

### interpolate

```typescript
/**
 * Replace named placeholders like {playerName} with values from params.
 * Unmatched placeholders are left as-is (safe fallback).
 */
function interpolate(
  template: string,
  params: Record<string, string | number>
): string;
```

## Behavior Contract

### Language Resolution

```
getStoredLanguage()  →  found?  →  yes  →  use stored language
                         │
                         no
                         │
                         ▼
                    detectLanguage()  →  match?  →  yes  →  use detected
                                          │
                                          no
                                          │
                                          ▼
                                        'en' (default)
```

### Translation Lookup

```
t(key, params?)
  │
  ├─ Look up key in current language dictionary
  │   └─ Found? → template string
  │
  ├─ Not found → Look up key in English dictionary (fallback)
  │   └─ Found? → template string
  │
  ├─ Not found → return raw key string
  │
  └─ If params provided → interpolate(template, params)
     └─ Return final string
```

### Side Effects on Language Change

| Order | Side Effect | Trigger |
|-------|------------|---------|
| 1 | React state update (`setLanguageState`) | `setLanguage()` called |
| 2 | `localStorage.setItem('turbotiply_lang', code)` | Same call |
| 3 | `document.documentElement.lang = code` | `useEffect` on language change |
| 4 | All consuming components re-render with new translations | React context propagation |

### Error Handling

| Scenario | Behavior |
|----------|----------|
| `localStorage` unavailable | `getStoredLanguage()` returns `null`; `storeLanguage()` silently fails. Language works for current session. |
| Invalid stored value (e.g., `"xx"`) | Treated as absent — falls through to browser detection |
| Missing key in non-English dictionary | Falls back to English value for that key |
| Missing key in English dictionary | Returns the raw key string (e.g., `"header.switchPlayer"`) |
| `useTranslation()` called outside `LanguageProvider` | Throws `Error('useTranslation must be used within a LanguageProvider')` |

## Dictionary File Contract

Each locale file (`en.ts`, `fr.ts`, `es.ts`, `ja.ts`, `de.ts`) must:

1. Export a default object satisfying the `Dictionary` type
2. Contain the exact same keys as `en.ts` (enforced by TypeScript)
3. Use `{placeholderName}` syntax for dynamic values
4. Document placeholder names in comments where non-obvious

### Placeholder Convention

| Placeholder | Used In | Description |
|-------------|---------|-------------|
| `{playerName}` | `header.greeting` | Current player's display name |
| `{answer}` | `game.incorrectAnswer` | The correct answer to the missed question |
| `{current}` | `game.roundOf`, `game.replayProgress` | Current round/replay number |
| `{total}` | `game.roundOf`, `game.replayProgress` | Total rounds/replays |
| `{count}` | `summary.correctCount` | Number of correct answers |
| `{names}` | `welcome.evictionMessage` | Evicted player name(s) |
| `{pairs}` | `summary.practiceHint` | Tricky number pairs list |
| `{score}` | `scores.scorePoints` | Numeric score |
| `{ordinal}` | `scores.placeScore` | Ordinal position (1st, 2nd, etc.) |

## Integration Point

```tsx
// App.tsx — provider placement
function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <SessionProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/play" element={<MainPage />} />
          </Routes>
        </SessionProvider>
      </HashRouter>
    </LanguageProvider>
  );
}
```

`LanguageProvider` wraps **outside** `HashRouter` and `SessionProvider` because:
- Language applies before login (welcome screen needs translations)
- Language is independent of session state
- Routes need translated content
