import { describe, expect, it } from "vitest";
import { GameSimulation } from "../../src/simulation/GameSimulation.js";
import { ARENA_WIDTH, PLAYER_RADIUS } from "../../src/utils/constants.js";

const MOVE_RIGHT = { p1: { moveX: 1, moveY: 0, aimX: 1, aimY: 0, fire: false, dash: false } };

describe("PlayerSystem", () => {
  it("clamps movement to arena bounds", () => {
    const sim = new GameSimulation(1);
    const player = sim.getState().players[0];
    player.x = ARENA_WIDTH - PLAYER_RADIUS + 10;

    sim.tick(MOVE_RIGHT);

    expect(player.x).toBeLessThanOrEqual(ARENA_WIDTH - PLAYER_RADIUS);
  });

  it("spawns bullets and respects TTL", () => {
    const sim = new GameSimulation(1);
    const player = sim.getState().players[0];
    player.bulletTtl = 2;
    player.bulletSpeed = 0;

    sim.tick({ p1: { moveX: 0, moveY: 0, aimX: 1, aimY: 0, fire: true, dash: false } });
    expect(sim.getState().bullets.length).toBe(1);

    sim.tick({});
    sim.tick({});
    sim.tick({});

    expect(sim.getState().bullets.length).toBe(0);
  });
});
