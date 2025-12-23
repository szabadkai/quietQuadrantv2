import React, { useEffect, useRef, useState } from "react";
import { GameRenderer } from "../../rendering/GameRenderer.js";
import { InputManager } from "../../input/InputManager.js";
import { InputBuffer } from "../../input/InputBuffer.js";
import { TwinInputManager } from "../../input/TwinInputManager.js";
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
import { DisconnectHandler } from "../../network/DisconnectHandler.js";
import { transmissionManager } from "../../audio/TransmissionManager.js";

export function GameScreen() {
  const containerRef = useRef(null);
  const disconnectHandlerRef = useRef(null);
  const reconnectIntervalRef = useRef(null);
  const pendingUpgrade = useGameStore((s) => s.state?.pendingUpgrade);
  const applyUpgrade = useGameStore((s) => s.actions.applyUpgrade);
  const state = useGameStore((s) => s.state);
  const runSummary = useGameStore((s) => s.state?.runSummary);
  const phase = useGameStore((s) => s.state?.phase);
  const session = useGameStore((s) => s.session);
  const lastRunRef = useRef(null);
  const rendererRef = useRef(null);
  const summaryTimeoutRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [waveAnnouncement, setWaveAnnouncement] = useState(null);

  // Keep pausedRef in sync with paused state
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Listen for wave-intermission events from the game renderer
  useEffect(() => {
    const handleIntermission = (e) => {
      const nextWave = e.detail.nextWave;
      // Show wave announcement (wave display is 1-indexed)
      setWaveAnnouncement(nextWave + 1);
      // Play random transmission
      transmissionManager.playRandom();
    };
    
    window.addEventListener("qq-wave-intermission", handleIntermission);
    return () => window.removeEventListener("qq-wave-intermission", handleIntermission);
  }, []);

  // Clear wave announcement when upgrade popup appears
  useEffect(() => {
    if (pendingUpgrade) {
      setWaveAnnouncement(null);
    }
  }, [pendingUpgrade]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !pendingUpgrade) {
        // Allow pause in single-player modes (not online or twin multiplayer)
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
    const { actions, simulation, state: simState } = useGameStore.getState();
    if (!simulation || !simState) {
      actions.startGame({ seed: Date.now() });
    }

    const currentSession = useGameStore.getState().session;
    const isTwin = currentSession?.mode === "twin";
    const isOnline = currentSession?.mode === "online";
    const inputManager = isTwin ? new TwinInputManager() : new InputManager();
    const inputBuffer = new InputBuffer();

    const renderer = new GameRenderer({
      parent: containerRef.current,
      getState: () => useGameStore.getState().state,
      onTick: () => {
        const uiState = useUIStore.getState();
        if (uiState.paused && uiState.pauseReason === "peer-disconnected") {
          return;
        }
        if (pausedRef.current) return;
        const gameState = useGameStore.getState().state;
        const sess = useGameStore.getState().session;
        const inputs = inputBuffer.capture(gameState, inputManager, {
          playerId: sess?.localPlayerId
        });
        useGameStore.getState().actions.tick(inputs);
      },
      onReady: (canvas) => inputManager.attach(canvas)
    });
    rendererRef.current = renderer;

    if (isOnline) {
      const sim = useGameStore.getState().simulation;
      const network = sim?.network;
      if (network) {
        disconnectHandlerRef.current = new DisconnectHandler({
          network,
          onPause: ({ peerId }) => {
            useUIStore.getState().actions.setPaused(true, "peer-disconnected");
            useUIStore.getState().actions.setDisconnectInfo({ peerId });
            reconnectIntervalRef.current = setInterval(() => {
              const handler = disconnectHandlerRef.current;
              if (handler) {
                const remaining = handler.getTimeRemaining(peerId);
                useUIStore.getState().actions.setReconnectTimeRemaining(remaining);
              }
            }, 500);
          },
          onResume: () => {
            if (reconnectIntervalRef.current) {
              clearInterval(reconnectIntervalRef.current);
              reconnectIntervalRef.current = null;
            }
            useUIStore.getState().actions.clearDisconnect();
          },
          onEnd: () => {
            if (reconnectIntervalRef.current) {
              clearInterval(reconnectIntervalRef.current);
              reconnectIntervalRef.current = null;
            }
            useUIStore.getState().actions.clearDisconnect();
            useUIStore.getState().actions.setScreen("summary");
          }
        });
      }
    }

    return () => {
      if (summaryTimeoutRef.current) {
        clearTimeout(summaryTimeoutRef.current);
        summaryTimeoutRef.current = null;
      }
      renderer.destroy();
      inputManager.destroy();
      if (disconnectHandlerRef.current) {
        disconnectHandlerRef.current.destroy();
        disconnectHandlerRef.current = null;
      }
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current);
        reconnectIntervalRef.current = null;
      }
      actions.stopGame();
    };
  }, []);

  useEffect(() => {
    if (!runSummary || phase !== "ended") return;
    if (lastRunRef.current === runSummary) return;
    lastRunRef.current = runSummary;

    const metaActions = useMetaStore.getState().actions;
    metaActions.recordRun(runSummary);
    metaActions.updateDailyStreak();
    const xpEarned =
      50 +
      (runSummary.wave ?? 0) * 10 +
      (runSummary.kills ?? 0) +
      (runSummary.bossDefeated ? 100 : 0) +
      (runSummary.multiplayer ? 25 : 0);
    const xpResult = metaActions.addXP(Math.round(xpEarned));
    if (xpResult.rankUp) {
      notifyRankUp(xpResult.newRank);
    }

    const unlocked = checkAchievements(runSummary);
    for (const achievement of unlocked) {
      notifyAchievement(achievement);
    }

    const navigate = () =>
      useUIStore.getState().actions.setScreen("summary");
    if (runSummary.victory === false) {
      summaryTimeoutRef.current = setTimeout(navigate, 600);
    } else {
      navigate();
    }
  }, [runSummary, phase]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--qq-bg)",
        position: "relative"
      }}
    >
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
      </div>
    </div>
  );
}
