import { useEffect, useRef } from "react";
import { GameRenderer } from "../../rendering/GameRenderer.js";
import { InputManager } from "../../input/InputManager.js";
import { InputBuffer } from "../../input/InputBuffer.js";
import { TwinInputManager } from "../../input/TwinInputManager.js";
import { useGameStore } from "../../state/useGameStore.js";
import { useUIStore } from "../../state/useUIStore.js";
import { DisconnectHandler } from "../../network/DisconnectHandler.js";

export function useGameInitialization(containerRef, pausedRef) {
    const rendererRef = useRef(null);
    const disconnectHandlerRef = useRef(null);
    const reconnectIntervalRef = useRef(null);
    const summaryTimeoutRef = useRef(null);

    useEffect(() => {
        const { actions, simulation, state: simState } = useGameStore.getState();
        if (!simulation || !simState) {
            actions.startGame({ seed: Date.now() });
        }

        const currentSession = useGameStore.getState().session;
        const isTwin = currentSession?.mode === "twin";
        const isOnline = currentSession?.mode === "online";
        const twinOptions = currentSession?.twinOptions ?? {};
        const inputManager = isTwin
            ? new TwinInputManager(null, twinOptions)
            : new InputManager();
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
    }, [containerRef, pausedRef]);

    return { summaryTimeoutRef };
}
