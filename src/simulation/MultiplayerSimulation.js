import { GameSimulation } from "./GameSimulation.js";
import { InputSync } from "../network/InputSync.js";
import { StateSync } from "../network/StateSync.js";

const CORRECTION_INTERVAL = 12;

export class MultiplayerSimulation {
    constructor({
        seed,
        role = "host",
        network,
        localPlayerId,
        cardBoosts,
        unlockedUpgrades
    } = {}) {
        this.role = role;
        this.network = network;
        this.localPlayerId = localPlayerId ?? (role === "host" ? "p1" : "p2");
        this.simulation = new GameSimulation({
            seed,
            playerCount: 2,
            multiplayer: true,
            cardBoosts,
            unlockedUpgrades
        });
        this.inputSync = new InputSync(network);
        this.stateSync = new StateSync();
        this.unsubscribeCorrection = null;

        if (this.network) {
            this.unsubscribeCorrection = this.network.on("correction", (snapshot) => {
                if (this.role !== "guest") return;
                this.stateSync.applyCorrection(this.simulation.getState(), snapshot);
            });
        }
    }

    tick(inputState = {}) {
        const nextTick = this.simulation.getState().tick + 1;
        const localInput =
      inputState[this.localPlayerId] ?? inputState.p1 ?? inputState.p2 ?? {};
        this.inputSync.processLocalInput(localInput, nextTick);
        const remoteInput = this.inputSync.getRemoteInput(nextTick);

        const inputMap =
      this.localPlayerId === "p1"
          ? { p1: localInput, p2: remoteInput }
          : { p1: remoteInput, p2: localInput };

        this.simulation.tick(inputMap);

        if (this.role === "host" && nextTick % CORRECTION_INTERVAL === 0) {
            const snapshot = this.stateSync.generateSnapshot(this.simulation.getState());
            if (this.network) {
                this.network.sendCorrection(snapshot);
            }
        }
    }

    getState() {
        return this.simulation.getState();
    }

    applyUpgrade(playerId, upgradeId) {
        return this.simulation.applyUpgrade(playerId, upgradeId);
    }

    destroy() {
        if (this.unsubscribeCorrection) {
            this.unsubscribeCorrection();
            this.unsubscribeCorrection = null;
        }
        this.inputSync.destroy();
        if (this.network?.leave) {
            this.network.leave();
        }
    }
}
