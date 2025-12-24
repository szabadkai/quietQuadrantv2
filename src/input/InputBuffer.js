export class InputBuffer {
    constructor() {
        this.inputs = {};
    }

    capture(state, inputManager, options = {}) {
        if (!state || !state.players?.length) {
            this.inputs = {};
            return this.inputs;
        }

        if (typeof inputManager.getInputs === "function") {
            this.inputs = inputManager.getInputs(state.players);
            return this.inputs;
        }

        const targetId = options.playerId ?? state.players[0].id;
        const player =
      state.players.find((candidate) => candidate.id === targetId) ??
      state.players[0];
        this.inputs = {
            [player.id]: inputManager.getInputForPlayer(player)
        };

        return this.inputs;
    }

    getCurrent() {
        return this.inputs;
    }
}
