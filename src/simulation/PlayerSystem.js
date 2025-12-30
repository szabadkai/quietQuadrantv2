/* eslint-disable max-lines */
import {
    ARENA_WIDTH,
    ARENA_HEIGHT,
    PLAYER_RADIUS,
    TICK_RATE,
    MAX_PLAYER_BULLETS,
    HEAT_WARNING_THRESHOLD,
    OVERHEAT_COOLDOWN_TICKS,
} from "../utils/constants.js";
import { clamp, normalize } from "../utils/math.js";

const PLAYER_PROJECTILE_MIN_RANGE =
    Math.max(ARENA_WIDTH, ARENA_HEIGHT) * 1.5;

const EMPTY_INPUT = {
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    fire: false,
    dash: false,
};

export const PlayerSystem = {
    update(state, inputs, rng) {
        for (const player of state.players) {
            if (!player.alive) continue;
            const input = inputs[player.id] ?? EMPTY_INPUT;

            if (player.invulnFrames > 0) {
                player.invulnFrames -= 1;
            }

            if (player.dashCooldown > 0) {
                player.dashCooldown -= 1;
            }
            if (player.shieldFrames > 0) {
                player.shieldFrames -= 1;
                if (player.shieldFrames <= 0) {
                    player.shieldActive = false;
                    player.shieldFrames = 0;
                }
            }
            if (player.shieldCooldown > 0) {
                player.shieldCooldown -= 1;
            } else if (
                player.energyShield &&
                !player.shieldActive &&
                player.alive
            ) {
                player.shieldActive = true;
                state.events.push({
                    type: "shield-activate",
                    playerId: player.id,
                    x: player.x,
                    y: player.y,
                });
            }
            if (player.lifestealCooldown > 0) {
                player.lifestealCooldown -= 1;
            }

            // Weapon heat system: calculate heat and manage overheat cooldown
            this.updateWeaponHeat(state, player);

            player.prevX = player.x;
            player.prevY = player.y;

            this.applyDash(state, player, input, rng);
            this.applyMovement(player, input);
            this.applyAim(player, input);
            this.updateMomentum(player, input);
            this.applyFire(state, player, input, rng);
        }
    },

    applyDash(state, player, input, rng) {
        if (!input.dash || player.dashCooldown > 0) return;

        const move = normalize(input.moveX, input.moveY);
        // If not moving, dash in aim direction
        const dirX = move.x !== 0 || move.y !== 0 ? move.x : player.aimX;
        const dirY = move.x !== 0 || move.y !== 0 ? move.y : player.aimY;
        if (dirX === 0 && dirY === 0) return;

        // Dash distance: 4 ship lengths
        const dashDistance = PLAYER_RADIUS * 8;

        player.x = clamp(
            player.x + dirX * dashDistance,
            PLAYER_RADIUS,
            ARENA_WIDTH - PLAYER_RADIUS
        );
        player.y = clamp(
            player.y + dirY * dashDistance,
            PLAYER_RADIUS,
            ARENA_HEIGHT - PLAYER_RADIUS
        );

        // Brief invulnerability during dash
        player.invulnFrames = Math.max(player.invulnFrames, 10);

        // Set cooldown (convert ms to ticks)
        const cooldownMs = player.dashCooldownMs ?? 1600;
        player.dashCooldown = Math.round((cooldownMs / 1000) * TICK_RATE);

        // Emit dash event for sound/visual effects
        state.events.push({
            type: "dash",
            playerId: player.id,
            x: player.x,
            y: player.y,
            angle: Math.atan2(dirY, dirX),
        });

        if ((player.dashSparksCount ?? 0) > 0) {
            this.spawnDashSparks(state, player, rng);
            state.events.push({
                type: "dash-sparks",
                playerId: player.id,
                x: player.x,
                y: player.y,
            });
        }
    },

    applyMovement(player, input) {
        const move = normalize(input.moveX, input.moveY);
        const accel = player.accel ?? player.speed * 6;
        const drag = player.drag ?? 0.992;

        if (move.x !== 0 || move.y !== 0) {
            player.vx += (move.x * accel) / TICK_RATE;
            player.vy += (move.y * accel) / TICK_RATE;
        } else {
            player.vx *= drag;
            player.vy *= drag;
        }

        const speed = Math.hypot(player.vx, player.vy);
        if (speed > player.speed) {
            const scale = player.speed / speed;
            player.vx *= scale;
            player.vy *= scale;
        }

        player.x = clamp(
            player.x + player.vx / TICK_RATE,
            PLAYER_RADIUS,
            ARENA_WIDTH - PLAYER_RADIUS
        );
        player.y = clamp(
            player.y + player.vy / TICK_RATE,
            PLAYER_RADIUS,
            ARENA_HEIGHT - PLAYER_RADIUS
        );
    },

    applyAim(player, input) {
        let aimX = input.aimX;
        let aimY = input.aimY;

        if (aimX === 0 && aimY === 0) {
            aimX = input.moveX;
            aimY = input.moveY;
        }

        const aim = normalize(aimX, aimY);
        if (aim.x !== 0 || aim.y !== 0) {
            player.aimX = aim.x;
            player.aimY = aim.y;
            player.rotation = Math.atan2(aim.y, aim.x);
        }
    },

    applyFire(state, player, input, rng) {
        if (player.fireCooldown > 0) {
            player.fireCooldown -= 1;
        }

        // Block firing if weapons are overheated
        if (player.overheatCooldown > 0) {
            return;
        }

        if (player.chargedShotDamagePct > 0) {
            player.chargeTicks = player.chargeTicks ?? 0;
            player.wasCharging = player.wasCharging ?? false;

            if (input.fire && player.fireCooldown <= 0) {
                player.chargeTicks = Math.min(player.chargeTicks + 1, 60);
                player.wasCharging = true;
                return;
            }

            if (player.wasCharging && player.chargeTicks > 0) {
                const chargeRatio = player.chargeTicks / 60;
                const damageMultiplier =
                    1 + player.chargedShotDamagePct * chargeRatio;
                this.applyBloodFuelCost(player);
                this.spawnProjectiles(state, player, rng, damageMultiplier, {
                    pierceOverride: Math.max(
                        player.bulletPierce,
                        player.chargePierce ?? 0
                    ),
                });
                player.fireCooldown = this.getFireCooldownTicks(player);
            }

            player.chargeTicks = 0;
            player.wasCharging = false;
            return;
        }

        if (!input.fire || player.fireCooldown > 0) return;

        this.applyBloodFuelCost(player);
        this.spawnProjectiles(state, player, rng, 1);
        player.fireCooldown = this.getFireCooldownTicks(player);
    },

    spawnProjectiles(state, player, rng, damageMultiplier, options = {}) {
        const baseCount = player.projectileCount ?? 1;
        const count = Math.min(baseCount, 25); // Performance cap: max 25 projectiles per burst
        const spreadRad = ((player.spreadDeg ?? 0) * Math.PI) / 180;
        const baseAngle = Math.atan2(player.aimY, player.aimX);
        const startAngle = count > 1 ? baseAngle - spreadRad / 2 : baseAngle;
        const step = count > 1 ? spreadRad / (count - 1) : 0;
        const bulletSpeed = Math.max(1, player.bulletSpeed ?? 0);
        const minTtl = Math.ceil(
            (PLAYER_PROJECTILE_MIN_RANGE / bulletSpeed) * TICK_RATE
        );
        const ttl = Math.max(player.bulletTtl ?? 0, minTtl);

        for (let i = 0; i < count; i += 1) {
            const angle =
                startAngle + step * i + this.randomSpread(rng, player);
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            const spawnX =
                player.x + dirX * (player.radius + player.bulletRadius + 1);
            const spawnY =
                player.y + dirY * (player.radius + player.bulletRadius + 1);

            state.bullets.push({
                id: state.nextBulletId++,
                owner: player.id,
                x: spawnX,
                y: spawnY,
                prevX: spawnX,
                prevY: spawnY,
                vx: dirX * player.bulletSpeed,
                vy: dirY * player.bulletSpeed,
                damage: player.bulletDamage * damageMultiplier,
                pierce: options.pierceOverride ?? player.bulletPierce,
                ttl,
                radius: player.bulletRadius,
                homingStrength: player.homingStrength ?? 0,
                homingRange: player.homingRange ?? 0,
                explosiveRadius: player.explosiveRadius ?? 0,
                explosiveDamagePct: player.explosiveDamagePct ?? undefined,
                splitShot: player.splitShot,
                critChance: player.critChance ?? 0,
                critDamage: player.critDamage ?? 2.0,
                ricochet: player.ricochet ?? 0,
                phaseThrough: player.canPhaseShots ?? false,
                blockShots: player.neutronCore ?? false,
                alive: true,
            });
        }

        if (state.runStats) {
            state.runStats.shotsFired += count;
        }

        // Emit shoot event for sound effects
        state.events.push({
            type: "shoot",
            playerId: player.id,
            x: player.x,
            y: player.y,
        });
    },

    randomSpread(rng, player) {
        if (!rng) return 0;
        const accuracy = player.accuracyPct ?? 1;
        if (accuracy >= 1) return 0;
        const maxOffset = (1 - accuracy) * 0.6;
        return rng.nextRange(-maxOffset, maxOffset);
    },

    updateMomentum(player, input) {
        if ((player.momentumMaxBonus ?? 0) <= 0) return;
        const moving = Math.hypot(input.moveX, input.moveY) > 0.1;
        const buildRate = player.momentumBuildRate ?? 0;
        const step = buildRate / TICK_RATE;
        if (step <= 0) return;
        if (moving) {
            player.momentum = Math.min(1, (player.momentum ?? 0) + step);
        } else {
            player.momentum = Math.max(0, (player.momentum ?? 0) - step * 1.2);
        }
    },

    getFireCooldownTicks(player) {
        let bonus = 0;
        if ((player.momentumMaxBonus ?? 0) > 0) {
            bonus += (player.momentum ?? 0) * player.momentumMaxBonus;
        }
        if ((player.berserkMaxBonus ?? 0) > 0) {
            const healthRatio = player.maxHealth > 0 ? player.health / player.maxHealth : 0;
            bonus += (1 - healthRatio) * player.berserkMaxBonus;
        }
        const multiplier = Math.max(0.1, 1 + bonus);
        const cooldown = Math.round(player.fireCooldownTicks / multiplier);
        return Math.max(3, cooldown); // Performance cap: max ~20 shots/sec
    },

    applyBloodFuelCost(player) {
        if ((player.bloodFuelFireCost ?? 0) <= 0) return;
        const cost = player.health * player.bloodFuelFireCost;
        // Allow fractional health (e.g. 0.1 damage on 5 HP) to avoid 1 damage minimum
        player.health = Math.max(0.1, player.health - cost);
    },

    spawnDashSparks(state, player, rng) {
        const count = player.dashSparksCount ?? 0;
        if (count <= 0) return;
        const speed = Math.max(280, (player.bulletSpeed ?? 0) * 0.65);
        const damage = Math.max(1, player.bulletDamage * 0.45);
        const sparkRadius = Math.max(2, (player.bulletRadius ?? 2) * 0.7);
        const range = Math.max(ARENA_WIDTH, ARENA_HEIGHT) * 0.35;
        const ttl = Math.max(
            45,
            Math.ceil((range / Math.max(1, speed)) * TICK_RATE)
        );
        for (let i = 0; i < count; i += 1) {
            const angle = (Math.PI * 2 * i) / count;
            const jitter = rng ? rng.nextRange(-0.2, 0.2) : (Math.random() - 0.5) * 0.4;
            const dirX = Math.cos(angle + jitter);
            const dirY = Math.sin(angle + jitter);
            state.bullets.push({
                id: state.nextBulletId++,
                owner: player.id,
                x: player.x,
                y: player.y,
                prevX: player.x,
                prevY: player.y,
                vx: dirX * speed,
                vy: dirY * speed,
                damage,
                pierce: 0,
                ttl,
                radius: sparkRadius,
                collisionScale: 1.8,
                homingStrength: 0,
                homingRange: 0,
                explosiveRadius: 0,
                splitShot: null,
                critChance: 0,
                critDamage: 1,
                ricochet: 0,
                phaseThrough: false,
                blockShots: player.neutronCore ?? false,
                alive: true,
                isShrapnel: true,
            });
        }
    },

    updateWeaponHeat(state, player) {
        // Count player's bullets on screen
        const playerBullets = state.bullets.filter(
            (b) => b.alive && b.owner === player.id
        ).length;
        
        // Calculate heat as percentage of max
        const heat = Math.min(1, playerBullets / MAX_PLAYER_BULLETS);
        const wasOverheating = player.weaponHeat >= HEAT_WARNING_THRESHOLD;
        const wasFullyOverheated = player.overheatCooldown > 0;
        
        player.weaponHeat = heat;
        
        // Decrement overheat cooldown if active
        if (player.overheatCooldown > 0) {
            player.overheatCooldown -= 1;
            
            // Emit cooldown end event when cooling finishes
            if (player.overheatCooldown <= 0) {
                state.events.push({
                    type: "overheat-end",
                    playerId: player.id,
                });
            }
            return;
        }
        
        // Check if we just hit 100% - trigger overheat
        if (heat >= 1.0) {
            player.overheatCooldown = OVERHEAT_COOLDOWN_TICKS;
            state.events.push({
                type: "overheat",
                playerId: player.id,
            });
            return;
        }
        
        // Emit warning event when crossing 90% threshold
        if (heat >= HEAT_WARNING_THRESHOLD && !wasOverheating) {
            state.events.push({
                type: "heat-warning",
                playerId: player.id,
                heat,
            });
        }
    },
};
