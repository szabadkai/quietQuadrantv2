import { spawnBossBullet, scaledCadence } from "./bossPatternUtils.js";

export const BeamSpin = {
  update(state, boss) {
    const cadence = scaledCadence(6, boss);
    if (boss.patternTick % cadence !== 0) return;
    const angle = boss.patternTick * 0.12 + boss.phaseIndex * 0.6;
    const speed = 200 + boss.phaseIndex * 30;
    spawnBossBullet(state, boss, Math.cos(angle), Math.sin(angle), speed);
  }
};
