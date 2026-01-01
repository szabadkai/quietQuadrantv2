import { PlayerStats } from "./PlayerStats.js";

export const AffixSystem = {
    apply(state, affix) {
        if (!affix) return;
        state.affix = affix;

        const mods = affix.modifiers ?? {};
        const eliteChanceBonus = mods.eliteChanceBonus ?? 0;
        state.modifiers = {
            enemyHealth: mods.enemyHealth ?? 1,
            enemySpeed: mods.enemySpeed ?? 1,
            enemyDamage: mods.enemyDamage ?? 1,
            playerDamage: mods.playerDamage ?? 1,
            playerSpeed: mods.playerSpeed ?? 1,
            xpGain: mods.xpGain ?? 1,
            upgradeChoices: mods.upgradeChoices ?? 3,
            enemyProjectileSpeed: mods.enemyProjectileSpeed ?? 1,
            eliteChance: mods.eliteChance ?? 1 + eliteChanceBonus,
            bossHealth: mods.bossHealth ?? 1,
            bossProjectileSpeed: mods.bossProjectileSpeed ?? 1,
            playerAccuracy: mods.playerAccuracy ?? 1,
            playerFireRate: mods.playerFireRate ?? 1,
            playerMaxHealth: mods.playerMaxHealth ?? 0,
            enemyCount: mods.enemyCount ?? 1,
            dashCooldownMult: mods.dashCooldownMult ?? 1,
            rareUpgradeBonus: mods.rareUpgradeBonus ?? 0,
            legendaryUpgradeBonus: mods.legendaryUpgradeBonus ?? 0
        };

        for (const player of state.players) {
            player.base.speed *= state.modifiers.playerSpeed;
            player.base.bulletDamage *= state.modifiers.playerDamage;
            player.base.fireCooldownTicks = Math.max(
                1,
                Math.round(player.base.fireCooldownTicks / state.modifiers.playerFireRate)
            );
            player.base.maxHealth = Math.max(
                1,
                player.base.maxHealth + state.modifiers.playerMaxHealth
            );
            player.dashCooldownMult = state.modifiers.dashCooldownMult;
            PlayerStats.recalculate(player);
        }
    }
};
