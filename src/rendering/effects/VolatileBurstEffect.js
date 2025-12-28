/** High-contrast geometric burst for Volatile Compounds. */
import { PLAYER_RADIUS } from "../../utils/constants.js";
import { PALETTE_HEX } from "../../utils/palette.js";

class PhasedVolatileBurst {
    constructor(graphics, x, y, radius) {
        this.graphics = graphics;
        this.x = x;
        this.y = y;
        this.targetRadius = radius;
        this.time = 0;
        this.duration = 0.5;
    }

    update(dt) {
        this.time += dt;
        if (this.time >= this.duration) return false;

        const g = this.graphics;
        g.clear();
        
        g.setPosition(this.x, this.y);
        g.setRotation(0);

        // Core Flash (White)
        if (this.time < 0.12) {
            const t = this.time / 0.12;
            const r = this.targetRadius * 0.8 * t;
            g.fillStyle(PALETTE_HEX.white, 1);
            g.fillCircle(0, 0, r);
        }

        // Main Blast (Red/Health)
        if (this.time > 0.04 && this.time < 0.45) {
            const t = (this.time - 0.04) / 0.41;
            const ease = 1 - Math.pow(1 - t, 3);
            const r = this.targetRadius * (0.5 + 1.2 * ease);
            
            const width = 4 * (1 - t);
            if (width > 0.5) {
                g.lineStyle(width, PALETTE_HEX.health, 1);
                g.strokeCircle(0, 0, r);
            }
        }

        // Secondary Ring (White)
        if (this.time > 0.08 && this.time < 0.5) {
            const t = (this.time - 0.08) / 0.42;
            const ease = 1 - Math.pow(1 - t, 2);
            const r = this.targetRadius * (0.2 + 1.0 * ease);
            
            const width = 2.5 * (1 - t);
            if (width > 0.5) {
                g.lineStyle(width, PALETTE_HEX.white, 1);
                g.strokeCircle(0, 0, r);
            }
        }

        return true;
    }
}

export function spawnVolatileBurst(renderer, x, y, radius = PLAYER_RADIUS * 1.5) {
    renderer.spawnPhasedEffect(PhasedVolatileBurst, x, y, radius);
    
    // Add some debris for extra impact
    const debrisCount = 8;
    for (let i = 0; i < debrisCount; i++) {
        const angle = (i / debrisCount) * Math.PI * 2;
        const speed = radius * (2 + Math.random());
        renderer.spawnRectParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: PALETTE_HEX.health,
            size: 3,
            life: 0.3,
            fade: true,
            shrink: true,
            spin: (Math.random() - 0.5) * 10,
        });
    }
}
