/**
 * Background music manager with intensity scaling.
 * Handles ambient tracks that respond to game state.
 */

const TRACKS = {
    title: "/music/Juhani Junkala [Retro Game Music Pack] Title Screen.mp3",
    level1: "/music/Juhani Junkala [Retro Game Music Pack] Level 1.mp3",
    level2: "/music/Juhani Junkala [Retro Game Music Pack] Level 2.mp3",
    level3: "/music/Juhani Junkala [Retro Game Music Pack] Level 3.mp3",
    ending: "/music/Juhani Junkala [Retro Game Music Pack] Ending.mp3",
};

export class MusicManager {
    constructor() {
        this.masterVolume = 0.5;
        this.musicVolume = 1.0;
        this.enabled = true;
        this.initialized = false;

        this.currentTrack = null;
        this.currentAudio = null;
        this.intensity = 0;
        this.targetIntensity = 0;
        this.lastIntensityLevel = 0;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.loadSettings();
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem("quiet-quadrant-settings");
            if (stored) {
                const settings = JSON.parse(stored);
                this.masterVolume = settings.masterVolume ?? 0.5;
                this.musicVolume = settings.musicVolume ?? 1.0;
            }
        } catch (e) {}
    }

    play(trackName) {
        if (!this.enabled || !this.initialized) return;

        const url = TRACKS[trackName];
        if (!url) {
            console.warn(`Unknown track: ${trackName}`);
            return;
        }

        if (this.currentTrack === trackName && this.currentAudio) {
            return;
        }

        this.stop();

        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = this.masterVolume * this.musicVolume;

        audio.play().catch((err) => {
            console.warn("Music autoplay blocked:", err.message);
        });

        this.currentAudio = audio;
        this.currentTrack = trackName;
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.currentTrack = null;
    }

    setIntensity(value) {
        this.targetIntensity = Math.max(0, Math.min(1, value));
    }

    update(delta) {
        const dt = delta / 1000;
        const lerpSpeed = 0.5;
        this.intensity +=
            (this.targetIntensity - this.intensity) * lerpSpeed * dt;
    }

    updateFromGameState(state) {
        if (!state || !this.initialized) return;

        let intensityLevel = 0;
        let targetTrack = "level1";

        if (state.phase === "boss") {
            intensityLevel = 3;
            targetTrack = "level3";
        } else if (state.phase === "wave") {
            const wave = state.wave?.current ?? 1;
            if (wave >= 8) {
                intensityLevel = 2;
                targetTrack = "level2";
            } else if (wave >= 4) {
                intensityLevel = 1;
                targetTrack = "level2";
            } else {
                intensityLevel = 0;
                targetTrack = "level1";
            }
        } else if (state.phase === "intermission") {
            targetTrack = this.currentTrack || "level1";
        } else if (state.phase === "ended") {
            targetTrack = "ending";
        }

        if (
            this.lastIntensityLevel !== intensityLevel ||
            this.currentTrack !== targetTrack
        ) {
            this.lastIntensityLevel = intensityLevel;
            if (this.currentTrack !== targetTrack) {
                this.play(targetTrack);
            }
        }

        this.setIntensity(intensityLevel / 3);
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolume();
    }

    updateVolume() {
        if (this.currentAudio) {
            this.currentAudio.volume = this.masterVolume * this.musicVolume;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    resume() {
        if (this.currentAudio && this.currentAudio.paused) {
            this.currentAudio.play().catch(() => {});
        }
    }

    destroy() {
        this.stop();
        this.initialized = false;
    }
}

export const musicManager = new MusicManager();
