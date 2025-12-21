/** Level-up burst effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnLevelUp(renderer, x, y) {
    for (let i = 0, n = Math.min(16, renderer.getAvailable()); i < n; i++) {
        const angle = (Math.PI * 2 * i) / n,
            speed = 100 + Math.random() * 40;
        renderer.spawnParticle({
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
