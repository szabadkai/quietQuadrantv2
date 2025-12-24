import { spawnRing, scaledCadence } from "./bossPatternUtils.js";

export const RicochetShards = {
    update(state, boss) {
        const cadence = scaledCadence(40 - boss.phaseIndex * 3, boss);
        if (boss.patternTick % cadence !== 0) return;
        spawnRing(state, boss, 10, 260 + boss.phaseIndex * 30);
    }
};
