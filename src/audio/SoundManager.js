/**
 * Sound effects manager with pooling and priority system.
 * Handles playback, volume control, and simultaneous sound limits.
 */

const MAX_SIMULTANEOUS = 8;
const SFX_GAIN_BOOST = 1.8;
const SYNTH_GAIN_SCALE = 0.6;

const SOUND_DEFS = {
    shoot: { priority: 3, volume: 0.3, cooldown: 50 },
    hit: { priority: 4, volume: 0.5, cooldown: 30 },
    kill: { priority: 4, volume: 0.4, cooldown: 20 },
    playerHit: { priority: 1, volume: 0.7, cooldown: 200 },
    dash: { priority: 2, volume: 0.5, cooldown: 100 },
    xpPickup: { priority: 5, volume: 0.3, cooldown: 30 },
    levelUp: { priority: 2, volume: 0.6, cooldown: 500 },
    bossAttack: { priority: 1, volume: 0.6, cooldown: 100 },
    bossPhase: { priority: 1, volume: 0.8, cooldown: 1000 },
    waveStart: { priority: 2, volume: 0.5, cooldown: 500 },
    victory: { priority: 1, volume: 0.8, cooldown: 2000 },
    defeat: { priority: 1, volume: 0.7, cooldown: 2000 },
    defeatBoom: { priority: 1, volume: 0.8, cooldown: 2000 },
    defeatShatter: { priority: 1, volume: 0.6, cooldown: 2000 },
    menuHover: { priority: 5, volume: 0.25, cooldown: 30 },
    menuSelect: { priority: 4, volume: 0.4, cooldown: 50 },
};

export class SoundManager {
    constructor() {
        this.context = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 1.0;
        this.enabled = true;
        this.activeSounds = [];
        this.cooldowns = new Map();
        this.buffers = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext ||
                window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.masterVolume * this.sfxVolume;
            this.initialized = true;

            // Attempt to resume immediately for WebKit (may require user gesture)
            if (this.context.state === "suspended") {
                this.context.resume().catch(() => {});
            }
        } catch (error) {
            console.warn("Audio context not available:", error);
            this.enabled = false;
        }
    }

    async loadSound(name, url) {
        if (!this.context) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error);
        }
    }

    play(name, options = {}) {
        if (!this.enabled || !this.context || !this.initialized) return;

        // Resume suspended context for WebKit/Safari
        if (this.context.state === "suspended") {
            this.context.resume().catch(() => {});
        }

        const def = SOUND_DEFS[name];
        if (!def) return;

        const now = Date.now();
        const lastPlayed = this.cooldowns.get(name) ?? 0;
        if (now - lastPlayed < def.cooldown) return;

        this.cleanupActiveSounds();
        if (this.activeSounds.length >= MAX_SIMULTANEOUS) {
            const lowest = this.findLowestPriority();
            if (lowest && lowest.priority > def.priority) {
                this.stopSound(lowest);
            } else {
                return;
            }
        }

        const buffer = this.buffers.get(name);
        if (buffer) {
            this.playBuffer(name, buffer, def, options);
        } else {
            this.playSynthetic(name, def, options);
        }

        this.cooldowns.set(name, now);
    }

    playBuffer(name, buffer, def, options) {
        const source = this.context.createBufferSource();
        source.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.value = def.volume * (options.volume ?? 1) * SFX_GAIN_BOOST;
        source.connect(gain);
        gain.connect(this.masterGain);

        const delay = Math.max(0, options.delay ?? 0);
        source.start(this.context.currentTime + delay);

        const soundRef = { name, source, gain, priority: def.priority };
        this.activeSounds.push(soundRef);

        source.onended = () => {
            const idx = this.activeSounds.indexOf(soundRef);
            if (idx !== -1) this.activeSounds.splice(idx, 1);
        };
    }

    playSynthetic(name, def, options) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        const synth = SYNTH_SOUNDS[name];
        if (!synth) return;

        osc.type = synth.type ?? "sine";
        const duration = synth.duration ?? 0.1;
        const delay = Math.max(0, options.delay ?? 0);
        const startTime = this.context.currentTime + delay;
        const startFreq = synth.freq ?? 440;
        osc.frequency.setValueAtTime(startFreq, startTime);
        if (synth.freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(
                Math.max(1, synth.freqEnd),
                startTime + duration
            );
        }

        const volume =
            def.volume *
            (options.volume ?? 1) *
            SYNTH_GAIN_SCALE *
            SFX_GAIN_BOOST;
        gain.gain.value = 0.001;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);

        const soundRef = { name, source: osc, gain, priority: def.priority };
        this.activeSounds.push(soundRef);

        osc.onended = () => {
            const idx = this.activeSounds.indexOf(soundRef);
            if (idx !== -1) this.activeSounds.splice(idx, 1);
        };
    }

    stopSound(soundRef) {
        try {
            soundRef.source.stop();
        } catch (e) {
            // Already stopped
        }
        const idx = this.activeSounds.indexOf(soundRef);
        if (idx !== -1) this.activeSounds.splice(idx, 1);
    }

    findLowestPriority() {
        let lowest = null;
        for (const sound of this.activeSounds) {
            if (!lowest || sound.priority > lowest.priority) {
                lowest = sound;
            }
        }
        return lowest;
    }

    cleanupActiveSounds() {
        this.activeSounds = this.activeSounds.filter((s) => {
            try {
                return s.source.playbackState !== "finished";
            } catch (e) {
                return true;
            }
        });
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume * this.sfxVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume * this.sfxVolume;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    processEvents(events) {
        // PERFORMANCE: Limit high-frequency sounds to prevent audio overload
        let hitCount = 0;
        let killCount = 0;
        const HIT_LIMIT = 5;
        const KILL_LIMIT = 5;
        
        for (const event of events) {
            switch (event.type) {
            case "shoot":
                this.play("shoot");
                break;
            case "enemy-hit":
                if (++hitCount <= HIT_LIMIT) {
                    this.play("hit");
                }
                break;
            case "enemy-death":
                if (++killCount <= KILL_LIMIT) {
                    this.play("kill");
                }
                break;
            case "player-hit":
                this.play("playerHit");
                break;
            case "dash":
                this.play("dash");
                break;
            case "xp-pickup":
                this.play("xpPickup");
                break;
            case "level-up":
                this.play("levelUp");
                break;
            case "boss-phase":
                this.play("bossPhase");
                break;
            case "victory":
                this.play("victory");
                break;
            case "defeat":
                this.play("defeat");
                this.play("defeatBoom", { delay: 0.08 });
                this.play("defeatShatter", { delay: 0.18 });
                break;
            }
        }
    }

    resume() {
        if (this.context?.state === "suspended") {
            this.context.resume();
        }
    }

    destroy() {
        for (const sound of this.activeSounds) {
            this.stopSound(sound);
        }
        this.activeSounds = [];
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        this.initialized = false;
    }
}

const SYNTH_SOUNDS = {
    shoot: { type: "square", freq: 880, duration: 0.05 },
    hit: { type: "sawtooth", freq: 220, duration: 0.08 },
    kill: { type: "square", freq: 440, duration: 0.12 },
    playerHit: { type: "sawtooth", freq: 110, duration: 0.2 },
    dash: { type: "sine", freq: 660, duration: 0.15 },
    xpPickup: { type: "sine", freq: 1200, duration: 0.06 },
    levelUp: { type: "sine", freq: 880, duration: 0.3 },
    bossAttack: { type: "sawtooth", freq: 150, duration: 0.25 },
    bossPhase: { type: "square", freq: 200, duration: 0.5 },
    waveStart: { type: "sine", freq: 550, duration: 0.2 },
    victory: { type: "sine", freq: 660, duration: 0.5 },
    defeat: { type: "sawtooth", freq: 140, freqEnd: 60, duration: 0.5 },
    defeatBoom: { type: "sawtooth", freq: 90, freqEnd: 40, duration: 0.7 },
    defeatShatter: { type: "square", freq: 520, freqEnd: 220, duration: 0.25 },
    menuHover: { type: "sine", freq: 600, duration: 0.04 },
    menuSelect: { type: "square", freq: 800, duration: 0.08 },
};

export const soundManager = new SoundManager();
