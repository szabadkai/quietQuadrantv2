import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";

export class PlayerRenderer {
  constructor(scene) {
    this.scene = scene;
    this.sprites = new Map();
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
      }
    }
  }

  createSprite(player) {
    const size = player.radius * 4.26;
    const sprite = this.scene.add.image(player.x, player.y, SPRITE_KEYS.player);
    sprite.setOrigin(0.5, 0.5);
    sprite.setDisplaySize(size, size);
    sprite.baseSize = size;
    return sprite;
  }
}
