/** Wave start pulse effect. */
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnWaveStart(renderer, x, y) {
    renderer.spawnRing(x, y, PALETTE_HEX.cyan, 150, 0.5);
}
