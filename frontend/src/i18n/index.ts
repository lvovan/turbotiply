import type { Language, LanguageInfo } from '../types/i18n';

export type { Language, LanguageInfo };

/** Translation key — derived from English dictionary keys. */
export type TranslationKey = keyof typeof import('./locales/en').default;

/** A complete dictionary — shape matches the English locale exactly. */
export type Dictionary = Record<TranslationKey, string>;

/** Default language when no preference or match is found. */
export const DEFAULT_LANGUAGE: Language = 'en';

/** Ordered list of all supported languages with metadata. */
export const SUPPORTED_LANGUAGES: readonly LanguageInfo[] = [
  { code: 'en', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ja', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', nativeName: 'Português', flag: '🇧🇷' },
] as const;

/**
 * Replace named placeholders like `{playerName}` with values from params.
 * Unmatched placeholders are left as-is (safe fallback).
 */
export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export { detectLanguage } from './detectLanguage';
export { LanguageProvider, useTranslation } from './LanguageContext';
