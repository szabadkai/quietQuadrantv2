import { spawnAimedBurst, scaledCadence } from "./bossPatternUtils.js";

export const AimedBurst = {
  update(state, boss) {
    const cadence = scaledCadence(30 - boss.phaseIndex * 4, boss);
    if (boss.patternTick % cadence !== 0) return;
    spawnAimedBurst(state, boss, 5, 0.5, 220 + boss.phaseIndex * 30);
  }
};
