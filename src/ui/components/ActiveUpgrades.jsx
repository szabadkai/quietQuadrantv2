import React from "react";
import { UPGRADE_BY_ID } from "../../config/upgrades.js";
import { getUpgradeIconPath } from "../../utils/assetPaths.js";

const CATEGORY_ICONS = {
    offense: "🎯",
    defense: "🛡️",
    utility: "⚡"
};

export function ActiveUpgrades({ upgrades }) {
    if (!upgrades || upgrades.length === 0) return null;

    // Count stacks of each upgrade
    const counts = upgrades.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const uniqueUpgrades = Object.keys(counts);

    return (
        <div className="qq-active-upgrades">
            {uniqueUpgrades.map((id, index) => {
                const upgrade = UPGRADE_BY_ID[id];
                if (!upgrade) return null;
                const stackCount = counts[id];
                const iconPath = getUpgradeIconPath(id);
                const categoryIcon = CATEGORY_ICONS[upgrade.category] || "✨";
                // Calculate basic position
                // Logic: Start in center, if index is low (left side) anchor left-center, if high anchor right-center
                // But simplified: Just center it and clamp with CSS or logic?
                // Better: Use a class based on index relative to total count
                const isLeftLeaning = index < uniqueUpgrades.length / 2;
                const tooltipClass = isLeftLeaning ? "qq-tooltip-left" : "qq-tooltip-right";

                return (
                    <div key={id} className="qq-active-upgrade-slot">
                        <img
                            src={iconPath}
                            alt={upgrade.name}
                            className="qq-active-upgrade-icon"
                            onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.classList.add("fallback");
                                e.target.parentElement.dataset.icon = categoryIcon;
                            }}
                        />
                        {stackCount > 1 && (
                            <span className="qq-active-upgrade-stacks">x{stackCount}</span>
                        )}
                        <div className={`qq-upgrade-tooltip ${tooltipClass}`}>
                            <div className="qq-tooltip-title">{upgrade.name}</div>
                            <div className="qq-tooltip-desc">{upgrade.description}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
