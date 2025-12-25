import React from "react";
import { UPGRADE_BY_ID } from "../../config/upgrades.js";

const CATEGORY_ICONS = {
    offense: "🎯",
    defense: "🛡️",
    utility: "⚡"
};

export function UpgradeCard({ upgradeId, onSelect }) {
    const upgrade = UPGRADE_BY_ID[upgradeId];
    if (!upgrade) return null;

    const categoryIcon = CATEGORY_ICONS[upgrade.category] || "✨";

    return (
        <button
            type="button"
            onClick={() => onSelect(upgradeId)}
            className="qq-upgrade-card"
            data-rarity={upgrade.rarity}
        >
            <div className="qq-upgrade-card__header">
                <span className="qq-upgrade-card__rarity">{upgrade.rarity}</span>
                <span className="qq-upgrade-card__category">{upgrade.category}</span>
            </div>

            <div className="qq-upgrade-card__illustration">
                <img
                    src={`/assets/upgrades/${upgrade.id}.png`}
                    alt={upgrade.name}
                    className="qq-upgrade-card__image"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        // Keep previous placeholder logic if needed or just hide
                    }}
                />
            </div>


            <div className="qq-upgrade-card__name">{upgrade.name}</div>

            {upgrade.description ? (
                <div className="qq-upgrade-card__desc">{upgrade.description}</div>
            ) : null}

            <div className="qq-upgrade-card__footer">
                <span className="qq-upgrade-card__type-icon">{categoryIcon}</span>
                <span className="qq-label" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>Select</span>
            </div>
        </button>
    );
}

