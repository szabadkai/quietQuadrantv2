/**
 * Centralized glow effect management for all game sprites
 */

// Preset configurations for different sprite types
// PERFORMANCE: Reduced quality for numerous objects (bullets, enemies, pickups)
// while maintaining high quality for player and boss sprites
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
            outerRadius: 1,
            innerStrength: 0.1,
            quality: 2, // Reduced from 4
        },
        enemyElite: {
            color: 0xffff00,
            outerRadius: 1.5,
            innerStrength: 0.2,
            quality: 3, // Reduced from 4
        },
        bulletPlayer: {
            color: 0x00ffff,
            tint: 0x6dd6ff,
            outerRadius: 2,
            innerStrength: 0.3,
            quality: 2, // Reduced from 8
        },
        bulletEnemy: {
            color: 0xff0000,
            tint: 0xff6666,
            outerRadius: 1.5,
            innerStrength: 0.3,
            quality: 2, // Reduced from 6
        },
        bulletBoss: {
            color: 0xff00ff,
            tint: 0xff00ff,
            outerRadius: 2,
            innerStrength: 0.4,
            quality: 3, // Reduced from 8
        },
        pickup: {
            color: 0x00ff00,
            outerRadius: 1.5,
            innerStrength: 0.2,
            quality: 2, // Reduced from 6
        },
        boss: {
            color: 0xff00ff,
            outerRadius: 0,
            innerStrength: 0.1,
            quality: 8,
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
        const numeric = Number.isFinite(value) ? value : 0;
        GlowManager.intensity = Math.max(0, Math.min(1, numeric));
    }

    static setTheme(theme) {
        if (GLOW_PRESETS_BASE[theme]) {
            GlowManager.theme = theme;
        }
    }

    static applyGlow(sprite, presetKey) {
        if (!sprite || !sprite.preFX) return;

        // Ensure sprite has a valid texture frame before applying FX
        // This prevents "Cannot read properties of undefined (reading 'width')" errors
        if (!sprite.frame || !sprite.frame.width || !sprite.frame.height) return;

        // Skip FX when transform values are invalid to avoid Phaser FX pipeline crashes
        if (
            !Number.isFinite(sprite.x) ||
            !Number.isFinite(sprite.y) ||
            !Number.isFinite(sprite.displayWidth) ||
            !Number.isFinite(sprite.displayHeight)
        ) {
            return;
        }

        const width =
            Number.isFinite(sprite.displayWidth) && sprite.displayWidth > 0
                ? sprite.displayWidth
                : sprite.frame.width;
        const height =
            Number.isFinite(sprite.displayHeight) && sprite.displayHeight > 0
                ? sprite.displayHeight
                : sprite.frame.height;
        if (!Number.isFinite(width) || !Number.isFinite(height)) return;
        if (width <= 0 || height <= 0) return;

        sprite.preFX.clear();

        const config = GLOW_PRESETS_BASE[GlowManager.theme][presetKey];
        if (!config) return;

        const intensity = GlowManager.intensity;
        if (intensity > 0) {
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

            const effectiveOuter = outerRadius * intensity;
            const effectiveInner = innerStrength * intensity;

            if (effectiveOuter > 0 || effectiveInner > 0) {
                sprite.preFX.addGlow(
                    color,
                    effectiveOuter,
                    0,
                    false,
                    effectiveInner,
                    quality
                );
            }
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
