export const INITIAL_UNLOCKED_UPGRADES = [
    "power-shot",
    "rapid-fire",
    "swift-projectiles",
    "engine-tune",
    "plating",
    "sidecar",
    "pierce",
    "shield-pickup",
    "kinetic-siphon",
    "dash-sparks"
];

export const INITIAL_LIFETIME_STATS = {
    totalRuns: 0,
    totalPlaytime: 0,
    totalKills: 0,
    totalVictories: 0,
    wavesCleared: 0,
    bossesDefeated: 0,
    highestWave: 0,
    bestWave: 0,
    fastestVictory: null,
    fastestBossKill: null,
    mostKillsRun: 0,
    mostUpgradesRun: 0,
    highestDamage: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    currentDailyStreak: 0,
    bestDailyStreak: 0,
    lastPlayedDate: "",
    upgradePickCounts: {},
    synergyUnlockCounts: {},
    bossRecords: {},
    bossKillCounts: {},
    affixPlayCounts: {},
    affixWinCounts: {},
    modePlayCounts: {},
    modeWinCounts: {}
};

export const INITIAL_ACHIEVEMENT_POPUP = {
    show: false,
    synergyId: null,
    synergyName: "",
    synergyDescription: ""
};

export const INITIAL_STREAK_POPUP = {
    show: false,
    count: 0,
    isNewBest: false
};

export function calculateRank(xp) {
    // Steeper curve to slow down late-level progression.
    const thresholds = [
        0, 150, 400, 800, 1300, 1900, 2600, 3400, 4300, 5300,
        6400, 7600, 8900, 10300, 11800, 13400, 15100, 16900, 18800, 20800
    ];
    for (let i = thresholds.length - 1; i >= 0; i -= 1) {
        if (xp >= thresholds[i]) return i + 1;
    }
    return 1;
}
