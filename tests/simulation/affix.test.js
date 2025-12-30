import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { getWeeklyAffix } from "../../src/config/affixes.js";
import { AffixSystem } from "../../src/simulation/AffixSystem.js";
import { createInitialState } from "../../src/simulation/GameState.js";
import { PLAYER_BASE } from "../../src/config/player.js";

describe("Affix System", () => {
    describe("getWeeklyAffix", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("returns consistent affix for the same date", () => {
            const date = new Date("2024-01-01T00:00:00Z");
            vi.setSystemTime(date);
            const affix1 = getWeeklyAffix();
            const affix2 = getWeeklyAffix();
            expect(affix1).toEqual(affix2);
        });

        it("returns consistent affix for different times on the same day", () => {
            vi.setSystemTime(new Date("2024-01-01T10:00:00Z"));
            const affix1 = getWeeklyAffix();
            
            vi.setSystemTime(new Date("2024-01-01T22:00:00Z"));
            const affix2 = getWeeklyAffix();
            
            expect(affix1.id).toBe(affix2.id);
        });

        it("rotates affixes weekly", () => {
            // Week 1
            vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
            const week1Affix = getWeeklyAffix();

            // Week 2 (7 days later)
            vi.setSystemTime(new Date("2024-01-08T00:00:00Z"));
            const week2Affix = getWeeklyAffix();

            // Week 1 and 2 should ideally be different, although random chance could make them same.
            // But getWeeklyAffix iterates through the array, so they SHOULD be different unless array length is 1.
            expect(week1Affix.id).not.toBe(week2Affix.id);
        });
    });

    describe("AffixSystem.apply", () => {
        it("applies modifiers to game state", () => {
            const state = createInitialState(1);
            const testAffix = {
                id: "test-affix",
                name: "Test Affix",
                modifiers: {
                    enemyHealth: 2.0,
                    playerDamage: 0.5,
                    xpGain: 1.5
                }
            };

            AffixSystem.apply(state, testAffix);

            expect(state.modifiers.enemyHealth).toBe(2.0);
            expect(state.modifiers.playerDamage).toBe(0.5);
            expect(state.modifiers.xpGain).toBe(1.5);
        });

        it("recalculates player base stats", () => {
            const state = createInitialState(1);
            const originalSpeed = state.players[0].base.speed;
            const originalDamage = state.players[0].base.bulletDamage;

            const testAffix = {
                id: "speed-demon",
                name: "Speed Demon",
                modifiers: {
                    playerSpeed: 1.5,
                    playerDamage: 2.0
                }
            };

            AffixSystem.apply(state, testAffix);

            expect(state.players[0].base.speed).toBe(originalSpeed * 1.5);
            expect(state.players[0].base.bulletDamage).toBe(originalDamage * 2.0);
        });
        
        it("handles missing modifiers gracefully", () => {
             const state = createInitialState(1);
             const emptyAffix = {
                 id: "empty",
                 name: "Empty",
                 modifiers: {}
             };
             
             AffixSystem.apply(state, emptyAffix);
             
             // specific check for defaults
             expect(state.modifiers.enemyHealth).toBe(1);
             expect(state.modifiers.playerDamage).toBe(1);
        });
    });
});
