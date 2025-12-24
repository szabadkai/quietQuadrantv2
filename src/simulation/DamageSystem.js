/* eslint-disable max-lines */
import {
    ARENA_WIDTH,
    ARENA_HEIGHT,
    PICKUP_RADIUS,
    PLAYER_INVULN_FRAMES,
    TICK_RATE,
} from "../utils/constants.js";
import { ENEMIES } from "../config/enemies.js";
import { spawnEnemy } from "./EnemySystem.js";

const PLAYER_PROJECTILE_MIN_RANGE =
    Math.max(ARENA_WIDTH, ARENA_HEIGHT) * 1.5;
const BOSS_DEATH_ANIMATION_TICKS = Math.round(TICK_RATE * 1.5);

export const DamageSystem = {
    update(state, rng) {
        if (!state.damageQueue.length) return;

        for (const damage of state.damageQueue) {
            if (damage.target === "enemy") {
                this.applyEnemyDamage(state, rng, damage);
            } else if (damage.target === "boss") {
                this.applyBossDamage(state, rng, damage);
            } else if (damage.target === "player") {
                this.applyPlayerDamage(state, damage);
            }
        }

        state.damageQueue = [];
    },

    applyEnemyDamage(state, rng, damage) {
        const enemy = state.enemies.find((e) => e.id === damage.id);
        if (!enemy || !enemy.alive) return;

        // Roll for crit
        let finalDamage = damage.amount;
        let isCrit = false;
        if (damage.source?.type === "bullet" && rng) {
            const critChance = damage.source.critChance ?? 0;
            if (critChance > 0 && rng.next() < critChance) {
                isCrit = true;
                finalDamage *= damage.source.critDamage ?? 2.0;
                state.events.push({
                    type: "crit-hit",
                    x: enemy.x,
                    y: enemy.y,
                });
            }
        }

        enemy.health -= finalDamage;
        if (state.runStats) {
            state.runStats.damageDealt += finalDamage;
            state.runStats.highestHit = Math.max(
                state.runStats.highestHit,
                finalDamage
            );
            if (isCrit) state.runStats.crits = (state.runStats.crits ?? 0) + 1;
        }
        state.events.push({
            type: "damage-number",
            x: enemy.x,
            y: enemy.y,
            amount: Math.round(finalDamage),
            isCrit,
        });
        const sourcePlayer = getPlayerFromSource(state, damage.source);
        if (isCrit && damage.source?.type === "bullet" && sourcePlayer) {
            this.spawnCritShrapnel(state, enemy, damage.source, sourcePlayer);
        }
        if (damage.source?.type === "bullet") {
            if (damage.source.explosiveRadius > 0) {
                this.applyExplosion(state, enemy, damage);
            }
            if (damage.source.splitShot) {
                this.spawnSplitBullets(state, damage.source);
            }
            if (sourcePlayer?.singularityRadius > 0) {
                this.applySingularity(state, sourcePlayer, damage.source);
            }
        }

        if (enemy.health > 0) return;

        enemy.alive = false;
        if (state.runStats) {
            state.runStats.kills += 1;
        }

        // Emit death event with position for effects
        state.events.push({
            type: "enemy-death",
            x: enemy.x,
            y: enemy.y,
            enemyId: enemy.id,
            isCrit,
        });

        const killer = getPlayerFromSource(state, damage.source);
        if (killer) {
            this.applyOnKillEffects(state, rng, enemy, killer, damage);
        }

        if (state.wave.enemiesRemaining > 0) {
            state.wave.enemiesRemaining -= 1;
        }

        this.spawnXpPickup(state, enemy);
        this.spawnSplitters(state, rng, enemy);
    },

    applyPlayerDamage(state, damage) {
        const player = state.players.find((p) => p.id === damage.id);
        if (!player || !player.alive) return;
        if (player.invulnFrames > 0) return;
        
        // Debug mode: skip all damage when invincible
        if (player.debugInvincible) return;

        if (player.shieldActive) {
            player.shieldActive = false;
            player.shieldFrames = 0;
            if (
                (player.xpShieldCooldownTicks ?? 0) > 0 &&
                (player.shieldCooldown ?? 0) <= 0
            ) {
                player.shieldCooldown = player.xpShieldCooldownTicks;
            }
            state.events.push({
                type: "shield-break",
                playerId: player.id,
                x: player.x,
                y: player.y,
            });
            return;
        }

        let finalDamage = damage.amount;
        if (damage.source?.type === "contact") {
            finalDamage *= 1 - (player.collisionDamageReduction ?? 0);
        }
        finalDamage *= 1 - (player.damageReduction ?? 0);
        finalDamage = Math.max(1, Math.round(finalDamage));

        player.health -= finalDamage;
        if (state.runStats) {
            state.runStats.damageTaken += finalDamage;
        }
        player.invulnFrames = PLAYER_INVULN_FRAMES;

        // Emit player-hit event for sound/visual effects
        state.events.push({
            type: "player-hit",
            playerId: player.id,
            x: player.x,
            y: player.y,
        });

        if (player.health <= 0) {
            player.alive = false;
            state.events.push({
                type: "player-down",
                playerId: player.id,
                x: player.x,
                y: player.y,
            });
        }
    },

    applyBossDamage(state, rng, damage) {
        const boss = state.boss;
        if (!boss || !boss.alive || boss.id !== damage.id) return;

        // Roll for crit
        let finalDamage = damage.amount;
        let isCrit = false;
        if (damage.source?.type === "bullet" && rng) {
            const critChance = damage.source.critChance ?? 0;
            if (critChance > 0 && rng.next() < critChance) {
                isCrit = true;
                finalDamage *= damage.source.critDamage ?? 2.0;
                state.events.push({
                    type: "crit-hit",
                    x: boss.x,
                    y: boss.y,
                });
            }
        }

        boss.health -= finalDamage;
        if (state.runStats) {
            state.runStats.damageDealt += finalDamage;
            state.runStats.highestHit = Math.max(
                state.runStats.highestHit,
                finalDamage
            );
            if (isCrit) state.runStats.crits = (state.runStats.crits ?? 0) + 1;
        }
        state.events.push({
            type: "damage-number",
            x: boss.x,
            y: boss.y,
            amount: Math.round(finalDamage),
            isCrit,
        });
        const sourcePlayer = getPlayerFromSource(state, damage.source);
        if (isCrit && damage.source?.type === "bullet" && sourcePlayer) {
            this.spawnCritShrapnel(state, boss, damage.source, sourcePlayer);
        }

        if (
            damage.source?.type === "bullet" &&
            damage.source.explosiveRadius > 0
        ) {
            this.applyExplosion(state, boss, damage);
        }

        if (boss.health > 0) return;

        boss.alive = false;
        if (state.runStats) {
            state.runStats.bossDefeated = true;
        }
        state.bossDeathTimer = Math.max(
            state.bossDeathTimer ?? 0,
            BOSS_DEATH_ANIMATION_TICKS
        );
        state.events.push({
            type: "boss-death",
            x: boss.x,
            y: boss.y,
            bossId: boss.id,
            radius: boss.radius,
        });
        state.boss = null;
    },

    spawnXpPickup(state, enemy) {
        const config = ENEMIES[enemy.type];
        if (!config) return;

        state.pickups.push({
            id: state.nextPickupId++,
            type: "xp",
            value: config.xp ?? 0,
            x: enemy.x,
            y: enemy.y,
            prevX: enemy.x,
            prevY: enemy.y,
            vx: enemy.vx ?? 0,
            vy: enemy.vy ?? 0,
            magnetized: false,
            targetId: null,
            radius: PICKUP_RADIUS,
            alive: true,
        });
    },

    spawnSplitters(state, rng, enemy) {
        if (enemy.type !== "splitter") return;
        if (enemy.splitDepth >= 1) return;

        const count = 2;
        for (let i = 0; i < count; i += 1) {
            spawnEnemy(state, "splitter", rng, {
                elite: enemy.elite,
                scale: 0.6,
                splitDepth: enemy.splitDepth + 1,
                position: {
                    x:
                        enemy.x +
                        (i === 0 ? -enemy.radius * 0.4 : enemy.radius * 0.4),
                    y: enemy.y,
                },
            });

            state.wave.enemiesRemaining += 1;
        }
    },

    applyOnKillEffects(state, rng, enemy, player, damage) {
        this.applyKillHealing(state, player, player.bloodFuelHealOnKill ?? 0);

        if (
            (player.lifestealAmount ?? 0) > 0 &&
            (player.lifestealCooldown ?? 0) <= 0
        ) {
            this.applyKillHealing(state, player, player.lifestealAmount ?? 0);
            player.lifestealCooldown = player.lifestealCooldownTicks ?? 0;
        }

        if ((player.shrapnelCount ?? 0) > 0) {
            const sourceDamage = damage.source?.damage ?? player.bulletDamage ?? 1;
            this.spawnShrapnel(
                state,
                enemy,
                damage.source,
                {
                    count: player.shrapnelCount,
                    damage: Math.max(
                        1,
                        sourceDamage * (player.shrapnelDamagePct ?? 0.3)
                    ),
                },
                rng
            );
        }

        if ((player.chainArcRange ?? 0) > 0) {
            this.spawnChainArc(state, enemy, player, damage);
        }

        if ((player.chainReactionRadius ?? 0) > 0) {
            this.applyChainReaction(state, enemy, player, damage);
        }
    },

    applyKillHealing(state, player, amount) {
        if (amount <= 0) return;
        const before = player.health;
        player.health = Math.min(player.maxHealth, player.health + amount);
        const healed = player.health - before;
        if (healed > 0) {
            state.events.push({
                type: "heal",
                playerId: player.id,
                x: player.x,
                y: player.y,
            });
            if (state.runStats) {
                state.runStats.totalHealing =
                    (state.runStats.totalHealing ?? 0) + healed;
            }
        }
    },

    spawnChainArc(state, enemy, player, damage) {
        const range = player.chainArcRange ?? 0;
        const target = getNearestEnemy(state, enemy, range);
        if (!target) return;
        const baseDamage = damage.amount ?? player.bulletDamage ?? 1;
        const arcDamage = Math.max(
            1,
            baseDamage * (player.chainArcDamagePct ?? 0.4)
        );
        state.damageQueue.push({
            target: "enemy",
            id: target.id,
            amount: arcDamage,
            source: { type: "chain-arc" },
        });
        state.events.push({
            type: "chain-arc",
            x1: enemy.x,
            y1: enemy.y,
            x2: target.x,
            y2: target.y,
        });
    },

    applyChainReaction(state, enemy, player) {
        const radius = player.chainReactionRadius ?? 0;
        if (radius <= 0) return;
        const damagePct = player.chainReactionDamagePct ?? 0.5;
        const explosionDamage = Math.max(1, enemy.maxHealth * damagePct);
        const radiusSq = radius * radius;

        state.events.push({
            type: "chain-reaction",
            x: enemy.x,
            y: enemy.y,
            radius,
        });

        for (const target of state.enemies) {
            if (!target.alive || target.id === enemy.id) continue;
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            if (dx * dx + dy * dy > radiusSq) continue;
            state.damageQueue.push({
                target: "enemy",
                id: target.id,
                amount: Math.max(1, Math.round(explosionDamage)),
                source: { type: "explosion", owner: player.id },
            });
        }
    },

    applySingularity(state, player, source) {
        const radius = player.singularityRadius ?? 0;
        if (radius <= 0) return;
        const pull = player.singularityPullStrength ?? 200;
        const radiusSq = radius * radius;
        for (const enemy of state.enemies) {
            if (!enemy.alive) continue;
            const dx = source.x - enemy.x;
            const dy = source.y - enemy.y;
            const distSq = dx * dx + dy * dy;
            if (distSq === 0 || distSq > radiusSq) continue;
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;
            enemy.vx += (nx * pull) / TICK_RATE;
            enemy.vy += (ny * pull) / TICK_RATE;
        }
        state.events.push({
            type: "singularity",
            x: source.x,
            y: source.y,
        });
    },
};

function getPlayerFromSource(state, source) {
    if (!source?.owner) return null;
    return state.players.find((player) => player.id === source.owner) ?? null;
}

function getNearestEnemy(state, origin, range) {
    const rangeSq = range > 0 ? range * range : Infinity;
    let best = null;
    let bestDist = Infinity;
    for (const enemy of state.enemies) {
        if (!enemy.alive || enemy.id === origin.id) continue;
        const dx = enemy.x - origin.x;
        const dy = enemy.y - origin.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > rangeSq || distSq >= bestDist) continue;
        bestDist = distSq;
        best = enemy;
    }
    return best;
}

DamageSystem.applyExplosion = function applyExplosion(state, enemy, damage) {
    const radius = damage.source.explosiveRadius;
    const damagePct = damage.source.explosiveDamagePct ?? 0.5;
    const radiusSq = radius * radius;

    // Emit explosion visual effect
    state.events.push({
        type: "explosion",
        x: enemy.x,
        y: enemy.y,
        radius: radius,
    });

    for (const target of state.enemies) {
        if (!target.alive || target.id === enemy.id) continue;
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        if (dx * dx + dy * dy > radiusSq) continue;
        state.damageQueue.push({
            target: "enemy",
            id: target.id,
            amount: Math.max(1, Math.round(damage.amount * damagePct)),
            source: { type: "explosion", owner: damage.source.owner },
        });
    }
};

DamageSystem.spawnSplitBullets = function spawnSplitBullets(state, source) {
    if (!source) return;
    const split = source.splitShot;
    if (!split) return;
    const speed = Math.hypot(source.vx, source.vy) || 0;
    if (speed === 0) return;
    const minTtl = Math.ceil(
        (PLAYER_PROJECTILE_MIN_RANGE / speed) * TICK_RATE
    );
    const ttl = Math.max(Math.floor(60 * 2), minTtl);

    const baseAngle = Math.atan2(source.vy, source.vx);
    const spread = split.angleRad ?? 0.4;
    const count = split.count ?? 2;
    const damage = Math.max(1, source.damage * (split.damagePct ?? 0.5));
    const step = count > 1 ? spread / (count - 1) : 0;
    const start = baseAngle - spread / 2;

    for (let i = 0; i < count; i += 1) {
        const splitAngle = start + step * i;
        const dirX = Math.cos(splitAngle);
        const dirY = Math.sin(splitAngle);
        const spawnX = source.x + dirX * (source.radius + 2);
        const spawnY = source.y + dirY * (source.radius + 2);

        state.bullets.push({
            id: state.nextBulletId++,
            owner: source.owner,
            x: spawnX,
            y: spawnY,
            prevX: spawnX,
            prevY: spawnY,
            vx: dirX * speed,
            vy: dirY * speed,
            damage: Math.max(1, damage),
            pierce: 0,
            ttl,
            radius: source.radius ?? 3,
            homingStrength: 0,
            explosiveRadius: 0,
            splitShot: null,
            blockShots: source.blockShots ?? false,
            alive: true,
        });
    }
};

DamageSystem.spawnCritShrapnel = function spawnCritShrapnel(
    state,
    target,
    source,
    player
) {
    if (!target || !source || !player) return;
    const count = 6;
    const sourceSpeed = Math.hypot(source.vx, source.vy) || 0;
    const playerSpeed = player.bulletSpeed;
    const speed = Math.max(
        120,
        playerSpeed === null || playerSpeed === undefined
            ? sourceSpeed
            : playerSpeed
    );
    const minTtl = Math.ceil(
        (PLAYER_PROJECTILE_MIN_RANGE / Math.max(1, speed)) * TICK_RATE
    );
    const playerTtl = player.bulletTtl;
    const ttl = Math.max(
        playerTtl === null || playerTtl === undefined ? 0 : playerTtl,
        minTtl
    );
    const sourceDamage = source.damage;
    const playerDamage = player.bulletDamage;
    const baseDamage =
        sourceDamage === null || sourceDamage === undefined
            ? playerDamage === null || playerDamage === undefined
                ? 1
                : playerDamage
            : sourceDamage;
    const damage = Math.max(1, baseDamage * 0.45);
    const playerRadius = player.bulletRadius;
    const sourceRadius = source.radius;
    const radius =
        playerRadius === null || playerRadius === undefined
            ? sourceRadius === null || sourceRadius === undefined
                ? 3
                : sourceRadius
            : playerRadius;
    const blockShots =
        source.blockShots ?? (player.neutronCore ? true : false);

    for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const spawnX = target.x + dirX * (radius + 2);
        const spawnY = target.y + dirY * (radius + 2);

        state.bullets.push({
            id: state.nextBulletId++,
            owner: source.owner,
            x: spawnX,
            y: spawnY,
            prevX: spawnX,
            prevY: spawnY,
            vx: dirX * speed,
            vy: dirY * speed,
            damage,
            pierce: 0,
            ttl,
            radius,
            homingStrength: 0,
            homingRange: 0,
            explosiveRadius: 0,
            splitShot: null,
            critChance: 0,
            critDamage: 1,
            ricochet: 0,
            phaseThrough: false,
            blockShots,
            alive: true,
            isShrapnel: true,
        });
    }
};

// Spawn shrapnel bullets on kill
DamageSystem.spawnShrapnel = function spawnShrapnel(
    state,
    enemy,
    source,
    options = {},
    rng = null
) {
    const count = options.count ?? 5;
    const speed =
        options.speed ??
        Math.max(200, source ? Math.hypot(source.vx, source.vy) : 0);
    const damage = Math.max(1, options.damage ?? source?.damage ?? 1);

    for (let i = 0; i < count; i++) {
        const jitter = rng
            ? rng.nextRange(-0.15, 0.15)
            : (Math.random() - 0.5) * 0.3;
        const angle = (Math.PI * 2 * i) / count + jitter;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);

        state.bullets.push({
            id: state.nextBulletId++,
            owner: source.owner,
            x: enemy.x,
            y: enemy.y,
            prevX: enemy.x,
            prevY: enemy.y,
            vx: dirX * speed,
            vy: dirY * speed,
            damage,
            pierce: 0,
            ttl: 45, // Short-lived
            radius: source?.radius ?? 3,
            homingStrength: 0,
            explosiveRadius: 0,
            splitShot: null,
            critChance: 0, // Shrapnel can't crit
            critDamage: 1,
            blockShots: source?.blockShots ?? false,
            alive: true,
            isShrapnel: true,
        });
    }

    // Emit shrapnel event for visual effect
    state.events.push({
        type: "shrapnel",
        x: enemy.x,
        y: enemy.y,
    });
};
