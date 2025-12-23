/**
 * Centralized glow effect management for all game sprites
 */

// Preset configurations for different sprite types
const GLOW_PRESETS_BASE = {
    vectrex: {
        player: {
            color: 0x00ffff,
            outerRadius: 2,
            innerStrength: 0.2,
            quality: 5,
        },
        enemy: {
            color: 0x00ffff,
            outerRadius: 1.5,
            innerStrength: 0.15,
            quality: 4,
        },
        enemyElite: {
            color: 0xffff00,
            outerRadius: 1.5,
            innerStrength: 0.2,
            quality: 4,
        },
        bulletPlayer: {
            color: 0x00ffff,
            tint: 0x6dd6ff,
            outerRadius: 3,
            innerStrength: 0.5,
            quality: 8,
        },
        bulletEnemy: {
            color: 0xff0000,
            tint: 0xff6666,
            outerRadius: 2,
            innerStrength: 0.4,
            quality: 6,
        },
        bulletBoss: {
            color: 0xff00ff,
            tint: 0xff00ff,
            outerRadius: 3,
            innerStrength: 0.5,
            quality: 8,
        },
        pickup: {
            color: 0x00ff00,
            outerRadius: 2,
            innerStrength: 0.3,
            quality: 6,
        },
        boss: {
            color: 0xff00ff,
            outerRadius: 0,
            innerStrength: 0.1,
            quality: 10,
        },
    },
    christmas: {
        player: {
            color: 0x228b22,
            outerRadius: 2,
            innerStrength: 0.2,
            quality: 5,
        },
        enemy: {
            color: 0xff0000,
            outerRadius: 1.5,
            innerStrength: 0.15,
            quality: 4,
        },
        enemyElite: {
            color: 0xffd700,
            outerRadius: 1.5,
            innerStrength: 0.2,
            quality: 4,
        },
        bulletPlayer: {
            color: 0x228b22,
            tint: 0x32cd32,
            outerRadius: 3,
            innerStrength: 0.5,
            quality: 8,
        },
        bulletEnemy: {
            color: 0xff0000,
            tint: 0xff6666,
            outerRadius: 2,
            innerStrength: 0.4,
            quality: 6,
        },
        bulletBoss: {
            color: 0xff0000,
            tint: 0xff0000,
            outerRadius: 3,
            innerStrength: 0.5,
            quality: 8,
        },
        pickup: {
            color: 0x228b22,
            outerRadius: 2,
            innerStrength: 0.3,
            quality: 6,
        },
        boss: {
            color: 0xff0000,
            outerRadius: 0,
            innerStrength: 0.1,
            quality: 10,
        },
    },
};

export class GlowManager {
    static intensity = 0.5;
    static theme = "vectrex";

    static setIntensity(value) {
        GlowManager.intensity = value;
    }

    static setTheme(theme) {
        if (GLOW_PRESETS_BASE[theme]) {
            GlowManager.theme = theme;
        }
    }

    static applyGlow(sprite, presetKey) {
        if (!sprite || !sprite.preFX) return;

        sprite.preFX.clear();

        const config = GLOW_PRESETS_BASE[GlowManager.theme][presetKey];
        if (!config) return;

        if (GlowManager.intensity > 0) {
            const {
                color = 0x00ffff,
                outerRadius = 2,
                innerStrength = 0.2,
                quality = 5,
                tint = null,
            } = config;

            if (tint) {
                sprite.setTint(tint);
            }

            sprite.preFX.addGlow(
                color,
                outerRadius,
                0,
                false,
                innerStrength * GlowManager.intensity,
                quality
            );
        } else {
            // Clear tint only if it was set by glow system
            if (config.tint) {
                sprite.clearTint();
            }
        }
    }

    static clearGlow(sprite) {
        if (!sprite || !sprite.preFX) return;
        sprite.preFX.clear();
        sprite.clearTint();
    }
}

// Export preset keys for easy reference
export const GLOW_PRESETS = {
    player: "player",
    enemy: "enemy",
    enemyElite: "enemyElite",
    bulletPlayer: "bulletPlayer",
    bulletEnemy: "bulletEnemy",
    bulletBoss: "bulletBoss",
    pickup: "pickup",
    boss: "boss",
};
