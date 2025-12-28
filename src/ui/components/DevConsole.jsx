import React, { useState, useEffect } from "react";
import { useGameStore } from "../../state/useGameStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { WAVES } from "../../config/waves.js";
import upgrades from "../../config/upgrades.json";

/**
 * Developer Console for testing and debugging.
 * Toggle with Shift+F
 */
export function DevConsole() {
    const [visible, setVisible] = useState(false);
    const [selectedWave, setSelectedWave] = useState(0);
    const [selectedUpgrade, setSelectedUpgrade] = useState("");
    const simulation = useGameStore((s) => s.simulation);
    const state = useGameStore((s) => s.state);
    const metaStats = useMetaStore((s) => s.lifetimeStats);
    const metaActions = useMetaStore((s) => s.actions);

    useEffect(() => {
        // Only allow DevConsole in development mode
        if (!import.meta.env.DEV) return;

        const handleKeyDown = (e) => {
            if (e.shiftKey && e.key.toLowerCase() === "f") {
                setVisible((v) => !v);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!import.meta.env.DEV) return null;
    if (!visible) return null;

    const handleWaveJump = () => {
        if (simulation?.setWave) {
            simulation.setWave(selectedWave);
        }
    };

    const handleForceUpgrade = () => {
        if (simulation?.forceUpgrade && selectedUpgrade) {
            simulation.forceUpgrade("p1", selectedUpgrade);
        }
    };

    const handleToggleInvincibility = () => {
        if (simulation?.toggleInvincibility) {
            simulation.toggleInvincibility("p1");
        }
    };

    const handleTestStreak = () => {
        metaActions.showStreakPopup(metaStats.currentDailyStreak + 1, false);
    };

    const handleResetStreak = () => {
        const nextStats = { ...metaStats, currentDailyStreak: 0, lastPlayedDate: "" };
        metaActions.setStats(nextStats);
    };

    const player = state?.players?.[0];
    const isInvincible = player?.debugInvincible ?? false;

    return (
        <div
            style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "rgba(0, 0, 0, 0.85)",
                border: "1px solid #0ff",
                borderRadius: 4,
                padding: 12,
                fontFamily: "monospace",
                fontSize: 11,
                color: "#0ff",
                zIndex: 9999,
                minWidth: 220,
                pointerEvents: "auto",
            }}
        >
            <div style={{ marginBottom: 8, fontWeight: "bold", borderBottom: "1px solid #0ff", paddingBottom: 4 }}>
                DEV CONSOLE (Shift+F)
            </div>

            {/* Wave Jump */}
            <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Wave Jump:</label>
                <div style={{ display: "flex", gap: 4 }}>
                    <select
                        value={selectedWave}
                        onChange={(e) => setSelectedWave(Number(e.target.value))}
                        style={{
                            flex: 1,
                            background: "#111",
                            color: "#0ff",
                            border: "1px solid #0ff",
                            padding: 4,
                        }}
                    >
                        {WAVES.map((_, i) => (
                            <option key={i} value={i}>
                                Wave {i + 1}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleWaveJump}
                        style={{
                            background: "#0ff",
                            color: "#000",
                            border: "none",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        GO
                    </button>
                </div>
            </div>

            {/* Force Upgrade */}
            <div style={{ marginBottom: 8 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Force Upgrade:</label>
                <div style={{ display: "flex", gap: 4 }}>
                    <select
                        value={selectedUpgrade}
                        onChange={(e) => setSelectedUpgrade(e.target.value)}
                        style={{
                            flex: 1,
                            background: "#111",
                            color: "#0ff",
                            border: "1px solid #0ff",
                            padding: 4,
                        }}
                    >
                        <option value="">-- Select --</option>
                        {[...upgrades]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                    </select>
                    <button
                        onClick={handleForceUpgrade}
                        style={{
                            background: "#0ff",
                            color: "#000",
                            border: "none",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        ADD
                    </button>
                </div>
            </div>

            {/* Invincibility Toggle */}
            <div style={{ marginBottom: 8 }}>
                <button
                    onClick={handleToggleInvincibility}
                    style={{
                        width: "100%",
                        background: isInvincible ? "#ff0" : "#333",
                        color: isInvincible ? "#000" : "#0ff",
                        border: "1px solid #0ff",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    {isInvincible ? "🛡️ INVINCIBLE (ON)" : "🛡️ INVINCIBILITY (OFF)"}
                </button>
            </div>

            {/* Streak Tools */}
            <div style={{ marginBottom: 8, borderTop: "1px solid #333", paddingTop: 8 }}>
                <label style={{ display: "block", marginBottom: 4, color: "#f80" }}>Streak Testing:</label>
                <div style={{ display: "flex", gap: 4 }}>
                    <button
                        onClick={handleTestStreak}
                        style={{
                            flex: 1,
                            background: "#f80",
                            color: "#000",
                            border: "none",
                            padding: "6px 8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: 10
                        }}
                    >
                        TEST POPUP (+1)
                    </button>
                    <button
                        onClick={handleResetStreak}
                        style={{
                            background: "#333",
                            color: "#888",
                            border: "1px solid #444",
                            padding: "6px 8px",
                            cursor: "pointer",
                            fontSize: 10
                        }}
                    >
                        RESET
                    </button>
                </div>
                <div style={{ fontSize: 9, marginTop: 4, color: "#888" }}>
                    Current: {metaStats.currentDailyStreak} | Best: {metaStats.bestDailyStreak}
                </div>
            </div>

            {/* Stats Display */}
            <div style={{ fontSize: 10, color: "#888", borderTop: "1px solid #333", paddingTop: 4 }}>
                <div>Enemies: {state?.enemies?.length ?? 0}</div>
                <div>Bullets: {state?.bullets?.length ?? 0}</div>
                <div>Wave: {(state?.wave?.current ?? 0) + 1}</div>
            </div>
        </div>
    );
}
