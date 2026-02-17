# Quickstart: Player Name Limit

**Feature**: 022-player-name-limit  
**Date**: 2025-07-15  

## Prerequisites

- Node.js (LTS)
- Git

## Setup

```bash
git checkout 022-player-name-limit
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open http://localhost:5173. Navigate to the welcome screen and click "New player" to see the name input form.

## Verification Checklist

### FR-001/FR-002: Max 10 characters
- [ ] Type more than 10 characters — input stops at 10
- [ ] Paste a 25-character string — truncated to first 10

### FR-003: Character counter
- [ ] Counter appears below name input showing `X/10` format
- [ ] Counter updates as you type
- [ ] Counter shows warning style (orange) when at 10/10

### FR-004/FR-005: Submit button state
- [ ] Submit disabled when field is empty
- [ ] Submit disabled when only whitespace
- [ ] Submit enabled when 1–10 non-whitespace characters entered

### FR-006/FR-007: Backward compatibility
- [ ] Pre-seed a player with a 15-character name in localStorage
- [ ] Verify name displays in full on player card
- [ ] Verify name displays in full in header greeting
- [ ] Play a game — no errors

### FR-008: Accessibility
- [ ] Screen reader announces character count changes
- [ ] Character counter has `aria-live="polite"`

## Testing

```bash
npm test
```

All existing tests plus new/updated tests must pass. Key test file: `tests/components/NewPlayerForm.test.tsx`.

## Files Modified

| File | Change |
|------|--------|
| `src/components/WelcomeScreen/NewPlayerForm.tsx` | `MAX_NAME_LENGTH` 20→10, add counter `<span>` |
| `src/components/WelcomeScreen/NewPlayerForm.module.css` | Add `.charCounter`, `.charCounterWarning` |
| `src/i18n/locales/{en,fr,de,ja,pt}.ts` | Add `player.charCount` key |
| `src/types/player.ts` | JSDoc "1–20" → "1–10" |
| `tests/components/NewPlayerForm.test.tsx` | Update 20→10 assertions, add counter tests |
