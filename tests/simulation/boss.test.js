import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/simulation/GameState.js";
import { BossSystem } from "../../src/simulation/BossSystem.js";
import { SeededRandom } from "../../src/utils/random.js";

describe("BossSystem", () => {
    it("spawns a boss and advances phase on low health", () => {
        const state = createInitialState(1);
        const rng = new SeededRandom(3);

        const boss = BossSystem.spawnBoss(state, rng, "sentinel");
        expect(state.phase).toBe("boss");
        expect(boss).toBeTruthy();

        boss.health = boss.maxHealth * 0.3;
        BossSystem.update(state, rng);

        expect(boss.phaseIndex).toBeGreaterThan(0);
    });
});
