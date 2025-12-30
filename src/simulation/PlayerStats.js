/* eslint-disable max-lines */
import { UPGRADE_BY_ID } from "../config/upgrades.js";
import { SYNERGIES } from "../config/synergies.js";
import {
    TICK_RATE,
    SINGULARITY_PULL_STRENGTH,
    SINGULARITY_PULL_RADIUS,
} from "../utils/constants.js";
import { clamp } from "../utils/math.js";

// Each boost level adds 4% effectiveness to the upgrade
const BOOST_BONUS_PER_LEVEL = 0.04;

export const PlayerStats = {
    recalculate(player, cardBoosts = {}) {
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
        let homingRange = 0;
        let explosiveRadius = 0;
        let splitShot = null;
        let explosiveDamagePct = null;
        let chargedShotDamagePct = 0;
        let chargePierce = 0;
        let accuracyPct = base.accuracyPct ?? 1;
        let maxHealthCap = null;
        let xpPickupRadiusPct = 0;
        let critChance = base.critChance ?? 0.05;
        let critDamage = base.critDamage ?? 2.0;
        let damageReductionPct = base.damageReduction ?? 0;
        let collisionDamageReductionPct = 0;
        let ricochet = 0;
        let dashSparksCount = 0;
        let shrapnelCount = 0;
        let shrapnelDamagePct = 0;
        let xpShieldDurationSec = 0;
        let xpShieldCooldownSec = 0;
        let lifestealAmount = 0;
        let lifestealCooldownSec = 0;
        let momentumMaxBonus = 0;
        let momentumBuildRate = 0;
        let chainArcDamagePct = 0;
        let chainArcRange = 0;
        let bloodFuelHealOnKill = 0;
        let bloodFuelFireCost = 0;
        let chainReactionDamagePct = 0;
        let chainReactionRadius = 0;
        let canPhaseShots = false;
        let berserkMaxBonus = 0;
        let neutronCore = false;
        let neutronBlockRadius = 0;
        let singularityPullStrength = 0;
        let singularityRadius = 0;
        let energyShield = false;
        let energyShieldCooldownSec = 0;

        for (const [upgradeId, count] of Object.entries(stacks)) {
            const upgrade = UPGRADE_BY_ID[upgradeId];
            if (!upgrade) continue;
            const effects = upgrade.effects ?? {};

            // Apply card boost multiplier (each boost level adds 4% effectiveness)
            const boostLevel = cardBoosts[upgradeId] ?? 0;
            const boostMultiplier = 1 + boostLevel * BOOST_BONUS_PER_LEVEL;

            if (effects.damagePct)
                damagePct += effects.damagePct * count * boostMultiplier;
            if (effects.fireRatePct)
                fireRatePct += effects.fireRatePct * count * boostMultiplier;
            if (effects.projectileSpeedPct)
                projectileSpeedPct +=
                    effects.projectileSpeedPct * count * boostMultiplier;
            if (effects.moveSpeedPct)
                moveSpeedPct += effects.moveSpeedPct * count * boostMultiplier;
            if (effects.maxHealth)
                maxHealth += effects.maxHealth * count * boostMultiplier;
            if (effects.pierce) pierce += effects.pierce * count;
            if (effects.extraProjectiles)
                projectileCount += effects.extraProjectiles * count;
            if (effects.spreadDeg) spreadDeg += effects.spreadDeg * count;
            if (effects.spreadTightenPct)
                spreadTightenPct +=
                    effects.spreadTightenPct * count * boostMultiplier;
            if (effects.projectileSizePct)
                bulletRadius +=
                    base.bulletRadius *
                    effects.projectileSizePct *
                    count *
                    boostMultiplier;
            if (effects.homingStrength)
                homingStrength +=
                    effects.homingStrength * count * boostMultiplier;
            if (effects.homingRange)
                homingRange = Math.max(
                    homingRange,
                    effects.homingRange * count * boostMultiplier
                );
            if (effects.accuracyPct)
                accuracyPct += effects.accuracyPct * count * boostMultiplier;
            if (effects.chargedShotDamagePct)
                chargedShotDamagePct +=
                    effects.chargedShotDamagePct * count * boostMultiplier;
            if (effects.chargePierce)
                chargePierce += effects.chargePierce * count;
            if (effects.maxHealthCap) maxHealthCap = effects.maxHealthCap;
            if (effects.xpPickupRadiusPct)
                xpPickupRadiusPct +=
                    effects.xpPickupRadiusPct * count * boostMultiplier;
            if (effects.critChance)
                critChance += effects.critChance * count * boostMultiplier;
            if (effects.critDamage)
                critDamage += effects.critDamage * count * boostMultiplier;
            if (effects.damageReductionPct)
                damageReductionPct +=
                    effects.damageReductionPct * count * boostMultiplier;
            if (effects.collisionDamageReductionPct)
                collisionDamageReductionPct +=
                    effects.collisionDamageReductionPct *
                    count *
                    boostMultiplier;
            if (effects.ricochet) ricochet += effects.ricochet * count;

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

            if (effects.special === "dash-sparks") {
                dashSparksCount += (effects.shrapnelCount ?? 6) * count;
            }

            if (effects.special === "shrapnel") {
                shrapnelCount += (effects.fragmentCount ?? 5) * count;
                const baseDamagePct = effects.fragmentDamage ?? 0.3;
                shrapnelDamagePct = Math.max(
                    shrapnelDamagePct,
                    baseDamagePct + baseDamagePct * 0.25 * (count - 1)
                );
            }

            if (effects.special === "xp-shield") {
                xpShieldDurationSec = Math.max(
                    xpShieldDurationSec,
                    (effects.duration ?? 2) * count
                );
                xpShieldCooldownSec = Math.max(
                    xpShieldCooldownSec,
                    effects.cooldown ?? 5
                );
            }

            if (effects.special === "lifesteal") {
                lifestealAmount += (effects.healAmount ?? 1) * count;
                lifestealCooldownSec = Math.max(
                    lifestealCooldownSec,
                    effects.cooldown ?? 3
                );
            }

            if (effects.special === "momentum") {
                momentumMaxBonus += (effects.maxBonus ?? 0.25) * count;
                momentumBuildRate += (effects.buildRate ?? 0.05) * count;
            }

            if (effects.special === "chain-arc") {
                chainArcDamagePct = Math.max(
                    chainArcDamagePct,
                    (effects.arcDamage ?? 0.4) * count
                );
                chainArcRange = Math.max(
                    chainArcRange,
                    (effects.arcRange ?? 100) + (count - 1) * 20
                );
            }

            if (effects.special === "blood-fuel") {
                bloodFuelHealOnKill = Math.max(
                    bloodFuelHealOnKill,
                    effects.healOnKill ?? 1
                );
                bloodFuelFireCost = Math.max(
                    bloodFuelFireCost,
                    effects.fireCost ?? 0.02
                );
            }

            if (effects.special === "chain-reaction") {
                chainReactionDamagePct = Math.max(
                    chainReactionDamagePct,
                    effects.explosionDamage ?? 0.5
                );
                chainReactionRadius = Math.max(
                    chainReactionRadius,
                    (effects.explosionRadius ?? 50) + (count - 1) * 10
                );
            }

            if (effects.special === "quantum-tunneling") {
                canPhaseShots = true;
            }

            if (effects.special === "berserk") {
                berserkMaxBonus = Math.max(
                    berserkMaxBonus,
                    (effects.maxBonus ?? 1.0) * count
                );
            }

            if (effects.special === "neutron-core") {
                neutronCore = true;
            }

            if (effects.special === "singularity") {
                singularityPullStrength = Math.max(
                    singularityPullStrength,
                    effects.pullStrength ?? SINGULARITY_PULL_STRENGTH
                );
                singularityRadius = Math.max(
                    singularityRadius,
                    effects.pullRadius ?? SINGULARITY_PULL_RADIUS
                );
            }

            if (effects.special === "energy-shield") {
                energyShield = true;
                energyShieldCooldownSec = effects.shieldCooldown ?? 5.0;
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
        player.homingRange = Math.max(0, homingRange);
        player.explosiveRadius = Math.max(0, explosiveRadius);
        player.explosiveDamagePct = explosiveDamagePct;
        player.splitShot = splitShot;
        player.chargedShotDamagePct = Math.max(0, chargedShotDamagePct);
        player.chargePierce = Math.max(0, Math.floor(chargePierce));
        player.accuracyPct = clamp(accuracyPct, 0.2, 1.2);
        player.xpPickupRadiusPct = Math.max(0, xpPickupRadiusPct);
        player.critChance = clamp(critChance, 0, 1);
        player.critDamage = Math.max(2.0, critDamage);
        player.synergies = synergies.map((synergy) => synergy.id);
        player.damageReduction = clamp(damageReductionPct, 0, 0.8);
        player.collisionDamageReduction = clamp(
            collisionDamageReductionPct,
            0,
            0.9
        );
        player.ricochet = Math.max(0, Math.floor(ricochet));
        player.dashSparksCount = Math.max(0, Math.floor(dashSparksCount));
        player.shrapnelCount = Math.max(0, Math.floor(shrapnelCount));
        player.shrapnelDamagePct = Math.max(0, shrapnelDamagePct);
        player.xpShieldDurationTicks = Math.round(
            xpShieldDurationSec * TICK_RATE
        );
        player.xpShieldCooldownTicks = Math.round(
            xpShieldCooldownSec * TICK_RATE
        );
        player.lifestealAmount = Math.max(0, lifestealAmount);
        player.lifestealCooldownTicks = Math.round(
            lifestealCooldownSec * TICK_RATE
        );
        player.momentumMaxBonus = Math.max(0, momentumMaxBonus);
        player.momentumBuildRate = Math.max(0, momentumBuildRate);
        player.chainArcDamagePct = Math.max(0, chainArcDamagePct);
        player.chainArcRange = Math.max(0, chainArcRange);
        player.bloodFuelHealOnKill = Math.max(0, bloodFuelHealOnKill);
        player.bloodFuelFireCost = Math.max(0, bloodFuelFireCost);
        player.chainReactionDamagePct = Math.max(0, chainReactionDamagePct);
        player.chainReactionRadius = Math.max(0, chainReactionRadius);
        player.canPhaseShots = canPhaseShots;
        player.berserkMaxBonus = Math.max(0, berserkMaxBonus);
        player.neutronCore = neutronCore;
        player.neutronBlockRadius = neutronCore
            ? Math.max(neutronBlockRadius, player.radius * 2.4)
            : 0;
        player.singularityPullStrength = Math.max(0, singularityPullStrength);
        player.singularityRadius = Math.max(0, singularityRadius);
        player.energyShield = energyShield;
        player.energyShieldCooldownTicks = Math.round(
            energyShieldCooldownSec * TICK_RATE
        );

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
