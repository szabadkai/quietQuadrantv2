import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/simulation/GameState.js";
import { SeededRandom } from "../../src/utils/random.js";
import { rollUpgrades } from "../../src/simulation/UpgradeRoller.js";
import { UpgradeSystem } from "../../src/simulation/UpgradeSystem.js";


describe("UpgradeSystem", () => {
  it("applies stat upgrades to player", () => {
    const state = createInitialState(1);
    const player = state.players[0];
    const baseSpeed = player.speed;

    UpgradeSystem.applyUpgrade(state, player.id, "engine-tune");

    expect(player.speed).toBeGreaterThan(baseSpeed);
  });

  it("adds projectile count for sidecar shot", () => {
    const state = createInitialState(1);
    const player = state.players[0];

    UpgradeSystem.applyUpgrade(state, player.id, "sidecar");

    expect(player.projectileCount).toBe(2);
  });
});

describe("UpgradeRoller", () => {
  it("returns valid upgrade options", () => {
    const state = createInitialState(1);
    const rng = new SeededRandom(5);
    const options = rollUpgrades(state.players[0], rng, 3);

    expect(options.length).toBeGreaterThan(0);
    expect(new Set(options).size).toBe(options.length);
  });
});
