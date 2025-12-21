import { describe, expect, it } from "vitest";
import { GameSimulation } from "../../src/simulation/GameSimulation.js";
import { SeededRandom } from "../../src/utils/random.js";

function buildInputs(ticks, seed) {
  const rng = new SeededRandom(seed);
  const inputs = [];

  for (let i = 0; i < ticks; i += 1) {
    inputs.push({
      p1: {
        moveX: rng.nextRange(-1, 1),
        moveY: rng.nextRange(-1, 1),
        aimX: rng.nextRange(-1, 1),
        aimY: rng.nextRange(-1, 1),
        fire: rng.next() > 0.6,
        dash: false
      }
    });
  }

  return inputs;
}

describe("Simulation determinism", () => {
  it("produces identical results with same seed and inputs", () => {
    const seed = 1337;
    const ticks = 120;
    const inputs = buildInputs(ticks, 42);

    const sim1 = new GameSimulation(seed);
    const sim2 = new GameSimulation(seed);

    for (let i = 0; i < ticks; i += 1) {
      sim1.tick(inputs[i]);
      sim2.tick(inputs[i]);
    }

    expect(sim1.getState()).toEqual(sim2.getState());
  });
});
