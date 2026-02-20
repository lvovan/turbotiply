# Research Summary: Scores Summary Page

## Sparkline Animation Performance
- Target 60 FPS for smooth animations; 30 FPS is acceptable for less critical UI.
- Render times should be <16ms per frame.
- Use memoization, requestAnimationFrame, and lightweight libraries.
- Recommended libraries: Recharts, Victory, react-sparklines, D3.js (with React).
- Accessibility: ARIA labels, color contrast, prefers-reduced-motion support, keyboard navigation, screen reader support.

## Max Rounds per Game
- Typical: 10–20 rounds per session for summary tables.
- Longer sessions (30+ rounds): use pagination or collapsible UI.
- UI: More than 20 rows can clutter; use alternating colors, sticky headers, scrollable containers for mobile.
- Accessibility: Proper table markup, ARIA roles, summaries, filtering/highlighting, avoid horizontal scrolling.
- Performance: Virtualization for 50+ rows, render only visible rows.

## React/Vite Versioning (2026)
- React: Use 19.x (latest stable), 18.x still supported.
- Vite: Use 5.x (latest stable), 4.x still supported.
- Best practices: semver ranges, test upgrades, keep dependencies up-to-date, prefer stable releases, check plugin compatibility, review migration guides.
- Upgrade strategy: upgrade regularly, use lock files, monitor community forums, ensure TypeScript compatibility.

## Decisions
- Use React 19.x and Vite 5.x for new features.
- Default summary table to 10–20 rounds; paginate/collapse for longer sessions.
- Use Victory or Recharts for sparkline, ensure accessibility and performance.

## Alternatives Considered
- D3.js for custom sparklines (rejected: more complex integration, less accessible).
- Unlimited rounds per game (rejected: UI clutter, accessibility/performance concerns).
- Alpha/beta React/Vite versions (rejected: prefer stable for reliability).
