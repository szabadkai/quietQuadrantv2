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

    state.wave.enemiesRemaining = 1;
    const enemy = spawnEnemy(state, "mass", rng, {
      position: { x: 120, y: 120 }
    });
    enemy.health = 1;

    state.damageQueue.push({ target: "enemy", id: enemy.id, amount: 2 });
    DamageSystem.update(state, rng);

    expect(state.pickups.length).toBe(1);

    const pickup = state.pickups[0];
    const player = state.players[0];
    player.x = pickup.x;
    player.y = pickup.y;

    CollisionSystem.update(state);
    LevelSystem.update(state, rng);

    expect(player.level).toBe(2);
    expect(player.xp).toBeGreaterThanOrEqual(50);
  });
});
