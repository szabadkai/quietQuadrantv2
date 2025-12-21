export const AFFIXES = [
    {
        id: "nimble-foes",
        name: "Nimble Foes",
        description: "+12% enemy speed -10% enemy health",
        modifiers: { enemyHealth: 0.9, enemySpeed: 1.12 },
    },
    {
        id: "ironclad",
        name: "Ironclad",
        description: "+18% enemy health -8% enemy speed",
        modifiers: { enemyHealth: 1.18, enemySpeed: 0.92 },
    },
    {
        id: "volatile-rare",
        name: "Volatile Finds",
        description: "+15% rare upgrade odds",
        modifiers: { rareUpgradeBonus: 0.15 },
    },
    {
        id: "glass-boost",
        name: "Glass Boost",
        description: "-12% enemy health +10% enemy speed +10% rare odds",
        modifiers: {
            enemyHealth: 0.88,
            enemySpeed: 1.1,
            rareUpgradeBonus: 0.1,
        },
    },
    {
        id: "overclocked",
        name: "Overclocked",
        description: "+20% player damage +15% enemy damage",
        modifiers: { playerDamage: 1.2, enemyDamage: 1.15 },
    },
    {
        id: "adrenaline-rush",
        name: "Adrenaline Rush",
        description: "+15% player speed -20% dash cooldown",
        modifiers: { playerSpeed: 1.15, dashCooldownMult: 0.8 },
    },
    {
        id: "sluggish",
        name: "Sluggish",
        description: "-10% player speed +25% player damage",
        modifiers: { playerSpeed: 0.9, playerDamage: 1.25 },
    },
    {
        id: "fast-learner",
        name: "Fast Learner",
        description: "+30% XP gain -10% player damage",
        modifiers: { xpGain: 1.3, playerDamage: 0.9 },
    },
    {
        id: "golden-age",
        name: "Golden Age",
        description: "+5% legendary odds +10% rare odds",
        modifiers: { rareUpgradeBonus: 0.1, legendaryUpgradeBonus: 0.05 },
    },
    {
        id: "tough-choices",
        name: "Tough Choices",
        description: "Only 2 upgrade choices +20% XP",
        modifiers: { xpGain: 1.2, upgradeChoices: 2 },
    },
    {
        id: "abundance",
        name: "Abundance",
        description: "4 upgrade choices -15% XP",
        modifiers: { xpGain: 0.85, upgradeChoices: 4 },
    },
    {
        id: "bullet-storm",
        name: "Bullet Storm",
        description: "+25% enemy projectile speed",
        modifiers: { enemyProjectileSpeed: 1.25 },
    },
    {
        id: "swarm-tactics",
        name: "Swarm Tactics",
        description: "+20% more enemies -15% enemy health",
        modifiers: { enemyHealth: 0.85, enemyCount: 1.2 },
    },
    {
        id: "elite-forces",
        name: "Elite Forces",
        description: "+25% elite spawn chance",
        modifiers: { eliteChanceBonus: 0.25 },
    },
    {
        id: "glass-cannons",
        name: "Glass Cannons",
        description: "Enemies +30% damage -25% health",
        modifiers: { enemyDamage: 1.3, enemyHealth: 0.75 },
    },
    {
        id: "enraged-boss",
        name: "Enraged Boss",
        description: "Boss +20% health +15% projectile speed",
        modifiers: { bossHealth: 1.2, bossProjectileSpeed: 1.15 },
    },
    {
        id: "weakened-boss",
        name: "Weakened Boss",
        description: "Boss -15% health +10% enemy health in waves",
        modifiers: { bossHealth: 0.85, enemyHealth: 1.1 },
    },
    {
        id: "chaos-mode",
        name: "Chaos Mode",
        description: "+15% everything: enemy speed damage and player damage",
        modifiers: { enemySpeed: 1.15, enemyDamage: 1.15, playerDamage: 1.15 },
    },
    {
        id: "marathon",
        name: "Marathon",
        description: "-20% XP +15% player speed -10% dash cooldown",
        modifiers: { xpGain: 0.8, playerSpeed: 1.15, dashCooldownMult: 0.9 },
    },
];

export function getWeeklyAffix(seedDate = new Date()) {
    const date = new Date(seedDate.toISOString().split("T")[0]);
    const weekSeed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24 * 7));
    const index = weekSeed % AFFIXES.length;
    return AFFIXES[index];
}

export function getWeeklySeed(seedDate = new Date()) {
    const date = new Date(seedDate.toISOString().split("T")[0]);
    const weekSeed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24 * 7));
    return weekSeed * 1000000 + 123456;
}
