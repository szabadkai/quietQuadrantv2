import { ENEMIES, ELITE_MODIFIERS } from "../config/enemies.js";
import {
    ARENA_WIDTH,
    ARENA_HEIGHT,
    ENEMY_BULLET_RADIUS,
    TICK_RATE,
} from "../utils/constants.js";
import { clamp, normalize } from "../utils/math.js";
import { DrifterAI } from "./enemies/DrifterAI.js";
import { WatcherAI } from "./enemies/WatcherAI.js";
import { MassAI } from "./enemies/MassAI.js";
import { PhantomAI } from "./enemies/PhantomAI.js";
import { OrbiterAI } from "./enemies/OrbiterAI.js";
import { SplitterAI } from "./enemies/SplitterAI.js";
import { ChargerAI } from "./enemies/ChargerAI.js";
import { ShielderAI } from "./enemies/ShielderAI.js";
import { BomberAI } from "./enemies/BomberAI.js";
import {
    getEliteSpeedMultiplier,
    initEliteBehavior,
    updateEliteBehavior,
} from "./EliteBehaviors.js";

const AI_MAP = {
    drifter: DrifterAI,
    watcher: WatcherAI,
    mass: MassAI,
    phantom: PhantomAI,
    orbiter: OrbiterAI,
    splitter: SplitterAI,
    charger: ChargerAI,
    shielder: ShielderAI,
    bomber: BomberAI,
};

export const EnemySystem = {
    update(state, rng) {
        const helpers = this.getHelpers();

        for (const enemy of state.enemies) {
            if (!enemy.alive) continue;

            updateEliteBehavior(enemy);

            enemy.prevX = enemy.x;
            enemy.prevY = enemy.y;

            const ai = AI_MAP[enemy.type];
            if (ai) {
                ai.update(enemy, state, rng, helpers);
            }

            this.clampToArena(enemy);
        }
    },

    getHelpers() {
        return {
            getNearestPlayer,
            spawnBullet: spawnEnemyBullet,
            getEliteSpeedMultiplier,
        };
    },

    clampToArena(enemy) {
        enemy.x = clamp(enemy.x, enemy.radius, ARENA_WIDTH - enemy.radius);
        enemy.y = clamp(enemy.y, enemy.radius, ARENA_HEIGHT - enemy.radius);
    },
};

export function spawnEnemy(state, kind, rng, options = {}) {
    const base = ENEMIES[kind];
    if (!base) return null;

    const elite = options.elite ?? false;
    const modifiers = elite
        ? ELITE_MODIFIERS
        : { health: 1, speed: 1, damage: 1 };
    const affixMods = state.modifiers ?? {};
    const scale = options.scale ?? 1;
    const position = options.position ?? randomEdgePosition(rng);

    const health = Math.round(
        base.health * modifiers.health * (affixMods.enemyHealth ?? 1) * scale
    );
    const speed =
        base.speed *
        modifiers.speed *
        (affixMods.enemySpeed ?? 1) *
        (options.speedScale ?? 1);
    const contactDamage =
        base.contactDamage * modifiers.damage * (affixMods.enemyDamage ?? 1);
    const bulletDamage = base.bulletDamage
        ? base.bulletDamage * modifiers.damage * (affixMods.enemyDamage ?? 1)
        : 0;

    const enemy = {
        id: state.nextEnemyId++,
        type: kind,
        x: position.x,
        y: position.y,
        prevX: position.x,
        prevY: position.y,
        vx: 0,
        vy: 0,
        speed,
        radius: base.radius * scale,
        health,
        maxHealth: health,
        contactDamage,
        bulletDamage,
        bulletSpeed: base.bulletSpeed
            ? base.bulletSpeed * (affixMods.enemyProjectileSpeed ?? 1)
            : 0,
        fireCooldownTicks: base.fireCooldownTicks ?? 0,
        fireCooldown: base.fireCooldownTicks
            ? rng.nextInt(0, base.fireCooldownTicks)
            : 0,
        elite,
        eliteBehavior: base.eliteBehavior ?? null,
        splitDepth: options.splitDepth ?? 0,
        alive: true,
    };

    if (kind === "phantom") {
        enemy.teleportCooldownRange = [180, 240];
        enemy.teleportCooldown = rng.nextInt(180, 240);
    }

    if (kind === "orbiter") {
        enemy.orbitAngle = rng.nextRange(0, Math.PI * 2);
        enemy.orbitDir = rng.next() > 0.5 ? 1 : -1;
        enemy.orbitRadius = 180;
    }

    initEliteBehavior(enemy, rng);
    state.enemies.push(enemy);
    return enemy;
}

function randomEdgePosition(rng) {
    const side = rng.nextInt(0, 3);
    if (side === 0) {
        return { x: rng.nextRange(0, ARENA_WIDTH), y: 0 };
    }
    if (side === 1) {
        return { x: rng.nextRange(0, ARENA_WIDTH), y: ARENA_HEIGHT };
    }
    if (side === 2) {
        return { x: 0, y: rng.nextRange(0, ARENA_HEIGHT) };
    }
    return { x: ARENA_WIDTH, y: rng.nextRange(0, ARENA_HEIGHT) };
}

function spawnEnemyBullet(state, enemy, dirX, dirY) {
    const dir = normalize(dirX, dirY);
    if (dir.x === 0 && dir.y === 0) return;
    if (!enemy.bulletSpeed || !enemy.bulletDamage) return;

    const spawnX = enemy.x + dir.x * (enemy.radius + ENEMY_BULLET_RADIUS + 2);
    const spawnY = enemy.y + dir.y * (enemy.radius + ENEMY_BULLET_RADIUS + 2);

    state.bullets.push({
        id: state.nextBulletId++,
        owner: "enemy",
        x: spawnX,
        y: spawnY,
        prevX: spawnX,
        prevY: spawnY,
        vx: dir.x * enemy.bulletSpeed,
        vy: dir.y * enemy.bulletSpeed,
        damage: enemy.bulletDamage,
        pierce: 0,
        ttl: Math.floor(TICK_RATE * 3),
        radius: ENEMY_BULLET_RADIUS,
        alive: true,
    });
}

function getNearestPlayer(state, enemy) {
    let best = null;
    let bestDist = Infinity;

    for (const player of state.players) {
        if (!player.alive) continue;
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
            bestDist = dist;
            best = player;
        }
    }

    return best;
}
