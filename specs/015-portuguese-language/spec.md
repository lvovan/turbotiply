# Feature Specification: Portuguese Language Support

**Feature Branch**: `015-portuguese-language`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Add support for Portuguese language."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Portuguese dictionary with complete translations (Priority: P1)

A Portuguese-speaking player opens TurboTiply and sees every piece of interface text in Portuguese. From the welcome screen title and subtitle, through player creation labels, game mode descriptions, in-game feedback ("Correto!", "Não é bem assim…"), to the score summary — all text appears in Portuguese. No English text leaks through except for the brand name "Turbotiply!", player-entered names, and numeric values.

**Why this priority**: Without a complete Portuguese dictionary containing all translation keys, no other part of the feature can function. This is the foundational deliverable.

**Independent Test**: Can be tested by setting Portuguese as the active language and navigating through every screen in the app (welcome, player creation, mode selection, gameplay, score summary), verifying all text is in Portuguese with no untranslated strings.

**Acceptance Scenarios**:

1. **Given** the Portuguese dictionary file exists with all required translation keys, **When** Portuguese is set as the active language, **Then** every user-facing text element displays in Portuguese.
2. **Given** the Portuguese dictionary, **When** compared to the English dictionary, **Then** both contain the exact same set of keys with no missing entries.
3. **Given** Portuguese is the active language, **When** a player plays a complete game (including correct and incorrect answers), **Then** all feedback messages, labels, buttons, and status text appear in Portuguese.
4. **Given** Portuguese is the active language, **When** mathematical formulas and numeric scores are displayed, **Then** they remain as standard numerals and are not translated.

---

### User Story 2 — Portuguese appears in the language switcher (Priority: P1)

A player opens the language switcher (flag button dropdown) and sees Portuguese listed alongside the existing five languages. The entry shows the Brazilian flag (🇧🇷) and the native name "Português". Selecting it immediately switches the entire interface to Portuguese.

**Why this priority**: The language switcher is the primary mechanism for players to select Portuguese. Without it, players have no way to choose the language manually.

**Independent Test**: Can be tested by clicking the language switcher on both the welcome screen and the header, verifying Portuguese appears in the dropdown, selecting it, and confirming all text updates to Portuguese.

**Acceptance Scenarios**:

1. **Given** a player views the language switcher dropdown, **When** they see the list of available languages, **Then** Portuguese is listed with the 🇧🇷 flag and the label "Português".
2. **Given** a player selects "Português" from the dropdown, **When** the selection is made, **Then** all interface text immediately updates to Portuguese without a page reload.
3. **Given** a player has selected Portuguese, **When** they view the flag button in the header, **Then** it displays the 🇧🇷 flag.
4. **Given** a player selects Portuguese on the welcome screen language switcher, **When** they create a profile and log in, **Then** the main page continues to display in Portuguese.

---

### User Story 3 — Browser auto-detection recognises Portuguese (Priority: P1)

A player whose browser is set to Portuguese (e.g., "pt", "pt-BR", "pt-PT") visits TurboTiply for the first time. The app auto-detects Portuguese from the browser's language preference list and displays the interface in Portuguese without any manual selection.

**Why this priority**: Auto-detection is the zero-configuration experience for Portuguese speakers. Visitors from Brazil and Portugal should see Portuguese immediately on first visit.

**Independent Test**: Can be tested by setting the browser's language preference to "pt-BR" or "pt", clearing any stored language preference, and loading TurboTiply — verifying all text appears in Portuguese.

**Acceptance Scenarios**:

1. **Given** a browser with "pt-BR" as the primary language and no stored language preference, **When** the player opens TurboTiply, **Then** all user-facing text displays in Portuguese.
2. **Given** a browser with "pt-PT" as the primary language, **When** the player opens TurboTiply, **Then** the app matches the base language "pt" and displays text in Portuguese.
3. **Given** a browser with language preferences `["pt", "en"]` and no stored preference, **When** the player opens TurboTiply, **Then** Portuguese is detected as the first match and the interface displays in Portuguese.

---

### User Story 4 — Portuguese preference persists across sessions (Priority: P2)

A player manually selects Portuguese as their language. They close the browser and return later. The app remembers their choice and displays the interface in Portuguese immediately, regardless of their browser's language setting.

**Why this priority**: Persistence ensures Portuguese speakers don't need to re-select their language on every visit. This builds on the existing persistence mechanism.

**Independent Test**: Can be tested by selecting Portuguese, closing and reopening the browser, and verifying Portuguese is still active.

**Acceptance Scenarios**:

1. **Given** a player who manually selected Portuguese, **When** they close and reopen the browser, **Then** the app displays in Portuguese without requiring re-selection.
2. **Given** a player with a stored Portuguese preference and a browser set to English, **When** they open TurboTiply, **Then** the interface displays in Portuguese (stored preference overrides detection).

---

### User Story 5 — HTML lang attribute reflects Portuguese (Priority: P2)

When Portuguese is the active language, the HTML document's `lang` attribute is set to `"pt"` so that screen readers and assistive technologies correctly identify the page language.

**Why this priority**: Accessibility compliance requires the document language to match the content language. This is a small but essential detail for Portuguese-speaking users who rely on screen readers.

**Independent Test**: Can be tested by selecting Portuguese and inspecting the `<html>` element's `lang` attribute in browser developer tools.

**Acceptance Scenarios**:

1. **Given** Portuguese is the active language, **When** the page is rendered, **Then** the `<html>` element's `lang` attribute is `"pt"`.
2. **Given** a player switches from English to Portuguese, **When** the switch occurs, **Then** the `lang` attribute updates from `"en"` to `"pt"` immediately.

---

### Edge Cases

- What happens when a player's browser reports `"pt-BR"` (Brazilian Portuguese) or `"pt-PT"` (European Portuguese) as the language? The app strips the region code and matches the base language `"pt"`, displaying Brazilian Portuguese text (since the dictionary uses Brazilian Portuguese as the default variant).
- What happens if the Portuguese dictionary is missing a key that exists in English? The system falls back to the English text for that specific key, consistent with existing fallback behaviour.
- What happens with Portuguese-specific characters (ã, õ, ç, á, é, etc.) in the dictionary? These are standard Unicode characters and should render correctly across all modern browsers without special handling.
- What happens with Portuguese text lengths compared to English? Portuguese text is typically 15–25% longer than English. The UI must accommodate this without overflow or truncation, consistent with the existing layout handling for German.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support Portuguese as a sixth language, identified by the language code `"pt"`.
- **FR-002**: A dedicated Portuguese dictionary file MUST be created containing translations for 100% of the keys present in the English dictionary.
- **FR-003**: The Portuguese dictionary MUST use the same key structure as all other existing dictionary files.
- **FR-004**: Portuguese MUST appear in the language switcher dropdown on both the welcome screen and the header, displaying the flag 🇧🇷 and native name "Português".
- **FR-005**: Selecting Portuguese from the language switcher MUST immediately update all user-facing text to Portuguese without a page reload.
- **FR-006**: The browser auto-detection mechanism MUST recognise `"pt"`, `"pt-BR"`, `"pt-PT"`, and any other `pt-*` variant as matching Portuguese.
- **FR-007**: When Portuguese is selected, the stored language preference MUST persist across browser sessions via the existing persistence mechanism.
- **FR-008**: When Portuguese is active, the HTML document's `lang` attribute MUST be set to `"pt"`.
- **FR-009**: The `Language` type MUST be extended to include `"pt"` as a valid language code.
- **FR-010**: All Portuguese translations MUST use named placeholders (e.g., `{playerName}`, `{current}`, `{total}`) consistent with the existing interpolation pattern.
- **FR-011**: If the Portuguese dictionary is missing a key, the system MUST fall back to the English text for that key, consistent with existing fallback behaviour.
- **FR-012**: The Portuguese dictionary MUST use Brazilian Portuguese (pt-BR) as the default variant.

### Key Entities

- **Portuguese Dictionary**: A collection of key-value pairs mapping all existing translation keys to Portuguese text strings. Follows the same structure as the five existing dictionaries.
- **Language entry for Portuguese**: A new entry in the supported languages list with code `"pt"`, native name `"Português"`, and flag `"🇧🇷"`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of translation keys present in the English dictionary have corresponding Portuguese translations — no missing keys.
- **SC-002**: Players with a Portuguese browser setting see all interface text in Portuguese on first visit with zero manual configuration.
- **SC-003**: Players can select Portuguese from the language switcher and see all text update in under 3 seconds.
- **SC-004**: The Portuguese language preference persists correctly across browser sessions with 100% reliability (when local storage is available).
- **SC-005**: The app remains fully usable on standard smartphone screens (320px width and above) with Portuguese selected — no layout breakage or text truncation of essential content.
- **SC-006**: All existing five languages continue to work correctly after Portuguese is added — no regressions.

## Assumptions

- **A-001**: The flag 🇧🇷 (Brazilian flag) represents Portuguese in the language switcher, since Brazil has the largest Portuguese-speaking population globally and Brazilian Portuguese is the most widely encountered variant online.
- **A-002**: The Portuguese dictionary uses Brazilian Portuguese (pt-BR) vocabulary and phrasing as the default variant. European Portuguese (pt-PT) is not provided as a separate option.
- **A-003**: The existing i18n infrastructure (dictionary file pattern, Language type, SUPPORTED_LANGUAGES list, LanguageContext, detectLanguage function) is designed to accommodate new languages with minimal changes — no architectural rework is needed.
- **A-004**: Portuguese uses the Latin alphabet with diacritics (ã, õ, ç, á, é, í, ó, ú, â, ê, ô) that are fully supported by Unicode and standard web fonts.
- **A-005**: Portuguese text lengths are comparable to other existing Latin-script languages (French, Spanish, German) and do not require special layout adjustments beyond what already exists.
