import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

/**
 * Bomber - Enemy that explodes on death, dealing area damage.
 * Moves steadily toward the player.
 */
export const BomberAI = {
    update(enemy, state, _rng, helpers) {
        const target = helpers.getNearestPlayer(state, enemy);
        if (!target) return;

        const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);
        const dir = normalize(target.x - enemy.x, target.y - enemy.y);

        // Blend AI velocity with external forces
        const targetVx = dir.x * speed;
        const targetVy = dir.y * speed;
        const blend = 0.12;
        enemy.vx = enemy.vx * (1 - blend) + targetVx * blend;
        enemy.vy = enemy.vy * (1 - blend) + targetVy * blend;

        enemy.x += enemy.vx / TICK_RATE;
        enemy.y += enemy.vy / TICK_RATE;

        // Pulsing effect when low health (visual telegraph)
        if (enemy.health <= enemy.maxHealth * 0.3) {
            enemy.aboutToExplode = true;
        }
    },

    /**
     * Called when bomber dies - creates explosion.
     */
    onDeath(enemy, state) {
        const radius = enemy.explosionRadius ?? 60;
        const damage = enemy.explosionDamage ?? 2;

        // Damage nearby players
        for (const player of state.players) {
            if (!player.alive) continue;
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= radius + player.radius) {
                state.damageQueue.push({
                    targetType: "player",
                    targetId: player.id,
                    damage,
                    sourceType: "bomber-explosion",
                });
            }
        }

        // Visual event
        state.events.push({
            type: "bomber-explosion",
            x: enemy.x,
            y: enemy.y,
            radius,
        });
    },
};
