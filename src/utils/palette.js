// Color palettes for different themes
const PALETTES = {
    vectrex: {
        background: "#000000",
        player: "#00FFFF",
        white: "#00FFFF",
        cyan: "#00FFFF",
        safe: "#00FF00",
        danger: "#FF00FF",
        enemy: "#00FFFF",
        boss: "#FF00FF",
        elite: "#FFFF00",
        health: "#FF0000",
        xp: "#00FF00",
        gold: "#FFFF00",
        rare: "#FFFF00",
        legendary: "#FF00FF",
        synergy: "#00FFFF",
        uiText: "#00FFFF",
        uiMuted: "#0088AA",
        panel: "#000000",
        panelBorder: "#00FFFF",
    },
    christmas: {
        background: "#000000",
        player: "#228B22",
        white: "#FFFFFF",
        cyan: "#228B22",
        safe: "#228B22",
        danger: "#FF0000",
        enemy: "#FF0000",
        boss: "#FF0000",
        elite: "#FFD700",
        health: "#FF0000",
        xp: "#228B22",
        gold: "#FFD700",
        rare: "#FFD700",
        legendary: "#FF0000",
        synergy: "#228B22",
        uiText: "#228B22",
        uiMuted: "#145214",
        panel: "#000000",
        panelBorder: "#228B22",
    },
};

const PALETTES_HEX = {
    vectrex: {
        background: 0x000000,
        player: 0x00ffff,
        white: 0x00ffff,
        cyan: 0x00ffff,
        safe: 0x00ff00,
        danger: 0xff00ff,
        enemy: 0x00ffff,
        boss: 0xff00ff,
        elite: 0xffff00,
        health: 0xff0000,
        xp: 0x00ff00,
        gold: 0xffff00,
        rare: 0xffff00,
        legendary: 0xff00ff,
        synergy: 0x00ffff,
    },
    christmas: {
        background: 0x000000,
        player: 0x228b22,
        white: 0xffffff,
        cyan: 0x228b22,
        safe: 0x228b22,
        danger: 0xff0000,
        enemy: 0xff0000,
        boss: 0xff0000,
        elite: 0xffd700,
        health: 0xff0000,
        xp: 0x228b22,
        gold: 0xffd700,
        rare: 0xffd700,
        legendary: 0xff0000,
        synergy: 0x228b22,
    },
};

let currentTheme = "vectrex";

export function setTheme(theme) {
    if (PALETTES[theme]) {
        currentTheme = theme;
    }
}

export function getTheme() {
    return currentTheme;
}

export const PALETTE = new Proxy(
    {},
    {
        get(target, prop) {
            return PALETTES[currentTheme][prop];
        },
    }
);

export const PALETTE_HEX = new Proxy(
    {},
    {
        get(target, prop) {
            return PALETTES_HEX[currentTheme][prop];
        },
    }
);
