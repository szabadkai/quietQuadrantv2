# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the game code: `simulation/` (pure logic), `rendering/` (Phaser visuals), `ui/` (React UI), `network/` (P2P), `state/` (Zustand), plus `audio/`, `config/`, `systems/`, and `utils/`.
- `tests/` contains Vitest suites, currently focused on `tests/simulation/`.
- `public/` hosts static assets served by Vite; `dist/` is generated build output.
- `docs/` and `specs/` contain supporting documentation and design notes.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server (served on your LAN via `--host`).
- `npm run build` produces a production build in `dist/`.
- `npm run build:pages` runs `tsc -b` and builds with `BUILD_TARGET=pages`.
- `npm run preview` serves the production build locally.
- `npm test` runs the Vitest suite once; `npm run test:watch` runs in watch mode.
- `npm run lint` runs ESLint across the repository.

## Coding Style & Naming Conventions
- Follow the existing style (2-space indentation, double quotes, semicolons).
- Keep files under 300 lines; ESLint enforces `max-lines` and React hook rules.
- React components use PascalCase file names (e.g., `TitleScreen.jsx`); hooks use `useX` naming.
- Prefer deterministic, side-effect-free logic in `src/simulation/` and keep rendering logic in `src/rendering/`.

## Testing Guidelines
- Framework: Vitest.
- Tests live under `tests/` and use `*.test.js` naming.
- Add or update tests for gameplay logic changes, especially in `src/simulation/`.

## Commit & Pull Request Guidelines
- Commit messages follow a simple Conventional Commit style: `feat:`, `fix:`, `chore:` with a short summary (e.g., `fix: transmissions`).
- Use `[skip ci]` for version bump-only commits when appropriate.
- PRs should include a clear description, testing notes (commands run), and screenshots/GIFs for UI changes.
- Keep changes scoped, respect the 300-line file limit, and add tests for new features.

## Release & Versioning
- The current version lives in `package.json`; update it with a `chore: bump version to X.Y.Z` commit.
- Keep version bumps isolated from feature work when possible; add `[skip ci]` if no functional changes are included.

## Architecture Notes
- The game is deterministic: simulation is time-stepped and input-driven, while rendering is visual-only.
- Multiplayer relies on input sync; avoid adding nondeterministic behavior to simulation code.
