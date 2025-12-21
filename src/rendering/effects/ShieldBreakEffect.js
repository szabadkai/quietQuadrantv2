/** Shield break shatter effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnShieldBreak(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(8, available);

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 60;
        renderer.spawnParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: PALETTE_HEX.cyan,
            size: 2,
            life: 0.25,
            fade: true,
        });
    }
}
