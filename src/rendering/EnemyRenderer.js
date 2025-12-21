import { lerp } from "../utils/math.js";
import { ELITE_SPRITES, ENEMY_SPRITES } from "./sprites.js";

export class EnemyRenderer {
  constructor(scene) {
    this.scene = scene;
    this.sprites = new Map();
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

      sprite.x = lerp(enemy.prevX, enemy.x, interpolation);
      sprite.y = lerp(enemy.prevY, enemy.y, interpolation);

      if (enemy.type === "phantom") {
        const flicker = 0.55 + Math.sin(this.scene.time.now * 0.02 + enemy.id) * 0.2;
        sprite.setAlpha(flicker);
      } else {
        sprite.setAlpha(1);
      }

      const baseSize = getEnemySize(enemy);
      const size = enemy.elite ? baseSize * 1.2 : baseSize;
      if (sprite.baseSize !== size) {
        sprite.baseSize = size;
        sprite.setDisplaySize(size, size);
      }
    }

    for (const [id, sprite] of this.sprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
  }

  createSprite(enemy) {
    const key = enemy.elite ? ELITE_SPRITES[enemy.type] : ENEMY_SPRITES[enemy.type];
    const spriteKey = key ?? ENEMY_SPRITES.drifter;
    const size = getEnemySize(enemy);
    const displaySize = enemy.elite ? size * 1.2 : size;
    const sprite = this.scene.add.image(enemy.x, enemy.y, spriteKey);
    sprite.setOrigin(0.5, 0.5);
    sprite.setDisplaySize(displaySize, displaySize);
    sprite.baseSize = displaySize;
    return sprite;
  }
}

function getEnemySize(enemy) {
  const multipliers = {
    splitter: 2.2,
    orbiter: 2.1
  };
  const scale = multipliers[enemy.type] ?? 2;
  return enemy.radius * scale * 2.4;
}
