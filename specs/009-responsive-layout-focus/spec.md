# Feature Specification: Responsive Layout & Persistent Keyboard

**Feature Branch**: `009-responsive-layout-focus`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "the UI does not use the screenspace optimally. On smartphone it does not take the entire screen (is aligned to the left, does not stretch horizontally), and on desktop it should be centered. The focus problem on mobile still persists: when a new round starts the virtual numpad does not appear automatically as the player has to click on the text field to make it appear."

## User Scenarios & Testing

### User Story 1 – Full-Width Responsive Layout (Priority: P1)

A player opens Turbotiply on a smartphone. The game content stretches to fill the full viewport width, using all available horizontal space. On a desktop or tablet, the content is horizontally centered with a comfortable maximum width so it doesn't sprawl across ultra-wide monitors.

**Why this priority**: The layout is broken on every page for every mobile user — content is pinned to the left with wasted space on the right. This is the most visible usability issue and affects every screen (welcome, gameplay, score summary).

**Independent Test**: Open the app on a 360px-wide mobile viewport. Verify content fills the full width with no dead space on the right side. Then open on a 1920px desktop viewport and verify content is horizontally centered with balanced whitespace on both sides.

**Acceptance Scenarios**:

1. **Given** a user opens any page on a smartphone viewport (≤480px), **When** the page renders, **Then** the content stretches to fill the full viewport width with only minimal padding (≤16px per side).
2. **Given** a user opens any page on a desktop viewport (≥1024px), **When** the page renders, **Then** the content is horizontally centered in the viewport with a maximum content width.
3. **Given** a user opens the app on any viewport width, **When** they view the welcome page or gameplay page, **Then** there is no dead space — the layout adapts fluidly between mobile (full-width) and desktop (centered) without horizontal scrolling.
4. **Given** a user resizes the browser window, **When** the viewport crosses the mobile/desktop threshold, **Then** the layout transitions smoothly between full-width and centered modes.

---

### User Story 2 – Persistent Virtual Keyboard During Gameplay (Priority: P1)

A player is answering multiplication questions on a smartphone. After submitting an answer and seeing the brief feedback, the next round's formula appears and the virtual numpad is already visible — the player can immediately start typing their answer without needing to tap the input field.

**Why this priority**: Equal priority with the layout fix because it directly impacts gameplay speed and flow on touch devices. Having to tap the input field between every round breaks the fast-paced rhythm of the game and frustrates players.

**Independent Test**: Open the app on a smartphone (or mobile emulator with touch simulation). Start a game, answer a question. When the next round appears after feedback, verify the virtual keyboard/numpad is visible without any additional taps. Repeat for 3+ rounds to confirm consistency.

**Acceptance Scenarios**:

1. **Given** a player submits an answer on a touch device, **When** the feedback phase ends and the next round begins, **Then** the virtual keyboard remains visible (or reappears) without the player needing to tap the input field.
2. **Given** a player is in the gameplay loop (input → feedback → next round), **When** transitioning between rounds, **Then** the input field maintains or regains focus with an active keyboard throughout the entire game session.
3. **Given** a player starts a new game by tapping "Start Game", **When** the first round appears, **Then** the virtual keyboard appears automatically alongside the input field.
4. **Given** a player is on a replay round, **When** the replay round begins after the previous round's feedback, **Then** the keyboard behavior is identical to primary rounds — visible without additional taps.

---

### Edge Cases

- What happens on desktop browsers where there is no virtual keyboard? The focus behavior should still work correctly — the text cursor should appear in the input field, but no keyboard overlay is expected.
- What happens if the browser/OS prevents programmatic keyboard activation? The input field should still receive focus (visible cursor), even if the OS suppresses the keyboard. The experience degrades gracefully.
- What happens on very narrow viewports (<320px)? The full-width layout should still apply; content may become tighter but should remain usable without horizontal scrolling.
- What happens on very wide viewports (>2560px)? The centered content area should maintain its maximum width; the background fills the remaining space.
- What happens on landscape-oriented smartphones? The layout should still fill the width; content height may require scrolling, which is acceptable in landscape mode.

## Requirements

### Functional Requirements

- **FR-001**: The app's root container MUST stretch to 100% of the viewport width on all screen sizes, removing any default maximum-width constraint that leaves unused horizontal space on mobile.
- **FR-002**: On viewports ≤480px (mobile), page content MUST use the full available width with minimal horizontal padding (no more than 16px per side).
- **FR-003**: On viewports ≥768px (desktop/tablet), page content MUST be horizontally centered within the viewport with a maximum content width of 540px to maintain readability.
- **FR-004**: The layout changes MUST apply consistently to all pages: welcome page, gameplay page, and score summary.
- **FR-005**: The answer input field MUST NOT be disabled (HTML `disabled` attribute) or set to `readOnly` during the feedback phase, because both cause mobile browsers to dismiss the virtual keyboard. Instead, the input MUST remain fully interactive at the DOM level, with a logical guard in the submit handler that ignores submissions during feedback.
- **FR-006**: During the feedback phase, the answer input MUST remain focused and the keyboard MUST remain visible. The submit handler MUST ignore any submissions when `currentPhase !== 'input'`. The user may type during feedback, but this is harmless since the input is auto-cleared when the next round begins (FR-011).
- **FR-007**: When a new round begins (after feedback or at game start), the answer input MUST have focus so the player can type immediately.
- **FR-008**: The virtual keyboard persistence behavior MUST work consistently across primary rounds, replay rounds, and the first round of a new game.
- **FR-009**: The layout MUST NOT introduce horizontal scrolling on any viewport width ≥320px.
- **FR-010**: All unused Vite scaffold styles in App.css (logo animation, card hover effects, read-the-docs class) MUST be removed as part of the layout cleanup.
- **FR-011**: When a new round begins (after feedback or at game start), the answer input's value MUST be automatically cleared to empty so the player sees a fresh input field for the new question.

## Success Criteria

### Measurable Outcomes

- **SC-001**: On a 360×640 CSS pixel viewport, 100% of the content area width is utilized (no visible dead space to the right of the content).
- **SC-002**: On a 1920×1080 viewport, game content is visually centered with balanced whitespace on both sides.
- **SC-003**: During gameplay on a touch device, the virtual keyboard remains visible across 10 consecutive round transitions without the player needing to tap the input field.
- **SC-004**: No horizontal scrollbar appears on any viewport width ≥320px.
- **SC-005**: Round-to-round transition time (from feedback end to player typing next answer) is under 0.5 seconds — the player can type immediately without waiting for or summoning the keyboard.

## Clarifications

### Session 2026-02-16

- Q: What maximum width should the main content area use on desktop viewports? → A: 540px, matching the existing WelcomePage max-width — keeps the game compact and readable for a children's app.
- Q: How should answer submission be prevented during feedback while keeping the input focusable? → A: Initially proposed `readOnly`, but Phase 0 research revealed `readOnly` also dismisses the keyboard on mobile browsers (iOS Safari, Chrome Android). Updated to submit-guard approach: input stays fully interactive, submit handler ignores submissions during feedback phase. User may type during feedback but input is auto-cleared on next round.
- Q: Should unused Vite default styles in App.css (logo animation, card hover effects, etc.) be cleaned up? → A: Yes — remove all unused Vite scaffold CSS as part of this feature since App.css is already being modified.
- Q: Should the input field be auto-cleared when a new round starts, or keep the previous answer visible? → A: Auto-clear — input value is reset to empty when a new round starts.

## Assumptions

- **Root cause — layout**: The Vite default CSS in `App.css` and `index.css` applies `max-width: 1280px`, `padding: 2rem`, and `place-items: center` on the `body` / `#root`, which constrains and left-biases the content instead of letting it fill the viewport. These defaults need to be overridden or replaced.
- **Root cause — keyboard**: The current implementation sets `disabled={true}` on the `<input>` during the feedback phase. This causes the browser to blur the element and dismiss the virtual keyboard. The subsequent `useEffect` calls `focus()` when `disabled` transitions back to `false`, but this `focus()` call occurs inside a `setTimeout` callback (not a direct user gesture), so mobile browsers ignore the keyboard activation request. Research also showed that `readOnly` dismisses the keyboard (though focus is retained). The fix uses a submit-guard approach: the input stays fully interactive at the DOM level, and the submit handler ignores submissions during feedback.
- **Browser limitations**: Some mobile browsers may still suppress virtual keyboards on programmatic focus regardless of approach. The spec aims for best-effort compatibility with mainstream 2020+ mobile browsers (Chrome, Safari, Firefox). Graceful degradation (focus without keyboard) is acceptable on edge-case browsers.
- **Cleanup scope**: Unused Vite default styles in App.css (logo spin animation, `.card` hover effects, `.read-the-docs` class) will be removed since the file is already being modified for the layout fix.
- **No new dependencies**: The fix is purely CSS and minor component logic changes. No new libraries or dependencies are needed.
