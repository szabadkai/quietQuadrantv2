import Phaser from "phaser";
import { ARENA_WIDTH, ARENA_HEIGHT, TICK_RATE } from "../utils/constants.js";
import { GameLoop } from "../core/GameLoop.js";
import { BackgroundRenderer } from "./BackgroundRenderer.js";
import { PlayerRenderer } from "./PlayerRenderer.js";
import { BulletRenderer } from "./BulletRenderer.js";
import { EnemyRenderer } from "./EnemyRenderer.js";
import { PickupRenderer } from "./PickupRenderer.js";
import { BossRenderer } from "./BossRenderer.js";
import { EffectsRenderer } from "./EffectsRenderer.js";
import { ScreenEffects } from "./ScreenEffects.js";
import { TelegraphRenderer } from "./TelegraphRenderer.js";
import { SPRITE_ASSETS } from "./sprites.js";
import { soundManager } from "../audio/SoundManager.js";
import { musicManager } from "../audio/MusicManager.js";
import { setTheme } from "../utils/palette.js";
import { GlowManager } from "./GlowManager.js";

const SETTINGS_KEY = "quiet-quadrant-settings";
const DEFAULT_SETTINGS = {
    screenShake: true,
    screenFlash: true,
    reducedMotion: false,
    damageNumbers: false,
    highContrast: false,
    crtScanlines: true,
    crtIntensity: 0.5,
    colorTheme: "vectrex",
};

function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {}
    return { ...DEFAULT_SETTINGS };
}

function applyBodyClasses(settings) {
    if (typeof document === "undefined") return;
    document.body.classList.toggle(
        "qq-high-contrast",
        settings.highContrast ?? false
    );
    document.body.classList.toggle(
        "qq-reduced-motion",
        settings.reducedMotion ?? false
    );
    document.body.classList.toggle(
        "qq-no-scanlines",
        !(settings.crtScanlines ?? true)
    );

    // Apply CRT intensity as CSS variable
    const intensity = settings.crtScanlines
        ? settings.crtIntensity ?? 0.5
        : 0;
    document.documentElement.style.setProperty("--crt-intensity", intensity);
    document.documentElement.style.setProperty("--glow-intensity", intensity);

    // Apply color theme
    const theme = settings.colorTheme || "vectrex";
    document.body.setAttribute("data-theme", theme);
}

class GameScene extends Phaser.Scene {
    constructor(gameRenderer) {
        super({ key: "game" });
        this.gameRenderer = gameRenderer;
    }

    create() {
        this.gameRenderer.initialize(this);
    }

    preload() {
        this.gameRenderer.preload(this);
    }

    update(time, delta) {
        this.gameRenderer.update(delta);
    }
}

export class GameRenderer {
    constructor({ parent, onTick, getState, onReady }) {
        this.parent = parent;
        this.onTick = onTick;
        this.getState = getState;
        this.onReady = onReady;

        this.backgroundRenderer = null;
        this.playerRenderer = null;
        this.bulletRenderer = null;
        this.enemyRenderer = null;
        this.pickupRenderer = null;
        this.bossRenderer = null;

        this.gameLoop = new GameLoop({
            tickRate: TICK_RATE,
            onTick: () => this.onTick(),
            onRender: (interpolation) => this.render(interpolation),
        });

        this.scene = new GameScene(this);
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: ARENA_WIDTH,
            height: ARENA_HEIGHT,
            parent: this.parent,
            backgroundColor: "#000000",
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: ARENA_WIDTH,
                height: ARENA_HEIGHT,
            },
            scene: this.scene,
        });
    }

    initialize(scene) {
        this.backgroundRenderer = new BackgroundRenderer(scene);
        this.pickupRenderer = new PickupRenderer(scene);
        this.enemyRenderer = new EnemyRenderer(scene);
        this.playerRenderer = new PlayerRenderer(scene);
        this.bulletRenderer = new BulletRenderer(scene);
        this.bossRenderer = new BossRenderer(scene);
        this.effectsRenderer = new EffectsRenderer(scene);
        this.screenEffects = new ScreenEffects(scene);
        this.telegraphRenderer = new TelegraphRenderer(scene);
        this.phaserScene = scene;
        this.audioResumed = false;

        soundManager.init();
        musicManager.init();

        const settings = loadSettings();
        this.applySettings(settings);
        this.settingsListener = (event) => {
            if (event?.detail) {
                this.applySettings(event.detail);
            }
        };
        window.addEventListener("qq-settings-changed", this.settingsListener);

        if (this.onReady) {
            this.onReady(this.game.canvas);
        }
    }

    applySettings(settings) {
        this.screenEffects.setShakeEnabled(settings.screenShake);
        this.screenEffects.setFlashEnabled(settings.screenFlash);
        this.screenEffects.setSlowMoEnabled(!(settings.reducedMotion ?? false));
        this.effectsRenderer.setSettings(settings);
        applyBodyClasses(settings);

        // Apply color theme
        const theme = settings.colorTheme || "vectrex";
        setTheme(theme);
        GlowManager.setTheme(theme);

        // Apply CRT intensity to sprite glows
        const intensity = settings.crtScanlines
            ? settings.crtIntensity ?? 0.5
            : 0;
        if (this.playerRenderer)
            this.playerRenderer.setGlowIntensity(intensity);
        if (this.enemyRenderer) this.enemyRenderer.setGlowIntensity(intensity);
        if (this.bulletRenderer)
            this.bulletRenderer.setGlowIntensity(intensity);
        if (this.pickupRenderer)
            this.pickupRenderer.setGlowIntensity(intensity);
        if (this.bossRenderer) this.bossRenderer.setGlowIntensity(intensity);
    }

    resumeAudio() {
        if (this.audioResumed) return;
        this.audioResumed = true;
        soundManager.resume();
        musicManager.resume();
        musicManager.play(musicManager.currentTrack ?? "level1");
    }

    preload(scene) {
        for (const asset of SPRITE_ASSETS) {
            scene.load.svg(asset.key, asset.file, {
                width: asset.size,
                height: asset.size,
            });
        }
    }

    update(deltaMs) {
        this.gameLoop.update(deltaMs);
    }

    render(interpolation) {
        const state = this.getState();
        if (!state) return;

        const events = state.events ?? [];

        this.backgroundRenderer.render(state);
        this.telegraphRenderer.update(16, state);
        this.pickupRenderer.render(state.pickups, interpolation);
        this.enemyRenderer.render(state.enemies, interpolation);
        this.bulletRenderer.render(state.bullets, interpolation);
        this.playerRenderer.render(state.players, interpolation);
        this.bossRenderer.render(state.boss, interpolation);
        this.effectsRenderer.update(16);
        this.screenEffects.update(16);

        if (events.length > 0) {
            this.effectsRenderer.processEvents(events);
            this.screenEffects.processEvents(events);
            soundManager.processEvents(events);

            // Emit wave events to UI
            for (const event of events) {
                if (
                    event.type === "wave-intermission" &&
                    state.phase === "intermission"
                ) {
                    window.dispatchEvent(
                        new CustomEvent("qq-wave-intermission", {
                            detail: { nextWave: event.nextWave },
                        })
                    );
                }
            }
        }

        if (state.boss) {
            this.telegraphRenderer.processBossState(state.boss);
        }

        musicManager.updateFromGameState(state);
        musicManager.update(16);
    }

    destroy() {
        this.effectsRenderer?.destroy();
        this.screenEffects?.destroy();
        this.telegraphRenderer?.destroy();
        soundManager.destroy();
        musicManager.destroy();
        if (this.settingsListener) {
            window.removeEventListener(
                "qq-settings-changed",
                this.settingsListener
            );
            this.settingsListener = null;
        }
        this.game.destroy(true);
    }
}
