/** High-contrast geometric burst for Volatile Compounds. */
import { PLAYER_RADIUS } from "../../utils/constants.js";
import { PALETTE_HEX } from "../../utils/palette.js";

export function spawnVolatileBurst(renderer, x, y, radius = PLAYER_RADIUS * 1.2) {
    const base = Math.max(radius, PLAYER_RADIUS * 1.2);
    const outer = base * 1.1;
    const inner = base * 0.7;

    renderer.spawnRing(
        x,
        y,
        PALETTE_HEX.white,
        outer,
        0.18,
        false,
        PALETTE_HEX.health
    );
    renderer.spawnRing(
        x,
        y,
        PALETTE_HEX.health,
        inner,
        0.12,
        false,
        PALETTE_HEX.white
    );

    const line = renderer.linePool.find((l) => !l.visible);
    if (line) {
        const spikes = 8;
        line.clear();
        line.setVisible(true);
        line.lineStyle(2.5, 0xffffff, 1);
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const dx = Math.cos(angle) * outer;
            const dy = Math.sin(angle) * outer;
            line.beginPath();
            line.moveTo(x, y);
            line.lineTo(x + dx, y + dy);
            line.strokePath();
        }
        line.lineStyle(1, 0xff4444, 1);
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const dx = Math.cos(angle) * inner;
            const dy = Math.sin(angle) * inner;
            line.beginPath();
            line.moveTo(x, y);
            line.lineTo(x + dx, y + dy);
            line.strokePath();
        }
        renderer.activeLines.push({
            graphics: line,
            life: 0.18,
            maxLife: 0.18,
        });
    }

    const shardCount = 10;
    for (let i = 0; i < shardCount; i++) {
        const angle = (i / shardCount) * Math.PI * 2;
        const speed = base * (4 + Math.random() * 2);
        const color = i % 2 === 0 ? PALETTE_HEX.white : PALETTE_HEX.health;
        renderer.spawnRectParticle({
            x,
            y,
            size: 4,
            color,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.2,
            fade: true,
            shrink: true,
            rotation: angle,
            spin: (Math.random() - 0.5) * 6,
        });
    }
}
