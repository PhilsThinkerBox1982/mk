# Repository Guidelines

## Build and Run

This is a standalone HTML/CSS/JavaScript project with no dependencies or build step. Open `index.html` in a modern browser, or serve the repository root with:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. There is no configured automated test or lint runner, so there is no single-test command; verify gameplay changes in a browser.

## Architecture

- `index.html` is the page shell and defines the arena canvas, health HUD, round message, keyboard help, touch controls, and restart button.
- `game.js` is a strict-mode IIFE with no modules or external dependencies. It owns fighter state, keyboard/pointer input, CPU decisions, frame-based physics and combat, canvas drawing, and HUD/message updates.
- `style.css` owns the page presentation and responsive layout. The canvas keeps its intrinsic 960×540 coordinate system while CSS scales it to fit the page.

Keep simulation and drawing in the existing animation loop: update fighter state and resolve hits before rendering each frame. Game coordinates and movement are frame-based, not time-delta-based.

## Project Conventions

- Keep the game dependency-free and browser-native; scripts are loaded directly by `index.html`.
- Keep DOM selectors aligned with the IDs and `data-key` attributes in `index.html`. Keyboard and touch controls both update the shared `keys` set in `game.js`.
- Use the canvas 2D context for arena and fighter visuals; use DOM elements for health bars and round messaging.
- Keep responsive behavior in `style.css`, including the existing narrow-screen breakpoints.
- See `README.md` for player controls and the local run instructions.
