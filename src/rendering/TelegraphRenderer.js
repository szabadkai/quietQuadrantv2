/**
 * Renders boss attack telegraphs and danger zone previews.
 * Shows players where attacks will land before they happen.
 */

import { PALETTE_HEX } from "../utils/palette.js";
import { ARENA_WIDTH, ARENA_HEIGHT } from "../utils/constants.js";

const TELEGRAPH_ALPHA = 0.25;
const TELEGRAPH_PULSE_SPEED = 4;

export class TelegraphRenderer {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(3);
        this.telegraphs = [];
        this.time = 0;
    }

    update(delta, state) {
        this.time += delta / 1000;
        this.graphics.clear();

        if (!state?.boss?.alive) {
            this.telegraphs = [];
            return;
        }

        this.updateTelegraphs(delta);
        this.renderTelegraphs();
    }

    addTelegraph(config) {
        this.telegraphs.push({
            type: config.type,
            x: config.x ?? 0,
            y: config.y ?? 0,
            radius: config.radius ?? 50,
            width: config.width ?? 40,
            height: config.height ?? ARENA_HEIGHT,
            angle: config.angle ?? 0,
            duration: config.duration ?? 500,
            elapsed: 0,
            color: config.color ?? PALETTE_HEX.danger,
        });
    }

    updateTelegraphs(delta) {
        for (let i = this.telegraphs.length - 1; i >= 0; i--) {
            const telegraph = this.telegraphs[i];
            telegraph.elapsed += delta;

            if (telegraph.elapsed >= telegraph.duration) {
                this.telegraphs.splice(i, 1);
            }
        }
    }

    renderTelegraphs() {
        for (const telegraph of this.telegraphs) {
            const progress = telegraph.elapsed / telegraph.duration;
            const pulse =
                Math.sin(this.time * TELEGRAPH_PULSE_SPEED) * 0.5 + 0.5;
            const alpha =
                TELEGRAPH_ALPHA * (1 - progress * 0.5) * (0.7 + pulse * 0.3);

            this.graphics.fillStyle(telegraph.color, alpha);
            this.graphics.lineStyle(2, telegraph.color, alpha * 1.5);

            switch (telegraph.type) {
            case "circle":
                this.renderCircle(telegraph, progress);
                break;
            case "line":
                this.renderLine(telegraph, progress);
                break;
            case "cone":
                this.renderCone(telegraph, progress);
                break;
            case "rect":
                this.renderRect(telegraph, progress);
                break;
            case "ring":
                this.renderRing(telegraph, progress);
                break;
            }
        }
    }

    renderCircle(telegraph, progress) {
        const radius = telegraph.radius * (0.5 + progress * 0.5);
        this.graphics.fillCircle(telegraph.x, telegraph.y, radius);
        this.graphics.strokeCircle(telegraph.x, telegraph.y, radius);
    }

    renderLine(telegraph, progress) {
        const length = telegraph.height;
        const halfWidth = telegraph.width / 2;
        const cos = Math.cos(telegraph.angle);
        const sin = Math.sin(telegraph.angle);

        const points = [
            { x: -halfWidth, y: 0 },
            { x: halfWidth, y: 0 },
            { x: halfWidth, y: length },
            { x: -halfWidth, y: length },
        ];

        const transformed = points.map((p) => ({
            x: telegraph.x + p.x * cos - p.y * sin,
            y: telegraph.y + p.x * sin + p.y * cos,
        }));

        this.graphics.beginPath();
        this.graphics.moveTo(transformed[0].x, transformed[0].y);
        for (let i = 1; i < transformed.length; i++) {
            this.graphics.lineTo(transformed[i].x, transformed[i].y);
        }
        this.graphics.closePath();
        this.graphics.fillPath();
        this.graphics.strokePath();
    }

    renderCone(telegraph, progress) {
        const radius = telegraph.radius;
        const halfAngle = Math.PI / 6;
        const startAngle = telegraph.angle - halfAngle;
        const endAngle = telegraph.angle + halfAngle;

        this.graphics.beginPath();
        this.graphics.moveTo(telegraph.x, telegraph.y);
        this.graphics.arc(
            telegraph.x,
            telegraph.y,
            radius,
            startAngle,
            endAngle
        );
        this.graphics.closePath();
        this.graphics.fillPath();
        this.graphics.strokePath();
    }

    renderRect(telegraph, progress) {
        const halfW = telegraph.width / 2;
        const halfH = telegraph.height / 2;
        this.graphics.fillRect(
            telegraph.x - halfW,
            telegraph.y - halfH,
            telegraph.width,
            telegraph.height
        );
        this.graphics.strokeRect(
            telegraph.x - halfW,
            telegraph.y - halfH,
            telegraph.width,
            telegraph.height
        );
    }

    renderRing(telegraph, progress) {
        const innerRadius = telegraph.radius * 0.7;
        const outerRadius = telegraph.radius;

        this.graphics.beginPath();
        this.graphics.arc(
            telegraph.x,
            telegraph.y,
            outerRadius,
            0,
            Math.PI * 2
        );
        this.graphics.arc(
            telegraph.x,
            telegraph.y,
            innerRadius,
            0,
            Math.PI * 2,
            true
        );
        this.graphics.closePath();
        this.graphics.fillPath();
    }

    processBossState(boss) {
        if (!boss?.alive) return;

        const pattern = boss.pattern;
        const tick = boss.patternTick;

        if (tick === 30) {
            this.addPatternTelegraph(boss, pattern);
        }
    }

    addPatternTelegraph(boss, pattern) {
        switch (pattern) {
        case "slam":
            this.addTelegraph({
                type: "circle",
                x: boss.x,
                y: boss.y,
                radius: 100,
                duration: 800,
                color: PALETTE_HEX.danger,
            });
            break;
        case "beam-spin":
            this.addTelegraph({
                type: "line",
                x: boss.x,
                y: boss.y,
                width: 30,
                height: 400,
                angle: 0,
                duration: 600,
                color: PALETTE_HEX.boss,
            });
            break;
        case "lane-beams":
            for (let i = 0; i < 3; i++) {
                this.addTelegraph({
                    type: "rect",
                    x: ARENA_WIDTH * (0.25 + i * 0.25),
                    y: ARENA_HEIGHT / 2,
                    width: 60,
                    height: ARENA_HEIGHT,
                    duration: 700,
                    color: PALETTE_HEX.danger,
                });
            }
            break;
        case "cone-volley":
            this.addTelegraph({
                type: "cone",
                x: boss.x,
                y: boss.y,
                radius: 250,
                angle: Math.PI / 2,
                duration: 500,
                color: PALETTE_HEX.boss,
            });
            break;
        case "pulse-ring":
            this.addTelegraph({
                type: "ring",
                x: boss.x,
                y: boss.y,
                radius: 150,
                duration: 600,
                color: PALETTE_HEX.boss,
            });
            break;
        }
    }

    destroy() {
        this.graphics.destroy();
        this.telegraphs = [];
    }
}
