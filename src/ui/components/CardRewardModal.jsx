import React from "react";
import { UpgradeCard } from "./UpgradeCard.jsx";
import { useMetaStore } from "../../state/useMetaStore.js";

export function CardRewardModal({ options, onSelect }) {
    const cardCollection = useMetaStore((s) => s.cardCollection);

    if (!options || options.length === 0) return null;

    const unlockedSet = new Set(cardCollection.unlockedUpgrades ?? []);
    const boosts = cardCollection.upgradeBoosts ?? {};

    return (
        <div className="qq-upgrade-overlay">
            <div className="qq-upgrade-panel">
                <div className="qq-upgrade-title">BOSS REWARD</div>
                <div className="qq-upgrade-grid">
                    {options.map((option) => {
                        const isUnlocked = unlockedSet.has(option);
                        const currentBoost = boosts[option] ?? 0;

                        return (
                            <div key={option} className="qq-reward-card-wrapper">
                                <UpgradeCard
                                    upgradeId={option}
                                    onSelect={() => onSelect(option)}
                                />
                                <div className="qq-reward-status">
                                    {isUnlocked ? (
                                        <span className="qq-boost-indicator">
                                            BOOST {currentBoost + 1} / 5
                                            <div className="qq-boost-pips">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`qq-boost-pip ${i <= currentBoost ? "filled" : ""}`}
                                                    >
                                                        ●
                                                    </span>
                                                ))}
                                            </div>
                                        </span>
                                    ) : (
                                        <span className="qq-unlock-indicator">NEW UNLOCK</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

