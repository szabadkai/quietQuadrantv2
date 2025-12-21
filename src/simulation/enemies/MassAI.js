import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

export const MassAI = {
  update(enemy, state, _rng, helpers) {
    const target = helpers.getNearestPlayer(state, enemy);
    if (!target) return;

    const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);
    const dir = normalize(target.x - enemy.x, target.y - enemy.y);

    enemy.vx = dir.x * speed;
    enemy.vy = dir.y * speed;
    enemy.x += enemy.vx / TICK_RATE;
    enemy.y += enemy.vy / TICK_RATE;

    enemy.fireCooldown -= 1;
    if (enemy.fireCooldown <= 0) {
      this.radialBurst(state, enemy, helpers);
      enemy.fireCooldown = enemy.fireCooldownTicks;
    }
  },

  radialBurst(state, enemy, helpers) {
    const count = 8;
    const step = (Math.PI * 2) / count;

    for (let i = 0; i < count; i += 1) {
      const angle = step * i;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      helpers.spawnBullet(state, enemy, dirX, dirY);
    }
  }
};
