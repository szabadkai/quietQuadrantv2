import React from "react";
import { UpgradeCard } from "./UpgradeCard.jsx";

export function UpgradeModal({ pendingUpgrade, onSelect }) {
    if (!pendingUpgrade) return null;

    return (
        <div className="qq-upgrade-overlay">
            <div className="qq-upgrade-panel">
                <div className="qq-upgrade-title">CHOOSE AN UPGRADE</div>
                <div className="qq-upgrade-grid">
                    {pendingUpgrade.options.map((option) => (
                        <UpgradeCard
                            key={option}
                            upgradeId={option}
                            onSelect={() => onSelect(pendingUpgrade.playerId, option)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
