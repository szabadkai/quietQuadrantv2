import React from "react";
import { UPGRADE_BY_ID } from "../../config/upgrades.js";

const RARITY_STYLES = {
  common: {
    border: "rgba(159, 240, 255, 0.25)",
    background: "rgba(4, 8, 12, 0.92)",
    glow: "0 0 12px rgba(159, 240, 255, 0.08)"
  },
  rare: {
    border: "rgba(159, 240, 255, 0.4)",
    background: "rgba(4, 8, 12, 0.92)",
    glow: "0 0 16px rgba(159, 240, 255, 0.12)"
  },
  legendary: {
    border: "rgba(159, 240, 255, 0.6)",
    background: "rgba(4, 8, 12, 0.92)",
    glow: "0 0 18px rgba(159, 240, 255, 0.16)"
  }
};

export function UpgradeCard({ upgradeId, onSelect }) {
  const upgrade = UPGRADE_BY_ID[upgradeId];
  if (!upgrade) return null;

  const style = RARITY_STYLES[upgrade.rarity] ?? RARITY_STYLES.common;

  return (
    <button
      type="button"
      onClick={() => onSelect(upgradeId)}
      className="qq-upgrade-card"
      data-rarity={upgrade.rarity}
      style={{
        background: style.background,
        borderColor: style.border,
        boxShadow: style.glow
      }}
    >
      <div className="qq-upgrade-rarity">{upgrade.rarity.toUpperCase()}</div>
      <div className="qq-upgrade-name">{upgrade.name}</div>
      {upgrade.description ? (
        <div className="qq-upgrade-description">{upgrade.description}</div>
      ) : null}
    </button>
  );
}
