import React, { useMemo } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { Button } from "../components/Button.jsx";
import { UPGRADE_BY_ID } from "../../config/upgrades.js";
import { SYNERGY_DEFINITIONS } from "../../config/synergies.js";
import { BOSSES } from "../../config/bosses.js";
import { AFFIXES } from "../../config/affixes.js";

const BOSSES_BY_ID = Object.fromEntries(BOSSES.map((boss) => [boss.id, boss]));
const AFFIX_BY_ID = Object.fromEntries(AFFIXES.map((affix) => [affix.id, affix]));

export function StatsScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const stats = useMetaStore((s) => s.lifetimeStats);
  const pilotRank = useMetaStore((s) => s.pilotRank);
  const pilotXP = useMetaStore((s) => s.pilotXP);

  const winRate = stats.totalRuns > 0
    ? Math.round(((stats.totalVictories ?? stats.bossKills ?? 0) / stats.totalRuns) * 100)
    : 0;

  const favoriteUpgrades = useMemo(() => {
    const counts = stats.upgradePickCounts || {};
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => {
        const upgrade = UPGRADE_BY_ID[id];
        return {
          id,
          name: upgrade?.name ?? id,
          rarity: upgrade?.rarity ?? "common",
          count
        };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 5);
  }, [stats.upgradePickCounts]);

  const synergyProgress = useMemo(() => {
    const counts = stats.synergyUnlockCounts || {};
    return SYNERGY_DEFINITIONS.map((synergy) => ({
      ...synergy,
      count: counts[synergy.id] ?? 0
    }));
  }, [stats.synergyUnlockCounts]);

  const unlockedSynergies = synergyProgress.filter((s) => s.count > 0);
  const totalSynergies = SYNERGY_DEFINITIONS.length;

  const bossRecords = useMemo(() => {
    const records = stats.bossRecords && Object.keys(stats.bossRecords).length
      ? stats.bossRecords
      : stats.bossKillCounts;

    return Object.entries(records || {})
      .map(([id, record]) => {
        const encounters = record.encounters ?? record.kills ?? record ?? 0;
        const kills = record.kills ?? record ?? 0;
        const boss = BOSSES_BY_ID[id];
        return {
          id,
          name: record.name ?? boss?.name ?? id,
          encounters,
          kills
        };
      })
      .filter((r) => r.encounters > 0)
      .sort((a, b) => b.encounters - a.encounters);
  }, [stats.bossRecords, stats.bossKillCounts]);

  const affixRecords = useMemo(() => {
    const plays = stats.affixPlayCounts || {};
    const wins = stats.affixWinCounts || {};
    return Object.entries(plays)
      .map(([id, count]) => {
        const affix = AFFIX_BY_ID[id];
        return {
          id,
          name: affix?.name ?? id,
          description: affix?.description ?? "",
          plays: count,
          wins: wins[id] ?? 0
        };
      })
      .filter((entry) => entry.plays > 0)
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 6);
  }, [stats.affixPlayCounts, stats.affixWinCounts]);

  return (
    <div className="qq-screen qq-screen-overlay">
      <div className="qq-panel-stats">
        <div className="qq-screen-header">
          <span className="qq-label">LIFETIME STATS</span>
          <h1>Progress Overview</h1>
          <p className="qq-muted">
            Pilot Rank {pilotRank} · {formatNumber(pilotXP)} XP
          </p>
        </div>

        <div className="qq-section">
          <SectionTitle label="Overview" />
          <StatGrid>
            <StatCard label="Total Runs" value={formatNumber(stats.totalRuns)} />
            <StatCard label="Time Played" value={formatTime(stats.totalPlaytime)} />
            <StatCard label="Victories" value={formatNumber(stats.totalVictories ?? stats.bossKills ?? 0)} />
            <StatCard label="Win Rate" value={`${winRate}%`} />
          </StatGrid>
        </div>

        <div className="qq-section">
          <SectionTitle label="Combat" />
          <StatGrid>
            <StatCard label="Enemies Destroyed" value={formatNumber(stats.totalKills)} />
            <StatCard label="Waves Cleared" value={formatNumber(stats.wavesCleared)} />
            <StatCard label="Bosses Defeated" value={formatNumber(stats.bossesDefeated ?? stats.bossKills ?? 0)} />
            <StatCard label="Highest Wave" value={formatNumber(stats.highestWave ?? stats.bestWave ?? 0)} />
          </StatGrid>
        </div>

        <div className="qq-section">
          <SectionTitle label="Records" />
          <StatGrid>
            <StatCard label="Fastest Victory" value={formatTime(stats.fastestVictory ?? stats.fastestBossKill)} />
            <StatCard label="Most Kills (run)" value={formatNumber(stats.mostKillsRun)} />
            <StatCard label="Most Upgrades" value={formatNumber(stats.mostUpgradesRun)} />
            <StatCard label="Best Win Streak" value={formatNumber(stats.bestWinStreak)} />
          </StatGrid>
        </div>

        <div className="qq-section">
          <SectionTitle label="Streaks" />
          <StatGrid>
            <StatCard label="Daily Streak" value={formatNumber(stats.currentDailyStreak)} highlight />
            <StatCard label="Best Daily Streak" value={formatNumber(stats.bestDailyStreak)} />
            <StatCard label="Current Win Streak" value={formatNumber(stats.currentWinStreak)} />
            <StatCard label="Best Win Streak" value={formatNumber(stats.bestWinStreak)} />
          </StatGrid>
        </div>

        {favoriteUpgrades.length > 0 && (
          <div className="qq-section">
            <SectionTitle label="Favorite Upgrades" />
            <div className="qq-upgrade-list">
              {favoriteUpgrades.map((upgrade) => (
                <div key={upgrade.id} className="qq-upgrade-row">
                  <span className={`qq-rarity-pill ${upgrade.rarity}`}>
                    {upgrade.name}
                  </span>
                  <span className="qq-upgrade-count">×{upgrade.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="qq-section">
          <div className="qq-section-header">
            <SectionTitle label="Achievements" />
            <span className="qq-pill">
              {unlockedSynergies.length} / {totalSynergies} Synergies
            </span>
          </div>
          {unlockedSynergies.length > 0 ? (
            <div className="qq-achievement-grid qq-achievement-grid-wide">
              {unlockedSynergies.map((synergy) => (
                <div
                  key={synergy.id}
                  className="qq-achievement-card unlocked"
                >
                  <div className="qq-achievement-name">{synergy.name}</div>
                  <div className="qq-achievement-desc">{synergy.description}</div>
                  <div className="qq-achievement-meta">
                    Unlocked {synergy.count}×
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="qq-muted">Discover synergies by combining upgrades during runs.</p>
          )}
        </div>

        {bossRecords.length > 0 && (
          <div className="qq-section">
            <SectionTitle label="Boss Record" />
            <div className="qq-boss-list">
              {bossRecords.map((record) => {
                const winPct = record.encounters > 0
                  ? Math.round((record.kills / record.encounters) * 100)
                  : 0;
                return (
                  <div key={record.id} className="qq-boss-row">
                    <span className="qq-strong">{record.name}</span>
                    <span className="qq-boss-meta">
                      {record.kills}/{record.encounters} ({winPct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {affixRecords.length > 0 && (
          <div className="qq-section">
            <SectionTitle label="Affix Experience" />
            <div className="qq-affix-grid">
              {affixRecords.map((affix) => (
                <div key={affix.id} className="qq-affix-card" title={affix.description}>
                  <div className="qq-affix-name">{affix.name}</div>
                  <div className="qq-affix-meta">
                    {affix.wins}W / {affix.plays}P
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="qq-screen-actions">
          <Button primary onClick={() => setScreen("title")}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatNumber(value) {
  if (value === undefined || value === null) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}

function formatTime(seconds) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs >= 1) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

function SectionTitle({ label }) {
  return <h3 className="qq-section-title">{label}</h3>;
}

function StatGrid({ children }) {
  return <div className="qq-stat-grid">{children}</div>;
}

function StatCard({ label, value, highlight = false }) {
  return (
    <div className={`qq-stat-card ${highlight ? "highlight" : ""}`}>
      <div className="qq-stat-label">{label}</div>
      <div className="qq-stat-value">{value}</div>
    </div>
  );
}
