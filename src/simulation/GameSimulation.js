import { SeededRandom } from "../utils/random.js";
import { createInitialState } from "./GameState.js";
import { PlayerSystem } from "./PlayerSystem.js";
import { EnemySystem } from "./EnemySystem.js";
import { BulletSystem } from "./BulletSystem.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { DamageSystem } from "./DamageSystem.js";
import { PickupSystem } from "./PickupSystem.js";
import { LevelSystem } from "./LevelSystem.js";
import { WaveSystem } from "./WaveSystem.js";
import { UpgradeSystem } from "./UpgradeSystem.js";
import { BossSystem } from "./BossSystem.js";
import { GameEndSystem } from "./GameEndSystem.js";
import { AffixSystem } from "./AffixSystem.js";

export class GameSimulation {
    constructor(config = {}) {
        const resolvedConfig =
            typeof config === "number" ? { seed: config } : config;
        const seed = resolvedConfig.seed ?? 0;
        this.rng = new SeededRandom(seed);
        this.state = createInitialState(seed, resolvedConfig);
        if (resolvedConfig.affix) {
            AffixSystem.apply(this.state, resolvedConfig.affix);
        }
    }

    tick(inputs = {}) {
        this.state.tick += 1;
        this.state.events = [];
        this.state.runStats.ticks += 1;
        this.state.runStats.wave = this.state.wave.current;
        const leadPlayer = this.state.players[0];
        if (leadPlayer) {
            this.state.runStats.maxHealth = Math.max(
                this.state.runStats.maxHealth,
                leadPlayer.maxHealth
            );
            this.state.runStats.maxMoveSpeed = Math.max(
                this.state.runStats.maxMoveSpeed,
                leadPlayer.speed
            );
            this.state.runStats.maxProjectiles = Math.max(
                this.state.runStats.maxProjectiles,
                leadPlayer.projectileCount ?? 1
            );
            this.state.runStats.synergies = leadPlayer.synergies ?? [];
        }

        if (this.state.bossDeathTimer > 0) {
            this.state.bossDeathTimer = Math.max(
                0,
                this.state.bossDeathTimer - 1
            );
        }

        if (this.state.pendingUpgrade) {
            return;
        }

        WaveSystem.update(this.state, this.rng);
        PlayerSystem.update(this.state, inputs, this.rng);
        EnemySystem.update(this.state, this.rng);
        BossSystem.update(this.state, this.rng);
        BulletSystem.update(this.state);
        CollisionSystem.update(this.state);
        DamageSystem.update(this.state, this.rng);
        DamageSystem.updateSingularities(this.state);
        PickupSystem.update(this.state);
        LevelSystem.update(this.state, this.rng);
        GameEndSystem.update(this.state);

        // PERFORMANCE: Cap event queue to prevent UI/Audio lag in extreme waves
        if (this.state.events.length > 100) {
            this.state.events.length = 100;
        }

        this.cleanupDeadEntities();
    }

    cleanupDeadEntities() {
        // In-place compaction to avoid allocating new arrays every tick
        compactAlive(this.state.bullets);
        compactAlive(this.state.enemies);
        compactAlive(this.state.pickups);
    }

    getState() {
        return this.state;
    }

    getSnapshot() {
        return {
            tick: this.state.tick,
            players: this.state.players.map((p) => ({
                id: p.id,
                x: p.x,
                y: p.y,
                health: p.health,
            })),
            enemyCount: this.state.enemies.length,
        };
    }

    applyUpgrade(playerId, upgradeId) {
        if (!this.state.pendingUpgrade) return false;
        if (this.state.pendingUpgrade.playerId !== playerId) return false;
        const applied = UpgradeSystem.applyUpgrade(
            this.state,
            playerId,
            upgradeId
        );
        if (applied) {
            this.state.pendingUpgrade = null;
        }
        return applied;
    }

    // Debug methods for DevConsole
    setWave(waveIndex) {
        const index = Math.max(
            0,
            Math.min(waveIndex, this.state.wave?.maxWave ?? 19)
        );
        this.state.wave.current = index;
        this.state.enemies = []; // Clear existing enemies
        this.state.bullets = []; // Clear bullets
        this.state.phase = "intermission";
        this.state.wave.intermission = 1; // Start almost immediately
        console.log(`[DEBUG] Wave set to ${index + 1}`);
    }

    forceUpgrade(playerId, upgradeId) {
        // Apply upgrade directly regardless of state
        UpgradeSystem.applyUpgrade(this.state, playerId, upgradeId);
        console.log(
            `[DEBUG] Forced upgrade ${upgradeId} for player ${playerId}`
        );
    }

    toggleInvincibility(playerId) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (player) {
            player.debugInvincible = !player.debugInvincible;
            console.log(
                `[DEBUG] Invincibility for ${playerId}: ${
                    player.debugInvincible ? "ON" : "OFF"
                }`
            );
        }
    }
}

/**
 * In-place array compaction - removes dead entities without allocating a new array.
 */
function compactAlive(arr) {
    let writeIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].alive) {
            arr[writeIndex++] = arr[i];
        }
    }
    if (writeIndex < arr.length) {
        arr.length = writeIndex;
    }
}
