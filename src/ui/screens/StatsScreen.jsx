import React from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { Button } from "../components/Button.jsx";
import { ACHIEVEMENTS } from "../../config/achievements.js";

export function StatsScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const stats = useMetaStore((s) => s.stats);
  const pilotRank = useMetaStore((s) => s.pilotRank);
  const pilotXP = useMetaStore((s) => s.pilotXP);
  const achievements = useMetaStore((s) => s.achievements);

  const winRate = stats.totalRuns > 0
    ? Math.round((stats.bossKills / stats.totalRuns) * 100)
    : 0;

  const playtimeHours = Math.floor(stats.totalPlaytime / 3600);
  const playtimeMins = Math.floor((stats.totalPlaytime % 3600) / 60);

  const unlockedAchievements = Object.values(ACHIEVEMENTS).filter(
    (achievement) => achievements[achievement.id]?.unlocked
  );
  const achievementCount = unlockedAchievements.length;
  const achievementTotal = Object.keys(ACHIEVEMENTS).length;

  const formatTime = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const overviewCards = [
    { label: "Total Runs", value: stats.totalRuns },
    { label: "Time Played", value: `${playtimeHours}h ${playtimeMins}m` },
    { label: "Victories", value: stats.bossKills },
    { label: "Win Rate", value: `${winRate}%` }
  ];

  const combatCards = [
    { label: "Enemies Destroyed", value: stats.totalKills },
    { label: "Best Wave", value: stats.bestWave || "—" },
    { label: "Boss Kills", value: stats.bossKills },
    {
      label: "Highest Damage",
      value: stats.highestDamage ? Math.round(stats.highestDamage) : "—"
    }
  ];

  const recordsCards = [
    { label: "Fastest Victory", value: formatTime(stats.fastestBossKill) },
    { label: "Best Win Streak", value: stats.bestWinStreak || "—" },
    { label: "Best Daily Streak", value: stats.bestDailyStreak || "—" },
    { label: "Current Streak", value: stats.currentDailyStreak || "—" }
  ];

  const progressCards = [
    { label: "Achievements", value: `${achievementCount}/${achievementTotal}` },
    { label: "Current Win Streak", value: stats.currentWinStreak || "—" },
    { label: "Boss Kills", value: stats.bossKills },
    { label: "Best Wave", value: stats.bestWave || "—" }
  ];

  const overviewStats = [
    { label: "Total Runs", value: stats.totalRuns },
    { label: "Victories", value: stats.bossKills },
    { label: "Win Rate", value: `${winRate}%` },
    { label: "Playtime", value: `${playtimeHours}h ${playtimeMins}m` }
  ];

  const combatStats = [
    { label: "Enemies Destroyed", value: stats.totalKills },
    { label: "Best Wave", value: stats.bestWave || "—" },
    { label: "Boss Kills", value: stats.bossKills },
    {
      label: "Highest Damage",
      value: stats.highestDamage ? Math.round(stats.highestDamage) : "—"
    }
  ];

  const recordStats = [
    { label: "Fastest Victory", value: formatTime(stats.fastestBossKill) },
    { label: "Best Win Streak", value: stats.bestWinStreak || "—" },
    { label: "Best Daily Streak", value: stats.bestDailyStreak || "—" },
    { label: "Current Streak", value: stats.currentDailyStreak || "—" }
  ];

  const progressStats = [
    { label: "Achievements", value: `${achievementCount}/${achievementTotal}` },
    { label: "Current Win Streak", value: stats.currentWinStreak || "—" },
    { label: "Boss Kills", value: stats.bossKills },
    { label: "Best Wave", value: stats.bestWave || "—" }
  ];

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-wide">
        <div className="qq-screen-header">
          <span className="qq-label">STATISTICS</span>
          <h1>Pilot Rank {pilotRank}</h1>
          <p className="qq-muted">{pilotXP} XP total</p>
        </div>

        <div className="qq-stats-grid">
          <section className="qq-stats-section">
            <h3>Overview</h3>
            <div className="qq-stat-list">
              {overviewStats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </section>

          <section className="qq-stats-section">
            <h3>Combat</h3>
            <div className="qq-stat-list">
              {combatStats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </section>

          <section className="qq-stats-section">
            <h3>Records</h3>
            <div className="qq-stat-list">
              {recordStats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </section>

          <section className="qq-stats-section">
            <h3>Streaks</h3>
            <div className="qq-stat-list">
              {progressStats.map((stat) => (
                <Stat key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </section>
        </div>

        <section className="qq-stats-section">
          <h3>Achievements</h3>
          {achievementCount > 0 ? (
            <div className="qq-achievement-grid">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="qq-achievement-card"
                  data-category={achievement.category}
                >
                  <div className="qq-achievement-icon">{achievement.icon}</div>
                  <div className="qq-achievement-name">{achievement.name}</div>
                  <div className="qq-achievement-desc">
                    {achievement.description}
                  </div>
                  <div className="qq-achievement-meta">
                    {achievement.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="qq-muted">No achievements discovered yet.</p>
          )}
        </section>

        <div className="qq-screen-actions">
          <Button primary onClick={() => setScreen("title")}>
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="qq-stat">
      <div className="qq-stat-label">{label}</div>
      <div className="qq-stat-value">{value}</div>
    </div>
  );
}
