import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Language } from '../types/i18n';
import type { TranslationKey, Dictionary } from './index';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, interpolate } from './index';
import { detectLanguage } from './detectLanguage';
import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';
import ja from './locales/ja';
import de from './locales/de';
import pt from './locales/pt';

// All dictionaries bundled at build time — no runtime fetching.
const dictionaries: Record<Language, Dictionary> = { en, fr, es, ja, de, pt };

const STORAGE_KEY = 'turbotiply_lang';

/** Read stored language preference from localStorage. */
function getStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      return stored as Language;
    }
  } catch {
    // localStorage unavailable — return null
  }
  return null;
}

/** Persist language preference to localStorage. */
function storeLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable — silently fail
  }
}

interface UseTranslationReturn {
  /** Current active language code. */
  language: Language;
  /**
   * Translate a key, with optional named parameter substitution.
   * Falls back to English if key is missing in current locale.
   * Falls back to the raw key string if missing in English too.
   */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /** Switch active language. Persists to localStorage. */
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<UseTranslationReturn | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app to provide language context.
 *
 * On mount:
 *   1. Reads localStorage('turbotiply_lang') → if valid, use it
 *   2. Else, calls detectLanguage() → uses browser preference
 *   3. Sets document.documentElement.lang
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    return getStoredLanguage() ?? detectLanguage();
  });

  // Sync <html lang="..."> attribute on every language change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storeLanguage(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict = dictionaries[language];
      let template: string = dict[key] ?? (dictionaries[DEFAULT_LANGUAGE] as Dictionary)[key] ?? key;
      if (params) {
        template = interpolate(template, params);
      }
      return template;
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, t, setLanguage }),
    [language, t, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Hook to access translation functions and language state.
 * Must be used within a LanguageProvider.
 * @throws If used outside LanguageProvider.
 */
export function useTranslation(): UseTranslationReturn {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
