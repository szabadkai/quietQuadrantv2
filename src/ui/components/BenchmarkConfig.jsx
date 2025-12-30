import React, { useState, useEffect } from "react";
import { useGameStore } from "../../state/useGameStore.js";
import { useUIStore } from "../../state/useUIStore.js";

export function BenchmarkConfig() {
    const [benchmarkResult, setBenchmarkResult] = useState(null);
    const [benchmarkHistory, setBenchmarkHistory] = useState(() => {
        try {
            const saved = localStorage.getItem("qq-bench-history");
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    // Benchmark Configuration
    const [benchEnemyCount, setBenchEnemyCount] = useState(300);
    const [benchProjectileLevel, setBenchProjectileLevel] = useState("med"); // low, med, high
    const [benchScenario, setBenchScenario] = useState("swarm"); // standard, boss, swarm

    const simulation = useGameStore((s) => s.simulation);
    const state = useGameStore((s) => s.state);
    const { actions: gameActions } = useGameStore();
    const { actions: uiActions } = useUIStore();

    // Watch for active benchmark results
    useEffect(() => {
        if (state?.benchmarkResults) {
            const r = state.benchmarkResults;

            if (r.error) {
                setBenchmarkResult(`Error: ${r.error}`);
            } else if (typeof r.avgFps === 'number') {
                const text = `FPS: ${r.avgFps.toFixed(1)} (1% Low: ${r.p1Fps})`;
                setBenchmarkResult(text);

                // Add to history
                const entry = {
                    date: new Date().toISOString(),
                    scenario: `${benchEnemyCount} Enemies / ${benchProjectileLevel} / ${benchScenario}`,
                    avgFps: r.avgFps.toFixed(1),
                    lowFps: r.p1Fps,
                    duration: r.duration.toFixed(0)
                };

                setBenchmarkHistory(prev => {
                    const next = [entry, ...prev].slice(0, 50); // Keep last 50
                    localStorage.setItem("qq-bench-history", JSON.stringify(next));
                    return next;
                });
            }

            // Clear result from state to prevent double-logging on re-renders
            state.benchmarkResults = null;

            if (simulation?.endBenchmark) {
                simulation.endBenchmark();
            }
        }
    }, [state?.benchmarkResults, benchEnemyCount, benchProjectileLevel, benchScenario, state, simulation]);

    const handleRunBenchmark = () => {
        setBenchmarkResult("Loading Benchmark...");

        // Launch the benchmark as a real game session
        gameActions.startGame({
            benchmark: {
                enemies: benchEnemyCount,
                bullets: benchProjectileLevel === "low" ? 50 : benchProjectileLevel === "med" ? 200 : 800,
                type: benchScenario,
                duration: 300
            }
        });

        uiActions.setScreen("game");
    };

    return (
        <div style={{ marginBottom: 8, borderTop: "1px solid #333", paddingTop: 8 }}>
            <label style={{ display: "block", marginBottom: 4, color: "#0f0" }}>Benchmark Config:</label>

            {/* Config Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 4 }}>
                <select
                    value={benchEnemyCount}
                    onChange={(e) => setBenchEnemyCount(Number(e.target.value))}
                    style={{ background: "#111", color: "#0f0", border: "1px solid #444", fontSize: 10 }}
                >
                    <option value={100}>100 Enemies</option>
                    <option value={300}>300 Enemies</option>
                    <option value={500}>500 Enemies</option>
                    <option value={800}>800 Enemies</option>
                    <option value={1000}>1000 Enemies</option>
                </select>

                <select
                    value={benchProjectileLevel}
                    onChange={(e) => setBenchProjectileLevel(e.target.value)}
                    style={{ background: "#111", color: "#0f0", border: "1px solid #444", fontSize: 10 }}
                >
                    <option value="low">Proj (Low)</option>
                    <option value="med">Proj (Med)</option>
                    <option value="high">Proj (High)</option>
                </select>

                <select
                    value={benchScenario}
                    onChange={(e) => setBenchScenario(e.target.value)}
                    style={{ background: "#111", color: "#0f0", border: "1px solid #444", fontSize: 10, gridColumn: "span 2" }}
                >
                    <option value="standard">Standard Scenario</option>
                    <option value="swarm">Swarm (Tight Spacing)</option>
                    <option value="boss">Boss Fight</option>
                    <option value="mixed">Mixed (Stress Test)</option>
                </select>
            </div>

            <button
                onClick={handleRunBenchmark}
                style={{
                    width: "100%",
                    background: "#0f0",
                    color: "#000",
                    border: "none",
                    padding: "6px 8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: 10,
                    marginBottom: 4
                }}
            >
                RUN SCENARIO
            </button>
            {benchmarkResult && (
                <div style={{ color: "#0f0", fontSize: 10, textAlign: "center", borderTop: "1px dashed #333", paddingTop: 2 }}>
                    Last Run: <strong>{benchmarkResult}</strong>
                </div>
            )}

            {/* History List */}
            {benchmarkHistory.length > 0 && (
                <div style={{ marginTop: 8, maxHeight: 100, overflowY: "auto", border: "1px solid #333", padding: 2 }}>
                    {benchmarkHistory.map((entry, i) => (
                        <div key={i} style={{ fontSize: 9, borderBottom: "1px solid #222", padding: "2px 0", color: "#888" }}>
                            <div style={{ color: "#ccc" }}>{new Date(entry.date).toLocaleTimeString()} - {entry.scenario}</div>
                            <div style={{ color: i === 0 ? "#0f0" : "#666" }}>
                                FPS: <strong>{entry.avgFps}</strong> | 1% Low: {entry.lowFps}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
