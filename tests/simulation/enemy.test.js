import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/simulation/GameState.js";
import { EnemySystem, spawnEnemy } from "../../src/simulation/EnemySystem.js";
import { SeededRandom } from "../../src/utils/random.js";


describe("EnemySystem", () => {
  it("moves drifter toward nearest player", () => {
    const state = createInitialState(1);
    const rng = new SeededRandom(42);
    const player = state.players[0];
    player.x = 100;
    player.y = 100;

    const enemy = spawnEnemy(state, "drifter", rng, {
      position: { x: 200, y: 100 }
    });

    EnemySystem.update(state, rng);

    expect(enemy.x).toBeLessThan(200);
  });
});
