import { ARENA_WIDTH, ARENA_HEIGHT } from "../utils/constants.js";
import { PALETTE_HEX } from "../utils/palette.js";

export class BackgroundRenderer {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.layers = [
            { count: 40, speed: 0.1, size: [0.4, 1.0], alpha: 0.25, stars: [] },
            {
                count: 24,
                speed: 0.25,
                size: [0.8, 1.5],
                alpha: 0.35,
                stars: [],
            },
            { count: 12, speed: 0.4, size: [1.2, 2.0], alpha: 0.5, stars: [] },
        ];
        this.seedStars();
    }

    seedStars() {
        for (const layer of this.layers) {
            for (let i = 0; i < layer.count; i += 1) {
                layer.stars.push({
                    x: Math.random() * ARENA_WIDTH,
                    y: Math.random() * ARENA_HEIGHT,
                    size: randRange(layer.size[0], layer.size[1]),
                    alpha: layer.alpha * randRange(0.7, 1),
                });
            }
        }
    }

    render(state) {
        const player = state?.players?.[0];
        const centerX = ARENA_WIDTH / 2;
        const centerY = ARENA_HEIGHT / 2;
        const offsetX = player ? player.x - centerX : 0;
        const offsetY = player ? player.y - centerY : 0;

        const brightness =
            state?.phase === "intermission"
                ? 0.65
                : state?.phase === "boss"
                ? 0.85
                : 1;

        this.graphics.clear();
        this.graphics.fillStyle(PALETTE_HEX.background, 1);
        this.graphics.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

        this.drawGrid(brightness);
        this.drawStars(offsetX, offsetY, brightness);
        this.drawBounds(brightness);
        this.drawVignette();
    }

    drawGrid(brightness) {
        const gridAlpha = 0.08 * brightness;
        this.graphics.lineStyle(1, 0x00ffff, gridAlpha);
        for (let x = 100; x < ARENA_WIDTH; x += 100) {
            this.graphics.lineBetween(x, 0, x, ARENA_HEIGHT);
        }
        for (let y = 100; y < ARENA_HEIGHT; y += 100) {
            this.graphics.lineBetween(0, y, ARENA_WIDTH, y);
        }
    }

    drawStars(offsetX, offsetY, brightness) {
        for (const layer of this.layers) {
            const shiftX = offsetX * layer.speed;
            const shiftY = offsetY * layer.speed;
            for (const star of layer.stars) {
                let x = star.x - shiftX;
                let y = star.y - shiftY;
                x = wrap(x, ARENA_WIDTH);
                y = wrap(y, ARENA_HEIGHT);
                this.graphics.fillStyle(0x00ffff, star.alpha * brightness);
                this.graphics.fillCircle(x, y, star.size);
            }
        }
    }

    drawBounds(brightness) {
        this.graphics.lineStyle(2, PALETTE_HEX.safe, 0.4 * brightness);
        this.graphics.strokeRect(1, 1, ARENA_WIDTH - 2, ARENA_HEIGHT - 2);
    }

    drawVignette() {
        // Removed vignette for cleaner Vectrex aesthetic
    }
}

function randRange(min, max) {
    return min + Math.random() * (max - min);
}

function wrap(value, max) {
    let wrapped = value % max;
    if (wrapped < 0) wrapped += max;
    return wrapped;
}
