/** XP pickup pop effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnXPPickup(renderer, x, y) {
    renderer.spawnRing(x, y, PALETTE_HEX.xp, 12, 0.12, false, PALETTE_HEX.white);

    const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ];
    for (const [dx, dy] of dirs) {
        renderer.spawnRectParticle({
            x,
            y,
            size: 3,
            color: Math.random() > 0.5 ? PALETTE_HEX.xp : PALETTE_HEX.white,
            vx: dx * 70,
            vy: dy * 70,
            life: 0.14,
            fade: true,
            shrink: true,
        });
    }
}
