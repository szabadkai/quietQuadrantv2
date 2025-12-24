import { normalize } from "../../../utils/math.js";
import { ENEMY_BULLET_RADIUS, TICK_RATE } from "../../../utils/constants.js";

export function spawnBossBullet(state, boss, dirX, dirY, speed = 200) {
    const dir = normalize(dirX, dirY);
    if (dir.x === 0 && dir.y === 0) return;

    const speedMultiplier = state.modifiers?.bossProjectileSpeed ?? 1;
    const bossSpeedMultiplier = boss?.projectileSpeedMultiplier ?? 1;
    const spawnX = boss.x + dir.x * (boss.radius + ENEMY_BULLET_RADIUS + 4);
    const spawnY = boss.y + dir.y * (boss.radius + ENEMY_BULLET_RADIUS + 4);

    state.bullets.push({
        id: state.nextBulletId++,
        owner: "boss",
        x: spawnX,
        y: spawnY,
        prevX: spawnX,
        prevY: spawnY,
        vx: dir.x * speed * speedMultiplier * bossSpeedMultiplier,
        vy: dir.y * speed * speedMultiplier * bossSpeedMultiplier,
        damage: 1,
        pierce: 0,
        ttl: Math.floor(TICK_RATE * 4),
        radius: ENEMY_BULLET_RADIUS,
        alive: true
    });
}

export function spawnRing(state, boss, count, speed, gapIndex = null) {
    const step = (Math.PI * 2) / count;
    for (let i = 0; i < count; i += 1) {
        if (gapIndex !== null && i === gapIndex) continue;
        const angle = step * i;
        spawnBossBullet(state, boss, Math.cos(angle), Math.sin(angle), speed);
    }
}

export function getNearestPlayer(state, boss) {
    let best = null;
    let bestDist = Infinity;
    for (const player of state.players) {
        if (!player.alive) continue;
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
            bestDist = dist;
            best = player;
        }
    }
    return best;
}

export function spawnAimedBurst(state, boss, count, spread, speed) {
    const target = getNearestPlayer(state, boss);
    if (!target) return;

    const baseAngle = Math.atan2(target.y - boss.y, target.x - boss.x);
    const step = count > 1 ? spread / (count - 1) : 0;
    const start = baseAngle - spread / 2;

    for (let i = 0; i < count; i += 1) {
        const angle = start + step * i;
        spawnBossBullet(state, boss, Math.cos(angle), Math.sin(angle), speed);
    }
}

export function scaledCadence(baseCadence, boss) {
    const multiplier = boss?.fireRateMultiplier ?? 1;
    return Math.max(1, Math.round(baseCadence / multiplier));
}
