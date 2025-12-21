import { clamp, distanceSq } from "../utils/math.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "../utils/constants.js";

export const CollisionSystem = {
    update(state) {
        this.playerBulletsVsEnemies(state);
        this.playerBulletsVsBoss(state);
        this.enemyBulletsVsPlayers(state);
        this.enemiesVsEnemies(state);
        this.enemiesVsPlayers(state);
        this.playersVsPickups(state);
    },

    playerBulletsVsEnemies(state) {
        for (const bullet of state.bullets) {
            if (!bullet.alive || !this.isPlayerBullet(bullet)) continue;

            for (const enemy of state.enemies) {
                if (!enemy.alive) continue;

                if (!this.hitTest(bullet, enemy)) continue;

                // Emit hit event for visual effects
                state.events.push({
                    type: "enemy-hit",
                    x: bullet.x,
                    y: bullet.y,
                    enemyId: enemy.id,
                });

                state.damageQueue.push({
                    target: "enemy",
                    id: enemy.id,
                    amount: bullet.damage,
                    source: {
                        type: "bullet",
                        owner: bullet.owner,
                        x: bullet.x,
                        y: bullet.y,
                        vx: bullet.vx,
                        vy: bullet.vy,
                        radius: bullet.radius,
                        damage: bullet.damage,
                        explosiveRadius: bullet.explosiveRadius ?? 0,
                        explosiveDamagePct: bullet.explosiveDamagePct,
                        splitShot: bullet.splitShot,
                        critChance: bullet.critChance ?? 0,
                        critDamage: bullet.critDamage ?? 1.5,
                    },
                });
                if (state.runStats) {
                    state.runStats.shotsHit += 1;
                }

                if (bullet.pierce > 0) {
                    bullet.pierce -= 1;
                } else {
                    bullet.alive = false;
                    break;
                }
            }
        }
    },

    enemyBulletsVsPlayers(state) {
        for (const bullet of state.bullets) {
            if (
                !bullet.alive ||
                (bullet.owner !== "enemy" && bullet.owner !== "boss")
            )
                continue;

            for (const player of state.players) {
                if (!player.alive) continue;

                if (!this.hitTest(bullet, player)) continue;

                state.damageQueue.push({
                    target: "player",
                    id: player.id,
                    amount: bullet.damage,
                });

                bullet.alive = false;
                break;
            }
        }
    },

    playerBulletsVsBoss(state) {
        const boss = state.boss;
        if (!boss || !boss.alive) return;

        for (const bullet of state.bullets) {
            if (!bullet.alive || !this.isPlayerBullet(bullet)) continue;
            if (!this.hitTest(bullet, boss)) continue;

            // Emit hit event for visual effects
            state.events.push({
                type: "enemy-hit",
                x: bullet.x,
                y: bullet.y,
                enemyId: boss.id,
            });

            state.damageQueue.push({
                target: "boss",
                id: boss.id,
                amount: bullet.damage,
                source: {
                    type: "bullet",
                    owner: bullet.owner,
                    x: bullet.x,
                    y: bullet.y,
                    vx: bullet.vx,
                    vy: bullet.vy,
                    radius: bullet.radius,
                    damage: bullet.damage,
                    explosiveRadius: bullet.explosiveRadius ?? 0,
                    explosiveDamagePct: bullet.explosiveDamagePct,
                    splitShot: bullet.splitShot,
                    critChance: bullet.critChance ?? 0,
                    critDamage: bullet.critDamage ?? 1.5,
                },
            });

            if (state.runStats) {
                state.runStats.shotsHit += 1;
            }

            if (bullet.pierce > 0) {
                bullet.pierce -= 1;
            } else {
                bullet.alive = false;
            }
        }
    },

    enemiesVsPlayers(state) {
        for (const enemy of state.enemies) {
            if (!enemy.alive) continue;

            for (const player of state.players) {
                if (!player.alive) continue;

                if (!this.hitTest(enemy, player)) continue;

                this.resolveOverlap(enemy, player, 0.4, 0.6);

                state.damageQueue.push({
                    target: "player",
                    id: player.id,
                    amount: enemy.contactDamage,
                });
            }
        }
    },

    enemiesVsEnemies(state) {
        const enemies = state.enemies;
        for (let i = 0; i < enemies.length; i += 1) {
            const enemyA = enemies[i];
            if (!enemyA.alive) continue;
            for (let j = i + 1; j < enemies.length; j += 1) {
                const enemyB = enemies[j];
                if (!enemyB.alive) continue;
                if (!this.hitTest(enemyA, enemyB)) continue;
                this.resolveOverlap(enemyA, enemyB, 0.5, 0.5);
            }
        }
    },

    playersVsPickups(state) {
        for (const pickup of state.pickups) {
            if (!pickup.alive) continue;

            for (const player of state.players) {
                if (!player.alive) continue;

                if (!this.hitTest(pickup, player)) continue;

                if (pickup.type === "xp") {
                    state.xpQueue.push({
                        playerId: player.id,
                        amount: pickup.value,
                    });
                }

                pickup.alive = false;
                break;
            }
        }
    },

    hitTest(a, b) {
        const radius = (a.radius ?? 0) + (b.radius ?? 0);
        return distanceSq(a.x, a.y, b.x, b.y) <= radius * radius;
    },

    resolveOverlap(entityA, entityB, pushA, pushB) {
        const dx = entityB.x - entityA.x;
        const dy = entityB.y - entityA.y;
        const radius = (entityA.radius ?? 0) + (entityB.radius ?? 0);
        const distSq = dx * dx + dy * dy;
        if (distSq === 0) {
            entityB.x += 0.1;
            return;
        }

        const dist = Math.sqrt(distSq);
        const overlap = radius - dist;
        if (overlap <= 0) return;

        const nx = dx / dist;
        const ny = dy / dist;
        const pushEntityA = pushA ?? 0.5;
        const pushEntityB = pushB ?? 0.5;

        entityA.x -= nx * overlap * pushEntityA;
        entityA.y -= ny * overlap * pushEntityA;
        entityB.x += nx * overlap * pushEntityB;
        entityB.y += ny * overlap * pushEntityB;

        const repelSpeed = 180;
        entityB.vx = (entityB.vx ?? 0) + nx * repelSpeed;
        entityB.vy = (entityB.vy ?? 0) + ny * repelSpeed;
        entityA.vx = (entityA.vx ?? 0) - nx * (repelSpeed * 0.6);
        entityA.vy = (entityA.vy ?? 0) - ny * (repelSpeed * 0.6);

        entityA.x = clamp(
            entityA.x,
            entityA.radius,
            ARENA_WIDTH - entityA.radius
        );
        entityA.y = clamp(
            entityA.y,
            entityA.radius,
            ARENA_HEIGHT - entityA.radius
        );
        entityB.x = clamp(
            entityB.x,
            entityB.radius,
            ARENA_WIDTH - entityB.radius
        );
        entityB.y = clamp(
            entityB.y,
            entityB.radius,
            ARENA_HEIGHT - entityB.radius
        );
    },

    isPlayerBullet(bullet) {
        return bullet.owner === "p1" || bullet.owner === "p2";
    },
};
