/** Over-the-top boss death sequence with chained shockwaves and debris. */
import { PLAYER_RADIUS } from "../../utils/constants.js";
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnBossDeath(renderer, x, y, bossRadius = PLAYER_RADIUS * 4) {
    const base = Math.max(PLAYER_RADIUS * 6, bossRadius * 2.5);
    const shock = base * 1.4;
    const emberRadius = base * 0.45;
    const particleBudget = Math.max(0, Math.min(renderer.getAvailable(), 120));
    const shardCount = Math.min(36, Math.max(18, Math.floor(particleBudget * 0.4)));
    const emberCount = Math.min(28, Math.max(12, Math.floor(particleBudget * 0.25)));

    const steps = [
        {
            time: 0,
            action: () => {
                renderer.spawnRing(x, y, 0xffffff, shock, 0.32, false, PALETTE_HEX.white);
                renderer.spawnRing(
                    x,
                    y,
                    PALETTE_HEX.boss,
                    base * 0.85,
                    0.3,
                    false,
                    PALETTE_HEX.gold
                );
                spawnShards(renderer, x, y, shardCount, base * 4.6, PALETTE_HEX.boss);
                spawnCoreSparks(renderer, x, y, particleBudget * 0.35, emberRadius);
            },
        },
        {
            time: 0.16,
            action: () => {
                renderer.spawnRing(
                    x,
                    y,
                    PALETTE_HEX.gold,
                    shock * 0.9,
                    0.28,
                    true,
                    PALETTE_HEX.white
                );
                renderer.spawnRing(x, y, PALETTE_HEX.boss, base * 1.35, 0.34, false, 0xffffff);
                spawnShards(renderer, x, y, Math.floor(shardCount * 0.65), base * 3.2, 0xffffff);
            },
        },
        {
            time: 0.32,
            action: () => {
                spawnEmbers(renderer, x, y, emberCount, emberRadius);
            },
        },
        {
            time: 0.62,
            action: () => {
                renderer.spawnRing(
                    x,
                    y,
                    0xffffff,
                    shock * 1.1,
                    0.42,
                    false,
                    PALETTE_HEX.boss
                );
            },
        },
    ];

    renderer.addSequence(steps, 1.35);
}

function spawnShards(renderer, x, y, count, speed, color) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const magnitude = speed * (0.65 + Math.random() * 0.5);
        renderer.spawnRectParticle({
            x,
            y,
            vx: Math.cos(angle) * magnitude,
            vy: Math.sin(angle) * magnitude,
            color,
            size: 5 + Math.random() * 4,
            life: 0.42 + Math.random() * 0.18,
            fade: true,
            shrink: true,
            spin: (Math.random() - 0.5) * 10,
        });
    }
}

function spawnCoreSparks(renderer, x, y, count, radius) {
    const finalCount = Math.max(8, Math.min(40, Math.floor(count)));
    for (let i = 0; i < finalCount; i++) {
        const angle = (Math.PI * 2 * i) / finalCount;
        const dist = radius * (0.4 + Math.random() * 0.3);
        renderer.spawnParticle({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 80,
            vy: (Math.random() - 0.5) * 80,
            color: i % 2 === 0 ? 0xffffff : PALETTE_HEX.boss,
            size: 4 + Math.random() * 2,
            life: 0.35 + Math.random() * 0.2,
            fade: true,
            shrink: true,
        });
    }
}

function spawnEmbers(renderer, x, y, count, radius) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * Math.random();
        const speed = 40 + Math.random() * 40;
        renderer.spawnParticle({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20,
            gravity: 60 + Math.random() * 40,
            color: i % 3 === 0 ? PALETTE_HEX.gold : PALETTE_HEX.boss,
            size: 3 + Math.random() * 2,
            life: 0.8 + Math.random() * 0.25,
            fade: true,
            shrink: true,
        });
    }
}
