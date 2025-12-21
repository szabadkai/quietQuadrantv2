import React from "react";
import { HealthBar } from "./HealthBar.jsx";
import { XPBar } from "./XPBar.jsx";
import { WaveIndicator } from "./WaveIndicator.jsx";
import { TICK_RATE } from "../../utils/constants.js";
import { WAVES } from "../../config/waves.js";

export function HUD({ state }) {
  if (!state) return null;
  const player = state.players?.[0];
  if (!player) return null;
  const ticks = state.runStats?.ticks ?? state.tick ?? 0;
  const seconds = Math.floor(ticks / TICK_RATE);
  const clock = formatClock(seconds);
  const affixName = state.affix?.name ?? "Standard";
  const bossName = state.boss?.name ?? "-";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          right: "12px"
        }}
      >
        <div className="qq-hud-bar">
          <div className="qq-panel">
            <div className="qq-hud-label">HULL</div>
            <div className="qq-hud-value">
              {Math.round(player.health)} / {Math.round(player.maxHealth)}
            </div>
            <HealthBar current={player.health} max={player.maxHealth} />
          </div>
          <div className="qq-panel">
            <div className="qq-hud-label">XP</div>
            <div className="qq-hud-value">LV {player.level}</div>
            <XPBar current={player.xp} toNext={player.xpToNext} />
          </div>
          <div className="qq-panel">
            <div className="qq-hud-label">WAVE</div>
            <WaveIndicator wave={state.wave.current} phase={state.phase} total={WAVES.length} />
          </div>
          <div className="qq-panel">
            <div className="qq-hud-label">CLOCK</div>
            <div className="qq-hud-value">{clock}</div>
          </div>
          <div className="qq-panel glow">
            <div className="qq-hud-label">WEEKLY</div>
            <div className="qq-hud-sub">Seed {state.seed}</div>
            <div className="qq-hud-sub">Boss: {bossName}</div>
            <div className="qq-hud-sub">Affix: {affixName}</div>
          </div>
        </div>
      </div>
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
