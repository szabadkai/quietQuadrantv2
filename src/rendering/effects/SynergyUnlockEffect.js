/** Synergy unlock celebration effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnSynergyUnlock(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(20, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 80 + Math.random() * 60;
        renderer.spawnParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: PALETTE_HEX.synergy,
            size: 3 + Math.random() * 2,
            life: 0.6 + Math.random() * 0.2,
            fade: true,
        });
    }
    renderer.spawnRing(x, y, PALETTE_HEX.synergy, 50, 0.4);
    renderer.spawnRing(x, y, PALETTE_HEX.synergy, 80, 0.5);
}
