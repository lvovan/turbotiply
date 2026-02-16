# Research: Portuguese Language Support

**Feature**: 015-portuguese-language  
**Date**: 2026-02-16  
**Status**: Complete — all unknowns resolved

## Research Tasks

### 1. Portuguese Variant Selection: Brazilian (pt-BR) vs European (pt-PT)

**Decision**: Brazilian Portuguese (pt-BR) as the single variant

**Rationale**:
- Brazil has ~215 million Portuguese speakers vs ~10 million in Portugal — over 95% of web traffic in Portuguese originates from Brazil
- Brazilian Portuguese is the most commonly encountered variant in software localisation (Google, Microsoft, Apple all default to pt-BR)
- Vocabulary differences between pt-BR and pt-PT are modest in the context of a children's math game (e.g., "jogo" vs "jogo", "pontuação" vs "pontuação" — most game-related terms are identical)
- A single Portuguese dictionary avoids the complexity of maintaining two variants with marginal benefit
- Aligns with spec assumption A-002

**Alternatives Considered**:
- **Separate pt-BR and pt-PT dictionaries**: Rejected — doubles translation maintenance for ~100 keys with <5% vocabulary difference in this domain. Violates YAGNI (Constitution II).
- **European Portuguese only**: Rejected — significantly smaller audience.

---

### 2. Flag Representation

**Decision**: 🇧🇷 (Brazilian flag)

**Rationale**:
- Follows the pattern established in 014: flags represent the largest population speaking each language (🇬🇧 for English, 🇪🇸 for Spanish)
- Brazil is by far the largest Portuguese-speaking country
- Most Portuguese-speaking users globally will recognise 🇧🇷 as representing their language in software
- Unicode flag emoji — no image assets needed, consistent with existing implementation
- Aligns with spec assumption A-001

**Alternatives Considered**:
- **🇵🇹 (Portuguese flag)**: Rejected — Portugal has a much smaller population and this would be inconsistent with the 🇬🇧/🇪🇸 pattern (neither uses the "origin country" flag).
- **Combined or neutral icon**: Rejected — no standard combined Portuguese flag emoji exists; a custom icon would break the all-emoji pattern.

---

### 3. Portuguese Text Length Impact

**Decision**: No special layout handling needed

**Rationale**:
- Portuguese text is typically 15–25% longer than English, comparable to French and Spanish
- German text (already supported) is typically 20–35% longer than English — the most extreme case is already handled
- The existing responsive layout was validated at 320px viewport with German text
- Portuguese diacritics (ã, õ, ç, á, é, í, ó, ú, â, ê, ô) are standard Latin Unicode characters rendered by all web fonts
- No special font loading or CSS changes required

**Verification**: Spot-checked key translations:
- "Create your player to get started!" (38 chars) → "Crie seu jogador para começar!" (31 chars) — actually shorter
- "Who is playing today?" (21 chars) → "Quem vai jogar hoje?" (20 chars) — comparable  
- "Play again" (10 chars) → "Jogar novamente" (15 chars) — 50% longer but well within existing layout tolerances

---

### 4. Child-Friendly Portuguese Vocabulary

**Decision**: Use informal Brazilian Portuguese appropriate for ages 6–12

**Rationale**:
- Brazilian Portuguese has informal ("você") and formal ("o senhor/a senhora") registers — children's software universally uses "você"
- Game feedback should be encouraging and simple: "Correto!", "Não foi dessa vez…", "Vamos lá! 🚀"
- Avoid complex verb conjugations where possible — prefer imperative ("Jogue novamente") over subjunctive
- Short sentences matching the style of existing English text
- Aligns with Constitution I (age-appropriate language for children 6–12)

---

### 5. Integration Points — Exact Code Changes Required

**Decision**: 5 files total (1 new, 4 modified), following the documented "How to Add a New Language" pattern from 014-multilingual-support

**Rationale**: The 014 quickstart.md documents the exact steps:

| File | Change |
|------|--------|
| `frontend/src/i18n/locales/pt.ts` | NEW — create Portuguese dictionary with all ~100 keys |
| `frontend/src/types/i18n.ts` | Add `'pt'` to `Language` union type |
| `frontend/src/i18n/index.ts` | Add `{ code: 'pt', nativeName: 'Português', flag: '🇧🇷' }` to `SUPPORTED_LANGUAGES` |
| `frontend/src/i18n/LanguageContext.tsx` | Import `pt` dictionary, add to `dictionaries` map |
| `frontend/src/i18n/detectLanguage.ts` | Add `'pt'` to `SUPPORTED_CODES` set |

No component code changes needed — the LanguageSwitcher dynamically renders from the `SUPPORTED_LANGUAGES` list. The `<html lang>` attribute is set dynamically from the active language code by the existing `LanguageContext`.

---

### 6. Test Impact Assessment

**Decision**: Existing tests pass without modification; no new test files required

**Rationale**:
- All 476 existing tests use the `test-utils.tsx` custom render wrapper which provides `LanguageProvider` defaulting to English
- Adding Portuguese to the `Language` type and `SUPPORTED_LANGUAGES` does not change the default language or any test behaviour
- TypeScript compile-time validation (`const pt: Dictionary = { ... }`) enforces dictionary completeness — no runtime test needed
- The existing `detectLanguage` function tests (if any) mock `navigator.languages` and won't be affected by adding `'pt'` to the supported set
- Build verification (`npm run build`) confirms TypeScript compilation succeeds with the new dictionary

**Note**: If the team desires explicit Portuguese-specific tests (e.g., verifying pt-BR detection or Portuguese text rendering), these can be added as follow-up work but are not required for the feature to be correct.
