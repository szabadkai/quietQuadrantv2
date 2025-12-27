/** Enemy death animation - scaled down version of player defeat with enemy colors. */
import { PLAYER_RADIUS } from "../../utils/constants.js";

const ENEMY_RED = 0xf14e4e;
const ENEMY_GOLD = 0xffcc00;

export function spawnEnemyDeath(renderer, x, y) {
    // Smaller base radius than player (0.6x scale)
    const baseRadius = PLAYER_RADIUS * 2.5;
    
    // 3 white rings staggered for thicker appearance
    const steps = [
        { time: 0.0, radius: baseRadius, color: 0xffffff, duration: 0.22 },
        { time: 0.05, radius: baseRadius * 1.2, color: 0xffffff, duration: 0.2 },
        { time: 0.1, radius: baseRadius * 1.5, color: 0xffffff, duration: 0.18 },
    ].map((step) => ({
        time: step.time,
        action: () =>
            renderer.spawnRing(
                x,
                y,
                step.color,
                step.radius,
                step.duration,
                false,
                step.color
            ),
    }));

    // Fewer debris (8 vs 12)
    const debrisCount = 8;
    for (let i = 0; i < debrisCount; i++) {
        const angle = (i / debrisCount) * Math.PI * 2;
        const speed = 80 + Math.random() * 60;
        renderer.spawnRectParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: ENEMY_RED,
            size: 4,
            life: 0.35 + Math.random() * 0.15,
            fade: true,
            shrink: true,
            spin: (Math.random() - 0.5) * 5,
        });
    }

    renderer.addSequence(steps, 0.4);
}
