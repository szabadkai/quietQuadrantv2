/** Explosion burst with expanding ring effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnExplosionRing(renderer, x, y, radius) {
    const available = renderer.getAvailable();
    const count = Math.min(16, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 80 + Math.random() * 40;
        renderer.spawnParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: PALETTE_HEX.danger,
            size: 2.5 + Math.random() * 1.5,
            life: 0.35,
            fade: true,
        });
    }
    renderer.spawnRing(x, y, PALETTE_HEX.danger, radius, 0.3);
}
