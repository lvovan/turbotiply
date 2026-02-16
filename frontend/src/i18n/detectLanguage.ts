import type { Language } from '../types/i18n';

/** Set of supported language codes for O(1) lookup. */
const SUPPORTED_CODES: ReadonlySet<string> = new Set<Language>(['en', 'fr', 'es', 'ja', 'de', 'pt']);

/**
 * Detect the best matching language from browser settings.
 *
 * Iterates `navigator.languages` (falling back to `navigator.language`),
 * strips region codes (e.g., `'es-MX'` → `'es'`), and returns the first
 * match against the supported language set.
 *
 * @returns The detected language code, or `'en'` if no match is found.
 */
export function detectLanguage(): Language {
  const candidates =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : []
      : [];

  for (const tag of candidates) {
    const base = tag.split('-')[0].toLowerCase();
    if (SUPPORTED_CODES.has(base)) {
      return base as Language;
    }
  }

  return 'en';
}
