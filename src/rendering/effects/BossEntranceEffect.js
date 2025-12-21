/** Boss entrance burst effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnBossEntrance(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(24, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const dist = 100 + Math.random() * 50;
        renderer.spawnParticle({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 150,
            vy: -Math.sin(angle) * 150,
            color: PALETTE_HEX.boss,
            size: 4,
            life: 0.5,
            fade: true,
        });
    }
    renderer.spawnRing(x, y, PALETTE_HEX.boss, 120, 0.6);
    renderer.spawnRing(x, y, 0xffffff, 80, 0.4);
}
