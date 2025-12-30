import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";
import { GlowManager, GLOW_PRESETS } from "./GlowManager.js";
import { safeNumber, safeSize } from "./sizeUtils.js";
import { ARENA_WIDTH, ARENA_HEIGHT } from "../utils/constants.js";
import { TextureValidator } from "./TextureValidator.js";

export class BulletRenderer {
    constructor(scene, maxBullets = 200) {
        this.scene = scene;
        this.pools = {
            player: [],
            enemy: [],
            boss: [],
            neutron: [],
        };
        this.maxBullets = maxBullets;

        for (let i = 0; i < maxBullets; i += 1) {
            const bullet = this.createSprite("player");
            this.pools.player.push(bullet);
        }
    }

    setGlowIntensity(intensity) {
        GlowManager.setIntensity(intensity);
        // Update all pooled sprites
        for (const poolKey in this.pools) {
            for (const sprite of this.pools[poolKey]) {
                const preset =
                    poolKey === "player"
                        ? GLOW_PRESETS.bulletPlayer
                        : poolKey === "boss"
                            ? GLOW_PRESETS.bulletBoss
                            : poolKey === "neutron"
                                ? GLOW_PRESETS.bulletNeutron
                                : GLOW_PRESETS.bulletEnemy;
                GlowManager.applyGlow(sprite, preset);
            }
        }
    }

    render(bullets, interpolation) {
        const used = { player: 0, enemy: 0, boss: 0, neutron: 0 };
        
        // Off-screen culling margin (accounts for bullet size and glow)
        const CULL_MARGIN = 50;

        for (const bullet of bullets) {
            if (!bullet.alive) continue;
            
            // PERFORMANCE: Skip rendering bullets that are off-screen
            const x = lerp(bullet.prevX, bullet.x, interpolation);
            const y = lerp(bullet.prevY, bullet.y, interpolation);
            if (x < -CULL_MARGIN || x > ARENA_WIDTH + CULL_MARGIN ||
                y < -CULL_MARGIN || y > ARENA_HEIGHT + CULL_MARGIN) {
                continue;
            }
            
            const poolKey = getPoolKey(bullet);
            let sprite = this.pools[poolKey][used[poolKey]];
            if (!sprite) {
                sprite = this.createSprite(poolKey);
                this.pools[poolKey].push(sprite);
            }

            // Safety check: Validate sprite before use
            if (!TextureValidator.validateSprite(sprite, SPRITE_KEYS.bullet, this.scene)) {
                sprite.setVisible(false);
                continue; 
            }

            sprite.setPosition(
                safeNumber(x, sprite.x ?? 0),
                safeNumber(y, sprite.y ?? 0)
            );
            const radius = Number.isFinite(bullet.radius)
                ? bullet.radius
                : 3;
            const size = getBulletSize(radius, poolKey);
            sprite.setDisplaySize(size.width, size.height);
            const rot = Math.atan2(bullet.vy ?? 0, bullet.vx ?? 0) + Math.PI;
            sprite.rotation = safeNumber(rot, 0);
            if (bullet.phaseThrough) {
                sprite.setAlpha(0.6);
            } else {
                sprite.setAlpha(1);
            }
            sprite.setVisible(true);
            used[poolKey] += 1;
        }

        this.hideUnused(this.pools.player, used.player);
        this.hideUnused(this.pools.enemy, used.enemy);
        this.hideUnused(this.pools.boss, used.boss);
        this.hideUnused(this.pools.neutron, used.neutron);
    }

    createSprite(poolKey) {
        let key =
            poolKey === "player" || poolKey === "neutron"
                ? SPRITE_KEYS.bullet
                : SPRITE_KEYS.enemyBullet;
        
        // Ensure key is valid using Validator
        key = TextureValidator.validateTextureKey(
            this.scene, 
            key, 
            SPRITE_KEYS.bullet
        );

        const sprite = this.scene.add.image(-100, -100, key);
        sprite.setOrigin(0.5, 0.5);
        sprite.setVisible(false);

        // Apply glow using centralized manager
        const preset =
            poolKey === "player"
                ? GLOW_PRESETS.bulletPlayer
                : poolKey === "boss"
                    ? GLOW_PRESETS.bulletBoss
                    : poolKey === "neutron"
                        ? GLOW_PRESETS.bulletNeutron
                        : GLOW_PRESETS.bulletEnemy;
        GlowManager.applyGlow(sprite, preset);

        return sprite;
    }

    hideUnused(pool, used) {
        for (let i = used; i < pool.length; i += 1) {
            pool[i].setVisible(false);
        }
    }
}

function getPoolKey(bullet) {
    if (bullet.owner === "boss") return "boss";
    if (bullet.owner === "enemy") return "enemy";
    if (bullet.blockShots) return "neutron";
    return "player";
}

function getBulletSize(radius, poolKey) {
    const scale = 1.5;
    if (poolKey === "player") {
        return {
            width: safeSize(radius * 9 * scale),
            height: safeSize(radius * 14 * scale),
        };
    }
    if (poolKey === "boss") {
        return {
            width: safeSize(radius * 8 * scale),
            height: safeSize(radius * 16 * scale),
        };
    }
    return {
        width: safeSize(radius * 7.2 * scale),
        height: safeSize(radius * 13 * scale),
    };
}
