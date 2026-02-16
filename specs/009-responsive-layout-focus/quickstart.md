# Quickstart: Responsive Layout & Persistent Keyboard

**Feature**: 009-responsive-layout-focus  
**Branch**: `009-responsive-layout-focus`

## Prerequisites

- Node.js (LTS)
- npm

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open in browser at the displayed URL. Use browser DevTools to toggle between mobile (360px) and desktop (1920px) viewports.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/components/AnswerInput.test.tsx
```

## Verification Checklist

### Layout (US1)

1. Open DevTools → toggle device toolbar → set to 360×640
2. Verify content fills full width with no dead space on right
3. Set to 1920×1080 → verify content is centered with balanced whitespace
4. Check both WelcomePage (`/`) and MainPage (`/play`)
5. Confirm no horizontal scrollbar on any width ≥320px

### Keyboard Persistence (US2)

1. Open on mobile device or use touch-enabled emulator
2. Start a game → answer a question
3. During feedback phase → verify keyboard stays visible
4. Next round appears → verify keyboard is still visible
5. Repeat for 3+ consecutive rounds
6. Verify input is auto-cleared on each new round

### Build

```bash
npm run build
```

Verify clean build with no warnings or errors.

## Key Files

| File | Role |
|------|------|
| `src/App.css` | Root `#root` responsive layout |
| `src/index.css` | Global reset (`box-sizing`, body cleanup) |
| `src/components/GamePlay/AnswerInput/AnswerInput.tsx` | Submit-guard + auto-clear |
| `src/components/GamePlay/AnswerInput/AnswerInput.module.css` | Input state styles |
| `src/pages/MainPage.tsx` | Passes `acceptingInput` prop |
| `src/pages/WelcomePage.module.css` | Redundant max-width removed |
