import { normalize } from "../../utils/math.js";
import { TICK_RATE } from "../../utils/constants.js";

/**
 * Shielder - Slow enemy with a frontal shield that blocks projectiles.
 * Must be flanked or hit from behind.
 */
export const ShielderAI = {
    update(enemy, state, rng, helpers) {
        const target = helpers.getNearestPlayer(state, enemy);
        if (!target) return;

        const speed = enemy.speed * helpers.getEliteSpeedMultiplier(enemy);
        const dir = normalize(target.x - enemy.x, target.y - enemy.y);

        // Face the player (shield direction)
        enemy.facingAngle = Math.atan2(dir.y, dir.x);

        // Move toward player
        const targetVx = dir.x * speed;
        const targetVy = dir.y * speed;
        const blend = 0.1;
        enemy.vx = enemy.vx * (1 - blend) + targetVx * blend;
        enemy.vy = enemy.vy * (1 - blend) + targetVy * blend;

        enemy.x += enemy.vx / TICK_RATE;
        enemy.y += enemy.vy / TICK_RATE;

        // Fire at player
        if (enemy.fireCooldown > 0) {
            enemy.fireCooldown -= 1;
        } else if (enemy.bulletSpeed && enemy.bulletDamage) {
            helpers.spawnBullet(state, enemy, dir.x, dir.y);
            enemy.fireCooldown = enemy.fireCooldownTicks ?? 120;
        }
    },

    /**
     * Check if a bullet should be blocked by the shield.
     * Called from collision system.
     */
    shouldBlockBullet(enemy, bulletX, bulletY) {
        if (!enemy.shieldArc) return false;

        // Get angle from enemy to bullet
        const dx = bulletX - enemy.x;
        const dy = bulletY - enemy.y;
        const bulletAngle = Math.atan2(dy, dx);

        // Check if bullet is within shield arc (facing direction)
        const facingAngle = enemy.facingAngle ?? 0;
        let angleDiff = bulletAngle - facingAngle;

        // Normalize to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const halfArc = enemy.shieldArc / 2;
        return Math.abs(angleDiff) <= halfArc;
    },
};
