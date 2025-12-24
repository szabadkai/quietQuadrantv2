import { lerp } from "../utils/math.js";
import { BOSS_SPRITES, SPRITE_KEYS } from "./sprites.js";
import { GlowManager, GLOW_PRESETS } from "./GlowManager.js";
import { safeNumber, safeSize } from "./sizeUtils.js";

export class BossRenderer {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
    }

    setGlowIntensity(intensity) {
        GlowManager.setIntensity(intensity);
        if (this.sprite) {
            GlowManager.applyGlow(this.sprite, GLOW_PRESETS.boss);
        }
    }

    render(boss, interpolation) {
        if (!boss) {
            if (this.sprite) {
                // Clear FX before destroying to prevent Phaser FXPipeline crash
                GlowManager.clearGlow(this.sprite);
                this.sprite.destroy();
                this.sprite = null;
            }
            return;
        }

        if (!this.sprite || this.sprite.bossId !== boss.id) {
            if (this.sprite) {
                // Clear FX before destroying to prevent Phaser FXPipeline crash
                GlowManager.clearGlow(this.sprite);
                this.sprite.destroy();
            }
            this.sprite = this.createSprite(boss);
        }

        const nextX = lerp(boss.prevX, boss.x, interpolation);
        const nextY = lerp(boss.prevY, boss.y, interpolation);
        this.sprite.x = safeNumber(nextX, this.sprite.x ?? 0);
        this.sprite.y = safeNumber(nextY, this.sprite.y ?? 0);
        const size = safeSize(boss.radius * 4);
        if (this.sprite.baseSize !== size) {
            this.sprite.baseSize = size;
            this.sprite.setDisplaySize(size, size);
        }
    }

    createSprite(boss) {
        const key = BOSS_SPRITES[boss.id] ?? SPRITE_KEYS.bossFallback;
        const size = safeSize(boss.radius * 4);
        const sprite = this.scene.add.image(boss.x, boss.y, key);
        sprite.setOrigin(0.5, 0.5);
        sprite.setDisplaySize(size, size);
        sprite.baseSize = size;
        sprite.bossId = boss.id;

        GlowManager.applyGlow(sprite, GLOW_PRESETS.boss);

        return sprite;
    }
}
