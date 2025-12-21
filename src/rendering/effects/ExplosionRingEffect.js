/** Explosion burst with fast expanding yellow ring. */
import { PLAYER_RADIUS } from "../../utils/constants.js";
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnExplosionRing(renderer, x, y, radius) {
    const baseRadius = PLAYER_RADIUS * 1.2;
    const target = baseRadius * (0.95 + Math.random() * 0.1);
    renderer.spawnRing(
        x,
        y,
        PALETTE_HEX.gold,
        target,
        0.22,
        false,
        PALETTE_HEX.gold
    );
}
