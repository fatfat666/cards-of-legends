# Cards of Legends (Rogue Board v0.7.6 — Modular Split)

This archive contains the complete, cleanly separated multi-file project ready to run locally or deploy to GitHub Pages / Netlify / Vercel.

## File Structure

- `index.html` — All screen layouts, HUD, PixiJS canvas container, and modal markup
- `style.css` — Complete theme variables, responsive flexbox/grid styles, card visuals, and animations
- `js/data.js` — `CARD_DATABASE`, `CLASS_THEMES`, `MASTERY_DEFINITIONS`, `RELIC_CATALOG`, and `STAGE_THEMES`
- `js/state.js` — `gameState`, `resetGameState()`, mastery persistence, Black Market stock/notoriety helpers, and admin lock logic
- `js/vfx.js` — PixiJS stage setup, sprite ticker loop, screen shake, particle bursts, Black Flash, gunfire, and cash VFX
- `js/combat.js` — Draw piles, card sequence slotting, card effect resolution, turrets/enforcers, enemy AI turns, and cleanup
- `js/ui.js` — Screen transitions, HUD `renderUI()`, board/mastery rendering, draft & shop modals, and Deck Builder gallery

## How to Run

- **Locally:** Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
- **GitHub Pages:** Upload all files and the `js/` folder to your repository root and enable GitHub Pages on the `main` branch.
