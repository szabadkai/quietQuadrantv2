import React from "react";

export function XPBar({ current, toNext }) {
    const needed = current + toNext;
    const pct = needed > 0 ? Math.max(0, Math.min(1, current / needed)) : 0;

    return (
        <div className="qq-hud-barline" style={{ marginTop: "6px" }}>
            <div
                className="qq-hud-barfill"
                style={{
                    width: `${pct * 100}%`,
                    background: "var(--qq-accent-soft)"
                }}
            />
        </div>
    );
}
