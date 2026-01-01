import React from "react";

/**
 * Boss health bar displayed at top-center during boss fights.
 * Shows boss name, phase indicator, and health with color transitions.
 */
export function BossHealthBar({ boss }) {
    if (!boss || !boss.alive) return null;

    const healthPct = Math.max(0, Math.min(1, boss.health / boss.maxHealth));
    const currentPhase = (boss.phaseIndex ?? 0) + 1;
    const totalPhases = boss.phases?.length ?? 4;

    // Color transitions: cyan > yellow (50%) > red (25%)
    let barColor = "var(--qq-accent)";
    let glowColor = "rgba(159, 240, 255, 0.5)";
    if (healthPct <= 0.25) {
        barColor = "var(--qq-health)";
        glowColor = "rgba(255, 68, 68, 0.5)";
    } else if (healthPct <= 0.5) {
        barColor = "var(--qq-rare)";
        glowColor = "rgba(255, 215, 0, 0.5)";
    }

    // Generate phase markers
    const phaseMarkers = [];
    if (boss.phases && boss.phases.length > 1) {
        for (let i = 1; i < boss.phases.length; i++) {
            const threshold = boss.phases[i];
            phaseMarkers.push(
                <div
                    key={i}
                    className="qq-boss-phase-marker"
                    style={{ left: `${threshold * 100}%` }}
                />
            );
        }
    }

    return (
        <div className="qq-boss-health-container">
            <div className="qq-boss-health-header">
                <span className="qq-boss-name">{boss.name}</span>
                <span className="qq-boss-phase">PHASE {currentPhase}/{totalPhases}</span>
            </div>
            <div className="qq-boss-health-bar">
                {phaseMarkers}
                <div
                    className={`qq-boss-health-fill ${healthPct <= 0.25 ? "qq-health-pulse" : ""}`}
                    style={{
                        width: `${healthPct * 100}%`,
                        background: barColor,
                        boxShadow: `0 0 12px ${glowColor}, 0 0 24px ${glowColor}`,
                    }}
                />
            </div>
            <div className="qq-boss-health-numbers">
                <span>{Math.round(boss.health)}</span>
                <span className="qq-boss-health-max">/ {boss.maxHealth}</span>
            </div>
        </div>
    );
}
