/* eslint-disable max-lines */
import { clamp, distanceSq } from "../utils/math.js";
import { ARENA_HEIGHT, ARENA_WIDTH } from "../utils/constants.js";

const PLAYER_BULLET_COLLISION_SCALE = 3;

export const CollisionSystem = {
    update(state) {
        if (!state.spatialGrid) return;
        
        // 1. Rebuild Grid with all alive enemies
        state.spatialGrid.clear();
        for (const enemy of state.enemies) {
            if (enemy.alive) state.spatialGrid.insert(enemy);
        }
        
        // 2. Perform Collision Checks
        this.playerBulletsVsEnemies(state);
        this.playerBulletsVsBoss(state);
        this.playerBulletsVsEnemyBullets(state);
        this.enemyBulletsVsPlayers(state);
        this.enemiesVsEnemies(state);
        this.enemiesVsPlayers(state);
        this.playersVsPickups(state);
    },

    playerBulletsVsEnemies(state) {
        for (const bullet of state.bullets) {
            if (!bullet.alive || !this.isPlayerBullet(bullet)) continue;

            // Use spatial grid to find nearby enemies (100px radius covers most cases)
            const nearby = state.spatialGrid.query(bullet.x, bullet.y, 100);
            for (const enemy of nearby) {
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
                        critDamage: bullet.critDamage ?? 2.0,
                        blockShots: bullet.blockShots ?? false,
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

                if (player.neutronCore) {
                    const dx = bullet.x - player.x;
                    const dy = bullet.y - player.y;
                    const radius = player.neutronBlockRadius ?? player.radius * 2.4;
                    if (dx * dx + dy * dy <= radius * radius) {
                        bullet.alive = false;
                        state.events.push({
                            type: "neutron-block",
                            x: bullet.x,
                            y: bullet.y,
                        });
                        break;
                    }
                }

                if (!this.hitTest(bullet, player)) continue;

                state.damageQueue.push({
                    target: "player",
                    id: player.id,
                    amount: bullet.damage,
                    source: { type: "bullet" },
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
                    critDamage: bullet.critDamage ?? 2.0,
                    blockShots: bullet.blockShots ?? false,
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

    playerBulletsVsEnemyBullets(state) {
        if (!state.players.some((player) => player.alive && player.neutronCore)) {
            return;
        }
        const blockers = state.bullets.filter(
            (bullet) =>
                bullet.alive &&
                this.isPlayerBullet(bullet) &&
                bullet.blockShots
        );
        if (!blockers.length) return;

        for (const bullet of state.bullets) {
            if (
                !bullet.alive ||
                (bullet.owner !== "enemy" && bullet.owner !== "boss")
            )
                continue;

            for (const blocker of blockers) {
                if (!blocker.alive) continue;
                if (!this.hitTest(bullet, blocker)) continue;
                bullet.alive = false;
                state.events.push({
                    type: "neutron-block",
                    x: bullet.x,
                    y: bullet.y,
                });
                break;
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
                const knockbackReduction =
                    player.collisionDamageReduction ?? 0;
                if (knockbackReduction > 0) {
                    player.vx *= 1 - knockbackReduction;
                    player.vy *= 1 - knockbackReduction;
                }

                state.damageQueue.push({
                    target: "player",
                    id: player.id,
                    amount: enemy.contactDamage,
                    source: { type: "contact" },
                });
            }
        }
    },

    enemiesVsEnemies(state) {
        for (const enemyA of state.enemies) {
            if (!enemyA.alive) continue;
            
            // Query nearby enemies using spatial grid
            const nearby = state.spatialGrid.query(enemyA.x, enemyA.y, enemyA.radius * 2);
            for (const enemyB of nearby) {
                if (!enemyB.alive || enemyA === enemyB) continue;
                // Use ID ordering to prevent double-checking pairs
                if (enemyA.id >= enemyB.id) continue;
                
                if (!this.hitTest(enemyA, enemyB)) continue;
                this.resolveOverlap(enemyA, enemyB, 0.5, 0.5);
            }
        }
    },

    playersVsPickups(_state) {
        // No pickups to process - XP system removed
    },

    hitTest(a, b) {
        const radius = getCollisionRadius(a) + getCollisionRadius(b);
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

function getCollisionRadius(entity) {
    const base = entity.collisionRadius ?? entity.radius ?? 0;
    if (entity.collisionScale !== undefined) {
        return base * entity.collisionScale;
    }
    if (entity.owner === "p1" || entity.owner === "p2") {
        return base * PLAYER_BULLET_COLLISION_SCALE;
    }
    return base;
}
