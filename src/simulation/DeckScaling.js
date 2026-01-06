/**
 * DeckScaling - Scales game difficulty based on player's meta-progression.
 *
 * As players accumulate card boosts and unlock more upgrades, enemies and
 * bosses become proportionally stronger to maintain challenge.
 * Also unlocks new enemy types and increases elite spawn rates.
 */

import { INITIAL_UNLOCKED_UPGRADES } from "../state/metaStoreUtils.js";
import { SCALED_ENEMIES } from "../config/enemies.js";

// Scaling constants - steep curve, noticeable from first boss kill
const SCALING = {
    // Each card boost level adds this much to enemy/boss stats
    healthPerBoostLevel: 0.06, // +6% enemy HP per boost level
    bossHealthPerBoostLevel: 0.08, // +8% boss HP per boost level

    // Each unlocked upgrade beyond the starting 9 adds difficulty
    healthPerUnlock: 0.12, // +12% enemy HP per unlocked upgrade
    bossHealthPerUnlock: 0.15, // +15% boss HP per unlocked upgrade

    // Elite chance scaling
    eliteChancePerProgression: 0.08, // +8% elite chance per progression point

    // Caps to prevent extreme scaling
    maxHealthMultiplier: 4.0, // Cap at +300% enemy HP
    maxBossHealthMultiplier: 5.0, // Cap at +400% boss HP
    maxEliteChance: 3.0, // Cap at 3x elite chance
};

export const DeckScaling = {
    /**
     * Calculate difficulty modifiers based on card collection state.
     * @param {Object} cardBoosts - Map of upgradeId -> boost level (0-5)
     * @param {string[]} unlockedUpgrades - Array of unlocked upgrade IDs
     * @returns {Object} Modifier adjustments to apply
     */
    calculateScaling(cardBoosts = {}, unlockedUpgrades = []) {
        // Count total boost levels across all cards
        const totalBoostLevels = Object.values(cardBoosts).reduce(
            (sum, level) => sum + (level ?? 0),
            0
        );

        // Count upgrades beyond the starting set
        const startingCount = INITIAL_UNLOCKED_UPGRADES.length;
        const currentCount = unlockedUpgrades?.length ?? startingCount;
        const extraUnlocks = Math.max(0, currentCount - startingCount);

        // Combined progression score (used for enemy unlocks)
        const progressionScore = totalBoostLevels + extraUnlocks;

        // Calculate health multipliers
        const boostHealthBonus = totalBoostLevels * SCALING.healthPerBoostLevel;
        const unlockHealthBonus = extraUnlocks * SCALING.healthPerUnlock;
        const enemyHealthMult = Math.min(
            SCALING.maxHealthMultiplier,
            1 + boostHealthBonus + unlockHealthBonus
        );

        const boostBossBonus =
            totalBoostLevels * SCALING.bossHealthPerBoostLevel;
        const unlockBossBonus = extraUnlocks * SCALING.bossHealthPerUnlock;
        const bossHealthMult = Math.min(
            SCALING.maxBossHealthMultiplier,
            1 + boostBossBonus + unlockBossBonus
        );

        // Elite chance multiplier
        const eliteChanceMult = Math.min(
            SCALING.maxEliteChance,
            1 + progressionScore * SCALING.eliteChancePerProgression
        );

        // Determine which scaled enemies are unlocked
        const unlockedEnemyTypes = SCALED_ENEMIES.filter(
            (e) => progressionScore >= e.threshold
        ).map((e) => e.type);

        return {
            enemyHealth: enemyHealthMult,
            bossHealth: bossHealthMult,
            eliteChance: eliteChanceMult,
            unlockedEnemyTypes,
            progressionScore,
            _debug: {
                totalBoostLevels,
                extraUnlocks,
                progressionScore,
                enemyHealthBonus: enemyHealthMult - 1,
                bossHealthBonus: bossHealthMult - 1,
                eliteChanceBonus: eliteChanceMult - 1,
                unlockedEnemyTypes,
            },
        };
    },

    /**
     * Apply deck-based scaling to game state modifiers.
     * @param {Object} state - Game state with modifiers
     * @param {Object} cardBoosts - Map of upgradeId -> boost level
     * @param {string[]} unlockedUpgrades - Array of unlocked upgrade IDs
     */
    applyToState(state, cardBoosts, unlockedUpgrades) {
        const scaling = this.calculateScaling(cardBoosts, unlockedUpgrades);

        // Multiply with existing modifiers (stacks with affixes)
        state.modifiers.enemyHealth *= scaling.enemyHealth;
        state.modifiers.bossHealth *= scaling.bossHealth;
        state.modifiers.eliteChance *= scaling.eliteChance;

        // Store scaling info for wave system to use
        state.deckScaling = {
            ...scaling._debug,
            unlockedEnemyTypes: scaling.unlockedEnemyTypes,
        };
    },

    /**
     * Get enemies to inject into a wave based on progression.
     * @param {number} progressionScore - Combined boosts + unlocks
     * @param {number} waveNumber - Current wave (1-10)
     * @returns {Array} Additional enemies to spawn
     */
    getScaledEnemies(progressionScore, waveNumber) {
        const extras = [];

        for (const scaled of SCALED_ENEMIES) {
            if (progressionScore < scaled.threshold) continue;

            // More enemies spawn in later waves
            const waveMultiplier = Math.floor(waveNumber / 3);
            // More enemies spawn with higher progression
            const progMultiplier = Math.floor(
                (progressionScore - scaled.threshold) / 2
            );
            const count = 1 + waveMultiplier + progMultiplier;

            // Cap per type per wave
            const cappedCount = Math.min(count, 4);

            for (let i = 0; i < cappedCount; i++) {
                // Higher progression = more elites
                const eliteChance = 0.1 + progressionScore * 0.05;
                extras.push({
                    kind: scaled.type,
                    elite: Math.random() < eliteChance,
                });
            }
        }

        return extras;
    },

    /**
     * Get a human-readable difficulty label based on scaling.
     */
    getDifficultyLabel(cardBoosts = {}, unlockedUpgrades = []) {
        const scaling = this.calculateScaling(cardBoosts, unlockedUpgrades);
        const totalBonus = scaling.enemyHealth - 1;

        if (totalBonus < 0.05) return "";
        if (totalBonus < 0.25) return "Scaled";
        if (totalBonus < 0.6) return "Veteran";
        if (totalBonus < 1.2) return "Elite";
        return "Master";
    },
};
