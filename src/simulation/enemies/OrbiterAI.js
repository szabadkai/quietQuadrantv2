import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

export const OrbiterAI = {
  update(enemy, state, _rng, helpers) {
    const target = helpers.getNearestPlayer(state, enemy);
    if (!target) return;

    enemy.orbitAngle += enemy.orbitDir * 0.04;
    const orbitX = target.x + Math.cos(enemy.orbitAngle) * enemy.orbitRadius;
    const orbitY = target.y + Math.sin(enemy.orbitAngle) * enemy.orbitRadius;

    const dir = normalize(orbitX - enemy.x, orbitY - enemy.y);
    const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);

    enemy.vx = dir.x * speed;
    enemy.vy = dir.y * speed;
    enemy.x += enemy.vx / TICK_RATE;
    enemy.y += enemy.vy / TICK_RATE;

    const aimDir = normalize(target.x - enemy.x, target.y - enemy.y);
    enemy.fireCooldown -= 1;
    if (enemy.fireCooldown <= 0) {
      helpers.spawnBullet(state, enemy, aimDir.x, aimDir.y);
      enemy.fireCooldown = enemy.fireCooldownTicks;
    }
  }
};
