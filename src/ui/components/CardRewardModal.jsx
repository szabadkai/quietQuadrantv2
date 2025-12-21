import React from "react";
import { UpgradeCard } from "./UpgradeCard.jsx";

export function CardRewardModal({ options, onSelect }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="qq-upgrade-overlay">
      <div className="qq-upgrade-panel">
        <div className="qq-upgrade-title">BOSS REWARD</div>
        <div className="qq-upgrade-grid">
          {options.map((option) => (
            <UpgradeCard
              key={option}
              upgradeId={option}
              onSelect={() => onSelect(option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
