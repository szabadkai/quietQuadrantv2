/** Visual telegraph for Phantom teleport destination. */
import { PALETTE_HEX } from "../../utils/palette.js";

export class PhasedPhantomTelegraph {
    constructor(graphics, x, y, radius) {
        this.graphics = graphics;
        this.x = x;
        this.y = y;
        this.targetRadius = radius || 12;
        this.time = 0;
        this.duration = 0.5; // Matches the 30-tick telegraph window
    }

    update(dt) {
        this.time += dt;
        if (this.time >= this.duration) return false;

        const g = this.graphics;
        g.clear();
        
        g.setPosition(this.x, this.y);
        g.setRotation(0);

        // Progress 0 to 1
        const t = this.time / this.duration;
        
        // Flicker effect: visible 70% of frames
        if (Math.random() > 0.7 && t < 0.8) return true;

        const color = PALETTE_HEX.enemy || 0xf14e4e; // Fallback to red if palette missing
        const alpha = 0.5 + 0.5 * t; // Get brighter as it gets closer
        
        // A contracting wireframe diamond
        // Starts at 3x radius, contracts to 1x radius
        const scale = 3 - 2 * (1 - Math.pow(1 - t, 2)); // Ease in
        const r = this.targetRadius * scale;

        g.lineStyle(2, color, alpha);
        
        // Draw diamond
        g.beginPath();
        g.moveTo(0, -r);
        g.lineTo(r, 0);
        g.lineTo(0, r);
        g.lineTo(-r, 0);
        g.closePath();
        g.strokePath();

         // Inner erratic glitches (horizontal scan-lines)
         if (t > 0.5) {
            const glitchW = this.targetRadius * 1.5;
            const yOff = (Math.random() - 0.5) * glitchW;
            g.lineStyle(1, color, alpha * 0.8);
            g.moveTo(-glitchW/2, yOff);
            g.lineTo(glitchW/2, yOff);
            g.strokePath();
         }

        return true;
    }
}

export function spawnPhantomTelegraph(renderer, x, y, radius) {
    renderer.spawnPhasedEffect(PhasedPhantomTelegraph, x, y, radius);
}
