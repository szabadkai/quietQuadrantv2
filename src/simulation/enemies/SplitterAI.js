import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

export const SplitterAI = {
    update(enemy, state, _rng, helpers) {
        const target = helpers.getNearestPlayer(state, enemy);
        if (!target) return;

        const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);
        const dir = normalize(target.x - enemy.x, target.y - enemy.y);

        // Blend AI velocity with external forces (e.g. singularity pull)
        const targetVx = dir.x * speed;
        const targetVy = dir.y * speed;
        const blend = 0.15;
        enemy.vx = enemy.vx * (1 - blend) + targetVx * blend;
        enemy.vy = enemy.vy * (1 - blend) + targetVy * blend;

        enemy.x += enemy.vx / TICK_RATE;
        enemy.y += enemy.vy / TICK_RATE;
    }
};
