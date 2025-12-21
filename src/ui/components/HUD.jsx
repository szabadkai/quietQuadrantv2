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
  const xpCurrent = Math.round(player.xp);
  const xpTotal = Math.round(player.xp + player.xpToNext);
  const hullValue = `${player.health.toFixed(1)} / ${Math.round(player.maxHealth)}`;
  const volatileActive = (player.chainReactionRadius ?? 0) > 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none"
      }}
    >
      <div className="qq-hud-wrap">
        <div className="qq-hud-bar">
          <div className="qq-panel qq-hud-panel">
            <div className="qq-hud-row">
              <div className="qq-hud-label">HULL</div>
              <div className="qq-hud-value">{hullValue}</div>
            </div>
            <HealthBar current={player.health} max={player.maxHealth} />
          </div>
          <div className="qq-panel qq-hud-panel">
            <div className="qq-hud-row">
              <div className="qq-hud-label">XP</div>
              <div className="qq-hud-value">
                LV {player.level} {xpCurrent} / {xpTotal}
              </div>
            </div>
            <XPBar current={player.xp} toNext={player.xpToNext} />
          </div>
          <div className="qq-panel qq-hud-panel">
            <div className="qq-hud-row">
              <div className="qq-hud-label">WAVE</div>
              <div className="qq-hud-value qq-hud-value-large">
                <WaveIndicator wave={state.wave.current} phase={state.phase} total={WAVES.length} />
              </div>
            </div>
          </div>
          <div className="qq-panel qq-hud-panel">
            <div className="qq-hud-row">
              <div className="qq-hud-label">CLOCK</div>
              <div className="qq-hud-value qq-hud-value-large">{clock}</div>
            </div>
          </div>
          <div className="qq-panel qq-hud-panel glow">
            <div className="qq-hud-row">
              <div className="qq-hud-label">WEEKLY</div>
              <div className="qq-hud-meta">Seed {state.seed}</div>
            </div>
            <div className="qq-hud-row">
              <div className="qq-hud-meta">{bossName}</div>
              <div className="qq-hud-meta">
                {affixName}
                {volatileActive ? (
                  <span className="qq-hud-tag"> / VOLATILE</span>
                ) : null}
              </div>
            </div>
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
