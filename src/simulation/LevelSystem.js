import { rollUpgrades } from "./UpgradeRoller.js";

const LEVEL_THRESHOLDS = [
    0,
    0,
    50,
    125,
    225,
    350,
    500,
    675,
    875,
    1100,
    1350
];

export const LevelSystem = {
    update(state, rng) {
        if (state.xpQueue.length) {
            for (const entry of state.xpQueue) {
                const player = state.players.find((p) => p.id === entry.playerId);
                if (!player || !player.alive) continue;
                const gain = entry.amount * (state.modifiers?.xpGain ?? 1);
                player.xp += gain;
            }

            for (const player of state.players) {
                if (!player.alive) continue;
                this.applyLevelUps(state, player);
            }

            state.xpQueue = [];
        }

        if (state.bossDeathTimer > 0) {
            return;
        }

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

    applyLevelUps(state, player) {
        let nextThreshold = getThresholdForLevel(player.level + 1);
        let gained = 0;
        while (player.xp >= nextThreshold) {
            player.level += 1;
            gained += 1;
            state.events.push({
                type: "level-up",
                playerId: player.id,
                level: player.level
            });
            nextThreshold = getThresholdForLevel(player.level + 1);
        }

        player.xpToNext = Math.max(0, nextThreshold - player.xp);
        if (gained > 0) {
            player.pendingUpgrades += gained;
        }
    }
};

function getThresholdForLevel(level) {
    if (level < LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[level];
    }

    const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extra = level - (LEVEL_THRESHOLDS.length - 1);
    return last + extra * 250;
}
