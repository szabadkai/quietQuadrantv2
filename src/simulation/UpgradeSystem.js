import { UPGRADE_BY_ID } from "../config/upgrades.js";
import { PlayerStats } from "./PlayerStats.js";
import { SynergyChecker } from "./SynergyChecker.js";

export const UpgradeSystem = {
  applyUpgrade(state, playerId, upgradeId) {
    const player = state.players.find((p) => p.id === playerId);
    const upgrade = UPGRADE_BY_ID[upgradeId];
    if (!player || !upgrade) return false;

    const currentStacks = player.upgrades.filter((id) => id === upgradeId).length;
    if (currentStacks >= upgrade.maxStacks) return false;

    const previousSynergies = [...player.synergies];
    player.upgrades.push(upgradeId);
    PlayerStats.recalculate(player);

    const newSynergies = SynergyChecker.getNewSynergies(
      previousSynergies,
      player.synergies
    );
    if (newSynergies.length) {
      for (const synergy of newSynergies) {
        state.events.push({
          type: "synergy-unlocked",
          playerId: player.id,
          synergyId: synergy.id
        });
      }
    }

    return true;
  }
};
