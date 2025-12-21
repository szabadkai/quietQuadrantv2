import React from "react";

export function CardDisplay({ title, subtitle }) {
  return (
    <div
      style={{
        background: "#0b1118",
        border: "1px solid #1f2937",
        borderRadius: "12px",
        padding: "16px",
        color: "#f8fafc",
        minWidth: "200px"
      }}
    >
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#94a3b8" }}>{subtitle}</div>
    </div>
  );
}
