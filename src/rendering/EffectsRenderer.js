/** Particle and explosion effects renderer. Manages pooled particles with budget enforcement. */
import { PALETTE_HEX } from "../utils/palette.js";
import { spawnBossEntrance } from "./effects/BossEntranceEffect.js";
import { spawnChainArc } from "./effects/ChainArcEffect.js";
import { spawnCritHit } from "./effects/CritHitEffect.js";
import { spawnDashTrail } from "./effects/DashTrailEffect.js";
import { spawnExplosion } from "./effects/ExplosionEffect.js";
import { spawnExplosionRing } from "./effects/ExplosionRingEffect.js";
import { spawnHeal } from "./effects/HealEffect.js";
import { spawnHitSpark } from "./effects/HitSparkEffect.js";
import { spawnLevelUp } from "./effects/LevelUpEffect.js";
import { spawnPlayerDown } from "./effects/PlayerDownEffect.js";
import { spawnShieldActivate } from "./effects/ShieldActivateEffect.js";
import { spawnShieldBreak } from "./effects/ShieldBreakEffect.js";
import { spawnShrapnelBurst } from "./effects/ShrapnelBurstEffect.js";
import { spawnSingularity } from "./effects/SingularityEffect.js";
import { spawnSynergyUnlock } from "./effects/SynergyUnlockEffect.js";
import { spawnWaveStart } from "./effects/WaveStartEffect.js";
import { spawnXPPickup } from "./effects/XPPickupEffect.js";

const MAX_PARTICLES = 300,
    PARTICLE_POOL_SIZE = 350;

export class EffectsRenderer {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.pool = [];
        this.activeCount = 0;
        this.linePool = [];
        this.activeLines = [];
        this.ringPool = [];
        this.activeRings = [];
        this.initPool();
        this.initLinePool();
        this.initRingPool();
    }

    initPool() {
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            const p = this.scene.add.circle(0, 0, 3, 0xffffff);
            p.setVisible(false);
            p.setDepth(9);
            this.pool.push(p);
        }
    }

    initLinePool() {
        for (let i = 0; i < 20; i++) {
            const l = this.scene.add.graphics();
            l.setVisible(false);
            l.setDepth(8);
            this.linePool.push(l);
        }
    }

    initRingPool() {
        for (let i = 0; i < 15; i++) {
            const r = this.scene.add.graphics();
            r.setVisible(false);
            r.setDepth(7);
            this.ringPool.push(r);
        }
    }

    getAvailable() {
        return MAX_PARTICLES - this.activeCount;
    }

    spawnRing(x, y, color, maxRadius, duration, inward = false) {
        const ring = this.ringPool.find((r) => !r.visible);
        if (!ring) return;
        ring.clear();
        ring.setVisible(true);
        this.activeRings.push({
            graphics: ring,
            x,
            y,
            color,
            maxRadius,
            life: duration,
            maxLife: duration,
            inward,
        });
    }

    spawnParticle(c) {
        const p = this.pool.find((p) => !p.visible);
        if (!p) return null;
        p.setPosition(c.x, c.y);
        p.setRadius(c.size);
        p.setFillStyle(c.color);
        p.setAlpha(1);
        p.setVisible(true);
        p.particleData = {
            vx: c.vx ?? 0,
            vy: c.vy ?? 0,
            life: c.life ?? 0.5,
            maxLife: c.life ?? 0.5,
            fade: c.fade ?? false,
            shrink: c.shrink ?? false,
            gravity: c.gravity ?? 0,
            initialSize: c.size,
        };
        this.particles.push(p);
        this.activeCount++;
        return p;
    }

    update(delta) {
        const dt = delta / 1000;
        this.updateParticles(dt);
        this.updateLines(dt);
        this.updateRings(dt);
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i],
                d = p.particleData;
            d.life -= dt;
            if (d.life <= 0) {
                p.setVisible(false);
                this.particles.splice(i, 1);
                this.activeCount--;
                continue;
            }
            d.vy += d.gravity * dt;
            p.x += d.vx * dt;
            p.y += d.vy * dt;
            if (d.fade) p.setAlpha(d.life / d.maxLife);
            if (d.shrink) p.setRadius(d.initialSize * (d.life / d.maxLife));
        }
    }

    updateLines(dt) {
        for (let i = this.activeLines.length - 1; i >= 0; i--) {
            const l = this.activeLines[i];
            l.life -= dt;
            if (l.life <= 0) {
                l.graphics.setVisible(false);
                l.graphics.clear();
                this.activeLines.splice(i, 1);
                continue;
            }
            l.graphics.setAlpha(l.life / l.maxLife);
        }
    }

    updateRings(dt) {
        for (let i = this.activeRings.length - 1; i >= 0; i--) {
            const r = this.activeRings[i];
            r.life -= dt;
            if (r.life <= 0) {
                r.graphics.setVisible(false);
                r.graphics.clear();
                this.activeRings.splice(i, 1);
                continue;
            }
            const progress = 1 - r.life / r.maxLife,
                radius = r.inward
                    ? r.maxRadius * (1 - progress)
                    : r.maxRadius * progress;
            const alpha = r.inward ? progress : 1 - progress;
            r.graphics.clear();
            r.graphics.lineStyle(2, r.color, alpha * 0.8);
            r.graphics.strokeCircle(r.x, r.y, radius);
            r.graphics.lineStyle(1, 0xffffff, alpha * 0.4);
            r.graphics.strokeCircle(r.x, r.y, radius * 0.9);
        }
    }

    processEvents(events) {
        for (const e of events) this.handleEvent(e);
    }

    handleEvent(e) {
        const { x, y, x1, y1, x2, y2, radius } = e,
            t = e.type;
        if (t === "enemy-death")
            spawnExplosion(this, x, y, PALETTE_HEX.enemy);
        else if (t === "player-hit")
            spawnHitSpark(this, x, y, PALETTE_HEX.danger);
        else if (t === "enemy-hit")
            spawnHitSpark(this, x, y, PALETTE_HEX.white);
        else if (t === "xp-pickup") spawnXPPickup(this, x, y);
        else if (t === "level-up") spawnLevelUp(this, x, y);
        else if (t === "dash") spawnDashTrail(this, x, y);
        else if (t === "boss-death")
            spawnExplosion(this, x, y, PALETTE_HEX.boss, 24);
        else if (t === "crit-hit") spawnCritHit(this, x, y);
        else if (t === "shrapnel")
            spawnShrapnelBurst(this, x, y);
        else if (t === "explosion")
            spawnExplosionRing(this, x, y, radius ?? 40);
        else if (t === "chain-arc")
            spawnChainArc(this, x1, y1, x2, y2);
        else if (t === "singularity") spawnSingularity(this, x, y);
        else if (t === "synergy-unlocked" && x !== undefined)
            spawnSynergyUnlock(this, x, y);
        else if (t === "boss-spawn" && x !== undefined)
            spawnBossEntrance(this, x, y);
        else if (t === "wave-start")
            spawnWaveStart(this, 480, 270);
        else if (t === "player-down" && x !== undefined)
            spawnPlayerDown(this, x, y);
        else if (t === "shield-activate")
            spawnShieldActivate(this, x, y);
        else if (t === "shield-break")
            spawnShieldBreak(this, x, y);
        else if (t === "heal") spawnHeal(this, x, y);
    }

    destroy() {
        this.pool.forEach((p) => p.destroy());
        this.linePool.forEach((l) => l.destroy());
        this.ringPool.forEach((r) => r.destroy());
        this.pool =
            this.linePool =
            this.ringPool =
            this.particles =
            this.activeLines =
            this.activeRings =
                [];
        this.activeCount = 0;
    }
}
