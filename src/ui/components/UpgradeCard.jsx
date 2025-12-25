import React, { useState } from "react";
import { UPGRADE_BY_ID } from "../../config/upgrades.js";
import { getUpgradeIconPath } from "../../utils/assetPaths.js";

export function UpgradeCard({ upgradeId, onSelect }) {
    const [iconMissing, setIconMissing] = useState(false);
    const upgrade = UPGRADE_BY_ID[upgradeId];
    if (!upgrade) return null;
    const iconPath = getUpgradeIconPath(upgrade.id);

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

            {!iconMissing ? (
                <img
                    src={iconPath}
                    alt={upgrade.name}
                    className="qq-upgrade-card__image"
                    onError={() => setIconMissing(true)}
                />
            ) : (
                <div className="qq-upgrade-card__placeholder" aria-hidden="true">
                    <span>✨</span>
                </div>
            )}


            <div className="qq-upgrade-card__name">{upgrade.name}</div>

            {upgrade.description ? (
                <div className="qq-upgrade-card__desc">{upgrade.description}</div>
            ) : null}

            <div className="qq-upgrade-card__footer">
                <span className="qq-upgrade-card__type-icon">+</span>
                <span className="qq-label" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>Select</span>
            </div>
        </button>
    );
}
