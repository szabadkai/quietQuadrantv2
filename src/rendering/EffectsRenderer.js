/* eslint-disable max-lines */
/** Particle and explosion effects renderer. Manages pooled particles with budget enforcement. */
import { PALETTE_HEX } from "../utils/palette.js";
import { spawnBossEntrance } from "./effects/BossEntranceEffect.js";
import { spawnChainArc } from "./effects/ChainArcEffect.js";
import { spawnDashTrail } from "./effects/DashTrailEffect.js";
import { spawnExplosion } from "./effects/ExplosionEffect.js";
import { spawnExplosionRing } from "./effects/ExplosionRingEffect.js";
import { spawnHeal } from "./effects/HealEffect.js";
import { spawnHitSpark } from "./effects/HitSparkEffect.js";
import { spawnLevelUp } from "./effects/LevelUpEffect.js";
import { spawnPlayerDown } from "./effects/PlayerDownEffect.js";
import { spawnPlayerDefeat } from "./effects/PlayerDefeatEffect.js";
import { spawnShieldActivate } from "./effects/ShieldActivateEffect.js";
import { spawnShieldBreak } from "./effects/ShieldBreakEffect.js";
import { spawnShrapnelBurst } from "./effects/ShrapnelBurstEffect.js";
import { spawnSingularity } from "./effects/SingularityEffect.js";
import { spawnSynergyUnlock } from "./effects/SynergyUnlockEffect.js";
import { spawnVolatileBurst } from "./effects/VolatileBurstEffect.js";
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
        this.rectPool = [];
        this.activeRects = [];
        this.textPool = [];
        this.activeTexts = [];
        this.activeSequences = [];
        this.settings = { damageNumbers: false };
        this.initPool();
        this.initLinePool();
        this.initRingPool();
        this.initRectPool();
        this.initTextPool();
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

    initRectPool() {
        for (let i = 0; i < 40; i++) {
            const rect = this.scene.add.rectangle(0, 0, 6, 6, 0xffffff);
            rect.setVisible(false);
            rect.setDepth(10);
            this.rectPool.push(rect);
        }
    }

    initTextPool() {
        for (let i = 0; i < 40; i++) {
            const t = this.scene.add.text(-100, -100, "", {
                fontFamily: "Courier New, monospace",
                fontSize: "12px",
                color: "#9ff0ff",
            });
            t.setVisible(false);
            t.setDepth(10);
            this.textPool.push(t);
        }
    }

    getAvailable() {
        return MAX_PARTICLES - this.activeCount;
    }

    spawnRing(
        x,
        y,
        color,
        maxRadius,
        duration,
        inward = false,
        accentColor = 0xffffff
    ) {
        const ring = this.ringPool.find((r) => !r.visible);
        if (!ring) return;
        ring.clear();
        ring.setVisible(true);
        this.activeRings.push({
            graphics: ring,
            x,
            y,
            color,
            accentColor,
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

    spawnRectParticle(c) {
        const r = this.rectPool.find((rect) => !rect.visible);
        if (!r) return null;
        r.setPosition(c.x, c.y);
        r.setSize(c.size, c.size);
        r.setFillStyle(c.color);
        r.setAlpha(1);
        r.setRotation(c.rotation ?? 0);
        r.setVisible(true);
        r.rectData = {
            vx: c.vx ?? 0,
            vy: c.vy ?? 0,
            life: c.life ?? 0.5,
            maxLife: c.life ?? 0.5,
            fade: c.fade ?? false,
            shrink: c.shrink ?? false,
            spin: c.spin ?? 0,
            initialSize: c.size,
        };
        this.activeRects.push(r);
        return r;
    }

    update(delta) {
        const dt = delta / 1000;
        this.updateParticles(dt);
        this.updateLines(dt);
        this.updateRings(dt);
        this.updateRects(dt);
        this.updateTexts(dt);
        this.updateSequences(dt);
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
            r.graphics.lineStyle(1, r.accentColor ?? 0xffffff, alpha * 0.4);
            r.graphics.strokeCircle(r.x, r.y, radius * 0.9);
        }
    }

    updateRects(dt) {
        for (let i = this.activeRects.length - 1; i >= 0; i--) {
            const r = this.activeRects[i];
            const d = r.rectData;
            d.life -= dt;
            if (d.life <= 0) {
                r.setVisible(false);
                this.activeRects.splice(i, 1);
                continue;
            }
            r.x += d.vx * dt;
            r.y += d.vy * dt;
            if (d.spin) {
                r.rotation += d.spin * dt;
            }
            if (d.fade) r.setAlpha(d.life / d.maxLife);
            if (d.shrink) {
                const size = d.initialSize * (d.life / d.maxLife);
                r.setSize(size, size);
            }
        }
    }

    updateTexts(dt) {
        for (let i = this.activeTexts.length - 1; i >= 0; i--) {
            const t = this.activeTexts[i];
            const d = t.textData;
            d.life -= dt;
            if (d.life <= 0) {
                t.setVisible(false);
                this.activeTexts.splice(i, 1);
                continue;
            }
            t.x += d.vx * dt;
            t.y += d.vy * dt;
            t.setAlpha(d.life / d.maxLife);
        }
    }

    updateSequences(dt) {
        for (let i = this.activeSequences.length - 1; i >= 0; i--) {
            const seq = this.activeSequences[i];
            seq.elapsed += dt;
            for (const step of seq.steps) {
                if (step.fired || seq.elapsed < step.time) continue;
                step.fired = true;
                step.action?.();
            }
            if (
                seq.elapsed >= seq.duration &&
                seq.steps.every((s) => s.fired)
            ) {
                this.activeSequences.splice(i, 1);
            }
        }
    }

    addSequence(steps, duration = null) {
        const maxTime = steps.reduce(
            (max, step) => Math.max(max, step.time ?? 0),
            0
        );
        const sequenceDuration = duration ?? maxTime + 0.5;
        this.activeSequences.push({
            elapsed: 0,
            duration: sequenceDuration,
            steps: steps.map((step) => ({ ...step, fired: false })),
        });
    }

    setSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    processEvents(events) {
        for (const e of events) this.handleEvent(e);
    }

    handleEvent(e) {
        const { x, y, x1, y1, x2, y2, radius } = e,
            t = e.type;
        if (t === "enemy-death") spawnExplosion(this, x, y, PALETTE_HEX.enemy);
        else if (t === "player-hit")
            spawnHitSpark(this, x, y, PALETTE_HEX.danger);
        else if (t === "enemy-hit")
            spawnHitSpark(this, x, y, PALETTE_HEX.white);
        else if (t === "xp-pickup") spawnXPPickup(this, x, y);
        else if (t === "level-up") spawnLevelUp(this, x, y);
        else if (t === "dash") spawnDashTrail(this, x, y);
        else if (t === "boss-death")
            spawnExplosion(this, x, y, PALETTE_HEX.boss, 24);
        else if (t === "crit-hit") spawnExplosion(this, x, y);
        else if (t === "shrapnel") spawnShrapnelBurst(this, x, y);
        else if (t === "dash-sparks")
            spawnShrapnelBurst(this, x, y, PALETTE_HEX.cyan);
        else if (t === "explosion")
            spawnExplosionRing(this, x, y, radius ?? 40);
        else if (t === "chain-reaction")
            spawnVolatileBurst(this, x, y, radius ?? 40);
        else if (t === "chain-arc") spawnChainArc(this, x1, y1, x2, y2);
        else if (t === "singularity") spawnSingularity(this, x, y);
        else if (t === "synergy-unlocked" && x !== undefined)
            spawnSynergyUnlock(this, x, y);
        else if (t === "boss-spawn" && x !== undefined)
            spawnBossEntrance(this, x, y);
        else if (t === "player-down" && x !== undefined)
            spawnPlayerDown(this, x, y);
        else if (t === "shield-activate") spawnShieldActivate(this, x, y);
        else if (t === "shield-break") spawnShieldBreak(this, x, y);
        else if (t === "heal") spawnHeal(this, x, y);
        else if (t === "ricochet") spawnHitSpark(this, x, y, PALETTE_HEX.white);
        else if (t === "neutron-block") spawnShieldBreak(this, x, y);
        else if (t === "defeat" && x !== undefined)
            spawnPlayerDefeat(this, x, y);
        else if (t === "damage-number" && this.settings.damageNumbers)
            this.spawnDamageNumber(x, y, e.amount, e.isCrit);
    }

    spawnDamageNumber(x, y, amount, isCrit = false) {
        if (amount === undefined || amount === null) return;
        const text = this.textPool.find((t) => !t.visible);
        if (!text) return;
        const value = Math.max(1, Math.round(amount));
        const color = isCrit ? "#ff8844" : "#9ff0ff";
        text.setText(String(value));
        text.setColor(color);
        text.setPosition(x + (Math.random() - 0.5) * 10, y - 8);
        text.setAlpha(1);
        text.setShadow(0, 0, 8, color, true, true);
        text.setVisible(true);
        text.textData = {
            life: 0.45,
            maxLife: 0.45,
            vx: (Math.random() - 0.5) * 10,
            vy: -30,
        };
        this.activeTexts.push(text);
    }

    destroy() {
        this.pool.forEach((p) => p.destroy());
        this.linePool.forEach((l) => l.destroy());
        this.ringPool.forEach((r) => r.destroy());
        this.rectPool.forEach((r) => r.destroy());
        this.textPool.forEach((t) => t.destroy());
        this.pool =
            this.linePool =
            this.ringPool =
            this.rectPool =
            this.particles =
            this.activeLines =
            this.activeRings =
            this.activeRects =
            this.textPool =
            this.activeTexts =
            this.activeSequences =
                [];
        this.activeCount = 0;
    }
}
