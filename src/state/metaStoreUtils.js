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
    "dash-sparks",
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
    modeWinCounts: {},
};

export const INITIAL_ACHIEVEMENT_POPUP = {
    show: false,
    synergyId: null,
    synergyName: "",
    synergyDescription: "",
};

export const INITIAL_STREAK_POPUP = {
    show: false,
    count: 0,
    isNewBest: false,
};

export function calculateRank(xp) {
    // Steeper curve to slow down late-level progression.
    const thresholds = [
        0, 150, 400, 800, 1300, 1900, 2600, 3400, 4300, 5300, 6400, 7600, 8900,
        10300, 11800, 13400, 15100, 16900, 18800, 20800,
    ];
    for (let i = thresholds.length - 1; i >= 0; i -= 1) {
        if (xp >= thresholds[i]) return i + 1;
    }
    return 1;
}

/**
 * Compute updated lifetime stats from a completed run.
 */
export function computeRunStats(stats, runStats) {
    const bossDefeated = !!runStats.bossDefeated;
    const duration = runStats.duration ?? 0;
    const kills = runStats.kills ?? 0;
    const waves = Math.max(0, runStats.wavesCleared ?? runStats.wave ?? 0);
    const upgradesPicked = runStats.upgradesPicked ?? 0;
    const affixId = runStats.affixId ?? null;
    const bossId = runStats.bossId ?? null;
    const bossName = runStats.bossName ?? null;
    const synergies = Array.isArray(runStats.synergies)
        ? runStats.synergies
        : [];

    const bossRecords = { ...(stats.bossRecords || {}) };
    if (bossId) {
        const prev = bossRecords[bossId] || {
            name: bossName ?? bossId,
            encounters: 0,
            kills: 0,
        };
        bossRecords[bossId] = {
            ...prev,
            name: bossName ?? prev.name,
            encounters: prev.encounters + 1,
            kills: prev.kills + (bossDefeated ? 1 : 0),
        };
    }

    const affixPlayCounts = { ...(stats.affixPlayCounts || {}) };
    const affixWinCounts = { ...(stats.affixWinCounts || {}) };
    if (affixId) {
        affixPlayCounts[affixId] = (affixPlayCounts[affixId] ?? 0) + 1;
        if (bossDefeated) {
            affixWinCounts[affixId] = (affixWinCounts[affixId] ?? 0) + 1;
        }
    }

    const synergyUnlockCounts = { ...(stats.synergyUnlockCounts || {}) };
    for (const id of synergies) {
        synergyUnlockCounts[id] = (synergyUnlockCounts[id] ?? 0) + 1;
    }

    const currentWinStreak = bossDefeated
        ? (stats.currentWinStreak ?? 0) + 1
        : 0;
    const bestWinStreak = bossDefeated
        ? Math.max(stats.bestWinStreak ?? 0, currentWinStreak)
        : stats.bestWinStreak ?? 0;
    const fastestVictory = bossDefeated
        ? Math.min(stats.fastestVictory ?? Infinity, duration)
        : stats.fastestVictory;

    return {
        ...stats,
        totalRuns: (stats.totalRuns ?? 0) + 1,
        totalPlaytime: (stats.totalPlaytime ?? 0) + duration,
        totalKills: (stats.totalKills ?? 0) + kills,
        totalVictories: (stats.totalVictories ?? 0) + (bossDefeated ? 1 : 0),
        bossKills: (stats.bossKills ?? 0) + (bossDefeated ? 1 : 0),
        bossesDefeated: (stats.bossesDefeated ?? 0) + (bossDefeated ? 1 : 0),
        wavesCleared: (stats.wavesCleared ?? 0) + waves,
        highestWave: Math.max(stats.highestWave ?? 0, waves),
        bestWave: Math.max(stats.bestWave ?? 0, waves),
        fastestVictory,
        fastestBossKill: bossDefeated
            ? Math.min(stats.fastestBossKill ?? Infinity, duration)
            : stats.fastestBossKill,
        highestDamage: Math.max(
            stats.highestDamage ?? 0,
            runStats.damageDealt ?? 0
        ),
        mostKillsRun: Math.max(stats.mostKillsRun ?? 0, kills),
        mostUpgradesRun: Math.max(stats.mostUpgradesRun ?? 0, upgradesPicked),
        currentWinStreak,
        bestWinStreak,
        bossRecords,
        affixPlayCounts,
        affixWinCounts,
        synergyUnlockCounts,
    };
}
