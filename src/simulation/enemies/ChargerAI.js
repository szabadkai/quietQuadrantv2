import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

/**
 * Charger - Fast enemy that periodically charges at the player.
 * Pauses briefly, telegraphs, then rushes forward at high speed.
 */
export const ChargerAI = {
    update(enemy, state, rng, helpers) {
        const target = helpers.getNearestPlayer(state, enemy);
        if (!target) return;

        // Initialize charge state
        if (enemy.chargeState === undefined) {
            enemy.chargeState = "stalking";
            enemy.chargeCooldown = enemy.chargeCooldown ?? 90;
            enemy.chargeTimer = rng.nextInt(30, enemy.chargeCooldown);
        }

        const baseSpeed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);

        if (enemy.chargeState === "stalking") {
            // Move toward player slowly
            const dir = normalize(target.x - enemy.x, target.y - enemy.y);
            const stalkSpeed = baseSpeed * 0.5;

            enemy.vx = enemy.vx * 0.9 + dir.x * stalkSpeed * 0.1;
            enemy.vy = enemy.vy * 0.9 + dir.y * stalkSpeed * 0.1;

            enemy.chargeTimer -= 1;
            if (enemy.chargeTimer <= 0) {
                enemy.chargeState = "telegraph";
                enemy.chargeTimer = 20; // Brief pause before charge
                // Lock in charge direction
                enemy.chargeDir = normalize(
                    target.x - enemy.x,
                    target.y - enemy.y
                );

                state.events.push({
                    type: "charger-telegraph",
                    enemyId: enemy.id,
                    x: enemy.x,
                    y: enemy.y,
                    dirX: enemy.chargeDir.x,
                    dirY: enemy.chargeDir.y,
                });
            }
        } else if (enemy.chargeState === "telegraph") {
            // Pause and shake before charging
            enemy.vx *= 0.8;
            enemy.vy *= 0.8;
            enemy.chargeTimer -= 1;

            if (enemy.chargeTimer <= 0) {
                enemy.chargeState = "charging";
                enemy.chargeTimer = enemy.chargeDuration ?? 30;
            }
        } else if (enemy.chargeState === "charging") {
            // Rush forward at high speed
            const chargeSpeed = enemy.chargeSpeed ?? 350;
            enemy.vx = enemy.chargeDir.x * chargeSpeed;
            enemy.vy = enemy.chargeDir.y * chargeSpeed;

            enemy.chargeTimer -= 1;
            if (enemy.chargeTimer <= 0) {
                enemy.chargeState = "stalking";
                enemy.chargeTimer = enemy.chargeCooldown ?? 90;
            }
        }

        enemy.x += enemy.vx / TICK_RATE;
        enemy.y += enemy.vy / TICK_RATE;
    },
};
