# Tasks: Responsive Layout & Persistent Keyboard

**Input**: Design documents from `/specs/009-responsive-layout-focus/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test updates are included only where existing tests break due to implementation changes.

**Organization**: Tasks are grouped by user story. US1 (layout) and US2 (keyboard) are independent and can be implemented in parallel. Both are P1 priority.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup needed — this feature modifies existing files only. No new dependencies, no new project structure.

*(Phase skipped — proceed directly to Phase 2)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Global CSS resets that both user stories depend on. Must complete before US1 or US2.

**⚠️ CRITICAL**: Both user stories depend on the body/root layout foundation being correct first.

- [x] T001 Add global `box-sizing: border-box` reset to `frontend/src/index.css` — add `*, *::before, *::after { box-sizing: border-box; }` before the `:root` block
- [x] T002 Clean up `body` styles in `frontend/src/index.css` — remove `display: flex`, `place-items: center`, and `min-height: 100vh` from the `body` rule; keep `margin: 0` and `min-width: 320px`

**Checkpoint**: Global CSS foundation is correct. Body is block-level, top-aligned, full-width.

---

## Phase 3: User Story 1 — Full-Width Responsive Layout (Priority: P1) 🎯 MVP

**Goal**: Content fills full viewport width on mobile (≤480px) and is horizontally centered at max-width 540px on desktop (≥768px). No dead space, no horizontal scrolling.

**Independent Test**: Open the app on a 360px-wide viewport — content fills full width. Open on 1920px — content is centered with balanced whitespace. No horizontal scrollbar on any width ≥320px.

### Implementation for User Story 1

- [x] T003 [US1] Replace `#root` styles in `frontend/src/App.css` — set `width: 100%; max-width: 540px; margin: 0 auto; min-height: 100vh; min-height: 100dvh;` and remove `padding: 2rem; text-align: center; max-width: 1280px`
- [x] T004 [US1] Remove all unused Vite scaffold styles from `frontend/src/App.css` — delete `.logo`, `.logo:hover`, `.logo.react:hover`, `@keyframes logo-spin`, `@media (prefers-reduced-motion)` logo animation, `.card`, and `.read-the-docs` rules
- [x] T005 [US1] Remove redundant `max-width: 540px` from `.content`, `.storageWarning`, `.evictionNotice`, `.errorBanner` in `frontend/src/pages/WelcomePage.module.css`
- [x] T006 [US1] Remove redundant `min-height: 100vh` from `.welcomePage` in `frontend/src/pages/WelcomePage.module.css`

**Checkpoint**: Layout is responsive — full-width on mobile, centered on desktop. All pages benefit from root-level `#root` constraint.

---

## Phase 4: User Story 2 — Persistent Virtual Keyboard During Gameplay (Priority: P1)

**Goal**: Virtual keyboard stays visible across round transitions on touch devices. Input is never disabled/readOnly at the DOM level. Submit handler guards against feedback-phase submissions. Input auto-clears on new round.

**Independent Test**: Start a game on a mobile device, answer 3+ questions. Keyboard stays visible throughout without needing to tap the input field between rounds.

### Implementation for User Story 2

- [x] T007 [US2] Refactor AnswerInput props in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` — rename `disabled: boolean` prop to `acceptingInput: boolean`, invert the boolean semantics (callers pass `true` when input phase is active)
- [x] T008 [US2] Implement submit-guard in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` — in `handleSubmit`, return early when `!acceptingInput`; remove `disabled` attribute from `<input>` element; keep submit button disabled when `!acceptingInput || isEmpty` for visual feedback
- [x] T009 [US2] Implement auto-clear in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.tsx` — add `useEffect` that calls `setValue('')` when `acceptingInput` transitions to `true` (new round begins)
- [x] T010 [US2] Update `.input:disabled` styles in `frontend/src/components/GamePlay/AnswerInput/AnswerInput.module.css` — remove the `:disabled` pseudo-class rule (input is never disabled); optionally add a subtle visual indicator for feedback phase via a CSS class
- [x] T011 [US2] Update MainPage prop in `frontend/src/pages/MainPage.tsx` — change `disabled={gameState.currentPhase !== 'input'}` to `acceptingInput={gameState.currentPhase === 'input'}` on the `<AnswerInput>` component

**Checkpoint**: Keyboard stays visible across round transitions. Input auto-clears each round. Submissions are ignored during feedback phase.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Update existing tests and a11y test suite to match the new component interface. Verify full test suite and build.

- [x] T012 [P] Update AnswerInput tests in `frontend/tests/components/AnswerInput.test.tsx` — replace all `disabled={true/false}` prop usages with `acceptingInput={false/true}`; update "input is disabled when disabled prop is true" test to verify submit-guard behavior (input is NOT disabled in DOM, but onSubmit is not called during feedback); add test for auto-clear on `acceptingInput` transition
- [x] T013 [P] Update a11y test in `frontend/tests/a11y/accessibility.test.tsx` — change `disabled={false}` to `acceptingInput={true}` in the AnswerInput a11y test render call
- [x] T014 Run full test suite (`npm test` in `frontend/`) and fix any failures
- [x] T015 Run production build (`npm run build` in `frontend/`) and verify clean output with no warnings or errors
- [x] T016 Run quickstart.md verification checklist — confirm layout on 360px and 1920px viewports, confirm no horizontal scrollbar, verify keyboard behavior narrative

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (needs correct body/root styles)
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion (needs correct body/root styles). Independent of US1.
- **Polish (Phase 5)**: Depends on Phase 3 AND Phase 4 completion

### User Story Dependencies

- **US1 (Layout)** and **US2 (Keyboard)** are fully independent — they modify different files with no overlap:
  - US1 touches: `App.css`, `index.css` (via Phase 2), `WelcomePage.module.css`
  - US2 touches: `AnswerInput.tsx`, `AnswerInput.module.css`, `MainPage.tsx`
- Both can be implemented in parallel after Phase 2

### Within Each User Story

- US1: T003 and T004 can be combined (same file), then T005+T006 (same file)
- US2: T007→T008→T009 are sequential (same file, each builds on previous); T010 is parallel (different file); T011 depends on T007 (prop rename)

### Parallel Opportunities

After Phase 2 (T001, T002) completes:
- US1 (T003–T006) and US2 (T007–T011) can run **in parallel**
- Within US1: T003+T004 (App.css) parallel with T005+T006 (WelcomePage.module.css)
- Within US2: T010 (CSS) parallel with T007–T009 (TSX), but T011 depends on T007
- In Phase 5: T012 and T013 can run in parallel (different test files)

---

## Parallel Example: After Phase 2

```text
# Stream A: User Story 1 (Layout)
T003 + T004: Rewrite App.css (remove Vite defaults, add responsive #root)
T005 + T006: Clean up WelcomePage.module.css (remove redundant constraints)

# Stream B: User Story 2 (Keyboard) — runs simultaneously
T007: Rename disabled → acceptingInput prop
T008: Implement submit-guard logic
T009: Implement auto-clear on new round
T010: Update AnswerInput.module.css (parallel with T007-T009)
T011: Update MainPage.tsx prop (after T007)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational CSS resets (T001–T002)
2. Complete Phase 3: User Story 1 — Layout fix (T003–T006)
3. **STOP and VALIDATE**: Verify full-width mobile, centered desktop layout
4. The layout improvement alone is a meaningful, deployable increment

### Incremental Delivery

1. Phase 2 → Foundation ready
2. US1 (T003–T006) → Layout fixed → Validate independently
3. US2 (T007–T011) → Keyboard fixed → Validate independently
4. Phase 5 (T012–T016) → Tests green, build clean → Deploy

### Full Sequential

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016

---

## Notes

- No new components are created in this feature — only existing files are modified
- No new dependencies — pure CSS and component logic changes
- The submit-guard approach (US2) was chosen over `readOnly` based on Phase 0 research: `readOnly` also dismisses the virtual keyboard on mobile browsers
- The `box-sizing: border-box` global reset (T001) is critical for preventing horizontal overflow when pages use `width: 100%` with padding
- T007–T009 are listed as separate tasks for clarity but can be implemented as a single edit to `AnswerInput.tsx` if preferred
