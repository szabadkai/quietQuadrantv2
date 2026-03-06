/**
 * Static keybinding reference for display in settings / how-to-play.
 * These are read-only — the actual bindings are hardcoded in InputManager.js and gamepad.js.
 */
export const KEYBINDINGS = {
    keyboard: [
        { action: "Move", keys: "WASD / Arrow Keys" },
        { action: "Aim", keys: "Mouse" },
        { action: "Fire", keys: "Left Click / Space" },
        { action: "Dash", keys: "Shift" },
        { action: "Pause", keys: "Escape" },
        { action: "Fullscreen", keys: "F11" },
    ],
    gamepad: [
        { action: "Move", keys: "Left Stick" },
        { action: "Aim", keys: "Right Stick" },
        { action: "Fire", keys: "RT / R2" },
        { action: "Dash", keys: "LB / L1" },
        { action: "Pause", keys: "Start" },
    ],
};
