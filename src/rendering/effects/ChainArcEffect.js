/** Chain lightning arc effect. */
export function spawnChainArc(renderer, x1, y1, x2, y2) {
    const line = renderer.linePool.find((l) => !l.visible);
    if (!line) return;

    line.clear();
    line.setVisible(true);

    const segments = 6;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const perpX = -dy * 0.15;
    const perpY = dx * 0.15;

    line.lineStyle(3, 0x00ffff, 1);
    line.beginPath();
    line.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const jitter = (Math.random() - 0.5) * 2;
        line.lineTo(
            x1 + dx * t + perpX * jitter,
            y1 + dy * t + perpY * jitter
        );
    }
    line.lineTo(x2, y2);
    line.strokePath();

    line.lineStyle(1.5, 0xffffff, 1);
    line.beginPath();
    line.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const jitter = (Math.random() - 0.5) * 1.5;
        line.lineTo(
            x1 + dx * t + perpX * jitter,
            y1 + dy * t + perpY * jitter
        );
    }
    line.lineTo(x2, y2);
    line.strokePath();

    renderer.activeLines.push({
        graphics: line,
        life: 0.15,
        maxLife: 0.15,
    });
}
