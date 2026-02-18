# Quickstart: Switch Player Emoji Button

**Feature Branch**: `024-switch-player-emoji`

## Prerequisites

- Node.js (LTS)
- `npm install` in `frontend/`

## Dev Server

```bash
cd frontend
npm run dev
```

## What to Verify

1. **Log in** as any player from the welcome screen
2. **Observe the header** — the switch-player button should display the 👥 emoji with no text
3. **Click the 👥 button** — session should end and you should return to the welcome screen
4. **Switch language** (flag button) — the 👥 button content should not change; the header layout should remain stable
5. **Keyboard test** — Tab to the 👥 button; it should have a visible focus ring and activate with Enter/Space
6. **Screen reader test** (optional) — the button should announce "Switch player" (or the localised equivalent)

## Run Tests

```bash
cd frontend
npx vitest run tests/components/Header.test.tsx
```

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/Header/Header.tsx` | Replace `{t('header.switchPlayer')}` with emoji + `aria-label` |
| `frontend/src/components/Header/Header.module.css` | Adjust `.switchButton` padding for emoji-only content |
| `frontend/tests/components/Header.test.tsx` | Add emoji content assertion |
