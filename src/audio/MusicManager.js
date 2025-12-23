/**
 * Background music manager with intensity scaling.
 * Handles ambient tracks that respond to game state.
 */

function resolveAssetPath(path) {
    const cleaned = String(path || "").replace(/^\/+/, "");
    // Always use relative paths for better compatibility with GitHub Pages
    return `./${cleaned}`;
}

const TRACKS = {
    title: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Title Screen.mp3"
    ),
    level1: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Level 1.mp3"
    ),
    level2: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Level 2.mp3"
    ),
    level3: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Level 3.mp3"
    ),
    ending: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Ending.mp3"
    ),
};

const LEVEL_SEQUENCE = ["level1", "level2", "level3"];

function trackForWaveNumber(waveNumber) {
    if (waveNumber <= 1) {
        return "ending";
    }
    // After first level, always play level1 to avoid interruptions
    return "level1";
}

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

        const waveNumber = (state.wave?.current ?? 0) + 1;
        let targetTrack = trackForWaveNumber(waveNumber);

        if (state.phase === "ended") {
            targetTrack = "ending";
        }

        if (this.currentTrack !== targetTrack) {
            this.play(targetTrack);
        }

        this.setIntensity(0);
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
