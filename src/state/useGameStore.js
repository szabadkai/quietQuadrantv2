import { create } from "zustand";
import { GameSimulation } from "../simulation/GameSimulation.js";
import { MultiplayerSimulation } from "../simulation/MultiplayerSimulation.js";
import { useMetaStore } from "./useMetaStore.js";

export const useGameStore = create((set, get) => ({
    simulation: null,
    state: null,
    stateVersion: 0, // Incremented to trigger React updates without cloning state
    lastRun: null,
    session: {
        mode: "solo",
        localPlayerId: "p1",
        role: "host",
    },

    actions: {
        startGame: (config = {}) => {
            const seed = config.seed ?? Date.now();
            const multiplayer = config.multiplayer ?? null;

            // Get card boosts from meta store
            const metaState = useMetaStore.getState();
            const cardBoosts = metaState.cardCollection?.upgradeBoosts ?? {};
            const unlockedUpgrades =
                config.unlockedUpgrades ??
                metaState.cardCollection?.unlockedUpgrades ??
                null;

            let simulation = null;
            let session = {
                mode: "solo",
                localPlayerId: "p1",
                role: "host",
            };

            if (multiplayer?.mode === "online") {
                simulation = new MultiplayerSimulation({
                    seed,
                    role: multiplayer.role ?? "host",
                    localPlayerId: multiplayer.localPlayerId,
                    network: multiplayer.network,
                    cardBoosts,
                    unlockedUpgrades,
                });
                session = {
                    mode: "online",
                    localPlayerId: simulation.localPlayerId,
                    role: multiplayer.role ?? "host",
                };
            } else {
                const playerCount = multiplayer?.mode === "twin" ? 2 : 1;
                simulation = new GameSimulation({
                    ...config,
                    seed,
                    playerCount,
                    multiplayer: playerCount > 1,
                    cardBoosts,
                    unlockedUpgrades,
                });
                session = {
                    mode: playerCount > 1 ? "twin" : "solo",
                    localPlayerId: "p1",
                    role: "host",
                    twinOptions: multiplayer?.twinOptions ?? {},
                };
            }

            set({
                simulation,
                state: simulation.getState(),
                stateVersion: 0,
                session,
            });
        },
        tick: (inputs = {}) => {
            const { simulation, session, stateVersion } = get();
            if (!simulation) return;
            if (session.mode === "online") {
                const localInput =
                    inputs[session.localPlayerId] ??
                    inputs.p1 ??
                    inputs.p2 ??
                    {};
                simulation.tick(localInput);
            } else {
                simulation.tick(inputs);
            }
            // Bump version to trigger re-renders; state is same ref but version changes
            set({
                state: simulation.getState(),
                stateVersion: stateVersion + 1,
            });
        },
        applyUpgrade: (playerId, upgradeId) => {
            const { simulation, stateVersion } = get();
            if (!simulation) return false;
            const applied = simulation.applyUpgrade(playerId, upgradeId);
            set({
                state: simulation.getState(),
                stateVersion: stateVersion + 1,
            });
            return applied;
        },
        stopGame: () => {
            const { simulation } = get();
            if (simulation?.destroy) {
                simulation.destroy();
            }
            set({ simulation: null, state: null, stateVersion: 0 });
        },
        setLastRun: (run) => set({ lastRun: run }),
    },
}));
