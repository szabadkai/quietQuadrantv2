import { ACHIEVEMENTS } from "../config/achievements.js";
import { useMetaStore } from "../state/useMetaStore.js";

export function checkAchievements(runStats) {
    const unlocked = [];
    const { achievements, actions } = useMetaStore.getState();

    for (const achievement of Object.values(ACHIEVEMENTS)) {
        if (achievements[achievement.id]?.unlocked) continue;
        if (achievement.check(runStats)) {
            if (actions.unlockAchievement(achievement.id)) {
                unlocked.push(achievement);
            }
        }
    }

    return unlocked;
}
