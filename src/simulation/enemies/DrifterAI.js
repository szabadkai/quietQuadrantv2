import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

export const DrifterAI = {
  update(enemy, state, _rng, helpers) {
    const target = helpers.getNearestPlayer(state, enemy);
    if (!target) return;

    const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);
    const dir = normalize(target.x - enemy.x, target.y - enemy.y);

    enemy.vx = dir.x * speed;
    enemy.vy = dir.y * speed;
    enemy.x += enemy.vx / TICK_RATE;
    enemy.y += enemy.vy / TICK_RATE;
  }
};
