import { spawnRing, scaledCadence } from "./bossPatternUtils.js";

export const RingWithGap = {
  update(state, boss, rng) {
    const cadence = scaledCadence(60 - boss.phaseIndex * 5, boss);
    if (boss.patternTick % cadence !== 0) return;
    const count = 16;
    const gapIndex = rng ? rng.nextInt(0, count - 1) : 0;
    spawnRing(state, boss, count, 200 + boss.phaseIndex * 20, gapIndex);
  }
};
