import { spawnRing, scaledCadence } from "./bossPatternUtils.js";

export const Slam = {
    update(state, boss) {
        const trigger = scaledCadence(30, boss);
        if (boss.patternTick === trigger) {
            spawnRing(state, boss, 12, 160 + boss.phaseIndex * 25);
        }
    }
};
