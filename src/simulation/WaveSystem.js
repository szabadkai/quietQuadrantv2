import { WAVES } from "../config/waves.js";
import { BOSSES } from "../config/bosses.js";
import { spawnEnemy } from "./EnemySystem.js";
import { BossSystem } from "./BossSystem.js";
import { DeckScaling } from "./DeckScaling.js";

/**
 * Get the boss ID to spawn. Uses explicit bossId from config if available,
 * otherwise falls back to seed-based deterministic selection.
 */
function getBossId(state) {
    if (state.bossId) return state.bossId;
    // Fallback: calculate from seed for backwards compatibility
    const index = Math.abs(state.seed) % BOSSES.length;
    return BOSSES[index].id;
}

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
                const bossId = getBossId(state);
                BossSystem.spawnBoss(state, rng, bossId);
                return;
            }

            state.phase = "intermission";
            state.wave.intermission = 180;

            // Emit intermission events for UI and audio
            state.events.push({
                type: "wave-cleared",
                wave: state.wave.current - 1,
            });
            state.events.push({
                type: "wave-intermission",
                nextWave: state.wave.current,
            });

            // Grant upgrade after wave completion
            for (const player of state.players) {
                if (player.alive) {
                    player.pendingUpgrades += 1;
                }
            }
        }
    },

    beginWave(state, rng) {
        const waveConfig = WAVES[state.wave.current];
        if (!waveConfig) {
            state.phase = "ended";
            return;
        }

        if (waveConfig.id === "boss") {
            const bossId = getBossId(state);
            BossSystem.spawnBoss(state, rng, bossId);
            return;
        }

        state.phase = "wave";
        state.wave.spawnQueue = this.buildSpawnQueue(waveConfig, state, rng);
        state.wave.enemiesRemaining = state.wave.spawnQueue.length;
        state.wave.spawnCooldown = 0;
    },

    buildSpawnQueue(waveConfig, state, rng) {
        const queue = [];
        const eliteChanceMult = state.modifiers?.eliteChance ?? 1;

        for (const entry of waveConfig.enemies) {
            const count = Math.round(entry.count * (entry.countScale ?? 1));
            const modifier = state.modifiers?.enemyCount ?? 1;
            const finalCount = Math.max(1, Math.round(count * modifier));
            for (let i = 0; i < finalCount; i += 1) {
                // Apply elite chance multiplier from deck scaling
                let isElite = entry.elite ?? false;
                if (!isElite && eliteChanceMult > 1) {
                    // Base 5% chance, scaled by modifier
                    isElite = rng.next() < 0.05 * eliteChanceMult;
                }
                queue.push({ kind: entry.kind, elite: isElite });
            }
        }

        // Inject scaled enemies based on deck progression
        const progressionScore = state.deckScaling?.progressionScore ?? 0;
        if (progressionScore > 0) {
            const waveNumber = state.wave.current + 1;
            const scaledEnemies = DeckScaling.getScaledEnemies(
                progressionScore,
                waveNumber
            );
            for (const enemy of scaledEnemies) {
                queue.push(enemy);
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
