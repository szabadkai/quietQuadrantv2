import {
    ARENA_WIDTH,
    ARENA_HEIGHT,
    PLAYER_RADIUS,
} from "../utils/constants.js";
import { PLAYER_BASE } from "../config/player.js";

export function createInitialState(seed = 0, config = {}) {
    const playerCount = Math.max(1, Math.floor(config.playerCount ?? 1));
    const players = createPlayers(playerCount);

    return {
        tick: 0,
        seed,
        phase: "pregame",
        players,
        enemies: [],
        bullets: [],
        pickups: [],
        wave: {
            current: 0,
            enemiesRemaining: 0,
            spawnQueue: [],
            spawnCooldown: 0,
            intermission: 0,
        },
        boss: null,
        nextBulletId: 1,
        nextEnemyId: 1,
        nextPickupId: 1,
        damageQueue: [],
        xpQueue: [],
        pendingUpgrade: null,
        affix: null,
        cardBoosts: config.cardBoosts ?? {},
        unlockedUpgrades: Array.isArray(config.unlockedUpgrades)
            ? [...config.unlockedUpgrades]
            : null,
        modifiers: {
            enemyHealth: 1,
            enemySpeed: 1,
            enemyDamage: 1,
            playerDamage: 1,
            playerSpeed: 1,
            xpGain: 1,
            upgradeChoices: 3,
            enemyProjectileSpeed: 1,
            eliteChance: 1,
            bossHealth: 1,
            bossProjectileSpeed: 1,
            playerAccuracy: 1,
            playerFireRate: 1,
            playerMaxHealth: 0,
            enemyCount: 1,
            dashCooldownMult: 1,
            rareUpgradeBonus: 0,
            legendaryUpgradeBonus: 0,
        },
        runStats: {
            ticks: 0,
            wave: 0,
            kills: 0,
            bossDefeated: false,
            damageDealt: 0,
            damageTaken: 0,
            shotsFired: 0,
            shotsHit: 0,
            multiplayer: playerCount > 1,
            highestHit: 0,
            maxMultiKill: 0,
            endHealth: 0,
            maxHealth: 0,
            maxProjectiles: 0,
            maxMoveSpeed: 0,
            totalHealing: 0,
            teamDamageShare: 0,
            partnerRevives: 0,
            syncedUpgradePicks: 0,
            synergies: [],
        },
        runSummary: null,
        events: [],
    };
}

function createPlayers(count) {
    const players = [];
    const centerX = ARENA_WIDTH / 2;
    const centerY = ARENA_HEIGHT / 2;
    const spacing = 48;
    const startX = centerX - ((count - 1) * spacing) / 2;

    for (let i = 0; i < count; i += 1) {
        players.push(
            createPlayer(`p${i + 1}`, {
                x: startX + i * spacing,
                y: centerY,
            })
        );
    }

    return players;
}

export function createPlayer(id, position = {}) {
    const x = position.x ?? ARENA_WIDTH / 2;
    const y = position.y ?? ARENA_HEIGHT / 2;
    return {
        id,
        x,
        y,
        prevX: x,
        prevY: y,
        vx: 0,
        vy: 0,
        aimX: 1,
        aimY: 0,
        rotation: 0,
        health: PLAYER_BASE.maxHealth,
        maxHealth: PLAYER_BASE.maxHealth,
        xp: 0,
        level: 1,
        xpToNext: 50,
        speed: PLAYER_BASE.speed,
        fireCooldownTicks: PLAYER_BASE.fireCooldownTicks,
        fireCooldown: 0,
        bulletSpeed: PLAYER_BASE.bulletSpeed,
        bulletDamage: PLAYER_BASE.bulletDamage,
        bulletTtl: PLAYER_BASE.bulletTtl,
        bulletPierce: PLAYER_BASE.bulletPierce,
        bulletRadius: PLAYER_RADIUS * 0.25,
        homingRange: 0,
        projectileCount: 1,
        spreadDeg: 0,
        homingStrength: 0,
        explosiveRadius: 0,
        splitShot: null,
        chargedShotDamagePct: 0,
        chargePierce: 0,
        accuracyPct: PLAYER_BASE.accuracyPct ?? 1,
        critChance: PLAYER_BASE.critChance ?? 0,
        critDamage: PLAYER_BASE.critDamage ?? 2.0,
        damageReduction: PLAYER_BASE.damageReduction ?? 0,
        collisionDamageReduction: 0,
        dashCooldownMs: PLAYER_BASE.dashCooldownMs ?? 0,
        dashDurationMs: PLAYER_BASE.dashDurationMs ?? 0,
        invulnAfterHitMs: PLAYER_BASE.invulnAfterHitMs ?? 0,
        magnetRadius: PLAYER_BASE.magnetRadius ?? 0,
        ricochet: 0,
        dashSparksCount: 0,
        shrapnelCount: 0,
        shrapnelDamagePct: 0,
        xpShieldDurationTicks: 0,
        xpShieldCooldownTicks: 0,
        shieldActive: false,
        shieldFrames: 0,
        shieldCooldown: 0,
        lifestealAmount: 0,
        lifestealCooldownTicks: 0,
        lifestealCooldown: 0,
        momentumMaxBonus: 0,
        momentumBuildRate: 0,
        momentum: 0,
        chainArcDamagePct: 0,
        chainArcRange: 0,
        bloodFuelHealOnKill: 0,
        bloodFuelFireCost: 0,
        chainReactionDamagePct: 0,
        chainReactionRadius: 0,
        canPhaseShots: false,
        berserkMaxBonus: 0,
        neutronCore: false,
        neutronBlockRadius: 0,
        singularityPullStrength: 0,
        singularityRadius: 0,
        size: PLAYER_BASE.size ?? PLAYER_RADIUS * 2,
        xpPickupRadiusPct: 0,
        radius: PLAYER_RADIUS,
        invulnFrames: 0,
        alive: true,
        upgrades: [],
        synergies: [],
        pendingUpgrades: 0,
        base: {
            maxHealth: PLAYER_BASE.maxHealth,
            speed: PLAYER_BASE.speed,
            fireCooldownTicks: PLAYER_BASE.fireCooldownTicks,
            bulletSpeed: PLAYER_BASE.bulletSpeed,
            bulletDamage: PLAYER_BASE.bulletDamage,
            bulletTtl: PLAYER_BASE.bulletTtl,
            bulletPierce: PLAYER_BASE.bulletPierce,
            bulletRadius: PLAYER_RADIUS * 0.25,
            accuracyPct: PLAYER_BASE.accuracyPct ?? 1,
            magnetRadius: PLAYER_BASE.magnetRadius ?? 0,
            damageReduction: PLAYER_BASE.damageReduction ?? 0,
        },
    };
}
