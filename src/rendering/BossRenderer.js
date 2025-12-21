import { lerp } from "../utils/math.js";
import { BOSS_SPRITES, SPRITE_KEYS } from "./sprites.js";

export class BossRenderer {
  constructor(scene) {
    this.scene = scene;
    this.sprite = null;
  }

  render(boss, interpolation) {
    if (!boss) {
      if (this.sprite) {
        this.sprite.destroy();
        this.sprite = null;
      }
      return;
    }

    if (!this.sprite || this.sprite.bossId !== boss.id) {
      if (this.sprite) {
        this.sprite.destroy();
      }
      this.sprite = this.createSprite(boss);
    }

    this.sprite.x = lerp(boss.prevX, boss.x, interpolation);
    this.sprite.y = lerp(boss.prevY, boss.y, interpolation);
    const size = boss.radius * 4;
    if (this.sprite.baseSize !== size) {
      this.sprite.baseSize = size;
      this.sprite.setDisplaySize(size, size);
    }
  }

  createSprite(boss) {
    const key = BOSS_SPRITES[boss.id] ?? SPRITE_KEYS.bossFallback;
    const size = boss.radius * 4;
    const sprite = this.scene.add.image(boss.x, boss.y, key);
    sprite.setOrigin(0.5, 0.5);
    sprite.setDisplaySize(size, size);
    sprite.baseSize = size;
    sprite.bossId = boss.id;
    return sprite;
  }
}
