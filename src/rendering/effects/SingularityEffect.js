/** Singularity pull-in effect. */
export function spawnSingularity(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(8, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const dist = 30 + Math.random() * 20;
        renderer.spawnParticle({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 60,
            vy: -Math.sin(angle) * 60,
            color: 0xaa00ff,
            size: 2,
            life: 0.25,
            fade: true,
            shrink: true,
        });
    }
    renderer.spawnRing(x, y, 0xaa00ff, 25, 0.2, true);
}
