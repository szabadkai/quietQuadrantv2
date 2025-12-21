/** XP pickup pop effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnXPPickup(renderer, x, y) {
    for (let i = 0, n = Math.min(3, renderer.getAvailable()); i < n; i++) {
        renderer.spawnParticle({
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
