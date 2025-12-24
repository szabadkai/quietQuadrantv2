import upgrades from "./upgrades.json";

export const UPGRADES = upgrades;

export const UPGRADE_BY_ID = Object.fromEntries(
    UPGRADES.map((upgrade) => [upgrade.id, upgrade])
);
