import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";
import { GlowManager, GLOW_PRESETS } from "./GlowManager.js";
import { safeNumber, safeSize } from "./sizeUtils.js";

export class PlayerRenderer {
    constructor(scene) {
        this.scene = scene;
        this.sprites = new Map();
        this.neutronRings = new Map();
        this.shieldRings = new Map();
        this.shieldInnerRings = new Map();
    }

    setGlowIntensity(intensity) {
        GlowManager.setIntensity(intensity);
        // Update existing sprites
        for (const [, sprite] of this.sprites) {
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

            const nextX = lerp(player.prevX, player.x, interpolation);
            const nextY = lerp(player.prevY, player.y, interpolation);
            sprite.x = safeNumber(nextX, sprite.x ?? 0);
            sprite.y = safeNumber(nextY, sprite.y ?? 0);
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
                const radius = Math.max(18, player.neutronBlockRadius ?? 0);
                ring.setPosition(sprite.x, sprite.y);
                ring.setRadius(radius);
                ring.setStrokeStyle(2, 0x6dd6ff, pulse);
            }

            const { outer: shieldOuter, inner: shieldInner } =
                this.ensureShieldRing(player);
            if (shieldOuter) {
                const pulse =
                    0.35 + Math.sin(this.scene.time.now * 0.008) * 0.2;
                const radius = player.radius * 3.2;
                shieldOuter.setPosition(sprite.x, sprite.y);
                shieldOuter.setRadius(radius);
                shieldOuter.setStrokeStyle(2, 0x6dd6ff, pulse);
                if (shieldInner) {
                    shieldInner.setPosition(sprite.x, sprite.y);
                    shieldInner.setRadius(radius * 0.86);
                    shieldInner.setStrokeStyle(1, 0x9ff0ff, pulse * 0.9);
                }
            }

            const nextSize = safeSize(player.radius * 4.26);
            if (sprite.baseSize !== nextSize) {
                sprite.baseSize = nextSize;
                sprite.setDisplaySize(nextSize, nextSize);
            }
        }

        for (const [id, sprite] of this.sprites) {
            if (!activeIds.has(id)) {
                // Clear FX before destroying to prevent Phaser FXPipeline crash
                GlowManager.clearGlow(sprite);
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
                const shieldInner = this.shieldInnerRings.get(id);
                if (shieldInner) {
                    shieldInner.destroy();
                    this.shieldInnerRings.delete(id);
                }
            }
        }
    }

    createSprite(player) {
        const size = safeSize(player.radius * 4.26);
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
                // Use Arc instead of Graphics - no triangulation needed
                ring = this.scene.add.arc(0, 0, 18, 0, 360, false, 0x000000, 0);
                ring.setStrokeStyle(2, 0x6dd6ff, 0.45);
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
        let outer = this.shieldRings.get(player.id);
        let inner = this.shieldInnerRings.get(player.id);
        if (hasShield) {
            if (!outer) {
                // Use Arc instead of Graphics - no triangulation needed
                outer = this.scene.add.arc(
                    0,
                    0,
                    30,
                    0,
                    360,
                    false,
                    0x000000,
                    0
                );
                outer.setStrokeStyle(2, 0x6dd6ff, 0.35);
                outer.setDepth(5);
                this.shieldRings.set(player.id, outer);
            }
            if (!inner) {
                inner = this.scene.add.arc(
                    0,
                    0,
                    26,
                    0,
                    360,
                    false,
                    0x000000,
                    0
                );
                inner.setStrokeStyle(1, 0x9ff0ff, 0.3);
                inner.setDepth(5);
                this.shieldInnerRings.set(player.id, inner);
            }
            outer.setVisible(true);
            inner.setVisible(true);
            return { outer, inner };
        }
        if (outer) {
            outer.setVisible(false);
        }
        if (inner) {
            inner.setVisible(false);
        }
        return { outer: null, inner: null };
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
