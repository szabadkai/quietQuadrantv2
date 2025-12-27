import { rollUpgrades } from "./UpgradeRoller.js";

/**
 * LevelSystem now only handles rolling upgrade options when players have pending upgrades.
 * XP collection and leveling has been removed - upgrades are granted after wave completion.
 */
export const LevelSystem = {
    update(state, rng) {
        // Skip during boss death animation
        if (state.bossDeathTimer > 0) {
            return;
        }

        // Roll upgrade options for players with pending upgrades
        if (!state.pendingUpgrade) {
            const nextPlayer = state.players.find(
                (player) => player.pendingUpgrades > 0 && player.alive
            );
            if (nextPlayer) {
                const choiceCount = state.modifiers?.upgradeChoices ?? 3;
                const options = rollUpgrades(
                    nextPlayer,
                    rng,
                    choiceCount,
                    state.modifiers,
                    state.unlockedUpgrades
                );
                if (options.length) {
                    nextPlayer.pendingUpgrades -= 1;
                    state.pendingUpgrade = {
                        playerId: nextPlayer.id,
                        options
                    };
                }
            }
        }
    },
};
