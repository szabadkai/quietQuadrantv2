import React from "react";
import { normalizeRoomCode } from "../../network/RoomCodeGenerator.js";

export function RoomCodeInput({ value, onChange }) {
    return (
        <input
            type="text"
            value={value}
            placeholder="ENTER CODE"
            onChange={(event) => onChange(normalizeRoomCode(event.target.value))}
            style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid rgba(159, 240, 255, 0.25)",
                background: "rgba(6, 10, 16, 0.85)",
                color: "var(--qq-text)",
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase"
            }}
        />
    );
}
