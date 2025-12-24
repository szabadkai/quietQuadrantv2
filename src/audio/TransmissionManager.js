/**
 * Manages transmission audio playback for contextual cues (waves, health, bosses, upgrades).
 * Looks for files in public/transmissions based on the manifest and falls back to general chatter.
 */
import {
    DEFAULT_MANIFEST,
    UPGRADE_CATEGORY_TO_POOL,
    cloneManifest,
    mergeManifest
} from "./transmissionManifest.js";
import { TransmissionPlayer } from "./TransmissionPlayer.js";

// Maps specific upgrade IDs to their voice line clips for precise callouts.
const UPGRADE_CLIP_BY_ID = {
    "power-shot": "./transmissions/upgrades/powershot.mp3",
    "rapid-fire": "./transmissions/upgrades/rapid_fire.mp3",
    heatseeker: "./transmissions/upgrades/heat_seaker.mp3",
    "heavy-barrel": "./transmissions/upgrades/heavy_barrel.mp3",
    rebound: "./transmissions/upgrades/rebound.mp3",
    "split-shot": "./transmissions/upgrades/split_shot.mp3",
    pierce: "./transmissions/upgrades/piercing_round.mp3",
    "chain-arc": "./transmissions/upgrades/chain_arc.mp3",
    "explosive-impact": "./transmissions/upgrades/explosive_impact.mp3",
    sidecar: "./transmissions/upgrades/side_cart.mp3",
    plating: "./transmissions/upgrades/lite_plating.mp3",
    "shield-pickup": "./transmissions/upgrades/xp_shield.mp3",
    stabilizers: "./transmissions/upgrades/stabilizers.mp3",
    "kinetic-siphon": "./transmissions/upgrades/kinetic_syphon.mp3",
    "neutron-core": "./transmissions/upgrades/neutron_core.mp3",
    "engine-tune": "./transmissions/upgrades/engine_tune.mp3",
    "magnet-coil": "./transmissions/upgrades/magnet_coil.mp3",
    "dash-sparks": "./transmissions/upgrades/dash_sparks.mp3",
    "momentum-feed": "./transmissions/upgrades/momentum_feed.mp3",
    "quantum-tunneling": "./transmissions/upgrades/quantum_tunneling.mp3",
    "glass-cannon": "./transmissions/upgrades/glass_canon.mp3",
    "singularity-rounds": "./transmissions/upgrades/singularity_round.mp3",
    "bullet-hell": "./transmissions/upgrades/bullet_hell.mp3",
    "blood-fuel": "./transmissions/upgrades/blood_fuel.mp3",
    "berserk-module": "./transmissions/upgrades/berserk_Module.mp3"
};

class TransmissionManager {
    constructor() {
        this.volume = 0.6;
        this.initialized = false;
        this.manifestLoaded = false;
        this.manifest = cloneManifest(DEFAULT_MANIFEST);
        this.player = new TransmissionPlayer({ volume: this.volume });
        this.announcedEnemies = new Set();
        this.eliteAnnounced = false;
        this.lastHealthTier = "healthy";
        this.lastHealthWarningMs = 0;
    }

    async init() {
        if (this.initialized) return;

        await this.loadManifest();
        await this.player.init();
        this.player.setVolume(this.volume);
        this.initialized = true;
    }

    async loadManifest() {
        if (this.manifestLoaded) return;
        try {
            const response = await fetch("./transmissions/manifest.json");
            if (!response.ok) throw new Error("manifest missing");
            const data = await response.json();
            this.manifest = mergeManifest(data);
        } catch (error) {
            this.manifest = cloneManifest(DEFAULT_MANIFEST);
        }
        this.manifestLoaded = true;
    }

    getPool(section, key = null) {
        const sourceSection = this.manifest[section] ?? DEFAULT_MANIFEST[section];
        if (!key) {
            return Array.isArray(sourceSection)
                ? sourceSection
                : DEFAULT_MANIFEST.general;
        }
        if (!sourceSection || !sourceSection[key]) return [];
        return sourceSection[key];
    }

    async playRandom(phase = null) {
        await this.init();
        
        let pool;
        if (phase === "intermission") {
            pool = this.getPool("wave", "intermission");
        } else if (phase === "wave") {
            pool = this.getPool("wave", "mid");
        } else {
            // Merge multiple for general chatter
            pool = [
                ...this.getPool("wave", "mid"),
                ...this.getPool("general")
            ];
        }

        if (!pool.length) pool = this.getPool("general");

        return this.player.playFromPool(pool, "random-chatter", null, {
            chance: 0.35
        });
    }

    async playWaveBriefing(enemies = [], hasElite = false) {
        await this.init();
        const types = enemies.filter((type) => type && type !== "boss");
        
        // Find if any type is new
        const newTypes = types.filter(type => !this.announcedEnemies.has(type));
        const primary = newTypes.length > 0 ? newTypes[0] : types[0];

        if (primary && !this.announcedEnemies.has(primary)) {
            this.announcedEnemies.add(primary);
            // High chance to play lore/intro on first encounter
            const pool = this.getPool("enemies", primary);
            if (pool.length) {
                await this.player.playFromPool(pool, `enemy-intro-${primary}`, null, {
                    chance: 0.9,
                    bypassCooldown: true 
                });
                return;
            }
        }

        if (hasElite && !this.eliteAnnounced) {
            const elitePool = this.getPool("enemies", "elite");
            if (elitePool.length) {
                this.eliteAnnounced = true;
                await this.player.playFromPool(
                    elitePool,
                    "enemy-elite",
                    this.getPool("general"),
                    { chance: 0.7, bypassCooldown: true }
                );
                return;
            }
        }

        const pool = primary ? this.getPool("enemies", primary) : [];
        const fallback =
      this.getPool("wave", "intermission") ?? this.getPool("general");
        await this.player.playFromPool(
            pool,
            `enemy-${primary ?? "wave"}`,
            fallback,
            {
                chance: 0.5 // Slightly increased
            }
        );
    }

    async playBossIntro(bossId) {
        await this.init();
        const pool = this.getPool("bosses", bossId);
        await this.player.playFromPool(
            pool,
            `boss-${bossId}`,
            this.getPool("general"),
            {
                bypassCooldown: true
            }
        );
    }

    async playUpgradeIntel({ rarity, categories = [], options = [] } = {}) {
        await this.init();
        const fallback = null;
        const categoryKeys = [
            ...new Set(
                categories
                    .map((category) => UPGRADE_CATEGORY_TO_POOL[category])
                    .filter(Boolean)
            )
        ];

        const optionPool = options
            .map((id) => UPGRADE_CLIP_BY_ID[id])
            .filter(Boolean);
        if (optionPool.length) {
            const played = await this.player.playFromPool(
                optionPool,
                "upgrade-options",
                fallback,
                { chance: 0.55 }
            );
            if (played) return;
        }

        if (rarity === "legendary") {
            const pool = this.getPool("upgrades", "legendary");
            if (pool.length) {
                if (
                    await this.player.playFromPool(pool, "upgrade-legendary", fallback, {
                        chance: 0.55
                    })
                ) {
                    return;
                }
            }
        }

        for (const poolKey of categoryKeys) {
            const pool = this.getPool("upgrades", poolKey);
            if (!pool.length) continue;
            await this.player.playFromPool(pool, `upgrade-${poolKey}`, fallback, {
                chance: 0.4
            });
            return;
        }
    }

    async playHealthWarning(tier) {
        await this.init();
        
        // Prevent health warning spamming (e.g. bouncing around thresholds)
        const now = Date.now();
        const healthGap = now - this.lastHealthWarningMs;
        if (healthGap < 15000) return; // Minimum 15s between ANY health warnings

        const key = tier === "critical" ? "critical" : "warning";
        const played = await this.player.playFromPool(
            this.getPool("health", key),
            `health-${key}`,
            this.getPool("general"),
            {
                chance: tier === "critical" ? 0.8 : 0.4,
                bypassCooldown: tier === "critical"
            }
        );

        if (played) {
            this.lastHealthWarningMs = now;
        }
    }

    async playWaveClear() {
        await this.init();
        const pool = this.getPool("wave", "success");
        await this.player.playFromPool(pool, "wave-success", null, {
            chance: 0.7,
            bypassCooldown: true
        });
    }

    async playRankUp() {
        await this.init();
        const pool = this.getPool("milestone", "rankUp");
        await this.player.playFromPool(pool, "milestone-rankup", null, {
            chance: 1,
            bypassCooldown: true
        });
    }

    async playSynergyUnlocked() {
        await this.init();
        const pool = this.getPool("milestone", "synergy");
        await this.player.playFromPool(pool, "milestone-synergy", null, {
            chance: 0.9,
            bypassCooldown: true
        });
    }

    async playVictory() {
        await this.init();
        const pool = this.getPool("milestone", "victory");
        await this.player.playFromPool(pool, "milestone-victory", null, {
            chance: 1,
            bypassCooldown: true
        });
    }

    async playDefeat() {
        await this.init();
        const pool = this.getPool("milestone", "defeat");
        await this.player.playFromPool(pool, "milestone-defeat", null, {
            chance: 1,
            bypassCooldown: true
        });
    }

    stop() {
        this.player.stop();
    }

    reset() {
        this.player.reset();
        this.announcedEnemies.clear();
        this.eliteAnnounced = false;
        this.lastHealthTier = "healthy";
        this.lastHealthWarningMs = 0;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.player.setVolume(this.volume);
    }

    resume() {
        this.player.resume();
    }

    destroy() {
        this.player.destroy();
        this.initialized = false;
        this.announcedEnemies.clear();
        this.eliteAnnounced = false;
        this.lastHealthTier = "healthy";
        this.lastHealthWarningMs = 0;
    }
}

export const transmissionManager = new TransmissionManager();
