import { SYNERGIES, SYNERGY_BY_ID } from "../config/synergies.js";

export const SynergyChecker = {
    getActive(upgrades) {
        return SYNERGIES.filter((synergy) =>
            synergy.requires.every((id) => upgrades.includes(id))
        );
    },

    getNewSynergies(previousIds, currentIds) {
        const previous = new Set(previousIds);
        return currentIds
            .filter((id) => !previous.has(id))
            .map((id) => SYNERGY_BY_ID[id])
            .filter(Boolean);
    }
};
