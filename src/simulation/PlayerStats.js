import { UPGRADE_BY_ID } from "../config/upgrades.js";
import { SYNERGIES } from "../config/synergies.js";
import { clamp } from "../utils/math.js";

export const PlayerStats = {
    recalculate(player) {
        const stacks = getUpgradeStacks(player.upgrades);
        const synergies = getSynergies(player.upgrades);

        const base = player.base;
        let maxHealth = base.maxHealth;
        let moveSpeedPct = 0;
        let fireRatePct = 0;
        let projectileSpeedPct = 0;
        let damagePct = 0;
        let pierce = base.bulletPierce;
        let projectileCount = 1;
        let spreadDeg = 0;
        let spreadTightenPct = 0;
        let bulletRadius = base.bulletRadius;
        let homingStrength = 0;
        let explosiveRadius = 0;
        let splitShot = null;
        let explosiveDamagePct = null;
        let chargedShotDamagePct = 0;
        let accuracyPct = base.accuracyPct ?? 1;
        let maxHealthCap = null;
        let xpPickupRadiusPct = 0;
        let critChance = 0;
        let critDamage = 1.5; // Base crit multiplier

        for (const [upgradeId, count] of Object.entries(stacks)) {
            const upgrade = UPGRADE_BY_ID[upgradeId];
            if (!upgrade) continue;
            const effects = upgrade.effects ?? {};

            if (effects.damagePct) damagePct += effects.damagePct * count;
            if (effects.fireRatePct) fireRatePct += effects.fireRatePct * count;
            if (effects.projectileSpeedPct)
                projectileSpeedPct += effects.projectileSpeedPct * count;
            if (effects.moveSpeedPct)
                moveSpeedPct += effects.moveSpeedPct * count;
            if (effects.maxHealth) maxHealth += effects.maxHealth * count;
            if (effects.pierce) pierce += effects.pierce * count;
            if (effects.extraProjectiles)
                projectileCount += effects.extraProjectiles * count;
            if (effects.spreadDeg) spreadDeg += effects.spreadDeg * count;
            if (effects.spreadTightenPct)
                spreadTightenPct += effects.spreadTightenPct * count;
            if (effects.projectileSizePct)
                bulletRadius +=
                    base.bulletRadius * effects.projectileSizePct * count;
            if (effects.homingStrength)
                homingStrength += effects.homingStrength * count;
            if (effects.accuracyPct) accuracyPct += effects.accuracyPct * count;
            if (effects.chargedShotDamagePct)
                chargedShotDamagePct += effects.chargedShotDamagePct * count;
            if (effects.maxHealthCap) maxHealthCap = effects.maxHealthCap;
            if (effects.xpPickupRadiusPct)
                xpPickupRadiusPct += effects.xpPickupRadiusPct * count;
            if (effects.critChance) critChance += effects.critChance * count;
            if (effects.critDamage) critDamage += effects.critDamage * count;

            if (effects.special === "explosive-impact") {
                const baseRadius = effects.radius ?? 40;
                const radiusStep = effects.radiusStep ?? 10;
                explosiveRadius = Math.max(
                    explosiveRadius,
                    baseRadius + radiusStep * (count - 1)
                );
                const aoeDamage = effects.aoeDamage ?? 0.5;
                explosiveDamagePct =
                    explosiveDamagePct === null
                        ? aoeDamage
                        : Math.max(explosiveDamagePct, aoeDamage);
            }

            if (effects.special === "split-shot") {
                splitShot = {
                    count: effects.shardCount ?? 2,
                    angleRad: 0.4,
                    damagePct: effects.shardDamage ?? 0.5,
                };
            }
        }

        for (const synergy of synergies) {
            const effects = synergy.effects ?? {};
            if (effects.damagePct) damagePct += effects.damagePct;
            if (effects.fireRatePct) fireRatePct += effects.fireRatePct;
            if (effects.projectileSpeedPct)
                projectileSpeedPct += effects.projectileSpeedPct;
            if (effects.moveSpeedPct) moveSpeedPct += effects.moveSpeedPct;
            if (effects.pierce) pierce += effects.pierce;
            if (effects.spreadDeg) spreadDeg += effects.spreadDeg;
            if (effects.homingStrength)
                homingStrength += effects.homingStrength;
            if (effects.accuracyPct) accuracyPct += effects.accuracyPct;
        }

        if (spreadTightenPct > 0) {
            spreadDeg *= Math.max(0, 1 - spreadTightenPct);
        }

        if (maxHealthCap !== null) {
            maxHealth = Math.min(maxHealth, maxHealthCap);
        }

        const newMaxHealth = Math.max(1, Math.floor(maxHealth));
        const healthDelta = newMaxHealth - player.maxHealth;

        player.maxHealth = newMaxHealth;
        player.health = clamp(
            player.health + Math.max(0, healthDelta),
            0,
            newMaxHealth
        );
        player.speed = Math.max(60, base.speed * (1 + moveSpeedPct));
        player.bulletDamage = Math.max(1, base.bulletDamage * (1 + damagePct));

        const fireRateMultiplier = Math.max(0.2, 1 + fireRatePct);
        player.fireCooldownTicks = Math.max(
            1,
            Math.round(base.fireCooldownTicks / fireRateMultiplier)
        );

        player.bulletSpeed = Math.max(
            100,
            base.bulletSpeed * (1 + projectileSpeedPct)
        );
        player.bulletPierce = Math.max(0, Math.floor(pierce));
        player.projectileCount = Math.max(1, Math.floor(projectileCount));
        player.spreadDeg = Math.max(0, spreadDeg);
        player.bulletRadius = Math.max(2, bulletRadius);
        player.homingStrength = Math.max(0, homingStrength);
        player.explosiveRadius = Math.max(0, explosiveRadius);
        player.explosiveDamagePct = explosiveDamagePct;
        player.splitShot = splitShot;
        player.chargedShotDamagePct = Math.max(0, chargedShotDamagePct);
        player.accuracyPct = clamp(accuracyPct, 0.2, 1.2);
        player.xpPickupRadiusPct = Math.max(0, xpPickupRadiusPct);
        player.critChance = clamp(critChance, 0, 1);
        player.critDamage = Math.max(1.5, critDamage);
        player.synergies = synergies.map((synergy) => synergy.id);

        return player;
    },
};

function getUpgradeStacks(upgrades) {
    return upgrades.reduce((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
    }, {});
}

function getSynergies(upgrades) {
    return SYNERGIES.filter((synergy) =>
        synergy.requires.every((id) => upgrades.includes(id))
    );
}
