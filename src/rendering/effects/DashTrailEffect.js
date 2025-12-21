/** Dash trail afterimage effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnDashTrail(renderer, x, y) {
    if (renderer.getAvailable() < 1) return;
    renderer.spawnParticle({
        x,
        y,
        vx: 0,
        vy: 0,
        color: PALETTE_HEX.cyan,
        size: 4,
        life: 0.2,
        fade: true,
        shrink: true,
    });
}
