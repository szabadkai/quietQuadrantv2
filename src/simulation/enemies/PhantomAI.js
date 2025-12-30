import { normalize, clamp } from "../../utils/math.js";
import { ARENA_WIDTH, ARENA_HEIGHT, TICK_RATE } from "../../utils/constants.js";

export const PhantomAI = {
    update(enemy, state, rng, helpers) {
        const target = helpers.getNearestPlayer(state, enemy);
        if (!target) return;

        enemy.teleportCooldown -= 1;

        // Telegraph phase: 30 ticks (0.5s) before teleport
        if (enemy.teleportCooldown === 30) {

            
            // Calculate and store the target position ahead of time
            const angle = rng.nextRange(0, Math.PI * 2);
            const distance = rng.nextRange(80, 140);
            let nextX = target.x + Math.cos(angle) * distance;
            let nextY = target.y + Math.sin(angle) * distance;
            
            // Clamp immediately so the telegraph shows the actual valid destination
            nextX = clamp(nextX, enemy.radius, ARENA_WIDTH - enemy.radius);
            nextY = clamp(nextY, enemy.radius, ARENA_HEIGHT - enemy.radius);
            
            enemy.teleportTarget = { x: nextX, y: nextY };
            
            if (state.events) {
                state.events.push({
                    type: "phantom-telegraph",
                    x: nextX,
                    y: nextY,
                    radius: enemy.radius
                });
            }
        }
        
        // Execute teleport
        if (enemy.teleportCooldown <= 0) {
            // Use stored target or fallback if something went wrong
            let nextX, nextY;
            if (enemy.teleportTarget) {
                nextX = enemy.teleportTarget.x;
                nextY = enemy.teleportTarget.y;
                delete enemy.teleportTarget;
            } else {
                // Fallback (should normally be handled by the telegraph block)
                const angle = rng.nextRange(0, Math.PI * 2);
                const distance = rng.nextRange(80, 140);
                nextX = target.x + Math.cos(angle) * distance;
                nextY = target.y + Math.sin(angle) * distance;
                nextX = clamp(nextX, enemy.radius, ARENA_WIDTH - enemy.radius);
                nextY = clamp(nextY, enemy.radius, ARENA_HEIGHT - enemy.radius);
            }

            // Reset cooldown
            const [minCd, maxCd] = enemy.teleportCooldownRange ?? [180, 240];
            enemy.teleportCooldown = rng.nextInt(minCd, maxCd);

            // Move
            enemy.x = nextX;
            enemy.y = nextY;
            enemy.prevX = enemy.x;
            enemy.prevY = enemy.y;
        }

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
