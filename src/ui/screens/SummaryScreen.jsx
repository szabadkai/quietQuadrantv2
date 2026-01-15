import React, { useEffect, useState, useCallback, useRef } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { musicManager } from "../../audio/MusicManager.js";
import { Button } from "../components/Button.jsx";
import { CardRewardModal } from "../components/CardRewardModal.jsx";
import { NameInputModal } from "../modals/NameInputModal.jsx";
import { UPGRADES } from "../../config/upgrades.js";
import {
    submitScore,
    calculateScore,
} from "../../network/LeaderboardService.js";
import { isSupabaseConfigured } from "../../network/supabaseClient.js";

const MAX_CARD_BOOST = 5;

function rollCardRewardOptions(cardCollection, count = 3) {
    const unlocked = new Set(cardCollection.unlockedUpgrades ?? []);
    const boosts = cardCollection.upgradeBoosts ?? {};
    let pool = Object.values(UPGRADES).filter((upgrade) => {
        const boostLevel = boosts[upgrade.id] ?? 0;
        return !unlocked.has(upgrade.id) || boostLevel < MAX_CARD_BOOST;
    });

    if (pool.length < count) {
        pool = Object.values(UPGRADES);
    }

    const options = [];
    const pickCount = Math.min(count, pool.length);
    const available = [...pool];
    for (let i = 0; i < pickCount; i += 1) {
        const index = Math.floor(Math.random() * available.length);
        const [picked] = available.splice(index, 1);
        if (picked) options.push(picked.id);
    }
    return options;
}

export function SummaryScreen() {
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const startGame = useGameStore((s) => s.actions.startGame);
    const lastRun = useMetaStore((s) => s.lastRun);
    const stats = useMetaStore((s) => s.lifetimeStats);
    const cardCollection = useMetaStore((s) => s.cardCollection);
    const pendingCardReward = useMetaStore((s) => s.pendingCardReward);
    const lastRewardRunId = useMetaStore((s) => s.lastRewardRunId);
    const playerName = useMetaStore((s) => s.playerName);
    const metaActions = useMetaStore((s) => s.actions);

    // Score submission state
    const [showNameModal, setShowNameModal] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState("idle"); // idle, submitting, success, error
    const [submissionError, setSubmissionError] = useState(null);
    const hasSubmittedRef = useRef(null); // Track submitted runId

    useEffect(() => {
        musicManager.init();
        musicManager.play("level1");
    }, []);

    useEffect(() => {
        if (!lastRun?.victory) return;
        const runId = lastRun.completedAt;
        if (!runId) return;
        if (pendingCardReward.active && pendingCardReward.runId === runId)
            return;
        if (lastRewardRunId === runId) return;
        const options = rollCardRewardOptions(cardCollection, 3);
        metaActions.setCardReward(options, runId);
    }, [
        lastRun,
        pendingCardReward.active,
        pendingCardReward.runId,
        lastRewardRunId,
        cardCollection,
        metaActions,
    ]);

    // Auto-prompt for name if not set and leaderboard is available
    useEffect(() => {
        if (!lastRun) return;
        if (!isSupabaseConfigured()) return;
        if (playerName) return;
        if (showNameModal) return;

        // Show name modal when card reward is done or not pending
        if (!pendingCardReward.active) {
            setShowNameModal(true);
        }
    }, [lastRun, playerName, pendingCardReward.active, showNameModal]);

    // Submit score when we have a name
    const submitScoreToLeaderboard = useCallback(async () => {
        if (!lastRun) return;
        if (!isSupabaseConfigured()) return;
        if (!playerName) return;
        if (submissionStatus !== "idle") return;

        // Avoid duplicate submissions
        const runId = lastRun.completedAt;
        if (hasSubmittedRef.current === runId) return;

        setSubmissionStatus("submitting");
        setSubmissionError(null);

        try {
            const result = await submitScore({
                playerName,
                runStats: lastRun,
                weeklySeed: lastRun.weeklySeed
                    ? String(lastRun.weeklySeed)
                    : null,
                affixId: lastRun.affixId || null,
            });

            if (result.success) {
                setSubmissionStatus("success");
                hasSubmittedRef.current = runId;
            } else {
                setSubmissionStatus("error");
                setSubmissionError(result.error || "Failed to submit score");
            }
        } catch (err) {
            console.error("[SummaryScreen] Score submission error:", err);
            setSubmissionStatus("error");
            setSubmissionError("Network error");
        }
    }, [lastRun, playerName, submissionStatus]);

    // Auto-submit when name is available
    useEffect(() => {
        if (
            playerName &&
            lastRun &&
            submissionStatus === "idle" &&
            !showNameModal
        ) {
            submitScoreToLeaderboard();
        }
    }, [playerName, lastRun, submissionStatus, showNameModal, submitScoreToLeaderboard]);

    const handleNameSubmit = (name) => {
        metaActions.setPlayerName(name);
        setShowNameModal(false);
    };

    const handleNameSkip = () => {
        setShowNameModal(false);
    };

    const handlePlayAgain = () => {
        startGame({ seed: Date.now() });
        setScreen("game");
    };

    const handleRetrySubmit = () => {
        setSubmissionStatus("idle");
        setSubmissionError(null);
        // Will trigger auto-submit via useEffect
    };

    if (!lastRun) {
        return (
            <div className="qq-screen">
                <div className="qq-panel">
                    <p>No run data available.</p>
                    <Button onClick={() => setScreen("title")}>
                        Back to Menu
                    </Button>
                </div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const bestWave = stats.highestWave ?? stats.bestWave ?? 0;
    const isNewBest = (lastRun.wave ?? 0) > bestWave;
    const score = calculateScore(lastRun);

    return (
        <div className="qq-screen">
            <div className="qq-panel qq-panel-narrow">
                <div className="qq-summary-header">
                    <span
                        className={`qq-result ${lastRun.victory ? "victory" : "defeat"}`}
                    >
                        {lastRun.victory ? "VICTORY" : "DEFEAT"}
                    </span>
                    <p className="qq-muted">
                        {lastRun.victory
                            ? "You survived the quadrant!"
                            : "The void claims another ship..."}
                    </p>
                </div>

                <div className="qq-summary-stats">
                    <div className="qq-summary-row qq-summary-row-highlight">
                        <span>Score</span>
                        <span className="qq-score-value">
                            {score.toLocaleString()}
                        </span>
                    </div>
                    <div className="qq-summary-row">
                        <span>Time</span>
                        <span>{formatTime(lastRun.duration)}</span>
                    </div>
                    <div className="qq-summary-row">
                        <span>Wave</span>
                        <span>
                            {lastRun.wave + 1}
                            {isNewBest && (
                                <span className="qq-new-best">NEW BEST!</span>
                            )}
                        </span>
                    </div>
                    <div className="qq-summary-row">
                        <span>Enemies</span>
                        <span>{lastRun.kills}</span>
                    </div>
                    <div className="qq-summary-row">
                        <span>Damage Dealt</span>
                        <span>{Math.round(lastRun.damageDealt)}</span>
                    </div>
                    <div className="qq-summary-row">
                        <span>Damage Taken</span>
                        <span>{Math.round(lastRun.damageTaken)}</span>
                    </div>
                    <div className="qq-summary-row">
                        <span>Accuracy</span>
                        <span>{Math.round(lastRun.accuracy * 100)}%</span>
                    </div>
                </div>

                {/* Leaderboard submission status */}
                {isSupabaseConfigured() && (
                    <div className="qq-submission-status">
                        {submissionStatus === "submitting" && (
                            <span className="qq-status submitting">
                                <span className="qq-spinner-small" />
                                Submitting to leaderboard...
                            </span>
                        )}
                        {submissionStatus === "success" && (
                            <span className="qq-status success">
                                ✓ Score submitted!
                            </span>
                        )}
                        {submissionStatus === "error" && (
                            <span className="qq-status error">
                                ✗ {submissionError}
                                <button
                                    className="qq-retry-link"
                                    onClick={handleRetrySubmit}
                                >
                                    Retry
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {lastRun.synergies?.length > 0 && (
                    <div className="qq-summary-section">
                        <span className="qq-label">SYNERGIES DISCOVERED</span>
                        <div className="qq-synergy-list">
                            {lastRun.synergies.map((s) => (
                                <span key={s} className="qq-synergy-tag">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="qq-summary-actions">
                    <Button primary onClick={handlePlayAgain}>
                        Run Again
                    </Button>
                    <Button onClick={() => setScreen("leaderboard")}>
                        Leaderboards
                    </Button>
                    <Button onClick={() => setScreen("title")}>
                        Back to Menu
                    </Button>
                </div>
            </div>

            {lastRun.victory && pendingCardReward.active && (
                <CardRewardModal
                    options={pendingCardReward.options}
                    onSelect={metaActions.claimCardReward}
                />
            )}

            {showNameModal && (
                <NameInputModal
                    onSubmit={handleNameSubmit}
                    onClose={handleNameSkip}
                    initialName={playerName || ""}
                />
            )}
        </div>
    );
}
