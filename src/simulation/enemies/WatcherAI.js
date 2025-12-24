import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

export const WatcherAI = {
    update(enemy, state, _rng, helpers) {
        const target = helpers.getNearestPlayer(state, enemy);
        if (!target) return;

        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const dist = Math.hypot(dx, dy) || 1;
        const dir = { x: dx / dist, y: dy / dist };

        const desired = 240;
        const buffer = 40;
        const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);

        let moveX = 0;
        let moveY = 0;

        if (dist > desired + buffer) {
            moveX = dir.x;
            moveY = dir.y;
        } else if (dist < desired - buffer) {
            moveX = -dir.x;
            moveY = -dir.y;
        } else {
            moveX = -dir.y;
            moveY = dir.x;
        }

        const move = normalize(moveX, moveY);
        enemy.vx = move.x * speed;
        enemy.vy = move.y * speed;
        enemy.x += enemy.vx / TICK_RATE;
        enemy.y += enemy.vy / TICK_RATE;

        enemy.fireCooldown -= 1;
        if (enemy.fireCooldown <= 0) {
            helpers.spawnBullet(state, enemy, dir.x, dir.y);
            enemy.fireCooldown = enemy.fireCooldownTicks;
        }
    }
};
