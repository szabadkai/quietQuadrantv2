import React, { useEffect, useState } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { Button } from "../components/Button.jsx";

export function TwinSetupScreen() {
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const startGame = useGameStore((s) => s.actions.startGame);

    // Config state
    const [p1Input, setP1Input] = useState("keyboard");
    const [p1PadIndex, setP1PadIndex] = useState(null);

    const [p2Input, setP2Input] = useState("keyboard");
    const [p2PadIndex, setP2PadIndex] = useState(null);

    const [gamepads, setGamepads] = useState([]);

    // Poll gamepads
    useEffect(() => {
        let rafId;
        const tick = () => {
            if (typeof navigator !== "undefined" && navigator.getGamepads) {
                const pads = Array.from(navigator.getGamepads())
                    .map((p, i) => (p ? { index: i, id: p.id, connected: p.connected } : null))
                    .filter((p) => p && p.connected);

                setGamepads(pads);

                // Auto-assignment logic
                if (pads.length > 0) {
                    // P1 defaults to first available if not set
                    setP1PadIndex(prev => {
                        if (prev !== null && pads.some(p => p.index === prev)) return prev;
                        return pads[0]?.index ?? null;
                    });

                    // P2 defaults to next available unique pad
                    setP2PadIndex(prev => {
                        if (prev !== null && pads.some(p => p.index === prev)) return prev;
                        // Avoid P1's pad if P1 is using gamepad
                        const p1Idx = p1Input === "gamepad" ? (p1PadIndex ?? pads[0]?.index) : -1;
                        const nextPad = pads.find(p => p.index !== p1Idx);
                        return nextPad?.index ?? pads[0]?.index ?? null;
                    });
                }
            }
            rafId = requestAnimationFrame(tick);
        };
        tick();
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [p1Input, p1PadIndex]);

    const handleStart = () => {
        const finalP1Pad = p1Input === "gamepad" ? p1PadIndex : null;
        const finalP2Pad = p2Input === "gamepad" ? p2PadIndex : null;

        startGame({
            seed: Date.now(),
            multiplayer: {
                mode: "twin",
                twinOptions: {
                    p1Input,
                    p1GamepadIndex: finalP1Pad,
                    p2Input,
                    p2GamepadIndex: finalP2Pad
                }
            }
        });
        setScreen("game");
    };

    const renderPadSelector = (current, set, label, exclude) => {
        if (gamepads.length === 0) return <div className="qq-control-row"><span>No controllers detected</span></div>;

        return (
            <div className="qq-control-row">
                <span className="qq-key">{label} Controller</span>
                <select
                    value={current ?? ""}
                    onChange={(e) => set(e.target.value ? Number(e.target.value) : null)}
                    style={{ background: 'transparent', color: 'inherit', border: '1px solid currentColor', padding: '4px', maxWidth: '180px' }}
                >
                    {gamepads.map(p => (
                        <option
                            key={p.index}
                            value={p.index}
                            disabled={p.index === exclude}
                        >
                            {`#${p.index + 1}: ${p.id.substring(0, 16).trim()}...`}
                            {p.index === exclude ? " (Taken)" : ""}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="qq-screen">
            <div className="qq-panel qq-panel-narrow">
                <div className="qq-screen-header">
                    <span className="qq-label">LOCAL CO-OP</span>
                    <h1>Twin Mode</h1>
                    <p className="qq-muted">Configure inputs. Requires 2 controllers for dual gamepad play.</p>
                </div>

                <div className="qq-twin-setup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* PLAYER 1 CONFIG */}
                    <div className="qq-twin-config-col">
                        <h3>Player 1</h3>
                        <div className="qq-toggle-row" style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Button
                                    onClick={() => setP1Input("keyboard")}
                                    primary={p1Input === "keyboard"}
                                    small
                                >
                                    KB + Mouse
                                </Button>
                                <Button
                                    onClick={() => setP1Input("gamepad")}
                                    primary={p1Input === "gamepad"}
                                    small
                                >
                                    Gamepad
                                </Button>
                            </div>
                        </div>
                        {p1Input === "gamepad" && renderPadSelector(p1PadIndex, setP1PadIndex, "P1", p2Input === "gamepad" ? p2PadIndex : -1)}

                        <div className="qq-control-list" style={{ marginTop: '1rem' }}>
                            {p1Input === "keyboard" ? (
                                <>
                                    <div className="qq-control-row"><span className="qq-key">WASD</span><span>Move</span></div>
                                    <div className="qq-control-row"><span className="qq-key">Mouse</span><span>Aim</span></div>
                                    <div className="qq-control-row"><span className="qq-key">Click</span><span>Fire</span></div>
                                </>
                            ) : (
                                <>
                                    <div className="qq-control-row"><span className="qq-key">L-Stick</span><span>Move</span></div>
                                    <div className="qq-control-row"><span className="qq-key">R-Stick</span><span>Aim</span></div>
                                    <div className="qq-control-row"><span className="qq-key">RT/RB</span><span>Fire</span></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* PLAYER 2 CONFIG */}
                    <div className="qq-twin-config-col">
                        <h3>Player 2</h3>
                        <div className="qq-toggle-row" style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <Button
                                    onClick={() => setP2Input("keyboard")}
                                    primary={p2Input === "keyboard"}
                                    small
                                >
                                    Keyboard
                                </Button>
                                <Button
                                    onClick={() => setP2Input("gamepad")}
                                    primary={p2Input === "gamepad"}
                                    small
                                >
                                    Gamepad
                                </Button>
                            </div>
                        </div>
                        {p2Input === "gamepad" && renderPadSelector(p2PadIndex, setP2PadIndex, "P2", p1Input === "gamepad" ? p1PadIndex : -1)}

                        <div className="qq-control-list" style={{ marginTop: '1rem' }}>
                            {p2Input === "keyboard" ? (
                                <>
                                    <div className="qq-control-row"><span className="qq-key">Arrows</span><span>Move</span></div>
                                    <div className="qq-control-row"><span className="qq-key">IJKL</span><span>Aim</span></div>
                                    <div className="qq-control-row"><span className="qq-key">Enter</span><span>Fire</span></div>
                                </>
                            ) : (
                                <>
                                    <div className="qq-control-row"><span className="qq-key">L-Stick</span><span>Move</span></div>
                                    <div className="qq-control-row"><span className="qq-key">R-Stick</span><span>Aim</span></div>
                                    <div className="qq-control-row"><span className="qq-key">RT/RB</span><span>Fire</span></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="qq-screen-actions">
                    <Button
                        primary
                        onClick={handleStart}
                        disabled={
                            ((p1Input === "gamepad" || p2Input === "gamepad") && gamepads.length === 0) ||
                            (p1Input === "gamepad" && p2Input === "gamepad" && p1PadIndex === p2PadIndex)
                        }
                    >
                        Start Game
                    </Button>
                    <Button onClick={() => setScreen("multiplayer")}>
                        Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
