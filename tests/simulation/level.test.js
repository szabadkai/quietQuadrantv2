import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/simulation/GameState.js";
import { SeededRandom } from "../../src/utils/random.js";
import { spawnEnemy } from "../../src/simulation/EnemySystem.js";
import { DamageSystem } from "../../src/simulation/DamageSystem.js";
import { CollisionSystem } from "../../src/simulation/CollisionSystem.js";
import { LevelSystem } from "../../src/simulation/LevelSystem.js";

describe("LevelSystem", () => {
    it("levels up after collecting enough XP", () => {
        const state = createInitialState(1);
        const rng = new SeededRandom(5);

        const enemyCount = 5;
        state.wave.enemiesRemaining = enemyCount;

        for (let i = 0; i < enemyCount; i += 1) {
            const enemy = spawnEnemy(state, "mass", rng, {
                position: { x: 120 + i * 5, y: 120 }
            });
            enemy.health = 1;
            state.damageQueue.push({
                target: "enemy",
                id: enemy.id,
                amount: 2
            });
        }

        DamageSystem.update(state, rng);

        expect(state.pickups.length).toBe(enemyCount);

        const player = state.players[0];
        player.x = state.pickups[0].x;
        player.y = state.pickups[0].y;

        for (const pickup of state.pickups) {
            pickup.x = player.x;
            pickup.y = player.y;
        }

        CollisionSystem.update(state);
        LevelSystem.update(state, rng);

        expect(player.level).toBe(2);
        expect(player.xp).toBeGreaterThanOrEqual(50);
    });
});
