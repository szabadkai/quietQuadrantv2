import React from "react";

export function RoomCodeDisplay({ code }) {
  if (!code) return null;

  return (
    <div
      style={{
        border: "1px solid rgba(159, 240, 255, 0.25)",
        borderRadius: "6px",
        padding: "12px 16px",
        background: "rgba(6, 10, 16, 0.85)"
      }}
    >
      <div style={{ fontSize: "10px", letterSpacing: "0.36em", color: "var(--qq-muted)" }}>
        ROOM CODE
      </div>
      <div
        style={{
          fontSize: "22px",
          letterSpacing: "0.4em",
          marginTop: "6px",
          color: "var(--qq-text)"
        }}
      >
        {code}
      </div>
    </div>
  );
}
