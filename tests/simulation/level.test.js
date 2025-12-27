import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/simulation/GameState.js";
import { SeededRandom } from "../../src/utils/random.js";
import { LevelSystem } from "../../src/simulation/LevelSystem.js";

describe("LevelSystem", () => {
    it("rolls upgrades when a player has pending upgrades", () => {
        const state = createInitialState(1);
        const rng = new SeededRandom(5);
        // Use valid IDs from upgrades.json
        state.unlockedUpgrades = ["power-shot", "rapid-fire", "engine-tune", "plating"];

        const player = state.players[0];
        player.pendingUpgrades = 1;

        LevelSystem.update(state, rng);

        expect(player.pendingUpgrades).toBe(0);
        expect(state.pendingUpgrade).not.toBeNull();
        expect(state.pendingUpgrade.playerId).toBe(player.id);
        expect(state.pendingUpgrade.options.length).toBeGreaterThan(0);
    });

    it("does not roll upgrades during boss death animation", () => {
        const state = createInitialState(1);
        const rng = new SeededRandom(5);
        state.bossDeathTimer = 100;

        const player = state.players[0];
        player.pendingUpgrades = 1;

        LevelSystem.update(state, rng);

        expect(state.pendingUpgrade).toBeNull();
        expect(player.pendingUpgrades).toBe(1);
    });
});
