/** Player defeat animation with timed red/white rings and debris. */
import { PLAYER_RADIUS } from "../../utils/constants.js";

const DEATH_RED = 0xf14e4e;
const DEATH_ACCENT = 0x9ff0ff;

export function spawnPlayerDefeat(renderer, x, y) {
    const baseRadius = PLAYER_RADIUS * 4.2;
    const steps = [
        { time: 0.0, radius: baseRadius, color: DEATH_RED, duration: 0.24 },
        {
            time: 0.1,
            radius: baseRadius * 1.4,
            color: DEATH_ACCENT,
            duration: 0.22,
        },
        {
            time: 0.2,
            radius: baseRadius * 1.8,
            color: 0xffffff,
            duration: 0.2,
        },
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

    const debrisCount = 12;
    for (let i = 0; i < debrisCount; i++) {
        const angle = (i / debrisCount) * Math.PI * 2;
        const speed = 120 + Math.random() * 100;
        renderer.spawnRectParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: DEATH_ACCENT,
            size: 6,
            life: 0.5 + Math.random() * 0.2,
            fade: true,
            shrink: true,
            spin: (Math.random() - 0.5) * 6,
        });
    }

    renderer.addSequence(steps, 0.6);
}
