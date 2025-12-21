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

const SETTINGS_KEY = "quiet-quadrant-settings";

function loadSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { screenShake: true, screenFlash: true };
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
            backgroundColor: "#05070b",
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
        this.screenEffects.setShakeEnabled(settings.screenShake);
        this.screenEffects.setFlashEnabled(settings.screenFlash);

        if (this.onReady) {
            this.onReady(this.game.canvas);
        }
    }

    resumeAudio() {
        if (this.audioResumed) return;
        this.audioResumed = true;
        soundManager.resume();
        musicManager.resume();
        musicManager.play("level1");
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
        this.game.destroy(true);
    }
}
