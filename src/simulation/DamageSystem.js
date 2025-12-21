import { PICKUP_RADIUS, PLAYER_INVULN_FRAMES } from "../utils/constants.js";
import { ENEMIES } from "../config/enemies.js";
import { spawnEnemy } from "./EnemySystem.js";

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
                finalDamage *= damage.source.critDamage ?? 1.5;
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
        if (damage.source?.type === "bullet") {
            if (damage.source.explosiveRadius > 0) {
                this.applyExplosion(state, enemy, damage);
            }
            if (damage.source.splitShot) {
                this.spawnSplitBullets(state, damage.source);
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

        // Spawn shrapnel on crit kills
        if (isCrit && damage.source) {
            this.spawnShrapnel(state, enemy, damage.source);
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

        player.health -= damage.amount;
        if (state.runStats) {
            state.runStats.damageTaken += damage.amount;
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
                finalDamage *= damage.source.critDamage ?? 1.5;
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
        state.events.push({
            type: "boss-death",
            x: boss.x,
            y: boss.y,
            bossId: boss.id,
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
            vx: 0,
            vy: 0,
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
};

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
            source: { type: "explosion" },
        });
    }
};

DamageSystem.spawnSplitBullets = function spawnSplitBullets(state, source) {
    if (!source) return;
    const split = source.splitShot;
    if (!split) return;
    const speed = Math.hypot(source.vx, source.vy) || 0;
    if (speed === 0) return;

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
            ttl: Math.floor(60 * 2),
            radius: source.radius ?? 3,
            homingStrength: 0,
            explosiveRadius: 0,
            splitShot: null,
            alive: true,
        });
    }
};

// Spawn shrapnel bullets on crit kills
DamageSystem.spawnShrapnel = function spawnShrapnel(state, enemy, source) {
    const count = 5;
    const speed = 200;
    const damage = Math.max(1, source.damage * 0.3);
    const baseAngle = Math.atan2(source.vy, source.vx);

    for (let i = 0; i < count; i++) {
        // Spread shrapnel in a forward cone
        const angleOffset = ((i - (count - 1) / 2) / count) * Math.PI * 0.6;
        const angle = baseAngle + angleOffset + (Math.random() - 0.5) * 0.2;
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
            radius: 2,
            homingStrength: 0,
            explosiveRadius: 0,
            splitShot: null,
            critChance: 0, // Shrapnel can't crit
            critDamage: 1,
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
