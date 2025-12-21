import { describe, expect, it } from "vitest";
import { GameSimulation } from "../../src/simulation/GameSimulation.js";
import { ARENA_WIDTH, ARENA_HEIGHT, PLAYER_RADIUS, TICK_RATE } from "../../src/utils/constants.js";

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
    player.bulletTtl = 10;
    player.bulletSpeed = 960;

    sim.tick({ p1: { moveX: 0, moveY: 0, aimX: 1, aimY: 0, fire: true, dash: false } });
    expect(sim.getState().bullets.length).toBe(1);

    const bullet = sim.getState().bullets[0];
    const minRange = Math.max(ARENA_WIDTH, ARENA_HEIGHT) * 1.5;
    const expectedMinTtl = Math.ceil((minRange / player.bulletSpeed) * TICK_RATE);
    expect(bullet.ttl + 1).toBeGreaterThanOrEqual(expectedMinTtl);

    for (let i = 0; i < expectedMinTtl - 2; i += 1) {
      sim.tick({});
    }
    expect(sim.getState().bullets.length).toBe(1);

    sim.tick({});
    sim.tick({});
    expect(sim.getState().bullets.length).toBe(0);
  });
});
