import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";

export class BulletRenderer {
  constructor(scene, maxBullets = 200) {
    this.scene = scene;
    this.pools = {
      player: [],
      enemy: [],
      boss: []
    };
    this.maxBullets = maxBullets;

    for (let i = 0; i < maxBullets; i += 1) {
      const bullet = this.createSprite("player");
      this.pools.player.push(bullet);
    }
  }

  render(bullets, interpolation) {
    const used = { player: 0, enemy: 0, boss: 0 };

    for (const bullet of bullets) {
      if (!bullet.alive) continue;
      const poolKey = getPoolKey(bullet);
      let sprite = this.pools[poolKey][used[poolKey]];
      if (!sprite) {
        sprite = this.createSprite(poolKey);
        this.pools[poolKey].push(sprite);
      }

      const x = lerp(bullet.prevX, bullet.x, interpolation);
      const y = lerp(bullet.prevY, bullet.y, interpolation);
      sprite.setPosition(x, y);
      const radius = bullet.radius ?? 3;
      const size = getBulletSize(radius, poolKey);
      sprite.setDisplaySize(size.width, size.height);
      sprite.rotation =
        Math.atan2(bullet.vy, bullet.vx) +
        Math.PI / 2 +
        (poolKey === "player" ? Math.PI / 2 : 0);
      sprite.setVisible(true);
      used[poolKey] += 1;
    }

    this.hideUnused(this.pools.player, used.player);
    this.hideUnused(this.pools.enemy, used.enemy);
    this.hideUnused(this.pools.boss, used.boss);
  }

  createSprite(poolKey) {
    const key =
      poolKey === "player" ? SPRITE_KEYS.bullet : SPRITE_KEYS.enemyBullet;
    const sprite = this.scene.add.image(-100, -100, key);
    sprite.setOrigin(0.5, 0.5);
    sprite.setVisible(false);
    if (poolKey === "boss") {
      sprite.setTint(0xff00ff);
    }
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
  return "player";
}

function getBulletSize(radius, poolKey) {
  const scale = 1.5;
  if (poolKey === "player") {
    return { width: radius * 7 * scale, height: radius * 14 * scale };
  }
  if (poolKey === "boss") {
    return { width: radius * 8 * scale, height: radius * 16 * scale };
  }
  return { width: radius * 7.2 * scale, height: radius * 13 * scale };
}
