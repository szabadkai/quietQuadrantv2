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

    it("spawns bullets and respects out-of-bounds", () => {
        const sim = new GameSimulation(1);
        const player = sim.getState().players[0];
        player.bulletSpeed = 300;
        player.x = ARENA_WIDTH - 100; // Position near right edge
        player.y = ARENA_HEIGHT / 2;

        sim.tick({ p1: { moveX: 0, moveY: 0, aimX: 1, aimY: 0, fire: true, dash: false } });
        expect(sim.getState().bullets.length).toBe(1);

        // Bullet travels right at 300px/sec = 5px per tick at 60 ticks/sec
        // From x=700, it needs to travel ~150px to reach out-of-bounds (800 + 50 margin)
        // That should take about 30 ticks
        for (let i = 0; i < 25; i += 1) {
            sim.tick({});
        }
        expect(sim.getState().bullets.length).toBe(1); // Still alive

        // After more ticks, it should be out of bounds
        for (let i = 0; i < 20; i += 1) {
            sim.tick({});
        }
        expect(sim.getState().bullets.length).toBe(0); // Dead
    });
});
