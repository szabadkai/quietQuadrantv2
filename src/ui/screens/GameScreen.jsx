import React, { useEffect, useRef, useState } from "react";
import { useGameStore } from "../../state/useGameStore.js";
import { UpgradeModal } from "../components/UpgradeModal.jsx";
import { HUD } from "../components/HUD.jsx";
import { DisconnectOverlay } from "../components/DisconnectOverlay.jsx";
import { PauseModal } from "../modals/PauseModal.jsx";
import { WaveAnnouncement } from "../components/WaveAnnouncement.jsx";
import { useUIStore } from "../../state/useUIStore.js";
import { useMetaStore } from "../../state/useMetaStore.js";
import { checkAchievements } from "../../systems/AchievementChecker.js";
import { notifyAchievement, notifyRankUp } from "../../state/useNotificationStore.js";
import { transmissionManager } from "../../audio/TransmissionManager.js";
import { readGamepad } from "../../input/gamepad.js";
import { TouchTwinSticks } from "../components/TouchTwinSticks.jsx";
import { isMobileDevice } from "../../utils/isMobileDevice.js";
import { useGameTransmissions } from "../hooks/useGameTransmissions.js";
import { useGameInitialization } from "../hooks/useGameInitialization.js";
import { DevConsole } from "../components/DevConsole.jsx";

export function GameScreen() {
    const containerRef = useRef(null);
    const pendingUpgrade = useGameStore((s) => s.state?.pendingUpgrade);
    const applyUpgrade = useGameStore((s) => s.actions.applyUpgrade);
    // Subscribe to stateVersion to force re-renders when simulation state mutates
    const stateVersion = useGameStore((s) => s.stateVersion);
    const state = useGameStore((s) => s.state);
    const uiPaused = useUIStore((s) => s.paused);
    const runSummary = useGameStore((s) => s.state?.runSummary);
    const phase = useGameStore((s) => s.state?.phase);
    const session = useGameStore((s) => s.session);
    const lastRunRef = useRef(null);
    const [paused, setPaused] = useState(false);
    const pausedRef = useRef(false);
    const [waveAnnouncement, setWaveAnnouncement] = useState(null);
    const startPressedRef = useRef(false);
    const [isMobile, setIsMobile] = useState(false);
    const touchControlsDisabled = paused || uiPaused || !!pendingUpgrade;

    const currentWaveIndex = state?.wave?.current;

    // Use hooks
    useGameTransmissions(state, session, setWaveAnnouncement);
    const { summaryTimeoutRef } = useGameInitialization(containerRef, pausedRef);

    // Keep pausedRef in sync with paused state
    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);

    // If we somehow still have an announcement when the wave has already started, dismiss it
    useEffect(() => {
        if (waveAnnouncement === null) return;
        const currentWave = currentWaveIndex ?? -1;
        const expectedWaveIndex = waveAnnouncement - 1;
        const inIntermission = phase === "intermission";
        if (!inIntermission || currentWave !== expectedWaveIndex) {
            setWaveAnnouncement(null);
        }
    }, [waveAnnouncement, phase, currentWaveIndex]);

    useEffect(() => {
        setIsMobile(isMobileDevice());
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !pendingUpgrade) {
                const currentSession = useGameStore.getState().session;
                const isMultiplayer = currentSession?.mode === "online" || currentSession?.mode === "twin";

                if (!isMultiplayer) {
                    e.preventDefault();
                    setPaused((p) => !p);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pendingUpgrade]);

    useEffect(() => {
        let rafId;
        const tick = () => {
            const pad = readGamepad(0);
            const isStart = pad?.buttons.start ?? false;
            const gameState = useGameStore.getState().state;
            const currentSession = useGameStore.getState().session;
            const isMultiplayer = currentSession?.mode === "online" || currentSession?.mode === "twin";

            if (isStart && !startPressedRef.current && !gameState?.pendingUpgrade && !isMultiplayer) {
                setPaused((p) => !p);
            }

            startPressedRef.current = !!isStart;
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    useEffect(() => {
        if (!runSummary || phase !== "ended") return;
        if (lastRunRef.current === runSummary) return;
        lastRunRef.current = runSummary;

        const metaActions = useMetaStore.getState().actions;
        metaActions.recordRun(runSummary);
        metaActions.updateDailyStreak();
        const xpEarned = 50 + (runSummary.wave ?? 0) * 10 + (runSummary.kills ?? 0) + (runSummary.bossDefeated ? 100 : 0) + (runSummary.multiplayer ? 25 : 0);
        const xpResult = metaActions.addXP(Math.round(xpEarned));
        if (xpResult.rankUp) {
            notifyRankUp(xpResult.newRank);
            transmissionManager.playRankUp();
        }

        const unlocked = checkAchievements(runSummary);
        for (const achievement of unlocked) {
            notifyAchievement(achievement);
        }

        const navigate = () => useUIStore.getState().actions.setScreen("summary");
        if (runSummary.victory === false) {
            summaryTimeoutRef.current = setTimeout(navigate, 600);
        } else {
            navigate();
        }
    }, [runSummary, phase, summaryTimeoutRef]);

    return (
        <div
            className="qq-game-container"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "var(--qq-bg)",
                position: "relative"
            }}
        >
            <TouchTwinSticks active={isMobile} disabled={touchControlsDisabled} />
            <div className="qq-game-frame">
                <div
                    ref={containerRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "1px solid var(--qq-panel-border)",
                        boxShadow: "0 0 18px rgba(159, 240, 255, 0.08)"
                    }}
                />
                <UpgradeModal pendingUpgrade={pendingUpgrade} onSelect={applyUpgrade} />
                <HUD state={state} />
                <DisconnectOverlay />
                {waveAnnouncement !== null && !pendingUpgrade && (
                    <WaveAnnouncement
                        waveNumber={waveAnnouncement}
                        onComplete={() => setWaveAnnouncement(null)}
                    />
                )}
                {paused && <PauseModal onResume={() => setPaused(false)} />}
                {import.meta.env.DEV && <DevConsole />}
            </div>
        </div>
    );
}
