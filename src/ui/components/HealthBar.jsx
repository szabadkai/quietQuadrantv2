import React from "react";

export function HealthBar({ current, max }) {
    const safeMax = Math.max(1, max);
    const pct = Math.max(0, Math.min(1, current / safeMax));
    const lowHealth = pct <= 0.3;

    return (
        <div className="qq-hud-barline">
            <div
                className={lowHealth ? "qq-hud-barfill qq-health-pulse" : "qq-hud-barfill"}
                style={{
                    width: `${pct * 100}%`,
                    background: lowHealth ? "var(--qq-health)" : "var(--qq-accent)",
                    boxShadow: lowHealth
                        ? "0 0 10px rgba(255, 68, 68, 0.35)"
                        : "0 0 10px rgba(159, 240, 255, 0.35)"
                }}
            />
        </div>
    );
}
