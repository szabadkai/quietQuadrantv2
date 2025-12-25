import { describe, expect, it } from "vitest";
import { GameSimulation } from "../../src/simulation/GameSimulation.js";

function queuePlayerDamage(sim, playerId, amount) {
    sim.getState().damageQueue.push({
        target: "player",
        id: playerId,
        amount,
        source: { type: "test" }
    });
}

describe("Dev console toggles", () => {
    it("prevents player damage when invincibility is enabled", () => {
        const sim = new GameSimulation(1);
        const player = sim.getState().players[0];
        const playerId = player.id;
        const baselineDamage = Math.max(1, Math.floor(player.maxHealth / 2));
        const postToggleDamage = Math.max(1, Math.ceil(player.maxHealth / 3));

        // Baseline: damage should land
        queuePlayerDamage(sim, playerId, baselineDamage);
        sim.tick();
        expect(player.health).toBeLessThan(player.maxHealth);

        // Enable invincibility and ensure incoming damage is ignored
        player.invulnFrames = 0; // clear post-hit i-frames from the first hit
        const healthBefore = player.health;
        sim.toggleInvincibility(playerId);

        queuePlayerDamage(sim, playerId, 999);
        sim.tick();
        expect(player.health).toBe(healthBefore);

        // Disable invincibility and confirm damage applies again
        player.invulnFrames = 0;
        sim.toggleInvincibility(playerId);
        queuePlayerDamage(sim, playerId, postToggleDamage);
        sim.tick();
        expect(player.health).toBeLessThan(healthBefore);
    });
});
