import React, { useState, useMemo } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { UPGRADES } from "../../config/upgrades.js";
import { Button } from "../components/Button.jsx";

const RARITY_ORDER = { common: 0, rare: 1, legendary: 2 };

export function CollectionScreen() {
  const setScreen = useUIStore((s) => s.actions.setScreen);
  const cardCollection = useMetaStore((s) => s.cardCollection);
  const [filter, setFilter] = useState("all");

  const upgrades = useMemo(() => {
    let list = Object.values(UPGRADES);

    if (filter !== "all") {
      list = list.filter((u) => u.rarity === filter);
    }

    list.sort((a, b) => {
      const rarityDiff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [filter]);

  const unlockedSet = new Set(cardCollection.unlockedUpgrades);
  const boosts = cardCollection.upgradeBoosts || {};

  const stats = useMemo(() => {
    const total = Object.keys(UPGRADES).length;
    const unlocked = cardCollection.unlockedUpgrades.length;
    const legendaries = cardCollection.unlockedUpgrades.filter(
      (id) => UPGRADES[id]?.rarity === "legendary"
    ).length;
    return { total, unlocked, legendaries };
  }, [cardCollection]);

  return (
    <div className="qq-screen">
      <div className="qq-panel qq-panel-wide">
        <div className="qq-screen-header">
          <span className="qq-label">COLLECTION</span>
          <h1>Upgrade Cards</h1>
          <p className="qq-muted">
            {stats.unlocked}/{stats.total} unlocked · {stats.legendaries} legendaries
          </p>
        </div>

        <div className="qq-filter-bar">
          {["all", "common", "rare", "legendary"].map((f) => (
            <button
              key={f}
              type="button"
              className={`qq-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="qq-collection-grid">
          {upgrades.map((upgrade) => {
            const unlocked = unlockedSet.has(upgrade.id);
            const boostLevel = boosts[upgrade.id] || 0;

            return (
              <div
                key={upgrade.id}
                className={`qq-collection-card ${unlocked ? "" : "locked"}`}
                data-rarity={upgrade.rarity}
              >
                {unlocked ? (
                  <>
                    <div className="qq-card-rarity">{upgrade.rarity}</div>
                    <div className="qq-card-name">{upgrade.name}</div>
                    <div className="qq-card-desc">{upgrade.description}</div>
                    <div className="qq-card-boosts">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`qq-boost-pip ${i < boostLevel ? "filled" : ""}`}
                        >
                          ●
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="qq-card-mystery">?</div>
                    <div className="qq-card-hint">
                      {upgrade.rarity} upgrade
                    </div>
                  </>
                )}
              </div>
            );
          })}
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
