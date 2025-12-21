import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_UNLOCKED_UPGRADES = [
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

export const useMetaStore = create(
  persist(
    (set, get) => ({
      pilotXP: 0,
      pilotRank: 1,
      stats: {
        totalRuns: 0,
        totalPlaytime: 0,
        totalKills: 0,
        bossKills: 0,
        bestWave: 0,
        fastestBossKill: null,
        highestDamage: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
        currentDailyStreak: 0,
        bestDailyStreak: 0,
        lastPlayedDate: "",
        upgradePickCounts: {},
        synergyUnlockCounts: {},
        bossKillCounts: {},
        affixPlayCounts: {},
        affixWinCounts: {},
        modePlayCounts: {},
        modeWinCounts: {}
      },
      cardCollection: {
        unlockedUpgrades: [...INITIAL_UNLOCKED_UPGRADES],
        upgradeBoosts: {},
        totalCardsCollected: 0
      },
      achievements: {},
      selectedShipColor: "default",
      selectedTitle: null,
      unlockedCosmetics: ["default"],
      pendingCardReward: {
        active: false,
        options: []
      },
      lastRun: null,

      actions: {
        addXP: (amount) => {
          const { pilotXP, pilotRank } = get();
          const newXP = pilotXP + amount;
          const newRank = calculateRank(newXP);
          set({ pilotXP: newXP, pilotRank: newRank });
          return newRank > pilotRank
            ? { rankUp: true, newRank }
            : { rankUp: false };
        },

        recordRun: (runStats) => {
          const { stats } = get();
          const bossDefeated = !!runStats.bossDefeated;
          const duration = runStats.duration ?? 0;

          set({
            stats: {
              ...stats,
              totalRuns: stats.totalRuns + 1,
              totalPlaytime: stats.totalPlaytime + duration,
              totalKills: stats.totalKills + (runStats.kills ?? 0),
              bossKills: stats.bossKills + (bossDefeated ? 1 : 0),
              bestWave: Math.max(stats.bestWave, runStats.wave ?? 0),
              fastestBossKill: bossDefeated
                ? Math.min(stats.fastestBossKill ?? Infinity, duration)
                : stats.fastestBossKill,
              highestDamage: Math.max(stats.highestDamage, runStats.damageDealt ?? 0),
              currentWinStreak: bossDefeated ? stats.currentWinStreak + 1 : 0,
              bestWinStreak: bossDefeated
                ? Math.max(stats.bestWinStreak, stats.currentWinStreak + 1)
                : stats.bestWinStreak
            },
            lastRun: runStats
          });
        },

        unlockAchievement: (id) => {
          const { achievements } = get();
          if (achievements[id]?.unlocked) return false;
          set({
            achievements: {
              ...achievements,
              [id]: { unlocked: true, unlockedAt: Date.now() }
            }
          });
          return true;
        },

        updateDailyStreak: () => {
          const { stats } = get();
          const today = new Date().toISOString().split("T")[0];
          if (stats.lastPlayedDate === today) {
            return { streakIncreased: false };
          }

          const lastDate = stats.lastPlayedDate
            ? new Date(stats.lastPlayedDate)
            : null;
          const todayDate = new Date(today);
          const diffDays = lastDate
            ? Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))
            : 0;

          const newStreak = diffDays === 1 ? stats.currentDailyStreak + 1 : 1;
          set({
            stats: {
              ...stats,
              currentDailyStreak: newStreak,
              bestDailyStreak: Math.max(newStreak, stats.bestDailyStreak),
              lastPlayedDate: today
            }
          });
          return { streakIncreased: diffDays === 1, newStreak };
        }
      }
    }),
    {
      name: "quiet-quadrant-meta",
      version: 2,
      partialize: (state) => {
        const { actions, ...rest } = state;
        return rest;
      },
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        actions: currentState.actions
      })
    }
  )
);

function calculateRank(xp) {
  const thresholds = [
    0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800,
    9100, 10500, 12000, 13600, 15300, 17100, 19000
  ];
  for (let i = thresholds.length - 1; i >= 0; i -= 1) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}
