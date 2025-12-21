import React from "react";

export function DashIndicator({ cooldownPct = 1 }) {
  const clamped = Math.max(0, Math.min(1, cooldownPct));
  const background =
    clamped >= 1
      ? "var(--qq-safe)"
      : `conic-gradient(var(--qq-safe) ${clamped * 360}deg, #101620 0)`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        color: "var(--qq-muted)"
      }}
    >
      <div
        className={clamped >= 1 ? "qq-dash-ready" : undefined}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "2px solid rgba(0, 255, 255, 0.5)",
          background,
          boxShadow: clamped >= 1 ? "0 0 12px rgba(0, 255, 255, 0.35)" : "none"
        }}
      />
      <div style={{ fontSize: "10px", letterSpacing: "0.16em" }}>DASH</div>
    </div>
  );
}
