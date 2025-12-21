import { spawnRing, scaledCadence } from "./bossPatternUtils.js";

export const PulseRing = {
  update(state, boss) {
    const cadence = scaledCadence(50 - boss.phaseIndex * 4, boss);
    if (boss.patternTick % cadence !== 0) return;
    spawnRing(state, boss, 18, 190 + boss.phaseIndex * 20);
  }
};
