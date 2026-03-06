/**
 * Colorblind palette transforms.
 * Applied on top of the active theme (vectrex, christmas, etc.)
 * Each entry maps palette keys to replacement CSS color strings.
 */
export const COLORBLIND_CSS = {
    none: {},
    deuteranopia: {
        // Red-green confusion: green → blue, red → orange
        "--qq-safe": "#4488FF",
        "--qq-xp": "#4488FF",
        "--qq-health": "#FF8800",
        "--qq-danger": "#FF8800",
    },
    protanopia: {
        // Red-green confusion (red-weak): green → blue, red → amber
        "--qq-safe": "#4488FF",
        "--qq-xp": "#4488FF",
        "--qq-health": "#FFAA00",
        "--qq-danger": "#FFAA00",
    },
    tritanopia: {
        // Blue-yellow confusion: yellow → pink
        "--qq-elite": "#FF8888",
        "--qq-rare": "#FF8888",
    },
};

/**
 * Phaser palette transforms (string hex colors).
 * Keys match palette.js PALETTES keys.
 */
export const COLORBLIND_PALETTE = {
    none: {},
    deuteranopia: {
        safe: "#4488FF",
        xp: "#4488FF",
        health: "#FF8800",
        danger: "#FF8800",
    },
    protanopia: {
        safe: "#4488FF",
        xp: "#4488FF",
        health: "#FFAA00",
        danger: "#FFAA00",
    },
    tritanopia: {
        elite: "#FF8888",
        rare: "#FF8888",
    },
};

/**
 * Phaser palette transforms (numeric hex colors).
 * Keys match palette.js PALETTES_HEX keys.
 */
export const COLORBLIND_PALETTE_HEX = {
    none: {},
    deuteranopia: {
        safe: 0x4488ff,
        xp: 0x4488ff,
        health: 0xff8800,
        danger: 0xff8800,
    },
    protanopia: {
        safe: 0x4488ff,
        xp: 0x4488ff,
        health: 0xffaa00,
        danger: 0xffaa00,
    },
    tritanopia: {
        elite: 0xff8888,
        rare: 0xff8888,
    },
};

export const COLORBLIND_MODES = ["none", "deuteranopia", "protanopia", "tritanopia"];

export const COLORBLIND_LABELS = {
    none: "OFF",
    deuteranopia: "DEUTERANOPIA",
    protanopia: "PROTANOPIA",
    tritanopia: "TRITANOPIA",
};
