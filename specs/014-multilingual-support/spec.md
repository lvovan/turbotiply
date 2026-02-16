# Feature Specification: Multilingual Support

**Feature Branch**: `014-multilingual-support`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Add multilingual (localization) support for English (as-is), French, Spanish, Japanese, German. Initially auto-detect language based on browser setting but let the player choose it in a Flag button at the upper right of the screen (when logged in, next to where the Switch Player button is). All localization text should be easily editable in dedicated dictionary files."

## Clarifications

### Session 2026-02-16

- Q: Which flag should represent English in the language switcher (🇬🇧 or 🇺🇸)? → A: 🇬🇧 British flag — represents English as the language.
- Q: How should dictionary files handle dynamic placeholders in translatable strings? → A: Named placeholders (e.g., `{playerName}`, `{current}`, `{total}`) so translators can reorder words to match target language grammar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Automatic language detection on first visit (Priority: P1)

A player opens TurboTiply for the first time in their browser. The application detects the browser's preferred language setting and displays all interface text in that language. If the browser language is French, the player sees "Turbotiply !" as the title, "Créer ton joueur pour commencer !" as the subtitle, and all buttons and labels in French. If the browser language is not one of the five supported languages, the application defaults to English.

**Why this priority**: This is the foundational experience — players should see the app in their language from the very first moment without needing to configure anything.

**Independent Test**: Can be tested by changing the browser's language preference to each of the five supported languages, loading the app fresh (no stored preference), and verifying all visible text appears in the expected language.

**Acceptance Scenarios**:

1. **Given** a browser with French as the primary language and no stored language preference, **When** the player opens TurboTiply, **Then** all user-facing text is displayed in French.
2. **Given** a browser with Japanese as the primary language, **When** the player opens TurboTiply, **Then** all user-facing text is displayed in Japanese.
3. **Given** a browser with Portuguese (unsupported) as the primary language, **When** the player opens TurboTiply, **Then** all user-facing text defaults to English.
4. **Given** a browser with "es-MX" (Mexican Spanish) as the primary language, **When** the player opens TurboTiply, **Then** the application matches the base language "es" and displays text in Spanish.

---

### User Story 2 — Language switcher via flag button (Priority: P1)

A logged-in player sees a flag button in the upper-right area of the header, positioned next to the existing "Switch player" button. Clicking/tapping the flag button opens a dropdown or popover showing all five supported languages, each represented by a recognisable flag icon and the language name written in that language (e.g., "Français", "日本語"). The player selects a language and the entire interface immediately updates to that language without a page reload.

**Why this priority**: Manual language selection is essential for players whose browser language doesn't match their preferred language, or for multilingual households sharing a device.

**Independent Test**: Can be tested by logging in as a player, clicking the flag button, selecting each language in turn, and verifying that all visible text updates immediately to the selected language.

**Acceptance Scenarios**:

1. **Given** a logged-in player on the main page, **When** they look at the header, **Then** they see a flag button next to the "Switch player" button displaying the flag corresponding to the currently active language.
2. **Given** a logged-in player, **When** they click the flag button, **Then** a dropdown/popover appears showing all five languages with their flags and native names.
3. **Given** a player viewing the language dropdown, **When** they select "Deutsch", **Then** all interface text immediately changes to German and the flag button updates to the German flag.
4. **Given** a player who has selected a language, **When** they navigate between pages (welcome screen ↔ game screen), **Then** the selected language persists across all pages.

---

### User Story 3 — Language preference persists across sessions (Priority: P1)

A player manually selects their preferred language (e.g., Spanish). They close the browser and return later. The app remembers their language choice and displays the interface in Spanish immediately, regardless of their browser's language setting. The manually chosen language takes precedence over browser detection.

**Why this priority**: Without persistence, players would need to re-select their language every visit, creating frustrating repetition — especially for players whose browser language differs from their preference.

**Independent Test**: Can be tested by selecting a language different from the browser default, closing and reopening the app, and verifying the previously selected language is still active.

**Acceptance Scenarios**:

1. **Given** a player who manually selected French, **When** they close and reopen the browser, **Then** the app displays in French without requiring re-selection.
2. **Given** a player with a stored language preference of German and a browser language of English, **When** they open TurboTiply, **Then** the interface displays in German (stored preference overrides browser detection).
3. **Given** a player who has never manually selected a language (using auto-detected English), **When** they change their browser language to Spanish and reload, **Then** the app auto-detects and switches to Spanish (no stored override exists).

---

### User Story 4 — Language switcher on the welcome screen (Priority: P2)

A player who has not yet logged in (on the welcome/player selection screen) can also change the language. Since the header with the flag button is only shown when logged in, a language selector is available on the welcome screen as well — positioned unobtrusively, such as in the top-right corner of the page or near the app title.

**Why this priority**: New players arriving at the welcome screen for the first time may need to switch from the auto-detected language before creating their profile — this is their first touchpoint with the app.

**Independent Test**: Can be tested by navigating to the welcome screen (not logged in), finding and using the language selector, and verifying that all welcome screen text updates to the chosen language.

**Acceptance Scenarios**:

1. **Given** a player on the welcome screen with no active session, **When** they look at the screen, **Then** a language selector control is visible.
2. **Given** a player on the welcome screen, **When** they change the language to Japanese, **Then** the title, subtitles, buttons, labels, and all other visible text switch to Japanese.
3. **Given** a player who changes the language on the welcome screen and then creates a profile and logs in, **When** they reach the main page, **Then** the selected language is maintained.

---

### User Story 5 — All text translated across the full gameplay flow (Priority: P1)

A player who has selected a non-English language plays a complete game. Every piece of text they encounter — from the mode selector ("Play" / "Improve"), through the game round feedback ("Correct!", "Not quite!"), to the score summary ("Game Over!", "Play again", table headers) — appears in their chosen language. Numeric values, scores, and mathematical formulas remain as numerals and are not translated.

**Why this priority**: Partial translation creates a jarring, unprofessional experience. All user-facing text must be consistently translated for the feature to deliver value.

**Independent Test**: Can be tested by selecting a non-English language and playing through a complete game (including both correct and incorrect answers), then verifying every text element encountered is in the selected language.

**Acceptance Scenarios**:

1. **Given** a player with French selected, **When** they view the mode selector, **Then** they see the mode names and descriptions in French.
2. **Given** a player with Spanish selected who answers a question incorrectly, **When** feedback is shown, **Then** the feedback text ("Not quite!", "The answer was …") appears in Spanish.
3. **Given** a player with German selected who completes a game, **When** the score summary appears, **Then** all labels ("Total Score", "Play again", "Back to menu", table headers) are in German.
4. **Given** any language is selected, **When** mathematical formulas and numeric scores are displayed, **Then** they remain as standard numerals (not translated or reformatted).

---

### User Story 6 — Dedicated dictionary files for easy editing (Priority: P2)

A content editor or developer needs to update a translation — for example, fixing a typo in the French text for "Switch player". They locate the dedicated French dictionary file, find the relevant entry by its key, edit the text, and the change is reflected in the app. Each supported language has its own separate dictionary file with the same set of keys, making it straightforward to compare translations across languages or add a new language.

**Why this priority**: Maintainability of translations is critical for long-term viability. Dictionary files must be structured so that non-developers can contribute translations and new languages can be added with minimal friction.

**Independent Test**: Can be tested by modifying a single entry in a dictionary file, rebuilding/reloading the app, and verifying the changed text appears in the UI for that language.

**Acceptance Scenarios**:

1. **Given** a developer opens the English dictionary file, **When** they review its structure, **Then** every user-facing string in the app has a corresponding key-value entry.
2. **Given** a developer compares the English and French dictionary files, **When** they review the keys, **Then** both files contain the exact same set of keys.
3. **Given** a developer creates a new dictionary file for a sixth language following the same key structure, **When** they register it in the app configuration, **Then** the new language becomes available in the language selector.

---

### Edge Cases

- What happens when the browser reports multiple preferred languages (e.g., `["pt", "es", "en"]`)? The app should iterate through the list and use the first supported language found (in this case, Spanish).
- What happens when localStorage is unavailable? The language preference cannot be persisted; the app falls back to browser detection on each visit. The language switcher still works for the current session.
- What happens if a dictionary file is missing a key? The app should fall back to the English text for that specific key so no blank or broken text appears.
- What happens with very long translated strings (e.g., German compound words)? The UI layout must accommodate varying text lengths without overflow or truncation of essential content.
- What happens when a player's name contains characters from a different script than the selected language? Names are user-entered and displayed as-is regardless of the active language.
- What happens on the welcome screen when the eviction message references player names? The message template is translated but player names within it remain as entered.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support five languages: English, French, Spanish, Japanese, and German.
- **FR-002**: The system MUST auto-detect the player's preferred language from the browser's language settings on first visit (when no stored preference exists).
- **FR-003**: When the browser's primary language is not supported, the system MUST iterate through the browser's language preference list and use the first supported language; if none match, it MUST default to English.
- **FR-004**: The system MUST display a language switcher (flag button) in the header next to the "Switch player" button when a player is logged in.
- **FR-005**: The flag button MUST display the flag icon corresponding to the currently active language.
- **FR-006**: Clicking/tapping the flag button MUST open a dropdown or popover listing all five supported languages, each showing its flag icon and native name (e.g., "English", "Français", "Español", "日本語", "Deutsch").
- **FR-007**: Selecting a language from the dropdown MUST immediately update all user-facing text in the interface without requiring a page reload.
- **FR-008**: The system MUST provide a language selector on the welcome screen (before login) so players can change the language prior to creating a profile or logging in.
- **FR-009**: The system MUST persist the player's manually chosen language preference in local storage.
- **FR-010**: A stored language preference MUST take precedence over browser-detected language on subsequent visits.
- **FR-011**: When no manually selected preference is stored, the system MUST re-detect from the browser's language settings on each visit.
- **FR-012**: All user-facing text elements MUST be translatable, including but not limited to: page titles, headings, button labels, form labels, placeholders, feedback messages, dialog text, accessibility labels (aria-labels), and status messages.
- **FR-013**: Mathematical formulas, numeric scores, and player-entered names MUST NOT be translated or reformatted.
- **FR-014**: Each supported language MUST have its own dedicated dictionary file containing all translatable text as key-value pairs.
- **FR-015**: All dictionary files MUST share the same set of keys; adding a new language requires creating a new dictionary file with the same key structure.
- **FR-019**: Dictionary entries containing dynamic values MUST use named placeholders (e.g., `{playerName}`, `{current}`, `{total}`) to allow translators to reorder words freely for target language grammar.
- **FR-016**: If a dictionary file is missing a translation for a specific key, the system MUST fall back to the English text for that key.
- **FR-017**: The HTML document's `lang` attribute MUST update to reflect the currently active language.
- **FR-018**: The UI layout MUST gracefully accommodate varying text lengths across languages without overflow, truncation of essential content, or layout breakage.

### Key Entities

- **Language**: A supported locale identified by its language code (e.g., "en", "fr", "es", "ja", "de"), with a display name in its own language, and an associated flag icon.
- **Dictionary**: A collection of key-value pairs mapping translation keys to localised text strings for a single language. One dictionary exists per supported language.
- **Language Preference**: The player's selected language, stored locally. Overrides browser detection when present.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players see all interface text in their browser's language (if supported) within the first page load, with zero manual configuration required.
- **SC-002**: Players can switch between all five supported languages in under 3 seconds (open selector → choose language → see updated text).
- **SC-003**: 100% of user-facing text elements are translated in all five supported languages — no English text leaks through when a non-English language is active (except player names and numbers).
- **SC-004**: A new language can be added by a developer by creating one new dictionary file and registering it, without modifying any component code.
- **SC-005**: Language preference chosen by the player persists correctly across browser sessions with 100% reliability (when storage is available).
- **SC-006**: The app remains fully usable on standard smartphone screens (no layout breakage) in all five supported languages, including languages with longer average word lengths (German) and non-Latin scripts (Japanese).

## Assumptions

- **A-001**: Flag icons are standard country/region flags commonly associated with each language: 🇧 for English, 🇫🇷 for French, 🇪🇸 for Spanish, 🇯🇵 for Japanese, 🇩🇪 for German. Unicode flag emoji will be used (no image assets required).
- **A-002**: The language preference is global per browser/device, not per player profile. All players on the same device share the same language setting, since language is a device-level concern, not a player-level one.
- **A-003**: Ordinal suffixes in score displays (1st, 2nd, 3rd, etc.) will be translated according to each language's conventions.
- **A-004**: The app title "Turbotiply!" is a brand name and remains untranslated across all languages.
- **A-005**: Right-to-left (RTL) language support is not in scope; all five target languages use left-to-right or top-to-bottom writing direction.
- **A-006**: Date/time formatting differences between locales are not in scope, as the app does not prominently display dates to users.
- **A-007**: Avatar labels and descriptions (e.g., "Rocket", "A flying rocket ship") are considered user-facing text and will be translated.
