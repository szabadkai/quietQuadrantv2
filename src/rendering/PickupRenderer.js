import { lerp } from "../utils/math.js";
import { SPRITE_KEYS } from "./sprites.js";
import { GlowManager, GLOW_PRESETS } from "./GlowManager.js";
import { safeNumber, safeSize } from "./sizeUtils.js";

export class PickupRenderer {
    constructor(scene, maxPickups = 100) {
        this.scene = scene;
        // No pickups to render
    }

    setGlowIntensity(intensity) {
        // No-op
    }

    render(pickups, interpolation) {
        // No-op
    }
}
