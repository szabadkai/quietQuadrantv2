import React from "react";
import { HealthBar } from "./HealthBar.jsx";
import { WaveIndicator } from "./WaveIndicator.jsx";
import { TICK_RATE } from "../../utils/constants.js";
import { WAVES } from "../../config/waves.js";
import { ActiveUpgrades } from "./ActiveUpgrades.jsx";
import { HeatWarning } from "./HeatWarning.jsx";


export function HUD({ state }) {
    if (!state) return null;
    const player = state.players?.[0];
    if (!player) return null;
    const ticks = state.runStats?.ticks ?? state.tick ?? 0;
    const seconds = Math.floor(ticks / TICK_RATE);
    const clock = formatClock(seconds);
    const affixName = state.affix?.name ?? "Standard";
    const bossName = state.boss?.name ?? "-";
    const currentHealth = Math.round(player.health);
    const maxHealth = Math.round(player.maxHealth);

    // Safety check for wave object
    const currentWave = state.wave?.current ?? 0;
    const wavePhase = state.phase ?? "normal";
    // If state.wave.total exists, use it, otherwise fall back to WAVES length
    const totalWaves = state.wave?.total ?? WAVES.length;

    return (
        <div className="qq-hud-layer">
            {/* LEFT CLUSTER: Health & Status */}
            <div className="qq-hud-cluster left">
                <div className="qq-hud-item">
                    <div className="qq-hud-label">HULL INTEGRITY</div>
                    <div className="qq-hull-display">
                        <span className="qq-hull-current">{currentHealth}</span>
                        <span className="qq-hull-max">/ {maxHealth}</span>
                    </div>
                </div>
                <HealthBar current={player.health} max={player.maxHealth} />

                {/* Active Upgrades moved to left cluster */}
                <ActiveUpgrades upgrades={player.upgrades} />
            </div>

            {/* CENTER CLUSTER: Wave Progress & Boss Info */}
            <div className="qq-hud-cluster center">
                <div className="qq-hud-item">
                    <div className="qq-hud-label">WAVE STATUS</div>
                    <div className="qq-hud-value jumbo">
                        <WaveIndicator wave={currentWave} phase={wavePhase} total={totalWaves} />
                    </div>
                    {(bossName !== "-" || affixName !== "Standard") && (
                        <div className="qq-hud-meta">
                            {bossName !== "-" ? bossName : affixName}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT CLUSTER: Clock, FPS, Meta */}
            <div className="qq-hud-cluster right">
                <div className="qq-hud-item">
                    <div className="qq-hud-label">MISSION TIME</div>
                    <div className="qq-hud-value large">{clock}</div>
                </div>

                <div className="qq-hud-item">
                    <div className="qq-hud-label">FPS</div>
                    <div className={`qq-hud-value ${state.fps < 50 ? "qq-hud-tag" : ""}`} style={{ fontSize: "14px" }}>
                        {state.fps ?? "--"}
                    </div>
                </div>
            </div>

            {/* Weapon Heat Warning - placed outside clusters for true center positioning */}
            <HeatWarning player={player} />
        </div>
    );
}



function formatClock(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return `${mm}:${ss}`;
}
