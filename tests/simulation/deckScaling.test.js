import { describe, it, expect } from "vitest";
import { DeckScaling } from "../../src/simulation/DeckScaling.js";
import { GameSimulation } from "../../src/simulation/GameSimulation.js";
import { INITIAL_UNLOCKED_UPGRADES } from "../../src/state/metaStoreUtils.js";

describe("DeckScaling", () => {
    describe("calculateScaling", () => {
        it("returns 1x multipliers for fresh player", () => {
            const scaling = DeckScaling.calculateScaling(
                {},
                INITIAL_UNLOCKED_UPGRADES
            );
            expect(scaling.enemyHealth).toBe(1);
            expect(scaling.bossHealth).toBe(1);
        });

        it("increases enemy health based on card boosts", () => {
            const cardBoosts = {
                "power-shot": 3,
                "rapid-fire": 2,
            };
            const scaling = DeckScaling.calculateScaling(
                cardBoosts,
                INITIAL_UNLOCKED_UPGRADES
            );
            // 5 total boost levels * 6% = 30% increase
            expect(scaling.enemyHealth).toBeCloseTo(1.3, 2);
        });

        it("increases boss health more than enemy health", () => {
            const cardBoosts = {
                "power-shot": 5,
                "rapid-fire": 5,
            };
            const scaling = DeckScaling.calculateScaling(
                cardBoosts,
                INITIAL_UNLOCKED_UPGRADES
            );
            // 10 boost levels: enemy +60%, boss +80%
            expect(scaling.enemyHealth).toBeCloseTo(1.6, 2);
            expect(scaling.bossHealth).toBeCloseTo(1.8, 2);
        });

        it("increases health based on unlocked upgrades", () => {
            const extraUpgrades = [
                ...INITIAL_UNLOCKED_UPGRADES,
                "heatseeker",
                "split-shot",
            ];
            const scaling = DeckScaling.calculateScaling({}, extraUpgrades);
            // 2 extra unlocks: enemy +24%, boss +30%
            expect(scaling.enemyHealth).toBeCloseTo(1.24, 2);
            expect(scaling.bossHealth).toBeCloseTo(1.3, 2);
        });

        it("combines boost and unlock scaling", () => {
            const cardBoosts = { "power-shot": 1 };
            const extraUpgrades = [...INITIAL_UNLOCKED_UPGRADES, "heatseeker"];
            const scaling = DeckScaling.calculateScaling(
                cardBoosts,
                extraUpgrades
            );
            // 1 boost (6%) + 1 unlock (12%) = 18%
            expect(scaling.enemyHealth).toBeCloseTo(1.18, 2);
        });

        it("caps scaling at maximum values", () => {
            // Simulate maxed out collection
            const cardBoosts = {};
            for (let i = 0; i < 30; i++) {
                cardBoosts[`upgrade-${i}`] = 5;
            }
            const manyUpgrades = Array(50).fill("upgrade");

            const scaling = DeckScaling.calculateScaling(
                cardBoosts,
                manyUpgrades
            );
            expect(scaling.enemyHealth).toBe(4.0); // Capped at +300%
            expect(scaling.bossHealth).toBe(5.0); // Capped at +400%
        });
    });

    describe("applyToState", () => {
        it("applies scaling to game state modifiers", () => {
            const sim = new GameSimulation({ seed: 1 });
            const state = sim.getState();

            // Reset modifiers to 1 for clean test
            state.modifiers.enemyHealth = 1;
            state.modifiers.bossHealth = 1;

            const cardBoosts = { "power-shot": 1 };
            const upgrades = [...INITIAL_UNLOCKED_UPGRADES, "heatseeker"];

            DeckScaling.applyToState(state, cardBoosts, upgrades);

            // 1 boost (6%) + 1 unlock (12%) = 18%
            expect(state.modifiers.enemyHealth).toBeCloseTo(1.18, 2);
            expect(state.deckScaling).toBeDefined();
            expect(state.deckScaling.totalBoostLevels).toBe(1);
            expect(state.deckScaling.extraUnlocks).toBe(1);
        });

        it("multiplies with existing modifiers", () => {
            const sim = new GameSimulation({ seed: 1 });
            const state = sim.getState();

            // Simulate an affix that already increased enemy health
            state.modifiers.enemyHealth = 1.2;
            state.modifiers.bossHealth = 1.3;

            const cardBoosts = { "power-shot": 5 }; // 30% boost
            DeckScaling.applyToState(
                state,
                cardBoosts,
                INITIAL_UNLOCKED_UPGRADES
            );

            // 1.2 * 1.30 = 1.56
            expect(state.modifiers.enemyHealth).toBeCloseTo(1.56, 2);
        });
    });

    describe("getDifficultyLabel", () => {
        it("returns empty string for fresh player", () => {
            const label = DeckScaling.getDifficultyLabel(
                {},
                INITIAL_UNLOCKED_UPGRADES
            );
            expect(label).toBe("");
        });

        it("returns Scaled after first boss kill", () => {
            // First boss gives 1 unlock = 12% scaling
            const upgrades = [...INITIAL_UNLOCKED_UPGRADES, "heatseeker"];
            const label = DeckScaling.getDifficultyLabel({}, upgrades);
            expect(label).toBe("Scaled");
        });

        it("returns Master for max progression", () => {
            const cardBoosts = {};
            for (let i = 0; i < 30; i++) {
                cardBoosts[`upgrade-${i}`] = 5;
            }
            const label = DeckScaling.getDifficultyLabel(
                cardBoosts,
                INITIAL_UNLOCKED_UPGRADES
            );
            expect(label).toBe("Master");
        });
    });

    describe("GameSimulation integration", () => {
        it("applies deck scaling during initialization", () => {
            const cardBoosts = { "power-shot": 5, "rapid-fire": 5 };
            const unlockedUpgrades = [
                ...INITIAL_UNLOCKED_UPGRADES,
                "heatseeker",
                "split-shot",
            ];

            const sim = new GameSimulation({
                seed: 1,
                cardBoosts,
                unlockedUpgrades,
            });

            const state = sim.getState();
            // 10 boosts (60%) + 2 unlocks (24%) = 84% enemy health increase
            expect(state.modifiers.enemyHealth).toBeCloseTo(1.84, 2);
            expect(state.deckScaling).toBeDefined();
        });
    });

    describe("getScaledEnemies", () => {
        it("returns no enemies for fresh player", () => {
            const enemies = DeckScaling.getScaledEnemies(0, 1);
            expect(enemies).toHaveLength(0);
        });

        it("returns chargers after first boss kill", () => {
            // progressionScore of 1 unlocks charger
            const enemies = DeckScaling.getScaledEnemies(1, 1);
            expect(enemies.length).toBeGreaterThan(0);
            expect(enemies.some((e) => e.kind === "charger")).toBe(true);
        });

        it("returns more enemy types with higher progression", () => {
            // progressionScore of 5 unlocks charger, shielder, bomber
            const enemies = DeckScaling.getScaledEnemies(5, 5);
            const types = new Set(enemies.map((e) => e.kind));
            expect(types.has("charger")).toBe(true);
            expect(types.has("shielder")).toBe(true);
            expect(types.has("bomber")).toBe(true);
        });

        it("spawns more enemies in later waves", () => {
            const wave1 = DeckScaling.getScaledEnemies(3, 1);
            const wave9 = DeckScaling.getScaledEnemies(3, 9);
            expect(wave9.length).toBeGreaterThan(wave1.length);
        });
    });

    describe("elite chance scaling", () => {
        it("increases elite chance with progression", () => {
            const fresh = DeckScaling.calculateScaling(
                {},
                INITIAL_UNLOCKED_UPGRADES
            );
            expect(fresh.eliteChance).toBe(1);

            const progressed = DeckScaling.calculateScaling(
                { "power-shot": 5 },
                [...INITIAL_UNLOCKED_UPGRADES, "heatseeker"]
            );
            // 6 progression points * 8% = 48% increase
            expect(progressed.eliteChance).toBeCloseTo(1.48, 2);
        });
    });
});
