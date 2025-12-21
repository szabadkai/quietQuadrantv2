import { spawnAimedBurst, scaledCadence } from "./bossPatternUtils.js";

export const ConeVolley = {
  update(state, boss) {
    const cadence = scaledCadence(24 - boss.phaseIndex * 3, boss);
    if (boss.patternTick % cadence !== 0) return;
    spawnAimedBurst(state, boss, 7, 0.9, 210 + boss.phaseIndex * 25);
  }
};
