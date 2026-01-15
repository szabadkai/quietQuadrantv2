import React, { useEffect, useState } from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { useGameStore } from "../../state/useGameStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { getWeeklyAffix, getWeeklySeed } from "../../config/affixes.js";
import { BOSSES } from "../../config/bosses.js";
import { musicManager } from "../../audio/MusicManager.js";
import { Button } from "../components/Button.jsx";
import { SettingsModal } from "../modals/SettingsModal.jsx";
import { AssetPreloader } from "../../utils/AssetPreloader.js";

export function TitleScreen() {
    const setScreen = useUIStore((s) => s.actions.setScreen);
    const startGame = useGameStore((s) => s.actions.startGame);
    const stats = useMetaStore((s) => s.lifetimeStats);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const weeklyAffix = getWeeklyAffix();
    const weeklySeed = getWeeklySeed();
    const weeklyBoss = BOSSES[weeklySeed % BOSSES.length];
    const versionLabel = import.meta.env?.DEV
        ? "vDev"
        : `v${import.meta.env?.VITE_APP_VERSION ?? "Dev"}`;

    useEffect(() => {
        musicManager.init();
        musicManager.play("title");
        // Update daily streak when visiting the main menu (rewards visiting the game)
        useMetaStore.getState().actions.updateDailyStreak();
        // Fallback: ensure assets are preloading (may have been skipped if slow connection)
        AssetPreloader.preloadAll();

        // Auto-show How to Play for new users who haven't seen it
        const hasSeenHowToPlay = useMetaStore.getState().hasSeenHowToPlay;
        if (!hasSeenHowToPlay) {
            setScreen("howtoplay");
        }
    }, [setScreen]);

    const handleWeekly = () => {
        startGame({ seed: weeklySeed, affix: weeklyAffix, bossId: weeklyBoss?.id });
        setScreen("game");
    };

    const handleExit = () => {
        if (window.require) {
            const { ipcRenderer } = window.require("electron");
            ipcRenderer.send("app-exit");
        }
    };

    return (
        <div className="qq-screen">
            <div className="qq-panel qq-panel-narrow">
                <div className="qq-title-header">
                    <span className="qq-label">QUIET QUADRANT</span>
                    <h1>One ship. One quadrant. Stay alive.</h1>
                </div>

                <div className="qq-menu-list">
                    <Button primary onClick={handleWeekly}>
                        Weekly Run
                    </Button>
                    <Button onClick={() => setScreen("multiplayer")}>
                        Multiplayer
                    </Button>
                    <Button onClick={() => setScreen("collection")}>
                        Collection
                    </Button>
                    <Button onClick={() => setScreen("stats")}>
                        Stats
                    </Button>
                    <Button onClick={() => setScreen("leaderboard")}>
                        Leaderboards
                    </Button>
                    <Button onClick={() => setScreen("howtoplay")}>
                        How to Play
                    </Button>
                    <Button onClick={() => setSettingsOpen(true)}>
                        Settings
                    </Button>
                    {window.require && (
                        <Button onClick={handleExit}>
                            Exit Game
                        </Button>
                    )}
                </div>

                <div className="qq-season-card">
                    <span className="qq-label">THIS WEEK</span>
                    <div className="qq-season-info">
                        <div className="qq-season-row">
                            <span>Seed</span>
                            <span>{weeklySeed.toString(36).toUpperCase()}</span>
                        </div>
                        <div className="qq-season-row">
                            <span>Boss</span>
                            <span>{weeklyBoss?.name || "Random"}</span>
                        </div>
                        <div className="qq-season-row">
                            <span>Affix</span>
                            <span>{weeklyAffix.name}</span>
                        </div>
                        <div className="qq-season-row">
                            <span>Your Best</span>
                            <span>Wave {(stats.highestWave ?? stats.bestWave ?? 0) > 0
                                ? (stats.highestWave ?? stats.bestWave)
                                : "—"}
                            </span>
                        </div>
                    </div>
                    <div className="qq-affix-desc">{weeklyAffix.description}</div>
                </div>

                <div className="qq-version">{versionLabel}</div>
            </div>

            {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
        </div>
    );
}
