/** Short hit spark burst effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnHitSpark(renderer, x, y, color = PALETTE_HEX.white) {
    for (let i = 0, n = Math.min(4, renderer.getAvailable()); i < n; i++) {
        const angle = Math.random() * Math.PI * 2,
            speed = 40 + Math.random() * 40;
        renderer.spawnParticle({
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
