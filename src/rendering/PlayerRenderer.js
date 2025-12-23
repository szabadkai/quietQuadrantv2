import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";
import { GlowManager, GLOW_PRESETS } from "./GlowManager.js";

export class PlayerRenderer {
    constructor(scene) {
        this.scene = scene;
        this.sprites = new Map();
        this.neutronRings = new Map();
        this.shieldRings = new Map();
    }

    setGlowIntensity(intensity) {
        GlowManager.setIntensity(intensity);
        // Update existing sprites
        for (const [id, sprite] of this.sprites) {
            GlowManager.applyGlow(sprite, GLOW_PRESETS.player);
        }
    }

    render(players, interpolation) {
        const activeIds = new Set();

        for (const player of players) {
            if (!player.alive) continue;
            activeIds.add(player.id);

            let sprite = this.sprites.get(player.id);
            if (!sprite) {
                sprite = this.createSprite(player);
                this.sprites.set(player.id, sprite);
            }

            sprite.x = lerp(player.prevX, player.x, interpolation);
            sprite.y = lerp(player.prevY, player.y, interpolation);
            sprite.rotation = player.rotation;

            const blink =
                player.invulnFrames > 0 &&
                Math.floor(this.scene.time.now / 100) % 2 === 0;
            sprite.setAlpha(blink ? 0.5 : 1);
            const tint = resolvePlayerTint(player);
            if (tint) {
                sprite.setTint(tint);
            } else {
                sprite.clearTint();
            }

            const ring = this.ensureNeutronRing(player);
            if (ring) {
                const pulse =
                    0.45 + Math.sin(this.scene.time.now * 0.006) * 0.2;
                ring.clear();
                ring.lineStyle(2, 0x6dd6ff, pulse);
                ring.strokeCircle(
                    sprite.x,
                    sprite.y,
                    Math.max(18, player.neutronBlockRadius ?? 0)
                );
            }

            const shieldRing = this.ensureShieldRing(player);
            if (shieldRing) {
                const pulse =
                    0.35 + Math.sin(this.scene.time.now * 0.008) * 0.2;
                const radius = player.radius * 3.2;
                shieldRing.clear();
                shieldRing.lineStyle(2, 0x6dd6ff, pulse);
                shieldRing.strokeCircle(sprite.x, sprite.y, radius);
                shieldRing.lineStyle(1, 0x9ff0ff, pulse * 0.9);
                shieldRing.strokeCircle(sprite.x, sprite.y, radius * 0.86);
            }

            const nextSize = player.radius * 4.26;
            if (sprite.baseSize !== nextSize) {
                sprite.baseSize = nextSize;
                sprite.setDisplaySize(nextSize, nextSize);
            }
        }

        for (const [id, sprite] of this.sprites) {
            if (!activeIds.has(id)) {
                sprite.destroy();
                this.sprites.delete(id);
                const ring = this.neutronRings.get(id);
                if (ring) {
                    ring.destroy();
                    this.neutronRings.delete(id);
                }
                const shield = this.shieldRings.get(id);
                if (shield) {
                    shield.destroy();
                    this.shieldRings.delete(id);
                }
            }
        }
    }

    createSprite(player) {
        const size = player.radius * 4.26;
        const sprite = this.scene.add.image(
            player.x,
            player.y,
            SPRITE_KEYS.player
        );
        sprite.setOrigin(0.5, 0.5);
        sprite.setDisplaySize(size, size);
        sprite.baseSize = size;

        // Apply glow using centralized manager
        GlowManager.applyGlow(sprite, GLOW_PRESETS.player);

        return sprite;
    }

    ensureNeutronRing(player) {
        const hasCore =
            player.neutronCore && (player.neutronBlockRadius ?? 0) > 0;
        let ring = this.neutronRings.get(player.id);
        if (hasCore) {
            if (!ring) {
                ring = this.scene.add.graphics();
                ring.setDepth(4);
                this.neutronRings.set(player.id, ring);
            }
            ring.setVisible(true);
            return ring;
        }
        if (ring) {
            ring.setVisible(false);
        }
        return null;
    }

    ensureShieldRing(player) {
        const hasShield = player.shieldActive;
        let ring = this.shieldRings.get(player.id);
        if (hasShield) {
            if (!ring) {
                ring = this.scene.add.graphics();
                ring.setDepth(5);
                this.shieldRings.set(player.id, ring);
            }
            ring.setVisible(true);
            return ring;
        }
        if (ring) {
            ring.setVisible(false);
        }
        return null;
    }
}

function resolvePlayerTint(player) {
    if (player.shieldActive) return 0x9ff0ff;
    if ((player.berserkMaxBonus ?? 0) > 0) {
        const healthRatio =
            player.maxHealth > 0 ? player.health / player.maxHealth : 1;
        if (healthRatio < 0.5) return 0xff6b6b;
    }
    if ((player.momentumMaxBonus ?? 0) > 0 && (player.momentum ?? 0) > 0.6) {
        return 0x6dd6ff;
    }
    return null;
}
