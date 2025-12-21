/** Crit hit flash and ring effect. */
export function spawnCritHit(renderer, x, y) {
    const available = renderer.getAvailable();
    const count = Math.min(12, available);

    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 120 + Math.random() * 80;
        renderer.spawnParticle({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: 0xffff00,
            size: 3 + Math.random() * 2,
            life: 0.3 + Math.random() * 0.15,
            fade: true,
        });
    }
    renderer.spawnRing(x, y, 0xffff00, 60, 0.25);
}
