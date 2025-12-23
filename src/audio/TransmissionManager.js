/**
 * Manages transmission audio playback between waves.
 * Plays random transmission clips from the public/transmissions folder.
 * Tracks played transmissions to avoid repetition.
 */

const TRANSMISSION_FILES = [
    "./transmissions/transmission-01.mp3",
    "./transmissions/transmission-02.mp3",
    "./transmissions/transmission-03.mp3",
    "./transmissions/transmission-04.mp3",
    "./transmissions/transmission-05.mp3",
    "./transmissions/transmission-06.mp3",
    "./transmissions/transmission-07.mp3",
    "./transmissions/transmission.mp3",
    "./transmissions/untitled-2.mp3",
    "./transmissions/untitled-3.mp3",
    "./transmissions/untitled-4.mp3",
    "./transmissions/untitled-5.mp3",
    "./transmissions/untitled-6.mp3",
    "./transmissions/untitled.mp3",
];

class TransmissionManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.volume = 0.6;
        this.currentSource = null;
        this.initialized = false;
        this.playedIndices = [];
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
        } catch (error) {
            console.warn(
                "TransmissionManager: Audio context not available",
                error
            );
        }
    }

    getNextIndex() {
        // If all transmissions have been played, reset the list
        if (this.playedIndices.length >= TRANSMISSION_FILES.length) {
            this.playedIndices = [];
        }

        // Get available indices (not yet played)
        const available = [];
        for (let i = 0; i < TRANSMISSION_FILES.length; i++) {
            if (!this.playedIndices.includes(i)) {
                available.push(i);
            }
        }

        // Pick a random one from available
        const idx = available[Math.floor(Math.random() * available.length)];
        this.playedIndices.push(idx);
        return idx;
    }

    async playRandom() {
        if (!this.initialized) {
            await this.init();
        }
        if (!this.context) return;

        // Stop any currently playing transmission
        this.stop();

        // Pick a transmission without repeating
        const idx = this.getNextIndex();
        const file = TRANSMISSION_FILES[idx];

        try {
            const response = await fetch(file);
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
        } catch (error) {
            console.warn(
                "TransmissionManager: Failed to play transmission",
                error
            );
        }
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

    reset() {
        this.playedIndices = [];
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

    destroy() {
        this.stop();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        this.initialized = false;
        this.playedIndices = [];
    }
}

export const transmissionManager = new TransmissionManager();
