# Dev Tools (Development Only)

This document describes developer-only hotkeys and window events for quick testing.

Important: All of these tools are intentionally only available in development builds (`import.meta.env.DEV`).

Hotkeys

-   Shift+F: Toggle Dev Console UI (already present in `DevConsole.jsx`).
-   Shift+G: Toggle glow visual effect.
-   Shift+C: Toggle CRT/scanlines.
-   Shift+I: Toggle invincibility for local player (`p1`).
-   Shift+L: Cycle and apply developer loadouts (Glass Cannon, Tank, Sprayer).

Window Events

-   `qq-toggle-invincibility` (CustomEvent): Toggle invincibility.

    -   detail: { playerId?: string }
    -   Example: `window.dispatchEvent(new CustomEvent('qq-toggle-invincibility', { detail: { playerId: 'p1' } }));`

-   `qq-set-invincibility` (CustomEvent): Set invincibility on/off.

    -   detail: { playerId?: string, enabled: boolean }
    -   Example: `window.dispatchEvent(new CustomEvent('qq-set-invincibility', { detail: { playerId: 'p1', enabled: true } }));`

-   `qq-apply-loadout` (CustomEvent): Apply a developer loadout to a player.
    -   detail: { index: number, playerId?: string }
    -   Example: `window.dispatchEvent(new CustomEvent('qq-apply-loadout', { detail: { index: 1, playerId: 'p1' } }));`

Files

-   `src/rendering/GameRenderer.js` — dev hotkeys (DEV gated).
-   `src/ui/components/DevConsole.jsx` — Dev Console UI (DEV gated).
-   `src/state/useGameStore.js` — Registers DEV-only window listeners for the events above.
-   `src/simulation/devLoadouts.js` — Example loadouts and `applyDevLoadout()` helper.

Notes

-   Loadouts and invincibility only mutate in-memory simulation state for testing; they are not persisted.
-   Global event listeners are registered only when running in development to avoid exposing them in production builds.

If you want these accessible behind a feature flag instead of DEV-only, I can add a runtime toggle in settings.
