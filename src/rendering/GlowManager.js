/**
 * Centralized glow effect management for all game sprites
 */

export class GlowManager {
    static intensity = 0.5;

    static setIntensity(value) {
        GlowManager.intensity = value;
    }

    static applyGlow(sprite, config) {
        if (!sprite || !sprite.preFX) return;

        sprite.preFX.clear();

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

// Preset configurations for different sprite types
export const GLOW_PRESETS = {
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
        outerRadius: 0,
        innerStrength: 0.1,
        quality: 10,
    },
    boss: {
        color: 0xff00ff,
        outerRadius: 0,
        innerStrength: 0.1,
        quality: 10,
    },
};
