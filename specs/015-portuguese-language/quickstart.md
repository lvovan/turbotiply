# Quickstart: Portuguese Language Support

**Feature**: 015-portuguese-language  
**Date**: 2026-02-16

## What Changed

TurboTiply gains Portuguese (Brazilian variant) as its sixth supported language. A new Portuguese dictionary file provides translations for all ~100 translation keys. The Language type, supported languages list, detection set, and dictionary map are extended to include Portuguese. The LanguageSwitcher automatically shows Portuguese (🇧🇷 Português) alongside the existing five languages. Browser auto-detection now recognises `pt`, `pt-BR`, and `pt-PT` variants.

## New Files

| File | Purpose |
|------|---------|
| `frontend/src/i18n/locales/pt.ts` | Portuguese (Brazilian) dictionary — all ~100 translation keys |

## Modified Files

| File | Change |
|------|--------|
| `frontend/src/types/i18n.ts` | Add `'pt'` to `Language` union type |
| `frontend/src/i18n/index.ts` | Add Portuguese entry to `SUPPORTED_LANGUAGES` array |
| `frontend/src/i18n/LanguageContext.tsx` | Import `pt` dictionary, add to `dictionaries` map |
| `frontend/src/i18n/detectLanguage.ts` | Add `'pt'` to `SUPPORTED_CODES` set |

## How to Verify

```bash
cd frontend

# Run tests — all 476+ should pass
npm test

# Build — should succeed with no TypeScript errors
npm run build

# Start dev server
npm run dev
```

1. Open the app — if your browser is set to Portuguese, text should appear in Portuguese automatically
2. On the welcome screen, click the language selector and verify Portuguese (🇧🇷 Português) is listed
3. Select Portuguese — all text should update immediately to Portuguese
4. Create a player and log in — verify the header shows 🇧🇷 flag button
5. Play a complete game — verify all feedback, labels, and summary text are in Portuguese
6. Close and reopen the browser — Portuguese should still be active (persisted)
7. Check on a 320px viewport — verify no layout breakage with Portuguese text
8. Switch to another language and back to Portuguese — verify smooth transitions

## Key Design Decisions

- **Brazilian Portuguese (pt-BR)** — single variant covering the largest Portuguese-speaking audience (~215M speakers)
- **🇧🇷 flag** — follows existing pattern of using the largest-population country's flag per language
- **No component changes** — LanguageSwitcher dynamically renders from SUPPORTED_LANGUAGES, so adding a new entry is sufficient
- **TypeScript enforces completeness** — `const pt: Dictionary = { ... }` fails to compile if any key is missing
- **Child-friendly vocabulary** — informal "você" register, encouraging feedback, simple verb forms
