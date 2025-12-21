import { ARENA_WIDTH, ARENA_HEIGHT, TICK_RATE } from "../utils/constants.js";
import { normalize } from "../utils/math.js";

export const BulletSystem = {
  update(state) {
    for (const bullet of state.bullets) {
      if (!bullet.alive) continue;

      if (bullet.owner !== "enemy" && bullet.homingStrength > 0) {
        this.applyHoming(state, bullet);
      }

      bullet.prevX = bullet.x;
      bullet.prevY = bullet.y;
      bullet.x += bullet.vx / TICK_RATE;
      bullet.y += bullet.vy / TICK_RATE;
      bullet.ttl -= 1;

      if (bullet.ttl <= 0 || this.isOutOfBounds(bullet)) {
        bullet.alive = false;
      }
    }
  },

  isOutOfBounds(bullet) {
    return (
      bullet.x < -bullet.radius ||
      bullet.y < -bullet.radius ||
      bullet.x > ARENA_WIDTH + bullet.radius ||
      bullet.y > ARENA_HEIGHT + bullet.radius
    );
  },

  applyHoming(state, bullet) {
    const target = getNearestEnemy(state, bullet);
    if (!target) return;

    const currentDir = normalize(bullet.vx, bullet.vy);
    const desiredDir = normalize(target.x - bullet.x, target.y - bullet.y);
    const steer = Math.min(0.15, bullet.homingStrength * 0.1);

    const nextDir = normalize(
      currentDir.x + (desiredDir.x - currentDir.x) * steer,
      currentDir.y + (desiredDir.y - currentDir.y) * steer
    );

    const speed = Math.hypot(bullet.vx, bullet.vy) || 0;
    bullet.vx = nextDir.x * speed;
    bullet.vy = nextDir.y * speed;
  }
};

function getNearestEnemy(state, bullet) {
  let best = null;
  let bestDist = Infinity;
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - bullet.x;
    const dy = enemy.y - bullet.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = enemy;
    }
  }
  return best;
}
