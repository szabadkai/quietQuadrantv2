/** Shield activation pulse effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnShieldActivate(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(12, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        renderer.spawnParticle({
            x: x + Math.cos(angle) * 20,
            y: y + Math.sin(angle) * 20,
            vx: Math.cos(angle) * 30,
            vy: Math.sin(angle) * 30,
            color: PALETTE_HEX.cyan,
            size: 2.5,
            life: 0.4,
            fade: true,
        });
    }
    renderer.spawnRing(x, y, PALETTE_HEX.cyan, 30, 0.3);
}
