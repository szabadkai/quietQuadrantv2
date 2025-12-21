import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";

export class PickupRenderer {
  constructor(scene, maxPickups = 100) {
    this.scene = scene;
    this.pool = [];
    this.maxPickups = maxPickups;

    for (let i = 0; i < maxPickups; i += 1) {
      const pickup = this.scene.add.image(-100, -100, SPRITE_KEYS.xp);
      pickup.setOrigin(0.5, 0.5);
      pickup.setVisible(false);
      this.pool.push(pickup);
    }
  }

  render(pickups, interpolation) {
    let used = 0;

    for (const pickup of pickups) {
      if (!pickup.alive) continue;
      let sprite = this.pool[used];
      if (!sprite) {
        sprite = this.scene.add.image(-100, -100, SPRITE_KEYS.xp);
        sprite.setOrigin(0.5, 0.5);
        this.pool.push(sprite);
      }

      const prevX = pickup.prevX ?? pickup.x;
      const prevY = pickup.prevY ?? pickup.y;
      const x = lerp(prevX, pickup.x, interpolation);
      const y = lerp(prevY, pickup.y, interpolation);
      sprite.setPosition(x, y);
      const size = (pickup.radius ?? 4) * 1.6;
      sprite.setDisplaySize(size, size);
      const pulse = (Math.sin(this.scene.time.now * 0.008) + 1) * 0.5;
      sprite.setScale(0.9 + pulse * 0.15);
      sprite.setVisible(true);
      used += 1;
    }

    for (let i = used; i < this.pool.length; i += 1) {
      this.pool[i].setVisible(false);
    }
  }
}
