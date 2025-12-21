/**
 * Particle and explosion effects renderer.
 * Manages pooled particles with budget enforcement.
 */

import { PALETTE_HEX } from "../utils/palette.js";

const MAX_PARTICLES = 200;
const PARTICLE_POOL_SIZE = 250;

export class EffectsRenderer {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.activeCount = 0;

        this.initPool();
    }

    initPool() {
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            const particle = this.scene.add.circle(0, 0, 3, 0xffffff);
            particle.setVisible(false);
            particle.setDepth(9);
            this.pool.push(particle);
        }
    }

    spawnExplosion(x, y, color = PALETTE_HEX.cyan, count = 8) {
        const available = MAX_PARTICLES - this.activeCount;
        const spawnCount = Math.min(count, available);

        for (let i = 0; i < spawnCount; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 80 + Math.random() * 60;
            this.spawnParticle({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                size: 2 + Math.random() * 2,
                life: 0.4 + Math.random() * 0.2,
                fade: true,
            });
        }
    }

    spawnHitSpark(x, y, color = PALETTE_HEX.white) {
        const available = MAX_PARTICLES - this.activeCount;
        const count = Math.min(4, available);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 40;
            this.spawnParticle({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                size: 1.5,
                life: 0.15 + Math.random() * 0.1,
                fade: true,
            });
        }
    }

    spawnXPPickup(x, y) {
        const available = MAX_PARTICLES - this.activeCount;
        const count = Math.min(3, available);

        for (let i = 0; i < count; i++) {
            this.spawnParticle({
                x,
                y,
                vx: (Math.random() - 0.5) * 30,
                vy: -40 - Math.random() * 20,
                color: PALETTE_HEX.xp,
                size: 2,
                life: 0.3,
                fade: true,
                gravity: 80,
            });
        }
    }

    spawnDashTrail(x, y, angle) {
        const available = MAX_PARTICLES - this.activeCount;
        if (available < 1) return;

        this.spawnParticle({
            x,
            y,
            vx: 0,
            vy: 0,
            color: PALETTE_HEX.cyan,
            size: 4,
            life: 0.2,
            fade: true,
            shrink: true,
        });
    }

    spawnLevelUp(x, y) {
        const available = MAX_PARTICLES - this.activeCount;
        const count = Math.min(16, available);

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 100 + Math.random() * 40;
            this.spawnParticle({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: PALETTE_HEX.gold,
                size: 3,
                life: 0.5,
                fade: true,
            });
        }
    }

    spawnParticle(config) {
        const particle = this.pool.find((p) => !p.visible);
        if (!particle) return null;

        particle.setPosition(config.x, config.y);
        particle.setRadius(config.size);
        particle.setFillStyle(config.color);
        particle.setAlpha(1);
        particle.setVisible(true);

        particle.data = {
            vx: config.vx ?? 0,
            vy: config.vy ?? 0,
            life: config.life ?? 0.5,
            maxLife: config.life ?? 0.5,
            fade: config.fade ?? false,
            shrink: config.shrink ?? false,
            gravity: config.gravity ?? 0,
            initialSize: config.size,
        };

        this.particles.push(particle);
        this.activeCount++;
        return particle;
    }

    update(delta) {
        const dt = delta / 1000;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const data = particle.data;

            data.life -= dt;
            if (data.life <= 0) {
                particle.setVisible(false);
                this.particles.splice(i, 1);
                this.activeCount--;
                continue;
            }

            data.vy += data.gravity * dt;
            particle.x += data.vx * dt;
            particle.y += data.vy * dt;

            if (data.fade) {
                particle.setAlpha(data.life / data.maxLife);
            }

            if (data.shrink) {
                const scale = data.life / data.maxLife;
                particle.setRadius(data.initialSize * scale);
            }
        }
    }

    processEvents(events) {
        for (const event of events) {
            switch (event.type) {
                case "enemy-death":
                    this.spawnExplosion(event.x, event.y, PALETTE_HEX.enemy);
                    break;
                case "player-hit":
                    this.spawnHitSpark(event.x, event.y, PALETTE_HEX.danger);
                    break;
                case "enemy-hit":
                    this.spawnHitSpark(event.x, event.y, PALETTE_HEX.white);
                    break;
                case "xp-pickup":
                    this.spawnXPPickup(event.x, event.y);
                    break;
                case "level-up":
                    this.spawnLevelUp(event.x, event.y);
                    break;
                case "dash":
                    this.spawnDashTrail(event.x, event.y);
                    break;
                case "boss-death":
                    this.spawnExplosion(event.x, event.y, PALETTE_HEX.boss, 24);
                    break;
            }
        }
    }

    destroy() {
        for (const particle of this.pool) {
            particle.destroy();
        }
        this.pool = [];
        this.particles = [];
        this.activeCount = 0;
    }
}
