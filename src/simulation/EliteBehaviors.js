export function initEliteBehavior(enemy, rng) {
    if (!enemy.elite) return;

    switch (enemy.eliteBehavior) {
    case "burst":
    case "burst-death":
        enemy.burstCooldown = rng.nextInt(60, 120);
        enemy.burstDuration = 0;
        enemy.burstSpeedMultiplier = 1.7;
        break;
    case "rapid-fire":
        enemy.fireCooldownTicks = Math.max(
            30,
            Math.floor(enemy.fireCooldownTicks * 0.65)
        );
        break;
    case "fast-teleport":
        enemy.teleportCooldownRange = [90, 150];
        break;
    case "death-explosion":
        enemy.deathExplosion = true;
        break;
    default:
        break;
    }
}

export function updateEliteBehavior(enemy) {
    if (!enemy.elite) return;
    if (enemy.eliteBehavior === "burst" || enemy.eliteBehavior === "burst-death") {
        if (enemy.burstDuration > 0) {
            enemy.burstDuration -= 1;
            if (enemy.burstDuration === 0) {
                enemy.burstCooldown = 120;
            }
        } else if (enemy.burstCooldown > 0) {
            enemy.burstCooldown -= 1;
        } else {
            enemy.burstDuration = 20;
        }
    }
}

export function getEliteSpeedMultiplier(enemy) {
    if (!enemy.elite) return 1;
    if (
        (enemy.eliteBehavior === "burst" ||
      enemy.eliteBehavior === "burst-death") &&
    enemy.burstDuration > 0
    ) {
        return enemy.burstSpeedMultiplier ?? 1.7;
    }
    return 1;
}
