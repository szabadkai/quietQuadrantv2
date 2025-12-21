import { ARENA_WIDTH, ARENA_HEIGHT, TICK_RATE } from "../utils/constants.js";
import { normalize } from "../utils/math.js";

const PLAYER_PROJECTILE_MARGIN =
  Math.max(ARENA_WIDTH, ARENA_HEIGHT) * 1.5;

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

      if (bullet.ttl <= 0) {
        bullet.alive = false;
        continue;
      }

      if (bullet.phaseThrough) {
        this.wrapBullet(bullet);
      } else {
        this.applyRicochet(state, bullet);
        if (this.isOutOfBounds(bullet)) {
          bullet.alive = false;
        }
      }
    }
  },

  isOutOfBounds(bullet) {
    const margin =
      bullet.owner === "p1" || bullet.owner === "p2"
        ? PLAYER_PROJECTILE_MARGIN + bullet.radius
        : bullet.radius;
    return (
      bullet.x < -margin ||
      bullet.y < -margin ||
      bullet.x > ARENA_WIDTH + margin ||
      bullet.y > ARENA_HEIGHT + margin
    );
  },

  applyHoming(state, bullet) {
    const target = getNearestEnemy(state, bullet, bullet.homingRange ?? 0);
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
  },
  wrapBullet(bullet) {
    let wrapped = false;
    const minX = -bullet.radius;
    const maxX = ARENA_WIDTH + bullet.radius;
    const minY = -bullet.radius;
    const maxY = ARENA_HEIGHT + bullet.radius;

    if (bullet.x < minX) {
      bullet.x = maxX;
      wrapped = true;
    } else if (bullet.x > maxX) {
      bullet.x = minX;
      wrapped = true;
    }

    if (bullet.y < minY) {
      bullet.y = maxY;
      wrapped = true;
    } else if (bullet.y > maxY) {
      bullet.y = minY;
      wrapped = true;
    }

    if (wrapped) {
      bullet.prevX = bullet.x;
      bullet.prevY = bullet.y;
    }
  },
};

BulletSystem.applyRicochet = function applyRicochet(state, bullet) {
  if ((bullet.ricochet ?? 0) <= 0) return;
  let bounced = false;

  if (bullet.x - bullet.radius <= 0 && bullet.vx < 0) {
    bullet.x = bullet.radius;
    bullet.vx *= -1;
    bounced = true;
  } else if (bullet.x + bullet.radius >= ARENA_WIDTH && bullet.vx > 0) {
    bullet.x = ARENA_WIDTH - bullet.radius;
    bullet.vx *= -1;
    bounced = true;
  }

  if (bullet.y - bullet.radius <= 0 && bullet.vy < 0) {
    bullet.y = bullet.radius;
    bullet.vy *= -1;
    bounced = true;
  } else if (bullet.y + bullet.radius >= ARENA_HEIGHT && bullet.vy > 0) {
    bullet.y = ARENA_HEIGHT - bullet.radius;
    bullet.vy *= -1;
    bounced = true;
  }

  if (bounced) {
    bullet.ricochet -= 1;
    state.events.push({
      type: "ricochet",
      x: bullet.x,
      y: bullet.y
    });
  }
};

function getNearestEnemy(state, bullet, range) {
  const rangeSq = range > 0 ? range * range : Infinity;
  let best = null;
  let bestDist = Infinity;
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - bullet.x;
    const dy = enemy.y - bullet.y;
    const dist = dx * dx + dy * dy;
    if (dist > rangeSq) continue;
    if (dist < bestDist) {
      bestDist = dist;
      best = enemy;
    }
  }
  return best;
}
