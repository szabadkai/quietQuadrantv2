/** Explosion particle burst effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnExplosion(renderer, x, y, color = PALETTE_HEX.cyan, count = 8) {
    for (let i = 0, n = Math.min(count, renderer.getAvailable()); i < n; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3,
            speed = 80 + Math.random() * 60;
        renderer.spawnParticle({
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
