import React from "react";

export function WaveIndicator({ wave, phase, total }) {
  const label = phase === "boss" ? "BOSS" : `${wave + 1}/${total ?? 0}`;
  return (
    <div className="qq-hud-value">{label}</div>
  );
}
