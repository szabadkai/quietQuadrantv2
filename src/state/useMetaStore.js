import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
    INITIAL_UNLOCKED_UPGRADES,
    INITIAL_LIFETIME_STATS,
    INITIAL_ACHIEVEMENT_POPUP,
    INITIAL_STREAK_POPUP,
    calculateRank
} from "./metaStoreUtils.js";


export const useMetaStore = create(
    devtools(
        persist(
            (set, get) => ({
                pilotXP: 0,
                pilotRank: 1,
                lifetimeStats: { ...INITIAL_LIFETIME_STATS },
                stats: { ...INITIAL_LIFETIME_STATS },
                cardCollection: {
                    unlockedUpgrades: [...INITIAL_UNLOCKED_UPGRADES],
                    upgradeBoosts: {},
                    totalCardsCollected: 0
                },
                achievements: {},
                achievementPopup: { ...INITIAL_ACHIEVEMENT_POPUP },
                streakPopup: { ...INITIAL_STREAK_POPUP },
                selectedShipColor: "default",
                selectedTitle: null,
                unlockedCosmetics: ["default"],
                pendingCardReward: {
                    active: false,
                    options: [],
                    runId: null
                },
                lastRewardRunId: null,
                lastRun: null,

                actions: {
                    setStats: (nextStats) => {
                        const merged = { ...INITIAL_LIFETIME_STATS, ...nextStats };
                        set({ lifetimeStats: merged, stats: merged });
                    },

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
                        const stats = get().lifetimeStats;
                        const bossDefeated = !!runStats.bossDefeated;
                        const duration = runStats.duration ?? 0;
                        const kills = runStats.kills ?? 0;
                        const waves = Math.max(0, runStats.wavesCleared ?? runStats.wave ?? 0);
                        const upgradesPicked = runStats.upgradesPicked ?? 0;
                        const affixId = runStats.affixId ?? null;
                        const bossId = runStats.bossId ?? null;
                        const bossName = runStats.bossName ?? null;
                        const synergies = Array.isArray(runStats.synergies) ? runStats.synergies : [];

                        const bossRecords = { ...(stats.bossRecords || {}) };
                        if (bossId) {
                            const prev = bossRecords[bossId] || { name: bossName ?? bossId, encounters: 0, kills: 0 };
                            bossRecords[bossId] = {
                                ...prev,
                                name: bossName ?? prev.name,
                                encounters: prev.encounters + 1,
                                kills: prev.kills + (bossDefeated ? 1 : 0)
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

                        const currentWinStreak = bossDefeated ? (stats.currentWinStreak ?? 0) + 1 : 0;
                        const bestWinStreak = bossDefeated
                            ? Math.max(stats.bestWinStreak ?? 0, currentWinStreak)
                            : stats.bestWinStreak ?? 0;
                        const fastestVictory = bossDefeated
                            ? Math.min(stats.fastestVictory ?? Infinity, duration)
                            : stats.fastestVictory;

                        const nextStats = {
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
                            highestDamage: Math.max(stats.highestDamage ?? 0, runStats.damageDealt ?? 0),
                            mostKillsRun: Math.max(stats.mostKillsRun ?? 0, kills),
                            mostUpgradesRun: Math.max(stats.mostUpgradesRun ?? 0, upgradesPicked),
                            currentWinStreak,
                            bestWinStreak,
                            bossRecords,
                            affixPlayCounts,
                            affixWinCounts,
                            synergyUnlockCounts
                        };

                        get().actions.setStats(nextStats);
                        set({ lastRun: runStats });
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
                        const stats = get().lifetimeStats;
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
                        const isNewBest = newStreak > (stats.bestDailyStreak ?? 0);
                        const nextStats = {
                            ...stats,
                            currentDailyStreak: newStreak,
                            bestDailyStreak: Math.max(newStreak, stats.bestDailyStreak ?? 0),
                            lastPlayedDate: today
                        };
                        get().actions.setStats(nextStats);

                        const streakIncreased = diffDays === 1;
                        if (newStreak >= 2 && streakIncreased) {
                            get().actions.showStreakPopup(newStreak, isNewBest);
                        }

                        return { streakIncreased, newStreak };
                    },
                    setCardReward: (options, runId) => {
                        set({
                            pendingCardReward: {
                                active: true,
                                options: [...options],
                                runId: runId ?? null
                            }
                        });
                    },

                    claimCardReward: (upgradeId) => {
                        set((state) => {
                            const unlocked = new Set(state.cardCollection.unlockedUpgrades);
                            const boosts = { ...(state.cardCollection.upgradeBoosts || {}) };
                            let unlockedUpgrades = state.cardCollection.unlockedUpgrades;

                            if (unlocked.has(upgradeId)) {
                                const current = boosts[upgradeId] ?? 0;
                                boosts[upgradeId] = Math.min(5, current + 1);
                            } else {
                                unlockedUpgrades = [...unlockedUpgrades, upgradeId];
                            }

                            const upgradePickCounts = {
                                ...(state.lifetimeStats.upgradePickCounts || {})
                            };
                            upgradePickCounts[upgradeId] =
                (upgradePickCounts[upgradeId] ?? 0) + 1;

                            const rewardRunId =
                state.pendingCardReward.runId ?? state.lastRewardRunId;

                            return {
                                cardCollection: {
                                    ...state.cardCollection,
                                    unlockedUpgrades,
                                    upgradeBoosts: boosts,
                                    totalCardsCollected:
                    (state.cardCollection.totalCardsCollected ?? 0) + 1
                                },
                                lifetimeStats: {
                                    ...state.lifetimeStats,
                                    upgradePickCounts
                                },
                                stats: {
                                    ...state.lifetimeStats,
                                    upgradePickCounts
                                },
                                pendingCardReward: {
                                    active: false,
                                    options: [],
                                    runId: null
                                },
                                lastRewardRunId: rewardRunId
                            };
                        });
                    },

                    showAchievement: (synergyId, synergyName, synergyDescription) => {
                        set({
                            achievementPopup: {
                                show: true,
                                synergyId,
                                synergyName,
                                synergyDescription
                            }
                        });
                    },

                    hideAchievement: () => {
                        set({ achievementPopup: { ...INITIAL_ACHIEVEMENT_POPUP } });
                    },

                    showStreakPopup: (count, isNewBest = false) => {
                        set({
                            streakPopup: {
                                show: true,
                                count,
                                isNewBest
                            }
                        });
                    },

                    hideStreakPopup: () => {
                        set({ streakPopup: { ...INITIAL_STREAK_POPUP } });
                    }
                }
            }),
            {
                name: "quiet-quadrant-meta",
                version: 3,
                partialize: (state) => {
                    const { actions: _actions, achievementPopup: _achievementPopup, streakPopup: _streakPopup, ...rest } = state;
                    return rest;
                },
                merge: (persistedState, currentState) => {
                    const mergedStats = {
                        ...INITIAL_LIFETIME_STATS,
                        ...(persistedState?.lifetimeStats || persistedState?.stats || {})
                    };
                    return {
                        ...currentState,
                        ...persistedState,
                        lifetimeStats: mergedStats,
                        stats: mergedStats,
                        actions: currentState.actions
                    };
                }
            }
        ),
        { name: "MetaStore" }
    )
);

