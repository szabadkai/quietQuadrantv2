import { BOSSES } from "../config/bosses.js";
import { ARENA_WIDTH, ARENA_HEIGHT } from "../utils/constants.js";
import { clamp, normalize } from "../utils/math.js";
import { BeamSpin } from "./bosses/patterns/BeamSpin.js";
import { AimedBurst } from "./bosses/patterns/AimedBurst.js";
import { RingWithGap } from "./bosses/patterns/RingWithGap.js";
import { SummonMinions } from "./bosses/patterns/SummonMinions.js";
import { ConeVolley } from "./bosses/patterns/ConeVolley.js";
import { PulseRing } from "./bosses/patterns/PulseRing.js";
import { Slam } from "./bosses/patterns/Slam.js";
import { RicochetShards } from "./bosses/patterns/RicochetShards.js";
import { LaneBeams } from "./bosses/patterns/LaneBeams.js";

const PATTERNS = {
    "beam-spin": BeamSpin,
    "aimed-burst": AimedBurst,
    "ring-with-gap": RingWithGap,
    "summon-minions": SummonMinions,
    "cone-volley": ConeVolley,
    "pulse-ring": PulseRing,
    slam: Slam,
    "ricochet-shards": RicochetShards,
    "lane-beams": LaneBeams,
};

const BASE_BOSS = {
    health: 800,
    speed: 55,
    radius: 32,
};

export const BossSystem = {
    spawnBoss(state, rng, bossId = null) {
        if (state.boss) return state.boss;

        const config = bossId
            ? BOSSES.find((boss) => boss.id === bossId)
            : rng.pick(BOSSES);
        if (!config) return null;

        const affixHealth = state.modifiers?.bossHealth ?? 1;
        const health = Math.round(
            BASE_BOSS.health * config.healthMultiplier * affixHealth
        );
        
        // Store base stats for phase modifier calculations
        const baseSpeed = BASE_BOSS.speed * (config.speedMultiplier ?? 1);
        const baseFireRate = config.fireRateMultiplier ?? 1;
        const baseProjectileSpeed = config.projectileSpeedMultiplier ?? 1;
        
        const boss = {
            id: config.id,
            name: config.name,
            x: ARENA_WIDTH / 2,
            y: ARENA_HEIGHT / 3,
            prevX: ARENA_WIDTH / 2,
            prevY: ARENA_HEIGHT / 3,
            health,
            maxHealth: health,
            radius: BASE_BOSS.radius,
            // Base stats (unmodified by phase)
            baseSpeed,
            baseFireRate,
            baseProjectileSpeed,
            // Current stats (modified by phase)
            speed: baseSpeed,
            fireRateMultiplier: baseFireRate,
            projectileSpeedMultiplier: baseProjectileSpeed,
            patterns: config.patterns,
            phases: config.phases,
            phaseModifiers: config.phaseModifiers ?? null,
            phaseIndex: 0,
            patternIndex: 0,
            pattern: config.patterns[0],
            patternTick: 0,
            patternDuration: 180,
            alive: true,
        };

        state.boss = boss;
        state.phase = "boss";
        state.events.push({
            type: "boss-spawn",
            bossId: boss.id,
            x: boss.x,
            y: boss.y,
        });
        if (state.runStats) {
            state.runStats.bossId = boss.id;
            state.runStats.bossName = boss.name;
        }
        return boss;
    },

    update(state, rng) {
        const boss = state.boss;
        if (!boss || !boss.alive) return;

        boss.prevX = boss.x;
        boss.prevY = boss.y;

        this.updatePhase(state, boss);
        this.moveBoss(state, boss);
        this.runPattern(state, boss, rng);
    },

    updatePhase(state, boss) {
        const healthRatio = boss.health / boss.maxHealth;
        let nextIndex = boss.phaseIndex;
        for (let i = 0; i < boss.phases.length; i += 1) {
            if (healthRatio <= boss.phases[i]) {
                nextIndex = i;
            }
        }

        if (nextIndex !== boss.phaseIndex) {
            boss.phaseIndex = nextIndex;
            boss.patternTick = 0;
            
            // Apply phase modifiers to escalate difficulty
            if (boss.phaseModifiers && boss.phaseModifiers[nextIndex]) {
                const mod = boss.phaseModifiers[nextIndex];
                boss.speed = boss.baseSpeed * (mod.speed ?? 1);
                boss.fireRateMultiplier = boss.baseFireRate * (mod.fireRate ?? 1);
                boss.projectileSpeedMultiplier = boss.baseProjectileSpeed * (mod.projectileSpeed ?? 1);
            }
            
            state.events.push({
                type: "boss-phase",
                bossId: boss.id,
                phase: boss.phaseIndex,
                totalPhases: boss.phases.length,
            });
        }
    },

    moveBoss(state, boss) {
        const target = getPlayerCenter(state);
        if (!target) return;

        const dir = normalize(target.x - boss.x, target.y - boss.y);
        boss.x = clamp(
            boss.x + dir.x * (boss.speed / 60),
            boss.radius,
            ARENA_WIDTH - boss.radius
        );
        boss.y = clamp(
            boss.y + dir.y * (boss.speed / 60),
            boss.radius,
            ARENA_HEIGHT * 0.7
        );
    },

    runPattern(state, boss, rng) {
        const pattern = PATTERNS[boss.pattern];
        boss.patternTick += 1;

        if (pattern) {
            pattern.update(state, boss, rng);
        }

        if (boss.patternTick >= boss.patternDuration) {
            boss.patternTick = 0;
            boss.patternIndex = (boss.patternIndex + 1) % boss.patterns.length;
            boss.pattern = boss.patterns[boss.patternIndex];
            boss.patternDuration = patternDurationFor(
                boss.pattern,
                boss.phaseIndex
            );
        }
    },
};

function getPlayerCenter(state) {
    const alive = state.players.filter((player) => player.alive);
    if (!alive.length) return null;
    const sum = alive.reduce(
        (acc, player) => {
            acc.x += player.x;
            acc.y += player.y;
            return acc;
        },
        { x: 0, y: 0 }
    );
    return { x: sum.x / alive.length, y: sum.y / alive.length };
}

function patternDurationFor(pattern, phase) {
    const base = {
        "beam-spin": 180,
        "aimed-burst": 150,
        "ring-with-gap": 150,
        "summon-minions": 120,
        "cone-volley": 150,
        "pulse-ring": 150,
        slam: 150,
        "ricochet-shards": 150,
        "lane-beams": 150,
    };

    const duration = base[pattern] ?? 150;
    return Math.max(90, Math.round(duration * (1 - phase * 0.12)));
}
