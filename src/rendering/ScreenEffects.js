/**
 * Screen-level visual effects: shake, flash, slow-mo.
 * Provides camera manipulation for impact feedback.
 */

export class ScreenEffects {
    constructor(scene) {
        this.scene = scene;
        this.camera = scene.cameras.main;

        this.shakeEnabled = true;
        this.flashEnabled = true;
        this.slowMoEnabled = true;

        this.slowMoActive = false;
        this.slowMoTimer = 0;
        this.slowMoScale = 1;
    }

    shake(intensity = 0.005, duration = 100) {
        if (!this.shakeEnabled || !this.camera) return;
        this.camera.shake(duration, intensity);
    }

    flash(color = 0xff0000, duration = 100, alpha = 0.3) {
        if (!this.flashEnabled || !this.camera) return;
        this.camera.flash(duration, ...hexToRgb(color), alpha);
    }

    startSlowMo(scale = 0.3, duration = 500) {
        if (!this.slowMoEnabled) return;
        this.slowMoActive = true;
        this.slowMoScale = scale;
        this.slowMoTimer = duration;
    }

    update(delta) {
        if (this.slowMoActive) {
            this.slowMoTimer -= delta;
            if (this.slowMoTimer <= 0) {
                this.slowMoActive = false;
                this.slowMoScale = 1;
            }
        }
    }

    getTimeScale() {
        return this.slowMoActive ? this.slowMoScale : 1;
    }

    onPlayerHit() {
        this.shake(0.008, 150);
        this.flash(0xff0000, 80, 0.2);
    }

    onPlayerDeath() {
        this.shake(0.015, 300);
        this.flash(0xff0000, 200, 0.4);
        this.startSlowMo(0.2, 800);
    }

    onBossPhaseChange() {
        this.shake(0.01, 200);
        this.flash(0xaa00ff, 150, 0.25);
        this.startSlowMo(0.4, 400);
    }

    onBossDeath() {
        this.shake(0.02, 500);
        this.flash(0xffffff, 300, 0.5);
        this.startSlowMo(0.15, 1200);
    }

    onLevelUp() {
        this.flash(0x00ffff, 100, 0.15);
        this.startSlowMo(0.5, 300);
    }

    processEvents(events) {
        for (const event of events) {
            switch (event.type) {
                case "player-hit":
                    this.onPlayerHit();
                    break;
                case "defeat":
                    this.onPlayerDeath();
                    break;
                case "boss-phase":
                    this.onBossPhaseChange();
                    break;
                case "boss-death":
                    this.onBossDeath();
                    break;
                case "level-up":
                    this.onLevelUp();
                    break;
                case "victory":
                    this.flash(0x00ff00, 200, 0.3);
                    this.startSlowMo(0.3, 600);
                    break;
            }
        }
    }

    setShakeEnabled(enabled) {
        this.shakeEnabled = enabled;
    }

    setFlashEnabled(enabled) {
        this.flashEnabled = enabled;
    }

    setSlowMoEnabled(enabled) {
        this.slowMoEnabled = enabled;
    }

    destroy() {
        this.slowMoActive = false;
        this.slowMoScale = 1;
    }
}

function hexToRgb(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return [r, g, b];
}
