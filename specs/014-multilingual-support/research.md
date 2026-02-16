# Research: Multilingual Support

**Feature**: 014-multilingual-support  
**Date**: 2026-02-16  
**Status**: Complete — all unknowns resolved

## Research Tasks

### 1. i18n Library vs Custom Solution

**Decision**: Custom lightweight solution (React Context + TypeScript dictionary files)

**Rationale**:
- ~100–150 lines of custom code vs. 24–49 KB of library code shipping unused features (pluralization, ICU messages, namespaces, async loading)
- Follows the exact same Context + Provider + hook pattern already established in `useSession.tsx` — zero learning curve
- TypeScript enforces dictionary key completeness at compile time — no external plugin needed
- Bundle impact: <2 KB minified vs. 24 KB+ gzipped for react-i18next
- Matches Constitution II (YAGNI) and performance budget (Lighthouse ≥90 on mobile, 3G)

**Alternatives Considered**:
- **react-i18next** (v15+): React 19 compatible, but pulls in 3 packages (~73 KB min total). Ships pluralization engines, namespace loading, async backends — none needed. Rejected for bundle size and unnecessary complexity.
- **FormatJS / react-intl**: ~49 KB min. Full ICU MessageFormat parser for plurals, date/number formatting — overkill for 5 languages and ~80 flat keys. Rejected.
- **LinguiJS**: ~30 KB, macro-based — adds build tooling complexity. Rejected.
- **Paraglide (inlang)**: Compiler-based tree-shaking — interesting but adds build-step complexity and maturity risk. Rejected.

---

### 2. Dictionary File Format: TypeScript vs JSON

**Decision**: TypeScript `.ts` files

**Rationale**:
- Compile-time type checking: `const fr: Dictionary = { ... }` catches missing or extra keys immediately — no runtime validation needed
- IDE autocompletion: type a key, see all translations across files
- Supports inline JSDoc comments explaining placeholders to translators
- Vite tree-shakes `.ts` files identically to `.json` — no bundle size difference
- `.json` requires `resolveJsonModule` and separate validation; missing keys aren't caught without a wrapper type

**Structure**: One file per language in `frontend/src/i18n/locales/`. English (`en.ts`) is the source of truth and defines the `Dictionary` type via `typeof en`. Other locales are typed as `Dictionary`, enforcing exact key parity.

---

### 3. Type-Safe Translation Keys

**Decision**: Derive key type from the English dictionary using `typeof` + `keyof`

**Rationale**:
- `const en = { ... } as const` makes every value a literal string type
- `type Dictionary = typeof en` captures the exact object shape
- Other locale files typed as `Dictionary` must match every key exactly — missing/extra keys produce TypeScript compile errors
- Zero runtime cost — types are erased at build time
- Adding a new key: add to `en.ts`, then TypeScript errors guide you through every other locale file

---

### 4. Named Placeholder Interpolation

**Decision**: Simple regex replacement — `template.replace(/\{(\w+)\}/g, ...)`

**Rationale**:
- 4 lines of code. Pattern: `{playerName}`, `{current}`, `{total}`
- Matches spec requirement FR-019
- Unmatched placeholders are preserved as-is (safe fallback)
- Translators can reorder placeholders freely: `"Punkte: {current} von {total}"` works identically to `"Score: {current} / {total}"`
- No need for ICU MessageFormat complexity — no pluralization, no select/gender, no number formatting required

---

### 5. Browser Language Detection

**Decision**: Iterate `navigator.languages`, match base language codes against supported set

**Rationale**:
- `navigator.languages` returns an ordered array of BCP 47 language tags (e.g., `["es-MX", "en-US", "fr"]`)
- Strip region codes (`es-MX` → `es`) and match against `['en', 'fr', 'es', 'ja', 'de']`
- First match wins; no match defaults to `'en'`
- Directly implements spec scenarios: US1-SC3 (Portuguese → English fallback), US1-SC4 (`es-MX` → `es`)
- Fallback to `navigator.language` (singular) for robustness

**Platform support**:

| Browser | Support |
|---------|---------|
| Chrome | Since v32 (2014) |
| Firefox | Since v32 (2014) |
| Safari | Since v10.1 (2017) |
| Edge | Since v16 (2017) / all Chromium Edge |
| School Chromebooks | All (run Chrome ≥80+) |

**Note on managed Chromebooks**: `navigator.languages` reflects the OS language set by the school admin, not necessarily the student's preference — this is why the manual language switcher exists.

---

### 6. Language Preference Persistence

**Decision**: Store in `localStorage` under `turbotiply_lang` key

**Rationale**:
- Consistent with existing storage patterns (`turbotiply_players`, `turbotiply_session`)
- Prefix follows the `turbotiply_` convention
- Resolution order: (1) `localStorage` stored preference → (2) `detectLanguage()` from browser → (3) default `'en'`
- Stored preference overrides browser detection (spec US3, FR-010)
- When no manual selection stored, re-detect from browser each visit (FR-011)
- `try/catch` around localStorage access for the unavailable-storage edge case

---

### 7. React Context Provider Architecture

**Decision**: Mirror the existing `SessionProvider` pattern

**Rationale**:
- `createContext` → `LanguageProvider` wrapper → `useTranslation()` hook — identical to `SessionContext` + `useSession()`
- Provider wraps the entire app (outside `SessionProvider` — language applies even before login)
- `useState` for language code, `useCallback` for `t()` function and `setLanguage()`, `useEffect` for HTML `lang` attribute
- `t()` is memoized based on `language` — components re-render only when language changes
- Provider placed in `App.tsx` wrapping `<HashRouter>` and `<SessionProvider>`

---

### 8. Unicode Flag Emoji Rendering

**Decision**: Safe to use Unicode flag emojis (🇬🇧 🇫🇷 🇪🇸 🇯🇵 🇩🇪)

**Rationale**:
- ChromeOS: Noto Color Emoji renders all flags correctly on all Chromebook models
- Chrome/Edge on Windows: Render flags correctly since Chrome 77+ (using bundled emoji font)
- Firefox on Windows: Correct rendering
- iOS/macOS: Full support via Apple Color Emoji
- Android: Full support via Noto Color Emoji

**Accessibility**: Flag emojis have no built-in alt text. Screen readers announce as "flag: Great Britain" or just "GB" depending on the reader. Spec requires native language names alongside flags (FR-006), so flags are never the sole indicator — passes Constitution I.

**Alternative rejected**: SVG flag images — adds asset management complexity, 5× more bytes, no visual improvement on target platforms.

---

### 9. Keyboard-Accessible Dropdown Pattern

**Decision**: Disclosure button pattern (WAI-ARIA Menu Button)

**Rationale**:
- Correct pattern for a small fixed option list (5 items)
- Uses `aria-expanded` + `aria-haspopup="true"` on button, `role="menu"` + `role="menuitem"` on items
- ~50 lines of code — no library needed

**Required keyboard interactions** (WAI-ARIA Menu Button pattern):
- Enter/Space on button → toggle menu
- Arrow Down/Up → navigate menu items (with wrap)
- Enter/Space on item → select language, close menu
- Escape → close menu, return focus to button
- Home → focus first item
- End → focus last item

**Alternatives rejected**:
- **Combobox** (`role="combobox"` + `role="listbox"`): Designed for filterable/searchable lists with type-ahead — unnecessary complexity for 5 fixed items
- **Native `<select>`**: Cannot reliably render flag emojis cross-platform (Safari shows boxes, some Android browsers skip emoji). 44px touch targets harder to guarantee. Cannot style to match app design.
- **Radix/Headless UI dropdown**: Adds a dependency for a single component — violates YAGNI

---

### 10. HTML `lang` Attribute Update

**Decision**: `useEffect` inside `LanguageProvider`

**Rationale**:
- `document.documentElement.lang = language` — standard DOM API
- Runs on mount (sets initial language) and on every language change
- Single source of truth, inside the provider
- Used by screen readers, browser spell-checkers, and search engines

---

## Summary

| Topic | Decision | Bundle Cost |
|-------|----------|-------------|
| i18n approach | Custom Context + TS dictionaries | <2 KB |
| Dictionary format | `.ts` files per language | 0 (same as .json) |
| Key type safety | `typeof en` + `keyof` | 0 (erased at compile) |
| Placeholders | Regex `{key}` replacement | <0.1 KB |
| Browser detection | `navigator.languages` | <0.1 KB |
| Persistence | `localStorage` `turbotiply_lang` | <0.1 KB |
| Provider | Mirror `SessionProvider` | <0.5 KB |
| Flags | Unicode emoji | 0 |
| Dropdown | Disclosure button + menu role | <1 KB |
| HTML lang | `useEffect` in provider | 0 |
| **Total feature bundle cost** | | **<4 KB** |

All research tasks resolved. No NEEDS CLARIFICATION items remain.
