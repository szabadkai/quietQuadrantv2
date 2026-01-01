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
        expect(boss.phases.length).toBe(4);
        expect(boss.phaseModifiers).toBeTruthy();

        // Verify initial phase stats
        const initialSpeed = boss.speed;
        
        // Drop to 70% health (should trigger phase 2)
        boss.health = boss.maxHealth * 0.7;
        BossSystem.update(state, rng);
        expect(boss.phaseIndex).toBe(1);
        expect(boss.speed).toBeGreaterThan(initialSpeed);
        
        // Drop to 40% health (should trigger phase 3)
        boss.health = boss.maxHealth * 0.4;
        BossSystem.update(state, rng);
        expect(boss.phaseIndex).toBe(2);
        
        // Drop to 20% health (should trigger phase 4)
        boss.health = boss.maxHealth * 0.2;
        BossSystem.update(state, rng);
        expect(boss.phaseIndex).toBe(3);
    });
});
