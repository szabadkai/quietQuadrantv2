import React, { useState, useEffect, useCallback } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { Button } from "../components/Button.jsx";
import { getWeeklySeed, getWeeklyAffix } from "../../config/affixes.js";
import {
    fetchAllTimeTop,
    fetchWeeklyTop,
} from "../../network/LeaderboardService.js";
import { isSupabaseConfigured } from "../../network/supabaseClient.js";

/**
 * Leaderboard screen showing all-time and weekly rankings.
 */
export function LeaderboardScreen() {
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const playerName = useMetaStore((s) => s.playerName);

    const [activeTab, setActiveTab] = useState("weekly");
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const weeklySeed = getWeeklySeed();
    const weeklyAffix = getWeeklyAffix();

    const loadScores = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let result;
            if (activeTab === "weekly") {
                result = await fetchWeeklyTop(String(weeklySeed), 50);
            } else {
                result = await fetchAllTimeTop(50);
            }

            if (result.error) {
                setError(result.error);
                setScores([]);
            } else {
                setScores(result.data);
            }
        } catch (err) {
            console.error("[LeaderboardScreen] Load error:", err);
            setError("Failed to load leaderboard");
            setScores([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, weeklySeed]);

    useEffect(() => {
        if (isSupabaseConfigured()) {
            loadScores();
        } else {
            setLoading(false);
            setError("Leaderboard not configured");
        }
    }, [loadScores]);

    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return "—";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="qq-screen qq-screen-overlay">
            <div className="qq-panel qq-panel-wide">
                <div className="qq-screen-header">
                    <span className="qq-label">GLOBAL RANKINGS</span>
                    <h1>Leaderboard</h1>
                </div>

                {/* Tab Selector */}
                <div className="qq-leaderboard-tabs">
                    <button
                        className={`qq-tab ${activeTab === "weekly" ? "active" : ""}`}
                        onClick={() => setActiveTab("weekly")}
                    >
                        This Week
                    </button>
                    <button
                        className={`qq-tab ${activeTab === "alltime" ? "active" : ""}`}
                        onClick={() => setActiveTab("alltime")}
                    >
                        All Time
                    </button>
                </div>

                {/* Weekly Info */}
                {activeTab === "weekly" && (
                    <div className="qq-weekly-info">
                        <span className="qq-pill">
                            Seed: {weeklySeed.toString(36).toUpperCase()}
                        </span>
                        <span className="qq-pill">{weeklyAffix.name}</span>
                    </div>
                )}

                {/* Content */}
                <div className="qq-leaderboard-content">
                    {loading && (
                        <div className="qq-loading">
                            <span className="qq-spinner" />
                            Loading...
                        </div>
                    )}

                    {error && !loading && (
                        <div className="qq-error-message">
                            <p>{error}</p>
                            <Button onClick={loadScores}>Retry</Button>
                        </div>
                    )}

                    {!loading && !error && scores.length === 0 && (
                        <div className="qq-empty-state">
                            <p className="qq-muted">No scores yet!</p>
                            <p className="qq-muted">
                                Complete a run to be the first on the leaderboard.
                            </p>
                        </div>
                    )}

                    {!loading && !error && scores.length > 0 && (
                        <div className="qq-leaderboard-table">
                            <div className="qq-leaderboard-header">
                                <span className="qq-col-rank">#</span>
                                <span className="qq-col-name">Pilot</span>
                                <span className="qq-col-score">Score</span>
                                <span className="qq-col-wave">Wave</span>
                                <span className="qq-col-time">Time</span>
                                <span className="qq-col-date">Date</span>
                            </div>
                            <div className="qq-leaderboard-rows">
                                {scores.map((entry, index) => {
                                    const isCurrentPlayer =
                                        playerName &&
                                        entry.player_name.toLowerCase() ===
                                        playerName.toLowerCase();
                                    const rankClass =
                                        index === 0
                                            ? "gold"
                                            : index === 1
                                                ? "silver"
                                                : index === 2
                                                    ? "bronze"
                                                    : "";

                                    return (
                                        <div
                                            key={entry.id}
                                            className={`qq-leaderboard-row ${isCurrentPlayer ? "highlight" : ""} ${rankClass}`}
                                        >
                                            <span className="qq-col-rank">
                                                {index + 1}
                                            </span>
                                            <span className="qq-col-name">
                                                {entry.player_name}
                                                {entry.victory && (
                                                    <span
                                                        className="qq-victory-badge"
                                                        title="Victory"
                                                    >
                                                        ★
                                                    </span>
                                                )}
                                            </span>
                                            <span className="qq-col-score">
                                                {entry.score.toLocaleString()}
                                            </span>
                                            <span className="qq-col-wave">
                                                {entry.wave + 1}
                                            </span>
                                            <span className="qq-col-time">
                                                {formatTime(entry.duration)}
                                            </span>
                                            <span className="qq-col-date">
                                                {formatDate(entry.created_at)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="qq-screen-actions">
                    <Button primary onClick={() => setScreen("title")}>
                        Back
                    </Button>
                    {!loading && !error && (
                        <Button onClick={loadScores}>Refresh</Button>
                    )}
                </div>
            </div>
        </div>
    );
}
