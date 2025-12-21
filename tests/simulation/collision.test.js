import { describe, expect, it } from "vitest";
import { CollisionSystem } from "../../src/simulation/CollisionSystem.js";

function createState() {
  return {
    bullets: [],
    enemies: [],
    pickups: [],
    damageQueue: [],
    xpQueue: [],
    players: []
  };
}

describe("CollisionSystem", () => {
  it("damages enemies on bullet hit", () => {
    const state = createState();
    state.enemies.push({
      id: 1,
      x: 100,
      y: 100,
      radius: 10,
      health: 2,
      alive: true
    });

    state.bullets.push({
      id: 1,
      owner: "p1",
      x: 100,
      y: 100,
      radius: 3,
      damage: 1,
      pierce: 0,
      alive: true
    });

    CollisionSystem.update(state);

    expect(state.damageQueue.length).toBe(1);
    expect(state.damageQueue[0]).toMatchObject({
      target: "enemy",
      id: 1,
      amount: 1
    });
    expect(state.bullets[0].alive).toBe(false);
  });
});
