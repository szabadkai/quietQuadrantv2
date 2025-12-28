/** Enemy death animation - phased draw call implementation. */
import { PLAYER_RADIUS } from "../../utils/constants.js";

const ENEMY_RED = 0xf14e4e;

class PhasedEnemyDeath {
    constructor(graphics, x, y) {
        this.graphics = graphics;
        this.x = x;
        this.y = y;
        this.time = 0;
        this.duration = 0.35;
        
        // Random rotation for the blast shape
        this.angle = Math.random() * Math.PI * 2;
    }

    update(dt) {
        this.time += dt;
        if (this.time >= this.duration) return false;

        const g = this.graphics;
        g.clear();
        
        g.setPosition(this.x, this.y);
        g.setRotation(0); // Circles don't need rotation

        // Phase 1: Solid Core Flash (White)
        // Rapid expansion, giving the explosion "body"
        // 0.15 -> 0.08
        if (this.time < 0.08) {
            const t = this.time / 0.08;
            const r = PLAYER_RADIUS * 1.3 * t; 
            g.fillStyle(0xffffff, 1);
            g.fillCircle(0, 0, r);
        }

        // Phase 2: Main Blast Wave (Thick Red Ring)
        // Starts as the core expands, carries the momentum outward
        // 0.05-0.45 (0.4s) -> 0.03-0.28 (0.25s) 
        if (this.time > 0.03 && this.time < 0.28) {
            const t = (this.time - 0.03) / 0.25;
            const ease = 1 - Math.pow(1 - t, 3); // Fast start, slow end
            const r = PLAYER_RADIUS * (0.5 + 2.5 * ease);
            
            // Start thick, get thinner
            const width = 3 * (1 - t);
            if (width > 0.5) {
                g.lineStyle(width, ENEMY_RED, 1);
                g.strokeCircle(0, 0, r);
            }
        }

        // Phase 3: Secondary Shockwave (Thinner White Ring)
        // Follows the main blast
        // 0.1-0.55 (0.45s) -> 0.06-0.34 (0.28s)
        if (this.time > 0.06 && this.time < 0.34) {
            const t = (this.time - 0.06) / 0.28;
            const ease = 1 - Math.pow(1 - t, 2);
            const r = PLAYER_RADIUS * (0.3 + 2 * ease);
            
            const width = 2 * (1 - t);
            if (width > 0.5) {
                g.lineStyle(width, 0xffffff, 1);
                g.strokeCircle(0, 0, r);
            }
        }

        return true;
    }
}

export function spawnEnemyDeath(renderer, x, y) {
    renderer.spawnPhasedEffect(PhasedEnemyDeath, x, y);

    // Keep the debris particles as they work well with the physics system
    const debrisCount = 10;
    for (let i = 0; i < debrisCount; i++) {
        const angle = (i / debrisCount) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 90 + Math.random() * 70;
        renderer.spawnRectParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: ENEMY_RED,
            size: 4,
            life: 0.4 + Math.random() * 0.2,
            fade: true,
            shrink: true,
            spin: (Math.random() - 0.5) * 8,
        });
    }
}
