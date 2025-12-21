import React from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { Button } from "../components/Button.jsx";

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

  const achievementCount = Object.values(achievements).filter((a) => a.unlocked).length;

  const formatTime = (seconds) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
              <Stat label="Total Runs" value={stats.totalRuns} />
              <Stat label="Victories" value={stats.bossKills} />
              <Stat label="Win Rate" value={`${winRate}%`} />
              <Stat label="Playtime" value={`${playtimeHours}h ${playtimeMins}m`} />
            </div>
          </section>

          <section className="qq-stats-section">
            <h3>Combat</h3>
            <div className="qq-stat-list">
              <Stat label="Enemies Destroyed" value={stats.totalKills} />
              <Stat label="Best Wave" value={stats.bestWave || "—"} />
              <Stat label="Boss Kills" value={stats.bossKills} />
              <Stat label="Highest Damage" value={stats.highestDamage || "—"} />
            </div>
          </section>

          <section className="qq-stats-section">
            <h3>Records</h3>
            <div className="qq-stat-list">
              <Stat label="Fastest Victory" value={formatTime(stats.fastestBossKill)} />
              <Stat label="Best Win Streak" value={stats.bestWinStreak || "—"} />
              <Stat label="Best Daily Streak" value={stats.bestDailyStreak || "—"} />
              <Stat label="Current Streak" value={stats.currentDailyStreak || "—"} />
            </div>
          </section>

          <section className="qq-stats-section">
            <h3>Progress</h3>
            <div className="qq-stat-list">
              <Stat label="Achievements" value={`${achievementCount}/31`} />
              <Stat label="Current Win Streak" value={stats.currentWinStreak || "—"} />
            </div>
          </section>
        </div>

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
      <span className="qq-stat-label">{label}</span>
      <span className="qq-stat-value">{value}</span>
    </div>
  );
}
