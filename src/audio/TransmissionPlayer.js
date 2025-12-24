export class TransmissionPlayer {
    constructor({ volume = 0.6, minGapMs = 70000 } = {}) {
        this.volume = volume;
        this.minGapMs = minGapMs;
        this.lastPlayMs = 0;
        this.playHistory = new Map();
        this.failedClips = new Set();
        this.context = null;
        this.masterGain = null;
        this.currentSource = null;
        this.initialized = false;
        this.playQueue = Promise.resolve();
    }

    async init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext ||
                window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.volume;
            this.initialized = true;

            // Attempt to resume immediately for WebKit (may require user gesture)
            if (this.context.state === "suspended") {
                this.context.resume().catch(() => {});
            }
        } catch (error) {
            console.warn(
                "TransmissionPlayer: Audio context not available",
                error
            );
        }
    }

    pickClip(pool, poolKey) {
        const validPool = pool.filter((clip) => !this.failedClips.has(clip));
        if (!validPool.length) return null;

        const history = this.playHistory.get(poolKey) ?? [];
        const available = [];
        for (let i = 0; i < validPool.length; i += 1) {
            if (!history.includes(i)) {
                available.push(i);
            }
        }

        const index =
            available.length > 0
                ? available[Math.floor(Math.random() * available.length)]
                : Math.floor(Math.random() * validPool.length);

        const nextHistory = available.length > 0 ? [...history, index] : [];
        this.playHistory.set(poolKey, nextHistory);
        if (nextHistory.length >= validPool.length) {
            this.playHistory.set(poolKey, []);
        }

        return validPool[index];
    }

    playFromPool(pool, poolKey, fallbackPool = null, options = {}) {
        this.playQueue = this.playQueue
            .then(() =>
                this._playFromPool(pool, poolKey, fallbackPool, options)
            )
            .catch((error) => {
                console.warn("TransmissionPlayer: Playback queue error", error);
                return false;
            });
        return this.playQueue;
    }

    async _playFromPool(pool, poolKey, fallbackPool = null, options = {}) {
        const {
            chance = 1,
            bypassCooldown = false,
            skipThrottle = false,
            markPlayback,
        } = options;
        const shouldMarkPlayback =
            markPlayback === undefined ? !skipThrottle : markPlayback;

        if (!skipThrottle) {
            if (chance < 1 && Math.random() > chance) {
                return false;
            }
            if (!bypassCooldown && !this.canPlayNow()) {
                return false;
            }
        }

        if (!pool || !pool.length) {
            if (fallbackPool) {
                return this._playFromPool(fallbackPool, "fallback", null, {
                    ...options,
                    skipThrottle: true,
                    markPlayback: shouldMarkPlayback,
                });
            }
            return false;
        }

        await this.init();
        if (!this.context) return false;

        this.stop();

        const clip = this.pickClip(pool, poolKey);
        if (!clip) {
            if (fallbackPool) {
                return this._playFromPool(fallbackPool, "fallback", null, {
                    ...options,
                    skipThrottle: true,
                    markPlayback: shouldMarkPlayback,
                });
            }
            return false;
        }

        const success = await this.playClip(clip);
        if (!success && fallbackPool) {
            return this._playFromPool(fallbackPool, "fallback", null, {
                ...options,
                skipThrottle: true,
                markPlayback: shouldMarkPlayback,
            });
        }
        if (success && shouldMarkPlayback) {
            this.lastPlayMs = Date.now();
        }
        return success;
    }

    async playClip(file) {
        if (!this.context) return false;

        // Resume suspended context (WebKit/Safari fix)
        if (this.context.state === "suspended") {
            try {
                await this.context.resume();
            } catch (e) {
                console.warn("TransmissionPlayer: Failed to resume context", e);
            }
        }

        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

            const source = this.context.createBufferSource();
            source.buffer = audioBuffer;

            const gain = this.context.createGain();
            gain.gain.value = this.volume;
            source.connect(gain);
            gain.connect(this.masterGain);

            source.start();
            this.currentSource = source;

            source.onended = () => {
                this.currentSource = null;
            };
            return true;
        } catch (error) {
            console.warn(
                "TransmissionPlayer: Failed to play transmission",
                error
            );
            this.failedClips.add(file);
            return false;
        }
    }

    canPlayNow() {
        if (this.minGapMs <= 0) return true;
        if (this.lastPlayMs === 0) return true;
        return Date.now() - this.lastPlayMs >= this.minGapMs;
    }

    stop() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // Already stopped
            }
            this.currentSource = null;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    resume() {
        if (this.context?.state === "suspended") {
            this.context.resume();
        }
    }

    reset() {
        this.playHistory.clear();
        this.failedClips.clear();
        this.lastPlayMs = 0;
        this.playQueue = Promise.resolve();
    }

    destroy() {
        this.stop();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        this.initialized = false;
        this.reset();
    }
}
