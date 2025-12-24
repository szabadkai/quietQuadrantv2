import { lerp } from "../utils/math.js";
import { ELITE_SPRITES, ENEMY_SPRITES } from "./sprites.js";
import { GlowManager, GLOW_PRESETS } from "./GlowManager.js";
import { safeNumber, safeSize } from "./sizeUtils.js";

export class EnemyRenderer {
    constructor(scene) {
        this.scene = scene;
        this.sprites = new Map();
    }

    setGlowIntensity(intensity) {
        GlowManager.setIntensity(intensity);
        // Update existing sprites
        for (const [id, sprite] of this.sprites) {
            const preset = sprite.isElite
                ? GLOW_PRESETS.enemyElite
                : GLOW_PRESETS.enemy;
            GlowManager.applyGlow(sprite, preset);
        }
    }

    render(enemies, interpolation) {
        const activeIds = new Set();

        for (const enemy of enemies) {
            if (!enemy.alive) continue;
            activeIds.add(enemy.id);

            let sprite = this.sprites.get(enemy.id);
            if (!sprite) {
                sprite = this.createSprite(enemy);
                this.sprites.set(enemy.id, sprite);
            }

            const nextX = lerp(enemy.prevX, enemy.x, interpolation);
            const nextY = lerp(enemy.prevY, enemy.y, interpolation);
            sprite.x = safeNumber(nextX, sprite.x ?? 0);
            sprite.y = safeNumber(nextY, sprite.y ?? 0);

            if (enemy.type === "phantom") {
                const flicker =
                    0.55 +
                    Math.sin(this.scene.time.now * 0.02 + enemy.id) * 0.2;
                sprite.setAlpha(flicker);
            } else {
                sprite.setAlpha(1);
            }

            const baseSize = getEnemySize(enemy);
            const size = enemy.elite ? baseSize * 1.2 : baseSize;
            const safeDisplay = safeSize(size);
            if (sprite.baseSize !== safeDisplay) {
                sprite.baseSize = safeDisplay;
                sprite.setDisplaySize(safeDisplay, safeDisplay);
            }
        }

        for (const [id, sprite] of this.sprites) {
            if (!activeIds.has(id)) {
                // Clear FX before destroying to prevent Phaser FXPipeline crash
                GlowManager.clearGlow(sprite);
                sprite.destroy();
                this.sprites.delete(id);
            }
        }
    }

    createSprite(enemy) {
        const key = enemy.elite
            ? ELITE_SPRITES[enemy.type]
            : ENEMY_SPRITES[enemy.type];
        const spriteKey = key ?? ENEMY_SPRITES.drifter;
        const size = getEnemySize(enemy);
        const displaySize = safeSize(enemy.elite ? size * 1.2 : size);
        const sprite = this.scene.add.image(enemy.x, enemy.y, spriteKey);
        sprite.setOrigin(0.5, 0.5);
        sprite.setDisplaySize(displaySize, displaySize);
        sprite.baseSize = displaySize;
        sprite.isElite = enemy.elite;

        // Apply glow using centralized manager
        const preset = enemy.elite
            ? GLOW_PRESETS.enemyElite
            : GLOW_PRESETS.enemy;
        GlowManager.applyGlow(sprite, preset);

        return sprite;
    }
}

function getEnemySize(enemy) {
    const scale = 2;
    return safeSize(enemy.radius * scale * 2.4);
}
