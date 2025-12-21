import { WAVES } from "../config/waves.js";
import { spawnEnemy } from "./EnemySystem.js";
import { BossSystem } from "./BossSystem.js";

export const WaveSystem = {
    update(state, rng) {
        if (state.phase === "pregame") {
            this.beginWave(state, rng);
            return;
        }

        if (state.phase === "intermission") {
            state.wave.intermission -= 1;
            if (state.wave.intermission <= 0) {
                this.beginWave(state, rng);
            }
            return;
        }

        if (state.phase !== "wave") return;

        if (state.wave.spawnQueue.length > 0) {
            if (state.wave.spawnCooldown > 0) {
                state.wave.spawnCooldown -= 1;
            } else {
                const groupSize = rng.nextInt(3, 5);
                for (let i = 0; i < groupSize; i += 1) {
                    const next = state.wave.spawnQueue.shift();
                    if (!next) break;
                    spawnEnemy(state, next.kind, rng, { elite: next.elite });
                }
                state.wave.spawnCooldown = 120;
            }
        } else if (
            state.wave.enemiesRemaining <= 0 &&
            state.enemies.length === 0
        ) {
            state.wave.current += 1;
            if (state.wave.current >= WAVES.length - 1) {
                BossSystem.spawnBoss(state, rng);
                return;
            }

            state.phase = "intermission";
            state.wave.intermission = 180;
        }
    },

    beginWave(state, rng) {
        const waveConfig = WAVES[state.wave.current];
        if (!waveConfig) {
            state.phase = "ended";
            return;
        }

        if (waveConfig.id === "boss") {
            BossSystem.spawnBoss(state, rng);
            return;
        }

        state.phase = "wave";
        state.wave.spawnQueue = this.buildSpawnQueue(waveConfig, state, rng);
        state.wave.enemiesRemaining = state.wave.spawnQueue.length;
        state.wave.spawnCooldown = 0;

        // Emit wave-start event for sound effects
        state.events.push({
            type: "wave-start",
            waveNumber: state.wave.current,
        });
    },

    buildSpawnQueue(waveConfig, state, rng) {
        const queue = [];
        for (const entry of waveConfig.enemies) {
            const count = Math.round(entry.count * (entry.countScale ?? 1));
            const modifier = state.modifiers?.enemyCount ?? 1;
            const finalCount = Math.max(1, Math.round(count * modifier));
            for (let i = 0; i < finalCount; i += 1) {
                queue.push({ kind: entry.kind, elite: entry.elite ?? false });
            }
        }

        shuffle(queue, rng);
        return queue;
    },
};

function shuffle(list, rng) {
    for (let i = list.length - 1; i > 0; i -= 1) {
        const j = rng.nextInt(0, i);
        [list[i], list[j]] = [list[j], list[i]];
    }
}
