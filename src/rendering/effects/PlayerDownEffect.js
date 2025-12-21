/** Player down burst effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnPlayerDown(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(20, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 60 + Math.random() * 80;
        renderer.spawnParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: PALETTE_HEX.health,
            size: 3 + Math.random() * 2,
            life: 0.8,
            fade: true,
            gravity: 50,
        });
    }
    renderer.spawnRing(x, y, PALETTE_HEX.health, 60, 0.4);
}
