import {
    ARENA_WIDTH,
    ARENA_HEIGHT,
    PLAYER_RADIUS,
    TICK_RATE,
} from "../utils/constants.js";
import { clamp, normalize } from "../utils/math.js";

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

            player.prevX = player.x;
            player.prevY = player.y;

            this.applyDash(state, player, input);
            this.applyMovement(player, input);
            this.applyAim(player, input);
            this.applyFire(state, player, input, rng);
        }
    },

    applyDash(state, player, input) {
        if (!input.dash || player.dashCooldown > 0) return;

        const move = normalize(input.moveX, input.moveY);
        // If not moving, dash in aim direction
        const dirX = move.x !== 0 || move.y !== 0 ? move.x : player.aimX;
        const dirY = move.x !== 0 || move.y !== 0 ? move.y : player.aimY;
        if (dirX === 0 && dirY === 0) return;

        // Dash distance: 2 ship widths
        const dashDistance = PLAYER_RADIUS * 4;

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
                this.spawnProjectiles(state, player, rng, damageMultiplier);
                player.fireCooldown = player.fireCooldownTicks;
            }

            player.chargeTicks = 0;
            player.wasCharging = false;
            return;
        }

        if (!input.fire || player.fireCooldown > 0) return;

        this.spawnProjectiles(state, player, rng, 1);
        player.fireCooldown = player.fireCooldownTicks;
    },

    spawnProjectiles(state, player, rng, damageMultiplier) {
        const count = player.projectileCount ?? 1;
        const spreadRad = ((player.spreadDeg ?? 0) * Math.PI) / 180;
        const baseAngle = Math.atan2(player.aimY, player.aimX);
        const startAngle = count > 1 ? baseAngle - spreadRad / 2 : baseAngle;
        const step = count > 1 ? spreadRad / (count - 1) : 0;

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
                pierce: player.bulletPierce,
                ttl: player.bulletTtl,
                radius: player.bulletRadius,
                homingStrength: player.homingStrength ?? 0,
                explosiveRadius: player.explosiveRadius ?? 0,
                explosiveDamagePct: player.explosiveDamagePct ?? undefined,
                splitShot: player.splitShot,
                critChance: player.critChance ?? 0,
                critDamage: player.critDamage ?? 1.5,
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
};
