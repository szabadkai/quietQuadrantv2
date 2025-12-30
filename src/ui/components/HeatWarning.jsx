import React from "react";
import { HEAT_WARNING_THRESHOLD } from "../../utils/constants.js";

export function HeatWarning({ player }) {
    if (!player) return null;

    const heat = player.weaponHeat ?? 0;
    const isOverheated = player.overheatCooldown > 0;

    // Don't show anything below threshold
    if (heat < HEAT_WARNING_THRESHOLD && !isOverheated) return null;

    const warningClass = isOverheated
        ? "qq-heat-warning qq-heat-offline"
        : "qq-heat-warning qq-heat-critical";

    const message = isOverheated
        ? "🔥 WEAPONS OFFLINE — COOLING"
        : "⚠ WEAPON SYSTEMS OVERHEATING";

    return (
        <div className={warningClass}>
            <span className="qq-heat-message">{message}</span>
            {!isOverheated && (
                <div className="qq-heat-bar-container">
                    <div
                        className="qq-heat-bar-fill"
                        style={{ width: `${Math.min(100, heat * 100)}%` }}
                    />
                </div>
            )}
        </div>
    );
}
