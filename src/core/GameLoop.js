export class GameLoop {
    constructor({ tickRate, onTick, onRender }) {
        this.tickRate = tickRate;
        this.onTick = onTick;
        this.onRender = onRender;
        this.accumulator = 0;
        this.paused = false;
    }

    update(deltaMs) {
        if (this.paused) return;

        const tickMs = 1000 / this.tickRate;
        this.accumulator += deltaMs;

        while (this.accumulator >= tickMs) {
            this.onTick();
            this.accumulator -= tickMs;
        }

        const interpolation = this.accumulator / tickMs;
        this.onRender(interpolation);
    }

    setPaused(paused) {
        this.paused = paused;
    }

    reset() {
        this.accumulator = 0;
    }
}
