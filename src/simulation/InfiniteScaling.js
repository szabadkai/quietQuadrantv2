/**
 * Infinite mode difficulty scaling system.
 * Handles wave cycling, stat scaling, and endless progression.
 */

const BASE_SCALING = {
    healthPerCycle: 0.1,
    speedPerCycle: 0.05,
    elitesPerCycle: 1,
    damagePerCycle: 0.05,
};

const BOSS_INTERVAL = 10;

export const InfiniteScaling = {
    isInfiniteMode(state) {
        return state.mode === "infinite";
    },

    getCycle(wave) {
        return Math.floor((wave - 1) / 10);
    },

    getScaledWave(wave) {
        return ((wave - 1) % 10) + 1;
    },

    getHealthMultiplier(wave) {
        const cycle = this.getCycle(wave);
        return 1 + cycle * BASE_SCALING.healthPerCycle;
    },

    getSpeedMultiplier(wave) {
        const cycle = this.getCycle(wave);
        return 1 + cycle * BASE_SCALING.speedPerCycle;
    },

    getDamageMultiplier(wave) {
        const cycle = this.getCycle(wave);
        return 1 + cycle * BASE_SCALING.damagePerCycle;
    },

    getExtraElites(wave) {
        const cycle = this.getCycle(wave);
        return cycle * BASE_SCALING.elitesPerCycle;
    },

    shouldSpawnBoss(wave) {
        return wave > 0 && wave % BOSS_INTERVAL === 0;
    },

    applyScaling(enemyConfig, wave) {
        const healthMult = this.getHealthMultiplier(wave);
        const speedMult = this.getSpeedMultiplier(wave);
        const damageMult = this.getDamageMultiplier(wave);

        return {
            ...enemyConfig,
            health: Math.round(enemyConfig.health * healthMult),
            speed: enemyConfig.speed * speedMult,
            damage: Math.round((enemyConfig.damage ?? 1) * damageMult),
        };
    },

    getWaveConfig(baseWaveConfig, wave) {
        if (!baseWaveConfig) return null;

        const scaledWave = this.getScaledWave(wave);
        const extraElites = this.getExtraElites(wave);
        const cycle = this.getCycle(wave);

        const config = { ...baseWaveConfig };

        if (config.enemies) {
            config.enemies = config.enemies.map((enemy) => ({
                ...enemy,
                elite:
                    enemy.elite || (cycle > 0 && Math.random() < 0.1 * cycle),
            }));

            for (let i = 0; i < extraElites && i < config.enemies.length; i++) {
                const idx = Math.floor(Math.random() * config.enemies.length);
                config.enemies[idx] = { ...config.enemies[idx], elite: true };
            }
        }

        if (cycle > 0) {
            const extraCount = Math.floor(cycle * 1.5);
            for (let i = 0; i < extraCount; i++) {
                const types = ["drifter", "watcher", "phantom", "orbiter"];
                const type = types[Math.floor(Math.random() * types.length)];
                config.enemies = config.enemies || [];
                config.enemies.push({
                    type,
                    elite: Math.random() < 0.2 * cycle,
                });
            }
        }

        return config;
    },

    getBossScaling(wave) {
        const cycle = this.getCycle(wave);
        return {
            healthMultiplier: 1 + cycle * 0.15,
            speedMultiplier: 1 + cycle * 0.05,
            damageMultiplier: 1 + cycle * 0.1,
        };
    },

    getXPMultiplier(wave) {
        const cycle = this.getCycle(wave);
        return 1 + cycle * 0.1;
    },

    getDifficultyLabel(wave) {
        const cycle = this.getCycle(wave);
        if (cycle === 0) return "";
        if (cycle === 1) return "Hard";
        if (cycle === 2) return "Very Hard";
        if (cycle === 3) return "Nightmare";
        if (cycle === 4) return "Insane";
        return `Cycle ${cycle + 1}`;
    },

    getScoreMultiplier(wave) {
        const cycle = this.getCycle(wave);
        return 1 + cycle * 0.25;
    },
};
