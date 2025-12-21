import React from "react";

export function CardRewardModal({ active }) {
  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(3, 5, 8, 0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--qq-text)",
        zIndex: 15
      }}
    >
      <div className="qq-panel">Card rewards are coming soon.</div>
    </div>
  );
}
