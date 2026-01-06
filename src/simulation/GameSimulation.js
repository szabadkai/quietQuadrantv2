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
import { DeckScaling } from "./DeckScaling.js";
import { ARENA_WIDTH, ARENA_HEIGHT } from "../utils/constants.js";

export class GameSimulation {
    constructor(config = {}) {
        const resolvedConfig =
            typeof config === "number" ? { seed: config } : config;
        const seed = resolvedConfig.seed ?? 0;
        this.rng = new SeededRandom(seed);
        this.state = createInitialState(seed, resolvedConfig);

        // Benchmark Setup
        if (resolvedConfig.benchmark) {
            this.setupBenchmark(resolvedConfig.benchmark);
        }

        // Apply deck-based difficulty scaling before affixes
        // (affixes will multiply on top of deck scaling)
        DeckScaling.applyToState(
            this.state,
            resolvedConfig.cardBoosts,
            resolvedConfig.unlockedUpgrades
        );

        if (resolvedConfig.affix) {
            AffixSystem.apply(this.state, resolvedConfig.affix);
        }
    }

    setupBenchmark(config) {
        this.state.isBenchmarking = true;
        this.state.benchmarkDuration = config.duration || 300; // Shortened to 5s
        this.state.benchmarkComplete = false;

        // Setup initial enemies based on count
        const enemies = [];
        const count = config.enemies || 100;

        for (let i = 0; i < count; i++) {
            const enemy = {
                id: i + 1000,
                x: this.rng.nextRange(0, ARENA_WIDTH),
                y: this.rng.nextRange(0, ARENA_HEIGHT),
                radius: 15,
                alive: true,
                vx: (this.rng.next() - 0.5) * 100,
                vy: (this.rng.next() - 0.5) * 100,
                type: "drifter",
                health: 1000, // High health to ensure they stick around
            };

            if (config.type === "swarm") {
                enemy.radius = 8;
                enemy.x = ARENA_WIDTH / 2 + (this.rng.next() - 0.5) * 300;
                enemy.y = ARENA_HEIGHT / 2 + (this.rng.next() - 0.5) * 300;
            } else if (config.type === "mixed") {
                const rand = this.rng.next();
                if (rand < 0.5) {
                    enemy.type = "drifter";
                } else if (rand < 0.7) {
                    enemy.type = "charger";
                    enemy.radius = 12;
                    enemy.vx *= 1.5;
                    enemy.vy *= 1.5;
                } else if (rand < 0.85) {
                    enemy.type = "swarmer";
                    enemy.radius = 8;
                } else {
                    enemy.type = "phantom";
                    enemy.radius = 14;
                }
            }

            enemies.push(enemy);
        }
        this.state.enemies = enemies;

        // Add dummy bullets for stress testing
        this.state.benchmarkTargetBullets = config.bullets || 0;
        if (this.state.benchmarkTargetBullets > 0) {
            this.spawnBenchmarkBullets(this.state.benchmarkTargetBullets);
        }

        // Make players invincible
        this.state.players.forEach((p) => {
            p.debugInvincible = true;
        });
    }

    endBenchmark() {
        this.state.isBenchmarking = false;
        this.state.benchmarkComplete = false;
        this.state.benchmarkResults = null;
    }

    tick(inputs = {}) {
        this.state.tick += 1;

        if (this.state.isBenchmarking) {
            if (this.state.benchmarkDuration > 0) {
                this.state.benchmarkDuration--;
            } else {
                this.state.benchmarkComplete = true;
            }

            if (!this.state.benchmarkComplete) {
                // Maintain bullet count
                if (this.state.benchmarkTargetBullets > 0) {
                    const currentBullets = this.state.bullets.length;
                    if (currentBullets < this.state.benchmarkTargetBullets) {
                        this.spawnBenchmarkBullets(
                            this.state.benchmarkTargetBullets - currentBullets
                        );
                    }
                }

                // Automated inputs for benchmark
                const tick = this.state.tick;
                const time = tick / 60;

                // Circular movement
                const moveX = Math.cos(time * 2);
                const moveY = Math.sin(time * 2);

                // Rotating aim
                const aimX = Math.cos(time * 3);
                const aimY = Math.sin(time * 3);

                // Construct inputs for P1
                inputs = {
                    p1: {
                        moveX,
                        moveY,
                        aimX,
                        aimY,
                        fire: true, // Always firing
                        dash: tick % 120 === 0, // Dash every 2 seconds
                    },
                };
            }
        }

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

    spawnBenchmarkBullets(count) {
        for (let i = 0; i < count; i++) {
            this.state.bullets.push({
                id: i + 5000 + this.state.tick * 1000, // Ensure unique IDs
                owner: i % 2 === 0 ? "p1" : "enemy",
                x: this.rng.nextRange(0, ARENA_WIDTH),
                y: this.rng.nextRange(0, ARENA_HEIGHT),
                radius: 5,
                alive: true,
                vx: (this.rng.next() - 0.5) * 300,
                vy: (this.rng.next() - 0.5) * 300,
                damage: 1,
                ttl: 600, // Long life
            });
        }
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

    setInvincibility(playerId, enabled) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (player) {
            player.debugInvincible = enabled;
            console.log(
                `[DEBUG] Invincibility for ${playerId} set to: ${
                    enabled ? "ON" : "OFF"
                }`
            );
        }
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
