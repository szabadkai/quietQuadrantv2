/** Shrapnel burst fragments effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnShrapnelBurst(renderer, x, y, color = PALETTE_HEX.danger) {
    const available = renderer.getAvailable();
    const count = Math.min(10, available);

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 100;
        renderer.spawnParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            size: 2 + Math.random() * 1.5,
            life: 0.2 + Math.random() * 0.15,
            fade: true,
        });
    }
}
