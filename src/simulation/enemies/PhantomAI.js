import { normalize, clamp } from "../../utils/math.js";
import { ARENA_WIDTH, ARENA_HEIGHT, TICK_RATE } from "../../utils/constants.js";

export const PhantomAI = {
  update(enemy, state, rng, helpers) {
    const target = helpers.getNearestPlayer(state, enemy);
    if (!target) return;

    enemy.teleportCooldown -= 1;
    if (enemy.teleportCooldown <= 0) {
      const [minCd, maxCd] = enemy.teleportCooldownRange ?? [180, 240];
      enemy.teleportCooldown = rng.nextInt(minCd, maxCd);

      const angle = rng.nextRange(0, Math.PI * 2);
      const distance = rng.nextRange(80, 140);
      const nextX = target.x + Math.cos(angle) * distance;
      const nextY = target.y + Math.sin(angle) * distance;

      enemy.x = clamp(nextX, enemy.radius, ARENA_WIDTH - enemy.radius);
      enemy.y = clamp(nextY, enemy.radius, ARENA_HEIGHT - enemy.radius);
      enemy.prevX = enemy.x;
      enemy.prevY = enemy.y;
    }

    const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);
    const dir = normalize(target.x - enemy.x, target.y - enemy.y);
    enemy.vx = dir.x * speed;
    enemy.vy = dir.y * speed;
    enemy.x += enemy.vx / TICK_RATE;
    enemy.y += enemy.vy / TICK_RATE;
  }
};
