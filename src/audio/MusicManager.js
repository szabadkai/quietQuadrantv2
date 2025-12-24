/**
 * Background music manager with intensity scaling.
 * Handles ambient tracks that respond to game state.
 */

function resolveAssetPath(path) {
    const cleaned = String(path || "").replace(/^\/+/, "");
    // Always use relative paths for better compatibility with GitHub Pages
    return `./${cleaned}`;
}

const ENDING_TRACK = resolveAssetPath(
    "music/Juhani Junkala [Retro Game Music Pack] Ending.mp3"
);

const TRACKS = {
    title: ENDING_TRACK,
    level1: ENDING_TRACK,
    level2: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Level 2.mp3"
    ),
    level3: resolveAssetPath(
        "music/Juhani Junkala [Retro Game Music Pack] Level 3.mp3"
    ),
    ending: ENDING_TRACK,
};

// Music is intentionally scaled down so a UI setting of 20% maps to full legacy loudness.
const MUSIC_VOLUME_SCALE = 0.2;

function trackForWaveNumber(waveNumber) {
    if (waveNumber <= 1) return "level1";
    return "level2";
}

export class MusicManager {
    constructor() {
        this.masterVolume = 0.5;
        this.musicVolume = 0.25;
        this.enabled = true;
        this.initialized = false;

        this.currentTrack = null;
        this.currentAudio = null;
        this.intensity = 0;
        this.targetIntensity = 0;
        this.autoplayUnlockHandler = null;
        this.visibilityHandler = null;
    }

    clearAutoplayHandler() {
        if (!this.autoplayUnlockHandler || typeof window === "undefined")
            return;
        window.removeEventListener("pointerdown", this.autoplayUnlockHandler);
        window.removeEventListener("keydown", this.autoplayUnlockHandler);
        this.autoplayUnlockHandler = null;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.loadSettings();
        this.setupVisibilityListener();
    }

    setupVisibilityListener() {
        if (typeof document === "undefined") return;
        this.visibilityHandler = () => {
            if (document.visibilityState === "hidden") {
                if (this.currentAudio && !this.currentAudio.paused) {
                    this.wasPlayingBeforeHide = true;
                    this.currentAudio.pause();
                }
            } else if (document.visibilityState === "visible") {
                if (this.wasPlayingBeforeHide && this.currentAudio) {
                    this.currentAudio.play().catch(() => {});
                    this.wasPlayingBeforeHide = false;
                }
            }
        };
        document.addEventListener("visibilitychange", this.visibilityHandler);
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem("quiet-quadrant-settings");
            if (stored) {
                const settings = JSON.parse(stored);
                this.masterVolume = settings.masterVolume ?? 0.5;
                this.musicVolume = settings.musicVolume ?? 0.25;
            }
        } catch (e) {
            // ignore
        }
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
        this.clearAutoplayHandler();

        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = this.getScaledVolume();
        // Explicit load for iOS/WebKit compatibility
        audio.load();

        const handleAutoplayBlock = () => {
            this.clearAutoplayHandler();
            if (this.currentAudio !== audio) return;
            audio.play().catch(() => {});
        };

        const playPromise = audio.play();
        if (playPromise?.catch) {
            playPromise.catch((err) => {
                console.warn("Music autoplay blocked:", err.message);
                this.autoplayUnlockHandler = handleAutoplayBlock;
                if (typeof window !== "undefined") {
                    window.addEventListener(
                        "pointerdown",
                        handleAutoplayBlock,
                        {
                            once: true,
                        }
                    );
                    window.addEventListener("keydown", handleAutoplayBlock, {
                        once: true,
                    });
                }
            });
        }

        this.currentAudio = audio;
        this.currentTrack = trackName;
    }

    stop() {
        this.clearAutoplayHandler();
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
            this.currentAudio.volume = this.getScaledVolume();
        }
    }

    getScaledVolume() {
        return this.masterVolume * this.musicVolume * MUSIC_VOLUME_SCALE;
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
        this.clearAutoplayHandler();
        if (typeof document !== "undefined" && this.visibilityHandler) {
            document.removeEventListener("visibilitychange", this.visibilityHandler);
        }
        this.initialized = false;
    }
}

export const musicManager = new MusicManager();
