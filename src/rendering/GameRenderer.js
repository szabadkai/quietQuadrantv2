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
import { AssetPreloader } from "../utils/AssetPreloader.js";

import { calculateBenchmarkResults } from "../utils/benchmark.js";

import { loadSettings, applyBodyClasses } from "../utils/settings.js";

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

        this.benchmarkStats = {
            samples: [],
            startTime: 0,
            active: false,
        };

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
        this.setupDebugHotkeys();

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
        // PERFORMANCE: lowFX mode disables all glow effects
        let intensity = settings.crtScanlines
            ? settings.crtIntensity ?? 0.5
            : 0;
        if (settings.lowFX) {
            intensity = 0;
        }

        GlowManager.setIntensity(intensity);
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
        // First, inject any pre-rasterized sprites from AssetPreloader
        // These were loaded during PreTitleScreen/TitleScreen
        const injectedCount = AssetPreloader.injectIntoPhaser(scene);

        const isMobile =
            scene.sys.game.device.os.iOS || scene.sys.game.device.os.android;
        // Use larger rasterization size on mobile for better quality at various display sizes
        const sizeMultiplier = isMobile ? 2 : 1;

        // Only load sprites that weren't pre-rasterized
        let loadedCount = 0;
        for (const asset of SPRITE_ASSETS) {
            if (!scene.textures.exists(asset.key)) {
                scene.load.svg(asset.key, asset.file, {
                    width: asset.size * sizeMultiplier,
                    height: asset.size * sizeMultiplier,
                });
                loadedCount++;
            }
        }

        if (loadedCount > 0) {
            console.log(
                `[GameRenderer] Loading ${loadedCount} sprites via Phaser (not pre-cached)`,
            );
        } else if (injectedCount > 0) {
            console.log(
                `[GameRenderer] All sprites pre-cached, no loading needed`,
            );
        }
    }

    update(deltaMs) {
        this.gameLoop.update(deltaMs);
    }

    render(interpolation) {
        const state = this.getState();
        if (!state) return;

        // Benchmark Collection
        if (state.isBenchmarking) {
            if (!this.benchmarkStats.active) {
                this.benchmarkStats.active = true;
                this.benchmarkStats.startTime = performance.now();
                this.benchmarkStats.samples = [];
                console.log("[GameRenderer] Benchmark Started");
            }

            if (!state.benchmarkComplete) {
                // Collect Sample
                const fps = this.game.loop.actualFps;
                // Ignore initial warm-up frames (first 60)
                if (state.tick > 60) {
                    this.benchmarkStats.samples.push(fps);
                }
            } else if (!state.benchmarkResults) {
                // Finalize Results using utility
                state.benchmarkResults = calculateBenchmarkResults(
                    this.benchmarkStats.samples,
                    this.benchmarkStats.startTime,
                );
                console.log(
                    "[GameRenderer] Benchmark Results:",
                    state.benchmarkResults,
                );
                this.benchmarkStats.active = false;
            }
        } else {
            this.benchmarkStats.active = false;
        }

        // Add FPS and debug info to state for HUD display
        state.fps = Math.round(this.game.loop.actualFps);
        state.debug = this.debugSettings || { glow: true, crt: true };

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
                        }),
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

    setupDebugHotkeys() {
        this.debugSettings = { glow: true, crt: true };

        // Only allow debug hotkeys in development mode
        if (!import.meta.env.DEV) return;

        // dev-only hotkeys: Shift+G (glow), Shift+C (CRT), Shift+I (invincible), Shift+L (cycle loadout)
        this.devLoadoutIndex = 0;
        window.addEventListener("keydown", (e) => {
            if (!e.shiftKey) return;
            const key = e.key.toLowerCase();
            if (key === "g") {
                this.debugSettings.glow = !this.debugSettings.glow;
                const intensity = this.debugSettings.glow
                    ? loadSettings().crtIntensity || 0.5
                    : 0;
                this.updateGlowIntensityAcrossRenderers(intensity);
                console.log(
                    `[DEBUG] Glow: ${this.debugSettings.glow ? "ON" : "OFF"}`,
                );
            } else if (key === "c") {
                this.debugSettings.crt = !this.debugSettings.crt;
                document.body.classList.toggle(
                    "qq-no-scanlines",
                    !this.debugSettings.crt,
                );
                console.log(
                    `[DEBUG] CRT: ${this.debugSettings.crt ? "ON" : "OFF"}`,
                );
            } else if (key === "i") {
                // Toggle invincibility via global event so store/simulation can handle it
                window.dispatchEvent(
                    new CustomEvent("qq-toggle-invincibility", {
                        detail: { playerId: "p1" },
                    }),
                );
            } else if (key === "l") {
                // Cycle dev loadouts and apply
                this.devLoadoutIndex = (this.devLoadoutIndex + 1) % 3; // match devLoadouts count
                window.dispatchEvent(
                    new CustomEvent("qq-apply-loadout", {
                        detail: { index: this.devLoadoutIndex, playerId: "p1" },
                    }),
                );
                console.log(
                    `[DEBUG] Applied dev loadout index ${this.devLoadoutIndex}`,
                );
            }
        });
    }

    updateGlowIntensityAcrossRenderers(intensity) {
        GlowManager.setIntensity(intensity);
        if (this.playerRenderer)
            this.playerRenderer.setGlowIntensity(intensity);
        if (this.enemyRenderer) this.enemyRenderer.setGlowIntensity(intensity);
        if (this.bulletRenderer)
            this.bulletRenderer.setGlowIntensity(intensity);
        if (this.pickupRenderer)
            this.pickupRenderer.setGlowIntensity(intensity);
        if (this.bossRenderer) this.bossRenderer.setGlowIntensity(intensity);
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
                this.settingsListener,
            );
            this.settingsListener = null;
        }
        this.game.destroy(true);
    }
}
