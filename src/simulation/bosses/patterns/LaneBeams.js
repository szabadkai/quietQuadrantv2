import { ARENA_WIDTH, ARENA_HEIGHT, ENEMY_BULLET_RADIUS, TICK_RATE } from "../../../utils/constants.js";
import { scaledCadence } from "./bossPatternUtils.js";

export const LaneBeams = {
    update(state, boss, rng) {
        if (boss.patternTick === 1) {
            boss.laneAxis = rng && rng.next() > 0.5 ? "vertical" : "horizontal";
            boss.laneOffset = rng ? rng.nextRange(-120, 120) : 0;
        }

        const cadence = scaledCadence(20 - boss.phaseIndex * 2, boss);
        if (boss.patternTick % cadence !== 0) return;

        if (boss.laneAxis === "vertical") {
            const x = clampLane(boss.x + boss.laneOffset, ENEMY_BULLET_RADIUS, ARENA_WIDTH - ENEMY_BULLET_RADIUS);
            spawnLaneBullet(state, x, 0, 0, 260, ENEMY_BULLET_RADIUS);
            spawnLaneBullet(state, x, ARENA_HEIGHT, 0, -260, ENEMY_BULLET_RADIUS);
        } else {
            const y = clampLane(boss.y + boss.laneOffset, ENEMY_BULLET_RADIUS, ARENA_HEIGHT - ENEMY_BULLET_RADIUS);
            spawnLaneBullet(state, 0, y, 260, 0, ENEMY_BULLET_RADIUS);
            spawnLaneBullet(state, ARENA_WIDTH, y, -260, 0, ENEMY_BULLET_RADIUS);
        }
    }
};

function spawnLaneBullet(state, x, y, vx, vy, radius) {
    state.bullets.push({
        id: state.nextBulletId++,
        owner: "boss",
        x,
        y,
        prevX: x,
        prevY: y,
        vx,
        vy,
        damage: 1,
        pierce: 0,
        ttl: Math.floor(TICK_RATE * 4),
        radius,
        alive: true
    });
}

function clampLane(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
