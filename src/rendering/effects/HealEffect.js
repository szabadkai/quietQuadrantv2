/** Heal sparkle effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnHeal(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(6, available);

    for (let i = 0; i < count; i++) {
        renderer.spawnParticle({
            x: x + (Math.random() - 0.5) * 20,
            y,
            vx: (Math.random() - 0.5) * 20,
            vy: -60 - Math.random() * 40,
            color: PALETTE_HEX.xp,
            size: 2.5,
            life: 0.5,
            fade: true,
        });
    }
}
