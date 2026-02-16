/** Supported language codes (BCP 47 base). */
export type Language = 'en' | 'fr' | 'es' | 'ja' | 'de' | 'pt';

/** Metadata for a supported language. */
export interface LanguageInfo {
  /** BCP 47 base language code. */
  code: Language;
  /** Language name in its own language (e.g., "Français"). */
  nativeName: string;
  /** Unicode flag emoji (e.g., "🇫🇷"). */
  flag: string;
}
