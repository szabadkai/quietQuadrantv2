import { UPGRADES } from "../config/upgrades.js";

const RARITY_WEIGHTS = [
  { rarity: "common", weight: 0.65 },
  { rarity: "rare", weight: 0.3 },
  { rarity: "legendary", weight: 0.05 }
];

export function rollUpgrades(
  player,
  rng,
  count = 3,
  modifiers = {},
  unlockedUpgrades = null
) {
  const stacks = getUpgradeStacks(player.upgrades);
  const unlockedSet = Array.isArray(unlockedUpgrades)
    ? new Set(unlockedUpgrades)
    : unlockedUpgrades instanceof Set
      ? unlockedUpgrades
      : null;
  const options = [];

  for (let i = 0; i < count; i += 1) {
    const rarity = rollRarity(rng, modifiers);
    const pool = UPGRADES.filter(
      (upgrade) =>
        upgrade.rarity === rarity &&
        (stacks[upgrade.id] ?? 0) < upgrade.maxStacks &&
        !options.includes(upgrade.id) &&
        (!unlockedSet || unlockedSet.has(upgrade.id))
    );

    if (pool.length === 0) {
      const fallback = UPGRADES.filter(
        (upgrade) =>
          (stacks[upgrade.id] ?? 0) < upgrade.maxStacks &&
          !options.includes(upgrade.id) &&
          (!unlockedSet || unlockedSet.has(upgrade.id))
      );
      if (!fallback.length) break;
      options.push(rng.pick(fallback).id);
    } else {
      options.push(pickWeighted(rng, pool).id);
    }
  }

  return options;
}

function rollRarity(rng, modifiers) {
  const roll = rng.next();
  const rareBonus = modifiers?.rareUpgradeBonus ?? 0;
  const legendaryBonus = modifiers?.legendaryUpgradeBonus ?? 0;

  let common = RARITY_WEIGHTS[0].weight;
  let rare = RARITY_WEIGHTS[1].weight + rareBonus;
  let legendary = RARITY_WEIGHTS[2].weight + legendaryBonus;
  const total = common + rare + legendary;
  common /= total;
  rare /= total;
  legendary /= total;

  if (roll <= common) return "common";
  if (roll <= common + rare) return "rare";
  return "legendary";
}

function getUpgradeStacks(upgrades) {
  return upgrades.reduce((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
}

function pickWeighted(rng, pool) {
  const total = pool.reduce((sum, upgrade) => sum + (upgrade.dropWeight ?? 1), 0);
  let roll = rng.next() * total;
  for (const upgrade of pool) {
    roll -= upgrade.dropWeight ?? 1;
    if (roll <= 0) return upgrade;
  }
  return pool[pool.length - 1];
}
