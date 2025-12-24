import { spawnEnemy } from "../../EnemySystem.js";

export const SummonMinions = {
    update(state, boss, rng) {
        if (boss.patternTick !== 1) return;
        const count = 3 + boss.phaseIndex;
        for (let i = 0; i < count; i += 1) {
            spawnEnemy(state, "drifter", rng, {
                position: {
                    x: boss.x + (rng.nextRange(-80, 80)),
                    y: boss.y + (rng.nextRange(-80, 80))
                }
            });
            state.wave.enemiesRemaining += 1;
        }
    }
};
