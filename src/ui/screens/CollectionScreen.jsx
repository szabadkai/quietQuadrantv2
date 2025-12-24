import React, { useMemo, useState } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { UPGRADES } from "../../config/upgrades.js";
import { Button } from "../components/Button.jsx";

const RARITY_ORDER = { legendary: 0, rare: 1, common: 2 };

export function CollectionScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const cardCollection = useMetaStore((s) => s.cardCollection);
  const [filter, setFilter] = useState("all");

  const unlockedSet = useMemo(
    () => new Set(cardCollection.unlockedUpgrades ?? []),
    [cardCollection.unlockedUpgrades]
  );
  const boosts = cardCollection.upgradeBoosts || {};

  const unlockedUpgrades = useMemo(() => {
    let list = UPGRADES.filter((upgrade) => unlockedSet.has(upgrade.id));
    if (filter !== "all") {
      list = list.filter((upgrade) => upgrade.rarity === filter);
    }
    return list
      .slice()
      .sort((a, b) => {
        const rarityDiff = (RARITY_ORDER[a.rarity] ?? 0) - (RARITY_ORDER[b.rarity] ?? 0);
        if (rarityDiff !== 0) return rarityDiff;
        return a.name.localeCompare(b.name);
      });
  }, [filter, unlockedSet]);

  const summary = useMemo(() => {
    const unlocked = cardCollection.unlockedUpgrades?.length ?? 0;
    const legendaries = (cardCollection.unlockedUpgrades ?? []).filter(
      (id) => UPGRADES.find((u) => u.id === id)?.rarity === "legendary"
    ).length;
    const collected = cardCollection.totalCardsCollected ?? unlocked;
    return { unlocked, legendaries, collected };
  }, [cardCollection]);

  const showMystery = filter === "all" && unlockedUpgrades.length < 30;

  return (
    <div className="qq-screen qq-screen-overlay">
      <div className="qq-panel-collection">
        <div className="qq-section">
          <div className="qq-collection-summary">
            <SummaryPill label="Cards Unlocked" value={summary.unlocked} />
            <SummaryPill label="Legendaries" value={summary.legendaries} accent />
            <SummaryPill label="Cards Collected" value={summary.collected} />
          </div>
        </div>

        <div className="qq-section qq-collection-filters">
          {["all", "common", "rare", "legendary"].map((value) => (
            <button
              key={value}
              type="button"
              className={`qq-filter-chip ${filter === value ? "active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        <div className="qq-section">
          <div className="qq-collection-grid">
            {unlockedUpgrades.map((upgrade) => {
              const boost = boosts[upgrade.id] ?? 0;
              const category = upgrade.category ?? "General";
              return (
                <div
                  key={upgrade.id}
                  className={`collection-card unlocked ${upgrade.rarity}`}
                >
                  <div className="collection-card__header">
                    <span className="rarity">{upgrade.rarity}</span>
                    {boost > 0 && <span className="boost">+{boost}</span>}
                  </div>
                  <div className="collection-card__name">{upgrade.name}</div>
                  <div className="collection-card__desc">{upgrade.description}</div>
                  <div className="collection-card__meta">
                    <span className="category">{category}</span>
                    <PipBar level={boost} />
                  </div>
                </div>
              );
            })}

            {showMystery && (
              <div className="collection-card locked">
                <div className="collection-card__name">?</div>
                <div className="collection-card__desc">
                  More to discover... Defeat bosses to unlock new cards.
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="qq-muted qq-collection-hint">
          Defeat bosses to unlock new cards and boost existing ones. Boosted cards appear more often!
        </p>

        <div className="qq-screen-actions">
          <Button primary onClick={() => setScreen("title")}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

function PipBar({ level }) {
  return (
    <div className="pip-bar">
      {[...Array(5)].map((_, idx) => (
        <span key={idx} className={`pip ${idx < level ? "filled" : ""}`} />
      ))}
    </div>
  );
}

function SummaryPill({ label, value, accent = false }) {
  return (
    <div className={`qq-summary-pill ${accent ? "accent" : ""}`}>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}
